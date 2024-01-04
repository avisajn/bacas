"""
 用于处理create_news的事件的lambda
"""
import base64
import json

from push import config
from push.redis_client import PushRedisClient

redis_client = PushRedisClient(**config.REDIS_CLIENT_CONFIG)


def handler(message: dict):
    event_name = message.get('event_name', '')
    media_id = message.get('media_id', 0)
    news_id = message.get('news_id', 0)
    if event_name == 'create_news' \
            and media_id > 0 \
            and news_id > 0:
        return message
    else:
        return None


def lambda_handler(event, context):
    events = []
    for record in event['Records']:
        payload = base64.b64decode(record['kinesis']['data'])  # type: bytes
        data = handler(json.loads(payload)['message'])
        if data is not None:
            events.append(data)
    if len(events) > 0:
        redis_client.push_create_news_event(events)
    return 'ok'

# bash lambda_deployer.sh flashgo_send_create_news_notification "push" push/lambdas/requirements.txt
