import json

import redis
from common import config
from common.utils import list_to_chunk
from offline.binlog_to_redis.function import RedisClient as BinlogRedisClient
from common.loggers import get_logger
from offline.filters import filter_by_invalid

O_CACHE_DEAL = 'O_C_deal_%s_0'

logger = get_logger(name=__name__, filename='delete_invalid_deals.log')


class RedisClient(BinlogRedisClient):

    def __init__(self, host, port=6379, db=0, password=None):
        self.redis_client = redis.StrictRedis(host=host, port=port, db=db, password=password,
                                              socket_connect_timeout=3)

    def batch_get_deals(self, deal_ids):
        res = {}
        for chunk in list_to_chunk(deal_ids, size=100):
            pipeline = self.redis_client.pipeline()
            for deal_id in chunk:
                pipeline.get(O_CACHE_DEAL % deal_id)
            for index, value in enumerate(pipeline.execute()):
                deal = json.loads(value.decode('utf8'))['deal']
                res[deal['id']] = deal
        return res

    def batch_del_deal(self, deal_ids, size=250):
        for i in range(0, len(deal_ids), size):
            items = deal_ids[i: i + size]
            for deal_id in items:
                self.del_deal(deal_id)


def main():
    redis_client = RedisClient(**config.OFFLINE_REDIS_CLIENT_CONFIG)

    sells = redis_client.get_sells()
    categories = redis_client.get_categories()
    for category in categories:
        for sell in sells:
            deals = redis_client.get_deals(category, sell) + redis_client.get_deals(category, sell, flash_deal=True)
            valid_deals = filter_by_invalid(list(deals))
            invalid_deals = set(deals) - set(valid_deals)
            logger.info('sell {} category {} : invalid {} / total {}'.format(sell, category, len(invalid_deals),
                                                                             len(deals)))
            if len(invalid_deals) != 0:
                redis_client.batch_del_deal(list(invalid_deals))


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        logger.exception('filter by invalid deals error')
