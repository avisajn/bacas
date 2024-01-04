from datetime import datetime

from django.core.management.base import BaseCommand

from common import pushutils, utils, loggers
from common.redisclient import redis_client
from random import choice

BATCH_SIZE = 50

logger = loggers.get_push_logger(__name__)

PUSH_TYPE_LIST = ["daily_home", "daily_cheap", "daily_flash", "daily_video"]


def random_push_type():
    history = redis_client.get_push_history()
    push_type = choice(PUSH_TYPE_LIST)
    if history:
        push_type = choice([item for item in PUSH_TYPE_LIST if item != history])
    redis_client.set_push_history(push_type)
    return push_type


class Command(BaseCommand):
    help = 'Send notifications'

    def add_arguments(self, parser):
        pass

    def handle(self, *args, **options):
        push_type = random_push_type()
        batch_id = pushutils.gen_batch_id(datetime.now(), push_type, 0, 'all')
        new_fcm_token_list, old_fcm_token_list = pushutils.load_users()
        for i in range((len(new_fcm_token_list) // BATCH_SIZE) + 1):
            start_index, end_index = i * BATCH_SIZE, (i + 1) * BATCH_SIZE
            to_push = [fcm_token for fcm_token in new_fcm_token_list[start_index:end_index] if
                       not utils.is_empty(fcm_token)]
            try:
                pushutils.push_message(to_push, push_type=push_type, batch_id=batch_id, remote_view=True)
            except:
                logger.exception('daily push error')
        for i in range((len(old_fcm_token_list) // BATCH_SIZE) + 1):
            start_index, end_index = i * BATCH_SIZE, (i + 1) * BATCH_SIZE
            to_push = [fcm_token for fcm_token in old_fcm_token_list[start_index:end_index] if
                       not utils.is_empty(fcm_token)]
            try:
                pushutils.push_message(to_push, push_type=push_type, batch_id=batch_id)
            except:
                logger.exception('daily push error')
