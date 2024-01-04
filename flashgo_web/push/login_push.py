from datetime import datetime, timedelta
from typing import List

from common import utils, loggers
from push.config import PushQueue, gen_batch_id
from push.context import Context
from push.models import PushUser, PushItem

from user_center_utils import config

logger = loggers.get_push_logger(__name__)
context = Context()
BATCH_SIZE = 100
INVITE_PRIZE = 800


def main():
    users = config.user_center_db.raw_sql(
        'select * from users where firebase_user_id=user_id and user_id not in '
        '(select firebase_user_id from users where firebase_user_id<>user_id)')
    now = datetime.now()
    batch_id = gen_batch_id(now, 'login', 0, 'all')
    to_push_users = []  # type List[PushUser]
    for user in users:
        if now - timedelta(1) > user.created_time > now - timedelta(2) and \
                not utils.is_empty(user.fcm_token):
            to_push_users.append(PushUser(user_id=user.user_id, fcm_token=user.fcm_token))
        elif now - timedelta(3) > user.created_time > now - timedelta(4) and \
                not utils.is_empty(user.fcm_token):
            to_push_users.append(PushUser(user_id=user.user_id, fcm_token=user.fcm_token))

    logger.info('login push total count %s' % len(to_push_users))
    for i in range((len(to_push_users) // BATCH_SIZE) + 1):
        start_index, end_index = i * BATCH_SIZE, (i + 1) * BATCH_SIZE
        try:
            push_message(to_push_users[start_index: end_index], batch_id)
        except:
            logger.exception('login push error')


def push_message(push_user_list: List[PushUser], batch_id: str):
    title = 'Anda mendapat Rp %s untuk mendapatkan penghasilan. Login untuk memeriksa!' % (
        format(INVITE_PRIZE, ',').replace(',', '.'))
    context.sender.send(PushQueue.PUSH_P1, PushItem(
        users=push_user_list,
        push_type='login',
        data_message={
            'title': title,
            'body': '',
            'click_action': 'FLUTTER_NOTIFICATION_CLICK',
            'routeName': 'login',
            'batchId': batch_id,
            'image': ''},
    ))


if __name__ == '__main__':
    main()
