import datetime
import json

import redis

PUSH_EVENTS_QUEUE = 'pub_news_queue_%s'
COMMENT_LIKE_EVENTS_QUEUE = 'C:like_message_%s'
COMMENT_REPLIED_EVENTS_QUEUE = 'C:be_replied_%s'
NEWS_AUDIT_EVENTS_QUEUE = 'N:news_audit_%s'
NEWS_BE_COMMENTED_QUEUE = 'N:news_be_commented_%s'
NEWS_BE_LIKED_QUEUE = 'N:news_be_liked_%s'
INCENTIVE_INCOME_PUSH_QUEUE = 'B:incentive_income_%s'


class PushRedisClient(object):
    _pool_map = {}  # type: dict[(str, int, int, str), redis.ConnectionPool]

    @classmethod
    def create_pool(cls, host, port, db, password):
        if (host, port, db, password) not in cls._pool_map:
            cls._pool_map[(host, port, db, password)] = redis.ConnectionPool(
                host=host,
                port=port,
                db=db,
                password=password
            )

    def __init__(self, host, port, db, password=None):
        PushRedisClient.create_pool(host, port, db, password)
        self._connection = redis.Redis(connection_pool=self._pool_map[(host, port, db, password)])

    def push_create_news_event(self, events):
        queue_name = PUSH_EVENTS_QUEUE % datetime.datetime.now().strftime('%Y%m%d')
        pipeline = self._connection.pipeline()
        pipeline.lpush(queue_name, *[json.dumps(event) for event in events])
        pipeline.expire(queue_name, 3 * 86400)
        pipeline.execute()

    def receive_create_news_event(self):
        queue_names = [PUSH_EVENTS_QUEUE % datetime.datetime.now().strftime('%Y%m%d'),
                       PUSH_EVENTS_QUEUE % (datetime.datetime.now() - datetime.timedelta(days=1)).strftime('%Y%m%d')]
        pipeline = self._connection.pipeline()
        for queue in queue_names:
            pipeline.lrange(queue, 0, -1)
        for queue in queue_names:
            pipeline.delete(queue)
        events = []
        for index, result in enumerate(pipeline.execute()):
            if index < len(queue_names):
                events += [json.loads(event) for event in result]
        return events

    def receive_comment_like_event(self):
        queue_names = [COMMENT_LIKE_EVENTS_QUEUE % datetime.datetime.utcnow().strftime('%Y%m%d'),
                       COMMENT_LIKE_EVENTS_QUEUE % (datetime.datetime.utcnow() - datetime.timedelta(days=1)).strftime(
                           '%Y%m%d')]
        pipeline = self._connection.pipeline()
        for queue in queue_names:
            pipeline.lrange(queue, 0, -1)
        for queue in queue_names:
            pipeline.delete(queue)
        events = []
        for index, result in enumerate(pipeline.execute()):
            if index < len(queue_names):
                events += [json.loads(event) for event in result]
        for event in events:
            event['event_name'] = 'comment_like'
        return events

    def receive_comment_replied_event(self):
        queue_names = [COMMENT_REPLIED_EVENTS_QUEUE % datetime.datetime.utcnow().strftime('%Y%m%d'),
                       COMMENT_REPLIED_EVENTS_QUEUE % (
                               datetime.datetime.utcnow() - datetime.timedelta(days=1)).strftime('%Y%m%d')]
        pipeline = self._connection.pipeline()
        for queue in queue_names:
            pipeline.lrange(queue, 0, -1)
        for queue in queue_names:
            pipeline.delete(queue)
        events = []
        for index, result in enumerate(pipeline.execute()):
            if index < len(queue_names):
                events += [json.loads(event) for event in result]
        for event in events:
            event['event_name'] = 'comment_replied'
        return events

    def receive_news_audit_event(self):
        queue_names = [NEWS_AUDIT_EVENTS_QUEUE % datetime.datetime.utcnow().strftime('%Y%m%d'),
                       NEWS_AUDIT_EVENTS_QUEUE % (
                               datetime.datetime.utcnow() - datetime.timedelta(days=1)).strftime('%Y%m%d')]
        pipeline = self._connection.pipeline()
        for queue in queue_names:
            pipeline.lrange(queue, 0, -1)
        for queue in queue_names:
            pipeline.delete(queue)
        events = []
        for index, result in enumerate(pipeline.execute()):
            if index < len(queue_names):
                events += [json.loads(event) for event in result]
        for event in events:
            event['event_name'] = 'news_audit'
        return events

    def receive_news_be_commented(self):
        queue_names = [NEWS_BE_COMMENTED_QUEUE % datetime.datetime.utcnow().strftime('%Y%m%d'),
                       NEWS_BE_COMMENTED_QUEUE % (
                               datetime.datetime.utcnow() - datetime.timedelta(days=1)).strftime('%Y%m%d')]
        pipeline = self._connection.pipeline()
        for queue in queue_names:
            pipeline.lrange(queue, 0, -1)
        for queue in queue_names:
            pipeline.delete(queue)
        events = []
        for index, result in enumerate(pipeline.execute()):
            if index < len(queue_names):
                events += [json.loads(event) for event in result]
        for event in events:
            event['event_name'] = 'news_be_commented'
        return events

    def receive_news_be_liked(self):
        queue_names = [NEWS_BE_LIKED_QUEUE % datetime.datetime.utcnow().strftime('%Y%m%d'),
                       NEWS_BE_LIKED_QUEUE % (
                               datetime.datetime.utcnow() - datetime.timedelta(days=1)).strftime('%Y%m%d')]
        pipeline = self._connection.pipeline()
        for queue in queue_names:
            pipeline.lrange(queue, 0, -1)
        for queue in queue_names:
            pipeline.delete(queue)
        events = []
        for index, result in enumerate(pipeline.execute()):
            if index < len(queue_names):
                events += [json.loads(event) for event in result]
        for event in events:
            event['event_name'] = 'news_be_liked'
        return events

    def receive_incentive_income(self):
        queue_names = [INCENTIVE_INCOME_PUSH_QUEUE % datetime.datetime.utcnow().strftime('%Y%m%d'),
                       INCENTIVE_INCOME_PUSH_QUEUE % (
                               datetime.datetime.utcnow() - datetime.timedelta(days=1)).strftime('%Y%m%d')]
        pipeline = self._connection.pipeline()
        for queue in queue_names:
            pipeline.lrange(queue, 0, -1)
        for queue in queue_names:
            pipeline.delete(queue)
        events = []
        for index, result in enumerate(pipeline.execute()):
            if index < len(queue_names):
                events += [json.loads(event) for event in result]
        for event in events:
            event['event_name'] = 'incentive_income'
        return events
