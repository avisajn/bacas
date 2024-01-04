from offline.loader.mysqlclient import mysql_client
from offline.loader.redisclient import redis_client
from common import loggers
from common.sql_models import CommonNewsCategories
from common.constants import NEWS_TYPE_MAPPING
from news.models import News, NewsImages


logger = loggers.get_logger(name=__name__, filename='delete_invalid_news.log')


def filter_invalid_news():
    news_category_ids = [news_cate.id for news_cate in
                         mysql_client.retrieve_objects_by_conditions(CommonNewsCategories,
                                                                     CommonNewsCategories.valid == 1)]
    for cate_id in news_category_ids:
        for type_name, news_type in NEWS_TYPE_MAPPING.items():
            old_news_ids = set(redis_client.get_news_ids_by_category(cate_id, news_type))
            news = mysql_client.retrieve_objects_by_conditions(News, News.news_id.in_(old_news_ids))
            valid_news_ids = {obj.news_id for obj in news if obj.valid == 1}
            invalid_news_ids = old_news_ids - valid_news_ids
            redis_client.del_invalid_news_ids(cate_id, news_type, invalid_news_ids)
            logger.info('news {} cate {} : {}/{} retained.'.format(type_name, cate_id, len(valid_news_ids),
                                                                   len(old_news_ids)))


def main():
    try:
        filter_invalid_news()
    except:
        logger.exception('filter invalid news error')


if __name__ == '__main__':
    main()