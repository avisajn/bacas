from collections import namedtuple
from enum import Enum

from common.sqs_client import SQSQueue

# SQS
_PushQueueValue = namedtuple('_PushQueueValue', ['value', 'url', 'push_per_hour', 'push_per_day'])


class PushQueue(SQSQueue, Enum):
    # 按优先级，由低到高排序
    PUSH_P1 = _PushQueueValue('push_queue_p1',
                              'https://sqs.ap-southeast-1.amazonaws.com/239801832578/flash_go_push_queue_p1',
                              push_per_hour=3,
                              push_per_day=10)
    PUSH_P2 = _PushQueueValue('push_queue_p2',
                              'https://sqs.ap-southeast-1.amazonaws.com/239801832578/flash_go_push_queue_p2',
                              push_per_hour=3,
                              push_per_day=15)
    PUSH_P3 = _PushQueueValue('push_queue_p3',
                              'https://sqs.ap-southeast-1.amazonaws.com/239801832578/flash_go_push_queue_p3',
                              push_per_hour=5,
                              push_per_day=20)
    PUSH_P4 = _PushQueueValue('push_queue_p4',
                              'https://sqs.ap-southeast-1.amazonaws.com/239801832578/flash_go_push_queue_p4',
                              push_per_hour=5,
                              push_per_day=20)

    @property
    def queue_url(self):
        return self.value.url

    @property
    def queue_name(self):
        return self.value.value

    @property
    def push_per_hour(self):
        return self.value.push_per_hour

    @property
    def push_per_day(self):
        return self.value.push_per_day


# FCM
FCM_API_KEY = 'AAAAjW90NIU:APA91bHvBxi-yRYqnf0O5XEgUMyY2FXkpoDMbBtPrH-4I9d-bk2cBtV8lxV-7kcapXy9pLh8wt-mzft2mi8gjKE9TVA-JbINeS2byky7klcstjoyNxk3h7sdnWQpUi161NqT7PwfNKxT'

PUSH_LOG_PATH = '/datadrive/flashgo/push_result/%s.%s.csv'

REDIS_CLIENT_CONFIG = {
    'host': 'flashgo-cache.kub6uf.0001.apse1.cache.amazonaws.com',
    'db': 0,
    'port': 6379,
    'password': None
}

PUSH_USER_DATA = '/datadrive/flashgo/export/users.data'

PUSH_TYPE_DEAL = 'deal'
PUSH_TYPE_VIDEO = 'video'
PUSH_TYPE_RETENTION = 'retention'
PUSH_TYPE_REMIND = 'remind'
PUSH_TYPE_DAILY = 'daily'
PUSH_TYPE_LOGIN = 'login'
PUSH_TYPE_ARTICLE = 'article'
PUSH_TYPE_IMAGE_TEXT = 'image_text'


def gen_batch_id(created_time, push_type, deal_id, target):
    return '{datetime}_{push_type}_{deal_id}_{target}'.format(
        datetime=created_time.strftime('%Y%m%d%H%M%S'),
        push_type=push_type,
        deal_id=deal_id,
        target=target
    )
