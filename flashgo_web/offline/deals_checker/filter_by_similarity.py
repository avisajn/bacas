from common.loggers import get_offline_logger
from common import config
from offline.loader.load_feeds_data import RedisClient
from offline.filters import filter_by_similar
from common.utils import pick_from_array

logger = get_offline_logger(name=__name__, filename='filter_by_similarity.log')


def main():
    redis_client = RedisClient(**config.OFFLINE_REDIS_CLIENT_CONFIG)
    sells = redis_client.get_sells()
    categories = redis_client.get_categories()
    for category_id in categories:
        result = []
        for sell_id in sells:
            if category_id in [31, 40, 61, 51, 113, 61, 135]:
                deals = redis_client.get_deals(category_id, sell_id)[:2000]
            else:
                deals = redis_client.get_deals(category_id, sell_id)[:400]
            retained_deals = filter_by_similar(deals)
            logger.info(
                'sell_id={} category_id={}: {}/{} deals retained.'.format(
                    sell_id, category_id, len(retained_deals), len(deals)
                )
            )
            result.append(retained_deals)
        deals = pick_from_array(result)
        logger.info('category %s, %s deals' % (category_id, len(deals)))
        redis_client.cache_category_deals(category_id, deals, with_similar=False)


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        logger.exception('filter by similarity error')
