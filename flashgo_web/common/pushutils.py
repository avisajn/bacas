import datetime
import os

import time

from pyfcm import FCMNotification

from common import loggers, utils

fcm_client = FCMNotification(
    api_key="AAAAjW90NIU:APA91bHvBxi-yRYqnf0O5XEgUMyY2FXkpoDMbBtPrH-4I9d-bk2cBtV8lxV-7kcapXy9pLh8wt-mzft2mi8gjKE9TVA-JbINeS2byky7klcstjoyNxk3h7sdnWQpUi161NqT7PwfNKxT")

logger = loggers.get_push_logger(__name__)

PUSH_LOG_PATH = '/datadrive/flashgo/push_result/%s.%s.csv'
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


def load_users(target_gender='all', fcm_token=None):
    if target_gender == 'Single':
        return [fcm_token], []
    new_users, old_users = set(), set()
    with open(PUSH_USER_DATA) as input_file:
        for line in input_file:
            fields = line.split('\t')
            fcm_token, gender, created_time = fields[3], fields[4], fields[5]
            if not utils.is_empty(fcm_token) and (target_gender == 'all' or
                                                  (target_gender != 'all' and gender == target_gender) or
                                                  (target_gender == 'Male' and gender == "NULL")):
                if datetime.datetime.strptime(created_time, "%Y-%m-%d %H:%M:%S") > \
                        datetime.datetime.strptime("2019-06-04", "%Y-%m-%d"):
                    new_users.add(fcm_token)
                else:
                    old_users.add(fcm_token)
    return list(new_users), list(old_users)


def push_multiple(registration_ids, message_title=None, message_body=None, data_message=None):
    response = fcm_client.notify_multiple_devices(registration_ids=registration_ids, message_title=message_title,
                                                  message_body=message_body, data_message=data_message)
    return response


def push_single(registration_id, message_title=None, message_body=None, data_message=None):
    response = fcm_client.notify_single_device(registration_id=registration_id, message_title=message_title,
                                               message_body=message_body, data_message=data_message)
    return response


_PUSH_CONTENT = {
    'flash_start': {'content': 'Produk dalam daftar favorit Anda akan mulai dijual dalam 3 menit. Cek sekarang >>>',
                    'route': 'favorite'},
    'daily_home': {'content': 'Rekomendasi produk untuk Anda hari ini, cek sekarang!', 'route': 'home'},
    'daily_cheap': {'content': 'Produk super murah, cek sekarang!', 'route': 'lowPrice'},
    'daily_flash': {'content': 'Flash Sale akan segera dimulai, bersiaplah!', 'route': 'flashGo'},
    'daily_video': {'content': 'Review terbaru berbagai macam produk ada disini, cek sekarang >>', 'route': 'video'},
    'profile': {'content': 'Ada Rp %s di akun Anda, cek dan dapatkan lebih banyak!', 'route': 'wallet'},
    'login': {'content': 'Anda mendapat Rp %s untuk mendapatkan penghasilan. Login untuk memeriksa!',
              'route': 'login'},
}


def log_push_result(batch_id, unique_push_id, push_result):
    ts = int(time.time())
    name = PUSH_LOG_PATH % (unique_push_id, datetime.datetime.utcnow().strftime('%Y-%m-%d'))
    target = batch_id.split('_')[-1]
    if target not in {'all', 'Male', 'Female', 'Single'}:
        target = 'all'
    with open(name, 'a', encoding='utf-8') as f:
        for result in push_result:
            user_id = result.get('fcm_token', '')
            deal_id = result.get('deal_id', '')
            message_id = result.get('message_id', '')
            push_type = result.get('push_type', '')
            if deal_id is None:
                deal_id = ''
            data = '%s,%s,%s,%s,%s,%s,%s\n' % (user_id, push_type, ts, deal_id, message_id, batch_id, target)
            f.write(data)
        f.flush()


def push_message(fcm_token_list, push_type, balance=0, prize=800, title=None, body=None, content_id=0, batch_id='',
                 image_url='', deal_type='', remote_view=False):
    if push_type == PUSH_TYPE_VIDEO:
        response = push_multiple(
            registration_ids=fcm_token_list,
            # message_title=None if remote_view else title,
            # message_body=None if remote_view else body,
            data_message={
                'title': title,
                'body': body,
                'click_action': 'FLUTTER_NOTIFICATION_CLICK',
                'routeName': 'videoDetail',
                'videoId': content_id,
                'batchId': batch_id,
                'image': image_url

            }
        )
    elif push_type == PUSH_TYPE_DEAL or push_type == 'item':
        response = push_multiple(
            registration_ids=fcm_token_list,
            # message_title=None if remote_view else title,
            # message_body=None if remote_view else body,
            data_message={
                'title': title,
                'body': body,
                'click_action': 'FLUTTER_NOTIFICATION_CLICK',
                'routeName': 'dealDetail',
                'dealId': content_id,
                'batchId': batch_id,
                'image': image_url,
                'type': deal_type
            }
        )
    elif push_type == PUSH_TYPE_ARTICLE:
        response = push_multiple(
            registration_ids=fcm_token_list,
            data_message={
                'title': title,
                'body': body,
                'click_action': 'FLUTTER_NOTIFICATION_CLICK',
                'routeName': 'article',
                'id': content_id,
                'batchId': batch_id,
                'image': image_url
            }
        )
    elif push_type == PUSH_TYPE_IMAGE_TEXT:
        response = push_multiple(
            registration_ids=fcm_token_list,
            data_message={
                'title': title,
                'body': body,
                'click_action': 'FLUTTER_NOTIFICATION_CLICK',
                'routeName': 'imageText',
                'id': content_id,
                'batchId': batch_id,
                'image': image_url
            }
        )
    elif push_type in _PUSH_CONTENT:
        push_content = _PUSH_CONTENT.get(push_type, dict())
        title = push_content.get('content')
        if push_type == 'profile':
            title = push_content.get('content') % (format(balance, ',').replace(',', '.'))
        elif push_type == 'login':
            title = push_content.get('content') % (format(prize, ',').replace(',', '.'))
        response = push_multiple(
            registration_ids=fcm_token_list,
            # message_title=None if remote_view else title,
            # message_body=None if remote_view else body,
            data_message={
                'title': title,
                'body': body,
                'click_action': 'FLUTTER_NOTIFICATION_CLICK',
                'routeName': push_content.get('route'),
                'batchId': batch_id,
                'image': image_url
            }
        )
    else:
        response = None
    push_log = []
    if response and isinstance(response, list) and len(response) > 0:
        response = response[0]
    if response and isinstance(response, dict) and len(response) > 0:
        for index, result in enumerate(response.get('results', [])):
            if index < len(fcm_token_list) and result.get('error') is None:
                push_log.append({
                    'fcm_token': fcm_token_list[index],
                    'push_type': push_type,
                    'deal_id': content_id,
                    'message_id': result.get('message_id', '')
                })
    log_push_result(batch_id, os.getpid(), push_log)
