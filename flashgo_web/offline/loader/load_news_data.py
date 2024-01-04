import datetime
import json
import os
import random
import uuid

import arrow
from sqlalchemy import desc

from author.utils import get_author_info
from common import loggers
from common.constants import NEWS_TYPE_MAPPING, GENDER_CONFIG, RedisKeyPrefix, MIN_USER_AUTHOR_ID
from common.es_client import es_client, ESClient
from common.redisclient import AUTHOR_FOLLOWED_COUNT
from common.s3client import s3_client
from common.sql_models import CommonNewsCategories, RssMedia, InterestNewsCategoryMapping, Rss, UserFollowing, \
    NewsCategoryMapping
from common.utils import pick_from_array, random_pick, get_random_ids
from common.views import _get_interest_rec_author
from favorite.sql_model import SelectedInterests, UserLike
from favorite.utils import _get_selected_interests
from news.constants import NewsStatus
from news.models import News, NewsLikesCount
from offline.loader.mysqlclient import mysql_client, MySQLClient
from offline.loader.redisclient import redis_client, RedisClient, FAKE_USER_FEED
from recsys.io import rec_redis_client
from recsys.models import FeedItem
from users.models import User, UserExtraInfo

logger = loggers.get_offline_logger(__name__, 'offline_news.log')

NEWS_FEEDS_SIZE = 10000


def set_logger(name):
    global logger
    logger = loggers.get_offline_logger(__name__, name + '.log')


class LoadTask(object):
    def __init__(self, redis_client: RedisClient, mysql_client: MySQLClient, es_client: ESClient):
        self.redis_client = redis_client
        self.mysql_client = mysql_client
        self.es_client = es_client

    def get_newest_news(self, days=360, size=15000, type=None):
        start_time = datetime.datetime.now() - datetime.timedelta(days=days)
        if type is None:
            news = self.mysql_client.retrieve_objects_by_conditions(News, News.created_time > start_time,
                                                                    News.valid == 1, limit=size)
        else:
            news = self.mysql_client.retrieve_objects_by_conditions(News, News.created_time > start_time,
                                                                    News.valid == 1, News.type == type, limit=size)

        news = [news for news in sorted(news, key=lambda obj: obj.created_time.timestamp(), reverse=True)]
        return news

    def update_news_likes_count(self):
        news_ids = list(self.redis_client.get_and_del_update_likes_news_set(delete_old_data=True))
        logger.info('news, size {}, need to update likes count, 10th {}'.format(len(news_ids), news_ids[:10]))
        for news_id in news_ids:
            likes_count = self.mysql_client.get_instances_count(UserLike.id, UserLike.news_id == news_id)
            if likes_count is not None:
                self.mysql_client.create_or_update_likes_count(news_id, likes_count)
                logger.info(f'update news_id {news_id}, likes count {likes_count}')

    def load_new_news(self):
        invalid_media_ids = set(media.user_id for media in
                                mysql_client.retrieve_objects_by_conditions(User, User.user_type == 2,
                                                                            User.show_on_feed == 0))
        now = arrow.utcnow()
        news_category = {}
        count = 0
        for news_list in self.es_client.get_update_recently_news(now.shift(minutes=-10, seconds=-10).isoformat(),
                                                                 now.isoformat()):
            for news in news_list:
                if int(news['news_media_id']) in invalid_media_ids:
                    continue
                news_id = int(news['news_id'])
                news_type = int(news['news_news_type'])
                category_ids = [data['category_id'] for data in news['news_categories']]
                for category_id in category_ids:
                    key = '{}:{}'.format(category_id, news_type)
                    category_news_ids = news_category.get(key, [])
                    category_news_ids.append(news_id)
                    news_category[key] = category_news_ids
                count += 1
        logger.info('Get {} news to update.'.format(count))
        for key, news_ids in news_category.items():
            category_id, _, news_type = key.partition(':')
            self.redis_client.cache_news_ids_by_category(category_id, news_type, news_ids)
            logger.info('category {} {} news, size {}, 10th are {}'.format(category_id, news_type, len(news_ids),
                                                                           news_ids[:10]))

    def _load_gender_recommend_feed(self, gender, category_news_mapping):
        if gender == 'Female':
            gender_cate_ids = [
                obj.id for obj in mysql_client.retrieve_objects_by_conditions(CommonNewsCategories,
                                                                              CommonNewsCategories.gender.in_({2, 0}),
                                                                              CommonNewsCategories.valid == 1)]
        else:
            gender_cate_ids = [
                obj.id for obj in mysql_client.retrieve_objects_by_conditions(CommonNewsCategories,
                                                                              CommonNewsCategories.gender.in_({1, 0}),
                                                                              CommonNewsCategories.valid == 1)]
        news_array = []
        weights = []
        for category_id, news_list in category_news_mapping.items():
            news_ids = category_news_mapping.get(category_id, [])
            if len(news_ids) > 0:
                news_array.append(news_ids)
                if category_id in gender_cate_ids:
                    weights.append(5)
                else:
                    weights.append(1)
        # hot news
        gender_click = self.redis_client.get_gender_click_news(gender)
        logger.info('{} click news, size {}, 10th'.format(gender, len(gender_click), gender_click[:10]))
        news_array.append(gender_click)
        weights.append(10)
        gender_news_feed = random_pick(news_array, weights, size=NEWS_FEEDS_SIZE)

        news_array = [gender_news_feed]
        weights = [1]

        # 增加30%的fake user发的新闻
        fake_user_feed = self._get_fake_user_feed()
        if fake_user_feed is not None and len(fake_user_feed) > 0:
            news_array.append(fake_user_feed)
            weights.append(0.3)

        # 增加20%的real user发的新闻
        real_user_feed = self._get_real_user_feed()
        if real_user_feed is not None and len(real_user_feed) > 0:
            news_array.append(real_user_feed)
            weights.append(0.5)
        gender_news_feed = random_pick(news_array, weights=weights)
        redis_client.cache_gender_news_feeds(gender, gender_news_feed)
        logger.info('cache {} news feed, size {}, 10th are {}'.format(gender, len(gender_news_feed),
                                                                      gender_news_feed[:10]))

    def _get_fake_user_feed(self):
        # fake_users = self.mysql_client.retrieve_objects_by_conditions(User, User.user_type == 1,
        #                                                               User.show_on_feed >= 1)
        # fake_user_ids = [user.user_id for user in fake_users]

        # 加权的fake user目前是产品指定的
        fake_user_ids = ['1950', '1951', '1952', '1953', '1954', '1956', '1957', '1958', '1959', '1960']
        news_array = []
        for user_id in fake_user_ids:
            news_list = self.mysql_client.retrieve_objects_by_conditions(News, News.media_id == user_id,
                                                                         News.valid >= 1)
            news_list = sorted(news_list, key=lambda obj: obj.publish_time, reverse=True)
            news_array.append([news.news_id for news in news_list])
        fake_user_news_feed = pick_from_array(news_array)
        return fake_user_news_feed

    def _get_real_user_feed(self):
        recent_news_list = self.mysql_client.retrieve_sortable_objects_by_conditions(News,
                                                                                     News.valid == NewsStatus.SUCCESS,
                                                                                     News.media_id > MIN_USER_AUTHOR_ID,
                                                                                     order_conditions=desc(
                                                                                         News.news_id),
                                                                                     limit=2000)
        news_array = [news.news_id for news in recent_news_list]
        random.shuffle(news_array)
        logger.info(f"Get real user feeds size {len(news_array)}, 10th {news_array[:10]}")
        return news_array

    def load_news_recommend_feeds(self):
        basic_category_ids = [category.id for category in
                              self.mysql_client.retrieve_objects_by_conditions(CommonNewsCategories,
                                                                               CommonNewsCategories.level == 1,
                                                                               CommonNewsCategories.valid == 1)]
        category_news_mapping = {}
        for category_id in basic_category_ids:
            news_array = []
            for news_type in NEWS_TYPE_MAPPING.values():
                news_ids = self.redis_client.get_news_ids_by_category(category_id, news_type)
                if len(news_ids) > 0:
                    news_array.append(news_ids)
            if len(news_array) > 0:
                news_category_feed = pick_from_array(news_array, size=1000)
                category_news_mapping[category_id] = news_category_feed
        self._load_gender_recommend_feed('Male', category_news_mapping)
        self._load_gender_recommend_feed('Female', category_news_mapping)
        weights = []
        category_ids = list(category_news_mapping.keys())
        default_array = [category_news_mapping[category_id] for category_id in category_ids]
        for category_id in category_ids:
            if category_id == 17:
                weights.append(len(category_ids) // 5)
            else:
                weights.append(1)
        logger.info("category_ids {} have no news_id".format(
            [category_id for category_id in basic_category_ids if category_id not in category_ids]))
        logger.info("category_ids: {}".format(category_ids))
        logger.info("weights: {}".format(weights))
        news_feed = random_pick(default_array, weights)

        news_array = [news_feed]
        weights = [1]

        # 增加30%的fake user发的新闻
        fake_user_feed = self._get_fake_user_feed()
        logger.info(f'get fake user feed to hot_news_feed, size {len(fake_user_feed)}')
        if fake_user_feed is not None and len(fake_user_feed) > 0:
            news_array.append(fake_user_feed)
            weights.append(0.3)

        # 增加20%的real user发的新闻
        real_user_feed = self._get_real_user_feed()
        logger.info(f'get real user feed to hot_news_feed, size {len(real_user_feed)}')
        if real_user_feed is not None and len(real_user_feed) > 0:
            news_array.append(real_user_feed)
            weights.append(0.5)

        news_feed = random_pick(news_array, weights=weights)
        rec_common_feeds = []
        for news_id in news_feed:
            data = {'item_id': news_id, 'recall': 'default', 'sort': 'random', 'exp': 'random'}
            feed_item = FeedItem(**data)
            rec_common_feeds.append(feed_item)
        rec_redis_client.cache_common_hot_feeds(rec_common_feeds, is_news=True)
        logger.info('cache FeedItem news feed, size {}'.format(len(rec_common_feeds)))

    def _load_gender_video_feeds(self, gender):
        basic_categories = self.mysql_client.retrieve_objects_by_conditions(CommonNewsCategories,
                                                                            CommonNewsCategories.level == 1,
                                                                            CommonNewsCategories.valid == 1)
        basic_category_ids = [cate.id for cate in basic_categories]
        if gender == 'Female':
            gender_cate_ids = [cate.id for cate in basic_categories if cate.gender in {2, 0}]

        else:
            gender_cate_ids = [cate.id for cate in basic_categories if cate.gender in {1, 0}]
        normal_array = []
        youtube_array = []
        weights = []
        for category_id in basic_category_ids:
            normal_video_ids = []
            youtube_video_ids = []
            video_ids = self.redis_client.get_news_ids_by_category(category_id, NEWS_TYPE_MAPPING['video'])
            videos = sorted(self.mysql_client.retrieve_objects_by_conditions(News, News.news_id.in_(video_ids)),
                            key=lambda obj: obj.created_time, reverse=True)
            for video in videos:
                if 'www.youtube.com' in video.url:
                    youtube_video_ids.append(video.news_id)
                normal_video_ids.append(video.news_id)
            normal_array.append(normal_video_ids)
            youtube_array.append(youtube_video_ids)
            if category_id in gender_cate_ids:
                weights.append(5)
            else:
                weights.append(1)
        youtube_feed = random_pick(youtube_array, weights, NEWS_FEEDS_SIZE)
        self.redis_client.cache_youtube_video_feeds(youtube_feed, gender)
        logger.info('cache {} youtube feed, size {}. 10th are {}'.format(gender, len(youtube_feed), youtube_feed[:10]))
        normal_feed = random_pick(normal_array, weights, NEWS_FEEDS_SIZE)
        self.redis_client.cache_normal_video_feeds(normal_feed, gender)
        logger.info('cache {} normal video feed, size {}. 10th are {}'.format(
            gender, len(normal_feed), normal_feed[:10]))

    def load_news_video_feed(self):
        self._load_gender_video_feeds('Male')
        self._load_gender_video_feeds('Female')
        self.redis_client.cache_normal_video_feeds(pick_from_array([
            self.redis_client.get_normal_video_feeds('Male'),
            self.redis_client.get_normal_video_feeds("Female")
        ]))
        self.redis_client.cache_youtube_video_feeds(pick_from_array([
            self.redis_client.get_youtube_video_feeds('Male'),
            self.redis_client.get_youtube_video_feeds('Female')
        ]))

    def load_common_video_feeds(self):
        basic_categories = self.mysql_client.retrieve_objects_by_conditions(CommonNewsCategories,
                                                                            CommonNewsCategories.level == 1,
                                                                            CommonNewsCategories.valid == 1)
        basic_category_ids = [cate.id for cate in basic_categories]
        normal_array = []
        for category_id in basic_category_ids:
            video_ids = self.redis_client.get_news_ids_by_category(category_id, NEWS_TYPE_MAPPING['video'])
            random.shuffle(video_ids)
            normal_array.append(video_ids)
        rec_common_feeds = []
        for news_id in pick_from_array(normal_array):
            feed_item = FeedItem(item_id=news_id, recall='default', sort='random', exp='random')
            rec_common_feeds.append(feed_item)
        rec_redis_client.cache_common_hot_feeds(rec_common_feeds, is_news=False)
        logger.info('cache FeedItem video feeds, size {}'.format(len(rec_common_feeds)))

    def load_author_feed(self):
        media_users = self.mysql_client.retrieve_objects_by_conditions(User, User.user_type == 2,
                                                                       User.show_on_feed >= 1)
        media_ids = [media.user_id for media in media_users]
        for media_id in media_ids:
            news_list = self.mysql_client.retrieve_objects_by_conditions(News, News.media_id == media_id,
                                                                         News.valid >= 1)

            # 部分news的publish字段值为None, 用created_time字段代替
            for news in news_list:
                if news.publish_time is None:
                    news.publish_time = news.created_time
            news_list = sorted(news_list, key=lambda obj: obj.publish_time, reverse=True)

            # 缓存media user的全部普通新闻feed流
            news_ids = [news.news_id for news in news_list]
            self.redis_client.cache_author_feed(media_id, news_ids, is_hot=False)
            logger.info(f'Cache media_id {media_id} common feed, size {len(news_ids)}, top ten {news_ids[:10]}')

            # 缓存media user的3个热门新闻feed流 (按点赞排序, 如果所有新闻均没有被点赞过, 取最新发布的前三个)
            news_likes = self.mysql_client.retrieve_objects_by_conditions(NewsLikesCount,
                                                                          NewsLikesCount.news_id.in_(set(news_ids)))
            hot_news = sorted(news_likes, key=lambda news_like: int(news_like.likes_count), reverse=True)
            hot_news_ids = [news_object.news_id for news_object in hot_news[:3]] + news_ids[:3]
            self.redis_client.cache_author_feed(media_id, hot_news_ids[:3], is_hot=True)
            logger.info(f'Cache media_id {media_id} hot feed, news ids {hot_news_ids[:3]}')

    def load_interest_author(self):
        interests = self.mysql_client.retrieve_objects_by_conditions(SelectedInterests, SelectedInterests.status == 1)
        for interest in interests:
            interest_id = interest.id
            category_mappings = self.mysql_client.retrieve_objects_by_conditions(InterestNewsCategoryMapping,
                                                                                 InterestNewsCategoryMapping.interest_id == interest_id)
            category_ids = {mapping.news_category_id for mapping in category_mappings}
            rss = self.mysql_client.retrieve_objects_by_conditions(Rss, Rss.fg_cate_id.in_(category_ids))
            rss_ids = {rss_object.id for rss_object in rss}
            rss_media = self.mysql_client.retrieve_objects_by_conditions(RssMedia, RssMedia.rss_id.in_(rss_ids))
            media_ids = {rss_media_object.media_id for rss_media_object in rss_media}
            media = self.mysql_client.retrieve_objects_by_conditions(User, User.id.in_(media_ids),
                                                                     User.show_on_feed == 1)
            media_ids = [media.user_id for media in media]
            media_statistic = self.mysql_client.retrieve_objects_by_conditions(UserExtraInfo,
                                                                               UserExtraInfo.user_id.in_(media_ids))
            media = sorted(media_statistic, key=lambda obj: int(obj.be_likes_count), reverse=True)
            media_ids = []
            for media_obj in media:
                if len(self.redis_client.get_author_feed(media_obj.user_id)) > 0:
                    media_ids.append(media_obj.id)
            self.redis_client.cache_interest_authors(interest_id, media_ids)
            logger.info('Cache interest_id {} author feed, size {}, 10th {}.'.format(interest_id, len(media_ids),
                                                                                     media_ids[:10]))

    def update_author_info(self):
        author_ids = self.redis_client.get_and_del_need_update_authors()
        logger.info('{} author_ids to update, 10th are {}.'.format(len(author_ids), author_ids[:10]))
        for index, media_id in enumerate(author_ids):
            # Get followers count today.
            followers_count = self.mysql_client.get_instances_count(UserFollowing.id,
                                                                    UserFollowing.author_id == media_id)
            # Count the number of total likes.
            news_list = self.mysql_client.retrieve_objects_by_conditions(News, News.valid == NewsStatus.SUCCESS,
                                                                         News.media_id == media_id)
            news_ids = [news.news_id for news in news_list]
            total_likes_count = self.mysql_client.get_instances_count(UserLike.id, UserLike.news_id.in_(news_ids))

            ttl = (int(media_id) % 30) * 60
            self.redis_client.expire_object_cache(AUTHOR_FOLLOWED_COUNT % media_id, ttl, min_ttl=60)
            # 更新user_extra_info表的数据
            user_extra_info = self.mysql_client.retrieve_object_by_unique_key(UserExtraInfo, user_id=str(media_id))
            try:
                if user_extra_info is None:
                    self.mysql_client.create_object(UserExtraInfo(id=media_id,
                                                                  user_id=str(media_id),
                                                                  be_follows_count=followers_count,
                                                                  be_likes_count=total_likes_count))
                else:
                    self.mysql_client.update_object(UserExtraInfo, media_id, contain_updated_time=True,
                                                    be_follows_count=followers_count, be_likes_count=total_likes_count)
                logger.info('{}, be_follows_count {}, be_likes_count {}.'.format(media_id, followers_count,
                                                                                 total_likes_count))
            except:
                logger.exception(f"update error, author_id {media_id}")

    def cache_get_options_data(self, cache_count=5):
        gender_data = GENDER_CONFIG
        interest_data = []
        for gender in ['Male', 'Female']:
            interests = _get_selected_interests(gender)
            for data in interests:
                data.pop('en_name')
                data['name'] = data.pop('id_name')
                data['gender_id'] = 1 if gender == 'Male' else 2
                interest_data.append(data)
        for suffix in range(cache_count):
            author_data = []
            for interest_id in [data['id'] for data in interest_data]:
                rec_author_ids = _get_interest_rec_author(interest_id)
                if len(rec_author_ids) < 6:
                    author_ids = list(set(redis_client.get_interest_author_feed(interest_id)) - set(rec_author_ids))
                    rec_author_ids += get_random_ids(author_ids, 6 - len(rec_author_ids))
                logger.info('suffix {}, interest_id {}, author_ids {}'.format(suffix, interest_id, rec_author_ids))
                for author_id in rec_author_ids:
                    try:
                        author_info = get_author_info(author_id, None, False)
                        author_info['interest_id'] = interest_id
                        author_data.append(author_info)
                    except:
                        logger.info('Error occurred in get author {} info.'.format(author_id))
            res = {
                'errno': 0,
                'errmsg': '',
                'data': {
                    'gender': gender_data,
                    'interest': interest_data,
                    'author': author_data
                },
                'impression_id': str(uuid.uuid4())
            }
            json_str = json.dumps(res, indent=2)
            local_file_path = './get_options_data.json'
            with open(local_file_path, 'w+') as f:
                f.write(json_str)
            s3_client.upload_file(local_file_path=local_file_path, file_name=f'user-options/option_data_{suffix}.json',
                                  content_type='json')
            logger.info(f'Cache options option_data_{suffix}.json')
            if os.path.exists(local_file_path):
                os.remove(local_file_path)

    def filter_vape(self):
        keys = [
            "CTR_F_ctrgender_Female",
            "CTR_F_ctrgender_Male",
            "CTR_F_ctrinterest_1",
            "CTR_F_ctrinterest_2",
            "CTR_F_ctrinterest_3",
            "CTR_F_ctrinterest_4",
            "CTR_F_ctrinterest_5",
            "CTR_F_ctrinterest_6",
            "CTR_F_ctrinterest_7",
            "CTR_F_ctrinterest_8",
            "CTR_F_ctrinterest_9",
            "CTR_F_ctrinterest_10",
            "CTR_F_ctrinterest_11",
            "CTR_F_ctrinterest_12",
            "CTR_F_ctrinterest_13",
            "CTR_F_ctrinterest_14",
            "CTR_F_ctrinterest_15",
            "CTR_F_ctrinterest_16",
            "CTR_F_ctrinterest_17",
            "CTR_F_ctrinterest_18",
        ]
        for key in keys:
            length = rec_redis_client._connection.llen(key)
            cache = set()
            ret = []
            vape_count = 0
            for i in range(0, length + 1, 500):
                items = rec_redis_client._connection.lrange(key, i, i + 500)
                news_ids = [json.loads(json_str)['item_id'] for json_str in items]
                news_categories = self.mysql_client.retrieve_objects_by_conditions(
                    NewsCategoryMapping, NewsCategoryMapping.news_id.in_(news_ids),
                    NewsCategoryMapping.category_id == 16)
                vape_news_ids = {obj.news_id for obj in news_categories}
                for item in items:
                    item = json.loads(item)
                    news_id = item['item_id']
                    if news_id in vape_news_ids or news_id in cache:
                        pass
                    else:
                        ret.append(json.dumps(item))
                        cache.add(news_id)
                vape_count += len(vape_news_ids)

            new_key = f'{key}_v2'
            is_empty = False
            for j in range(0, len(ret) + 1, 1000):

                # 如果原来的key没有数据, 那么不更新 "%s_v2"
                if len(ret) == 0:
                    is_empty = True
                    break
                else:
                    pipeline = rec_redis_client._connection.pipeline()
                    if j == 0:
                        pipeline.delete(new_key)

                    items = ret[j:j + 1000]
                    if len(items) > 0:
                        pipeline.rpush(new_key, *items)
                        pipeline.expire(new_key, 32 * 24 * 60 * 60)
                        pipeline.execute()
            if is_empty:
                logger.info(f'{key} is empty, not update.')
            else:
                logger.info(f'{new_key}: {len(ret)}/{length} retained. vape size {vape_count}')


def load_data(action):
    load_task = LoadTask(redis_client, mysql_client, es_client)
    logger.info("\nstart")
    if action == 'likes-count':
        set_logger(action)
        load_task.update_news_likes_count()
    elif action == 'author-feed':
        set_logger(action)
        load_task.load_author_feed()
        load_task.load_interest_author()
    elif action == 'author-info':
        set_logger(action)
        load_task.update_author_info()
    elif action == 'cache-interest':
        set_logger(action)
        load_task.cache_get_options_data()
    elif action == 'filter-vape':
        set_logger(action)
        load_task.filter_vape()
    else:
        load_task.load_new_news()
        load_task.load_news_recommend_feeds()
        load_task.load_news_video_feed()
        load_task.load_common_video_feeds()

    logger.info("end\n")


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
