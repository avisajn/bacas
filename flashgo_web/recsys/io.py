from typing import List

import redis

from common.constants import RedisKeyPrefix
from recsys.models import FeedItem, FeedType

FEED_NAME = 'U_F_%s_%s'
HOT_FEED_NAME = 'H_F_%s_%s'
CTR_FEED_NAME = 'CTR_F_%s_%s_v2'
COMMON_FEED_NAME = 'COMMON_F_%s_%s'

SHORT_VIDEO_REC_FEED = RedisKeyPrefix.NEWS + 'Short_Video_rec_%s'


class RecSysRedisClient(object):
    _pool_map = {}  # type: dict[(str, int, int, str), redis.ConnectionPool]

    def __init__(self, host, port=6379, db=0, password=None):
        RecSysRedisClient.create_pool(host, port, db, password)
        self._connection = redis.Redis(connection_pool=self._pool_map[(host, port, db, password)])

    @classmethod
    def create_pool(cls, host, port, db, password):
        if (host, port, db, password) not in cls._pool_map:
            cls._pool_map[(host, port, db, password)] = redis.ConnectionPool(
                host=host,
                port=port,
                db=db,
                password=password
            )

    def update_user_feeds(self, user_id, feed_type: FeedType, feed_items: List[FeedItem], expire_time=86400 * 3,
                          delete=True):
        name = FEED_NAME % (feed_type.value, user_id)
        self._update_feeds(name, feed_items, expire_time=expire_time, delete=delete)

    def get_user_feed_left_time(self, user_id, feed_type: FeedType):
        name = FEED_NAME % (feed_type.value, user_id)
        return self._connection.ttl(name)

    def update_hot_feeds(self, recall_field_id, feed_type: FeedType, feed_items: List[FeedItem]):
        name = HOT_FEED_NAME % (feed_type.value, recall_field_id)
        self._update_feeds(name, feed_items)

    def _update_feeds(self, name, feed_items: List[FeedItem], expire_time=86400 * 3, delete=False):
        if len(feed_items) > 0:
            pipeline = self._connection.pipeline()
            if delete:
                pipeline.delete(name)
            pipeline.rpush(name, *[item.to_json_string() for item in feed_items])
            pipeline.expire(name, expire_time)
            pipeline.execute()

    def clear_hot_feeds(self):
        # TODO 改成通过scan方式获取
        for key in self._connection.keys('H_F_*'):
            self._connection.delete(key)

    def get_user_feeds(self, user_id, feed_type: FeedType = None) -> List[FeedItem]:
        feed_types = [feed_type] if feed_type is not None else FeedType.get_default_feeds()
        names = [FEED_NAME % (feed_type.value, user_id) for feed_type in feed_types]
        return self._get_feeds(names)

    def expire_user_feeds(self, user_id, feed_type: FeedType = FeedType.ONLINE, ttl=2):
        name = FEED_NAME % (feed_type.value, user_id)
        return self._connection.expire(name, ttl)

    def get_hot_feeds(self, recall_field_id, feed_type: FeedType):
        name = feed_type.get_pattern() % (feed_type.value, recall_field_id)
        return self._get_feeds([name])

    def get_same_type_feeds(self, recall_field_ids: list, feed_type: FeedType) -> List[List[FeedItem]]:
        names = [feed_type.get_pattern() % (feed_type.value, recall_field_id) for recall_field_id in recall_field_ids]
        return self._get_feed_list(names)

    def _get_feed_list(self, names) -> List[List[FeedItem]]:
        pipeline = self._connection.pipeline()
        for name in names:
            pipeline.lrange(name, 0, -1)
        ret = []  # type: List[List[FeedItem]]
        for values in pipeline.execute():
            if values is not None and len(values) > 0:
                feed_items = [FeedItem.parse(item) for item in values]
                ret.append(feed_items)
        return ret

    def _get_feeds(self, names):
        pipeline = self._connection.pipeline()
        for name in names:
            pipeline.lrange(name, 0, -1)
        ret = []  # type: List[FeedItem]
        item_ids = set()
        for values in pipeline.execute():
            if values is not None and len(values) > 0:
                for item in values:
                    feed_item = FeedItem.parse(item)
                    if feed_item.item_id not in item_ids:
                        item_ids.add(feed_item.item_id)
                        ret.append(feed_item)
        return ret

    def cache_common_hot_feeds(self, common_feeds: List[FeedItem], is_news=True):
        if is_news:
            name = COMMON_FEED_NAME % (FeedType.COMMON.value, 'news')
        else:
            name = COMMON_FEED_NAME % (FeedType.COMMON.value, 'video')
        self._update_feeds(name, common_feeds, delete=True)

    def get_short_video_rec_feed(self, news_id: int) -> List[int]:
        name = SHORT_VIDEO_REC_FEED % news_id
        news_ids = self._connection.lrange(name, 0, -1)
        return [int(news_id) for news_id in news_ids]


rec_redis_client = RecSysRedisClient('flashgo-rec.kub6uf.0001.apse1.cache.amazonaws.com')


def _test():
    rec_redis_client.update_user_feeds('test', FeedType.ONLINE, [FeedItem(1, 'recall_name', 'sort_name', 'exp_name'),
                                                                 FeedItem(2, 'recall_name', 'sort_name', 'exp_name')])


class RecSysMysqlClient(object):
    pass


class ESClient(object):
    pass


class ItemProfileDAO(object):
    pass


class UserProfileDAO(object):
    pass


if __name__ == '__main__':
    # _test()
    ret = rec_redis_client.get_hot_feeds('news', FeedType.COMMON)
    print(len(ret))
