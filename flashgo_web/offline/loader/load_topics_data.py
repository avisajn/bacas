import datetime

from comments.models import Comments
from common import loggers
from common.constants import RedisKeyPrefix
from common.es_client import es_client, ESClient
from common.redisclient import TOPIC_DEALS_FEED, TOPIC_NEWS_FEED, TOPIC_NEWS_COUNT, TOPIC_DEALS_COUNT, \
    SORTED_TOPIC_NEWS_FEED
from common.sql_models import Topics, TopicDeals, TopicNews
from common.utils import pick_from_array, format_topic_keywords, UniqueItemList
from favorite.sql_model import UserLike
from news.constants import NewsStatus
from news.models import News
from offline.loader.mysqlclient import mysql_client, MySQLClient
from offline.loader.redisclient import redis_client, RedisClient

logger = loggers.get_offline_logger(__name__, 'offline_topic.log')

NEWS_FEEDS_SIZE = 10000


def set_logger(name):
    global logger
    logger = loggers.get_offline_logger(__name__, name + '.log')


class LoadTask(object):
    def __init__(self, redis_client: RedisClient, mysql_client: MySQLClient, es_client: ESClient):
        self.redis_client = redis_client
        self.mysql_client = mysql_client
        self.es_client = es_client

    def update_topic_views_count(self):
        topic_with_views = self.redis_client.get_topic_ids(with_scores=True)
        for topic_id, views_count in topic_with_views.items():
            self.mysql_client.update_object(Topics, topic_id, contain_updated_time=True, views_count=views_count)
            logger.info(f'Update views_count, topic_id {topic_id}, views_count {views_count}')

    def load_topic_feeds(self):

        online_topics = self.mysql_client.retrieve_objects_by_conditions(Topics, Topics.status == 1)

        keywords_set = set()
        for topic in online_topics:
            words = {format_topic_keywords(word) for word in topic.keywords.split(',')}
            keywords_set.update(words)
        self.redis_client.cache_topic_keywords(keywords_set)
        logger.info('Cache topic keywords, size {}, {}'.format(len(keywords_set), keywords_set))

        self.redis_client.cache_topic_ids({topic.id: topic.views_count for topic in online_topics})
        logger.info(f'Cache topics, size {len(online_topics)}')
        topic_ids = [topic.id for topic in online_topics]
        # self._load_topics_news(topic_ids)
        self._load_topics_deals(topic_ids)

    def _load_topics_deals(self, online_topic_ids):
        for topic_id in online_topic_ids:
            topic_deals = self.mysql_client.retrieve_objects_by_conditions(TopicDeals, TopicDeals.topic_id == topic_id)
            topic_deal_ids = [topic_deal.deal_id for topic_deal in topic_deals]
            self.redis_client.cache_object(TOPIC_DEALS_COUNT % topic_id, len(topic_deal_ids), ex=2 * 60 * 60,
                                           prefix=RedisKeyPrefix.TOPIC)

            sells_deals = {}
            deals = self.mysql_client.retrieve_deals_by_deal_id_list(topic_deal_ids)
            for deal in deals:
                deals_list = sells_deals.get(deal.ecommerce_id, [])
                deals_list.append(deal)
                sells_deals[deal.ecommerce_id] = deals_list

            deal_array = []
            for sell_id, deals_list in sells_deals.items():
                deal_ids = [deal.id for deal in sorted(deals_list, key=lambda deal: deal.get_score(), reverse=True)]
                deal_array.append(deal_ids)

            sorted_deal_ids = pick_from_array(deal_array)
            self.redis_client.cache_object(TOPIC_DEALS_FEED % topic_id, sorted_deal_ids, ex=2 * 60 * 60,
                                           prefix=RedisKeyPrefix.DEAL)
            logger.info(
                f'Cache topic deals, topic_id {topic_id}, sell_ids {list(sells_deals.keys())}, '
                f'size {len(sorted_deal_ids)}, 10th {sorted_deal_ids[:10]}')

    @staticmethod
    def _get_news_hot_score(comment_count, like_count):
        return comment_count * 1 + like_count * 1

    def _load_topics_news(self, online_topic_ids):

        for topic_id in online_topic_ids:
            topic_news_list = self.mysql_client.retrieve_objects_by_conditions(TopicNews,
                                                                               TopicNews.topic_id == topic_id,
                                                                               TopicNews.status == 1)

            topic_news_ids = [topic_news.news_id for topic_news in topic_news_list]
            valid_news = self.mysql_client.retrieve_objects_by_conditions(News, News.news_id.in_(topic_news_ids),
                                                                          News.valid == NewsStatus.SUCCESS)

            # 计算news的热度分数
            hot_news_list = []
            not_hot_news_list = []
            recent_hot_news_list = []
            now = datetime.datetime.now()
            for news in valid_news:
                if news.publish_time is None:
                    news.publish_time = news.created_time

                news.comment_count = self.mysql_client.get_instances_count(Comments.id,
                                                                           Comments.news_id == news.news_id)
                news.like_count = self.mysql_client.get_instances_count(UserLike.id, UserLike.news_id == news.news_id)
                news.hot_score = self._get_news_hot_score(news.comment_count, news.like_count)

                if news.hot_score > 0:
                    if news.created_time > now - datetime.timedelta(days=7):
                        recent_hot_news_list.append(news)
                    else:
                        hot_news_list.append(news)
                else:
                    not_hot_news_list.append(news)

            # 按发布时间生成话题的内容列表
            sorted_news_list = sorted(valid_news, key=lambda instance: instance.publish_time, reverse=True)
            sorted_news_ids = [news.news_id for news in sorted_news_list]
            self.redis_client.cache_object(SORTED_TOPIC_NEWS_FEED % (topic_id, 'created_time'), sorted_news_ids,
                                           ex=2 * 60 * 60, prefix=RedisKeyPrefix.NEWS)
            logger.info(f'Cache topic created time feed, topic_id {topic_id}, '
                        f'size {len(sorted_news_ids)}, 10th {sorted_news_ids[:10]}')

            # 按热度生成话题的内容列表
            news_id_list = UniqueItemList()

            recent_hot_news_list = sorted(recent_hot_news_list,
                                          key=lambda instance: (instance.hot_score, news.publish_time))
            for news in reversed(recent_hot_news_list):
                news_id_list.append(news.news_id)

            hot_news_list = sorted(hot_news_list, key=lambda instance: (instance.hot_score, news.publish_time))
            for news in reversed(hot_news_list):
                news_id_list.append(news.news_id)

            not_hot_news_list = sorted(not_hot_news_list, key=lambda instance: instance.publish_time, reverse=True)
            for news in not_hot_news_list:
                news_id_list.append(news.news_id)

            hot_news_id_list = news_id_list.to_list()
            self.redis_client.cache_object(TOPIC_NEWS_COUNT % topic_id, len(valid_news), ex=2 * 60 * 60,
                                           prefix=RedisKeyPrefix.TOPIC)
            self.redis_client.cache_object(TOPIC_NEWS_FEED % topic_id, hot_news_id_list, ex=2 * 60 * 60,
                                           prefix=RedisKeyPrefix.NEWS)
            self.redis_client.cache_object(SORTED_TOPIC_NEWS_FEED % (topic_id, 'hot'), hot_news_id_list,
                                           ex=2 * 60 * 60, prefix=RedisKeyPrefix.NEWS)
            logger.info(f'Cache topic hot news, topic_id {topic_id}, '
                        f'size {len(hot_news_id_list)}, 10th {hot_news_id_list[:10]}')


def load_data(action):
    load_task = LoadTask(redis_client, mysql_client, es_client)
    logger.info("===============start===============")
    if action is None:
        load_task.update_topic_views_count()
        load_task.load_topic_feeds()
    logger.info("================end================\n")


def main(action=None):
    import sys
    if action is None and len(sys.argv) > 1:
        action = sys.argv[1]
    try:
        load_data(action)
    except:
        logger.exception('news load news error')


def test():
    pass


if __name__ == '__main__':
    main()
