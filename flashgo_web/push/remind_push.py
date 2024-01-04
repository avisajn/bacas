from datetime import datetime, timedelta
from typing import List

import pytz

from common import utils, loggers, userutils
from common.mysqlclient import mysql_client
from common.sql_models import FlashDeal, UserFlashRemind
from push.config import PushQueue, gen_batch_id
from push.context import Context
from push.models import PushUser, PushItem

context = Context()
BATCH_SIZE = 100

logger = loggers.get_push_logger(__name__)


def main():
    start = datetime.now().astimezone(pytz.UTC).strftime("%Y-%m-%d %H:%M:%S")
    end = (datetime.now() + timedelta(minutes=30)).astimezone(pytz.UTC).strftime("%Y-%m-%d %H:%M:%S")
    batch_id = gen_batch_id(datetime.now(), 'remind', 0, 'all')
    incoming_flash_deals = mysql_client.retrieve_objects_by_conditions(FlashDeal, FlashDeal.start_time >= start,
                                                                       FlashDeal.start_time <= end)
    for flash_deal in incoming_flash_deals:
        logger.info("remind push for flashdeal %s:" % flash_deal.deal_id)
        remind_users = mysql_client.retrieve_objects_by_conditions(UserFlashRemind,
                                                                   UserFlashRemind.deal_id == flash_deal.deal_id)
        for i in range((len(remind_users) // BATCH_SIZE) + 1):
            start_index, end_index = i * BATCH_SIZE, (i + 1) * BATCH_SIZE
            user_fcm_token = userutils.retrieve_fcm_tokens(
                [remind_user.user_id for remind_user in remind_users[start_index:end_index]])
            to_push_users = [PushUser(user_id=user_id, fcm_token=fcm_token) for user_id, fcm_token
                             in user_fcm_token.items() if not utils.is_empty(fcm_token)]
            if not utils.is_empty(to_push_users):
                try:
                    push_message(push_user_list=to_push_users, batch_id=batch_id)
                except:
                    logger.exception('remind push error')


def push_message(push_user_list: List[PushUser], batch_id: str):
    context.sender.send(PushQueue.PUSH_P3, PushItem(
        users=push_user_list,
        push_type='flash_start',
        data_message={
            'title': 'Produk dalam daftar favorit Anda akan mulai dijual dalam 3 menit. Cek sekarang >>>',
            'body': '',
            'click_action': 'FLUTTER_NOTIFICATION_CLICK',
            'routeName': 'favorite',
            'batchId': batch_id,
            'image': ''},
    ))


if __name__ == '__main__':
    main()
