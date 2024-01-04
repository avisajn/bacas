from datetime import datetime
from typing import Dict, List

import pytz

from common import utils, loggers
from common.mysqlclient import mysql_client
from common.redisclient import redis_client
from common.sql_models import PushHistory
from push.config import PUSH_USER_DATA, PushQueue, PUSH_TYPE_VIDEO, PUSH_TYPE_DEAL, PUSH_TYPE_ARTICLE, \
    PUSH_TYPE_IMAGE_TEXT
from push.context import Context
from push.models import PushUser, PushItem

context = Context()
BATCH_SIZE = 50

logger = loggers.get_push_logger(__name__)


def main():
    waiting_list = mysql_client.retrieve_objects_by_conditions(PushHistory, PushHistory.status == 0)
    if len(waiting_list) > 0:
        waiting_list = sorted(waiting_list,
                              key=lambda item: item.schedule_time.replace(
                                  tzinfo=pytz.UTC) if item.schedule_time
                                                      is not None else datetime.now().astimezone(pytz.UTC))
        push_task = waiting_list[0]
        if push_task.schedule_type == 'delay' and push_task.schedule_time.replace(
                tzinfo=pytz.UTC) > datetime.now().astimezone(pytz.UTC):
            logger.info('push not ready, batch_id: %s, deal_id: %s'
                        % (push_task.batch_id, push_task.deal_id))
            return
        else:
            mysql_client.update_object(clazz=PushHistory, object_id=push_task.id, status=1,
                                       execute_time=datetime.now().astimezone(pytz.UTC))
            redis_client.add_push(push_task.push_type, push_task.deal_id)
        to_push_users = [PushUser(user_id=user_id, fcm_token=fcm_token) for fcm_token, user_id in
                         load_users(push_task.target, push_task.fcm_token).items()
                         if not utils.is_empty(fcm_token)]
        for i in range((len(to_push_users) // BATCH_SIZE) + 1):
            start_index, end_index = i * BATCH_SIZE, (i + 1) * BATCH_SIZE
            try:
                push_message(
                    push_user_list=to_push_users[start_index:end_index],
                    batch_id=push_task.batch_id,
                    push_type=push_task.push_type,
                    title=push_task.title,
                    body=push_task.body,
                    image=push_task.image,
                    content_id=int(push_task.deal_id)
                )
                logger.info('push round finished, batch_id: %s, deal_id: %s, round: %s'
                            % (push_task.batch_id, push_task.deal_id, i))
            except:
                logger.exception('error during push')


def load_users(target_gender='all', fcm_token=None) -> Dict[str, str]:
    if target_gender == 'Single':
        return {fcm_token: 'test_user_id'}
    ret = {}  # type Dict[str, str]
    with open(PUSH_USER_DATA) as input_file:
        for line in input_file:
            fields = line.split('\t')
            user_id, fcm_token, gender = fields[1], fields[3], fields[4]
            if not utils.is_empty(fcm_token) and (target_gender == 'all' or
                                                  (target_gender != 'all' and gender == target_gender) or
                                                  (target_gender == 'Male' and gender == "NULL")):
                ret[fcm_token] = user_id
    return ret


def push_message(push_user_list: List[PushUser], batch_id: str, push_type: str, title: str, body: str, image: str,
                 content_id: int):
    context.sender.send(PushQueue.PUSH_P2, PushItem(
        users=push_user_list,
        push_type=push_type,
        data_message=generate_message(batch_id=batch_id, push_type=push_type, title=title, body=body, image=image,
                                      content_id=content_id)
    ))


def generate_message(batch_id: str, push_type: str, title: str, body: str, image: str,
                     content_id: int, play_video_directly=False):
    if push_type == PUSH_TYPE_VIDEO:
        return {
            'title': title,
            'body': body,
            'click_action': 'FLUTTER_NOTIFICATION_CLICK',
            'routeName': 'videoDetail',
            'videoId': content_id,
            'batchId': batch_id,
            'image': image,
            'play_video_directly': play_video_directly
        }
    elif push_type == PUSH_TYPE_DEAL or push_type == 'item':
        return {
            'title': title,
            'body': body,
            'click_action': 'FLUTTER_NOTIFICATION_CLICK',
            'routeName': 'dealDetail',
            'dealId': content_id,
            'batchId': batch_id,
            'image': image,
            'type': ''
        }
    elif push_type == PUSH_TYPE_ARTICLE:
        return {
            'title': title,
            'body': body,
            'click_action': 'FLUTTER_NOTIFICATION_CLICK',
            'routeName': 'article',
            'id': content_id,
            'batchId': batch_id,
            'image': image
        }
    elif push_type == PUSH_TYPE_IMAGE_TEXT:
        return {
            'title': title,
            'body': body,
            'click_action': 'FLUTTER_NOTIFICATION_CLICK',
            'routeName': 'imageText',
            'id': content_id,
            'batchId': batch_id,
            'image': image
        }


def _test():
    user_list = [PushUser(user_id='Facebook_533242040476625',
                          fcm_token='f1zwjtz9qK8:APA91bE86nmodiFQDb4295n1bDrpSV-q-U2B1isJ2JmBnMeS6Xs9jtcR082WPkiXXc29uX8_eD7p2uglFQRc4t0v3jVMf4fNKOP3hY5dDub11DMvsi7PEGQrtFSLvFMfe6ieCj8k4q6_')]
    push_message(push_user_list=user_list,
                 batch_id='batch_id',
                 push_type='video',
                 title='test',
                 body='test',
                 image='',
                 content_id=100919022)


if __name__ == '__main__':
    main()
