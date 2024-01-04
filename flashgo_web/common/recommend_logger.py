import hashlib
import json
import os
import queue
import threading
import time

from common import loggers
from common.config import MYSQL_CLIENT_CONFIG
from common.mysqlclient import BaseDbClient
from common.sql_models import DEALS_CATEGORIES_MAP, NATIVE_DEALS_CATEGORIES_MAP

logger = loggers.get_logger(__name__)


class MessageClient(object):
    def __init__(self, project_id, impression_topic_name, click_topic_name):
        from google.cloud import pubsub_v1

        self.project_id = project_id
        batch_settings = pubsub_v1.types.BatchSettings(
            max_bytes=1024,  # One kilobyte
            max_latency=1,  # One second
        )
        self.publisher = pubsub_v1.PublisherClient(batch_settings)
        self.impression_topic_path = self.publisher.topic_path(project_id, impression_topic_name)
        self.clicks_topic_path = self.publisher.topic_path(project_id, click_topic_name)

    def publish(self, data, topic_path):
        if isinstance(data, dict):
            data = json.dumps(data).encode('utf-8')
        if isinstance(data, str):
            data = data.encode('utf-8')
        self.publisher.publish(topic_path, data=data)


def get_user_bucket(user_id: str, exp: dict):
    user_id = str(user_id)
    name = exp['name']
    buckets = exp['buckets']
    md5_data = hashlib.md5((user_id + name).encode('utf-8'))
    hash_number = int(md5_data.hexdigest()[:5], 16) % buckets
    return hash_number


default_exps = [
    {
        'name': 'default',
        'buckets': 2
    }
]

news_recommend_exp = {
    'name': 'news_recommend',
    'buckets': 3
}


def concat_bucket_name(user_id, exps=default_exps):
    buckets = []
    for exp in exps:
        buckets.append('%s:%s' % (exp['name'], get_user_bucket(user_id, exp)))
    return ';'.join(buckets)


class RecommendLogger(object):
    def __init__(self, mysql_client: BaseDbClient, message_client: MessageClient):
        self.mysql_client = mysql_client
        self.message_client = message_client
        self._cache = {}

    def set_impression(self, page_id, user_id, deal_ids, buckets, channel, type='deal'):
        data = {
            'page_id': page_id,
            'user_id': user_id,
            'deal_ids': deal_ids,
            'buckets': buckets,
            'channel': channel,
            'type': type
        }
        self.message_client.publish(data, self.message_client.impression_topic_path)

    def _get_and_cache_deal(self, deal_id):
        deal_id = int(deal_id)
        if deal_id in self._cache:
            return self._cache[deal_id]
        else:
            categories = [deal.id for deal in
                          self.mysql_client.retrieve_objects_by_deal_id(DEALS_CATEGORIES_MAP, deal_id=deal_id)]
            native_categories = [deal.id for deal in
                                 self.mysql_client.retrieve_objects_by_deal_id(NATIVE_DEALS_CATEGORIES_MAP, deal_id)]
            deal = {
                'deal_categories': categories,
                'deal_source_categories': native_categories
            }
            if len(self._cache) > 1000:
                self._cache = {}
            self._cache[deal_id] = deal
            return deal

    def set_click(self, user_id, deal_id, buckets, channel, page_id=-1, page_pos=-1):
        data = {
            'page_id': page_id,
            'page_pos': page_pos,
            'user_id': user_id,
            'deal_id': deal_id,
            'deal_categories': self._get_and_cache_deal(deal_id)['deal_categories'],
            'deal_source_categories': self._get_and_cache_deal(deal_id)['deal_source_categories'],
            'buckets': buckets,
            'channel': channel
        }
        self.message_client.publish(data, self.message_client.clicks_topic_path)


class Consumer(object):
    def __init__(self, maxsize=100):
        self._queue = queue.Queue(maxsize=maxsize)
        self.worker = threading.Thread(name='Recommend-Consumer-%s' % os.getpid(), target=self.work)
        self.work_start_flag = False

    def start_consumer(self):
        if self.work_start_flag:
            return
        if not self.worker.is_alive():
            self.work_start_flag = True
            self.worker.start()

    def work(self):
        recommend_logger = RecommendLogger(BaseDbClient(MYSQL_CLIENT_CONFIG),
                                           MessageClient('sale-aggregator', 'impressions', 'clicks'))
        logger.info('start run consumer')
        count = 0
        while True:
            try:
                data = self._queue.get()
                if count == 100 or count < 10:
                    logger.info('consumer %s , data %s' % (count, data))
                    if count > 1000000:
                        count = 0
                    count += 1
                if data is None:
                    time.sleep(1)
                else:
                    if data[0] == 'impression':
                        recommend_logger.set_impression(**data[1])
                    else:
                        recommend_logger.set_click(**data[1])
            except:
                logger.exception('recommend work error')
                time.sleep(1)

    def set_impression(self, page_id, user_id, deal_ids, buckets, channel, type='deal'):
        try:
            self.start_consumer()
            self._queue.put_nowait(('impression',
                                    dict(page_id=page_id, user_id=user_id, deal_ids=deal_ids, buckets=buckets,
                                         channel=channel, type=type)))
        except:
            logger.exception('set impression error, for (%s)' % user_id)

    def set_click(self, user_id, deal_id, buckets, channel, page_id=-1, page_pos=-1):
        try:
            self.start_consumer()
            self._queue.put_nowait(('click', dict(page_id=page_id, user_id=user_id, deal_id=deal_id, buckets=buckets,
                                                  channel=channel, page_pos=page_pos)))
        except:
            logger.exception('set click error, for(%s)' % user_id)


class DoNothingConsumer(object):

    def start_consumer(self):
        pass

    def work(self):
        pass

    def set_impression(self, page_id, user_id, deal_ids, buckets, channel, type='deal'):
        pass

    def set_click(self, user_id, deal_id, buckets, channel, page_id=-1, page_pos=-1):
        pass


deal_logger = DoNothingConsumer()
