import datetime
import json
import os
import time
from typing import List, Dict

from pyfcm import FCMNotification

from common.redisclient import redis_client
from common.utils import DuplicatedItemSet
from push import config, context, forms
from push.config import PushQueue, PUSH_LOG_PATH
from push.events import Receiver
from push.models import PushItem
from push.rate_limit import ServerRateLimit, UserRateLimit


def log_push_result(batch_id, unique_push_id, push_result, flush=True):
    ts = int(time.time())
    name = PUSH_LOG_PATH % (unique_push_id, datetime.datetime.utcnow().strftime('%Y-%m-%d'))
    target = batch_id.split('_')[-1]
    if target not in {'all', 'Male', 'Female', 'Single'}:
        target = 'all'
    with open(name, 'a', encoding='utf-8') as f:
        for result in push_result:
            fcm_user_id = result.get('fcm_token', '')
            deal_id = result.get('deal_id', '')
            message_id = result.get('message_id', '')
            push_type = result.get('push_type', '')
            user_id = result.get('user_id', '')
            if deal_id is None:
                deal_id = ''
            data = '%s,%s,%s,%s,%s,%s,%s,%s\n' % (
                fcm_user_id, push_type, ts, deal_id, message_id, batch_id, target, user_id)
            f.write(data)
        if flush:
            f.flush()


logger = None


def get_recent_users():
    return list(redis_client.get_recent_users())


class PushClient(object):
    def __init__(self, server_rate_limit: ServerRateLimit,
                 user_rate_limit: UserRateLimit):
        self.fcm_client = FCMNotification(api_key=config.FCM_API_KEY)
        self.server_rate_limit = server_rate_limit
        self.user_rate_limit = user_rate_limit
        self.__unique_data = set()
        self.__error_count = 0

    def _push_multiple(self, registration_ids, message_title=None, message_body=None, data_message=None):
        response = self.fcm_client.notify_multiple_devices(registration_ids=registration_ids,
                                                           message_title=message_title,
                                                           message_body=message_body, data_message=data_message)
        return response

    def _push_single(self, registration_id, message_title=None, message_body=None, data_message=None):
        response = self.fcm_client.notify_single_device(registration_id=registration_id, message_title=message_title,
                                                        message_body=message_body, data_message=data_message)
        return response

    def _unique_data(self, fcm_token, push_item: PushItem):
        data = json.dumps(push_item.data_message)
        return (fcm_token, data,) not in self.__unique_data

    def _add_unique_data(self, fcm_token, push_item: PushItem):
        if len(self.__unique_data) > 20000:
            self._info('unique data is over max value')
            self.__unique_data = set()
        data = json.dumps(push_item.data_message)
        self.__unique_data.add((fcm_token, data,))

    def push(self, push_item: PushItem):
        fcm_token_list = []
        fcm_user_map = {}
        fcm_token_set = set()
        data_message = forms.parse(push_item)
        for user in push_item.users:
            if user.fcm_token not in fcm_token_set and self._unique_data(user.fcm_token, push_item):
                fcm_token_set.add(user.fcm_token)
                fcm_token_list.append(user.fcm_token)
                fcm_user_map[user.fcm_token] = user.user_id
            else:
                self._info('%s (%s) is duplicated' % (user.user_id, user.fcm_token))
        if push_item.pass_through:
            response = self._push_multiple(fcm_token_list,
                                           message_title=push_item.data_message.get('title', ''),
                                           message_body=push_item.data_message.get('body', ''),
                                           data_message=push_item.data_message)
        else:
            response = self._push_multiple(fcm_token_list, data_message=push_item.data_message)
        push_log = []
        if response and isinstance(response, list) and len(response) > 0:
            response = response[0]
        if response and isinstance(response, dict) and len(response) > 0:
            for index, result in enumerate(response.get('results', [])):
                if index < len(fcm_token_list) and result.get('error') is None:
                    push_log.append({
                        'fcm_token': fcm_token_list[index],
                        'push_type': push_item.push_type,
                        'deal_id': data_message.content_id,
                        'message_id': result.get('message_id', ''),
                        'user_id': fcm_user_map[fcm_token_list[index]]
                    })
                    self._add_unique_data(fcm_token_list[index], push_item)
                elif result.get('error') is not None:
                    self.__error_count += 1
                    if self.__error_count < 100 or self.__error_count % 100 == 0:
                        self._info('push error %s' % result.get('error'))
                        if self.__error_count > 1000000:
                            self.__error_count = 0
        return data_message.batch_id, os.getpid(), push_log

    def _info(self, message):
        if logger is not None:
            logger.info(message)

    def _error(self, message):
        if logger is not None:
            logger.error(message)

    def _exception(self, message):
        if logger is not None:
            logger.exception(message)

    def _push_list(self, push_items: List[PushItem], push_per_hour, push_per_day, prefix=''):
        user_ids = []
        for push_item in push_items:
            for user in push_item.users:
                user_ids.append(user.user_id)
        allow_user_list = self.user_rate_limit.try_acquire_permit(user_ids, push_per_hour, push_per_day, prefix=prefix)
        allow_users = DuplicatedItemSet(allow_user_list)
        push_logs = []
        for push_item in push_items:
            users = []
            for user in push_item.users:
                if user.user_id in allow_users:
                    users.append(user)
                    del allow_users[user.user_id]
            push_item.users = users
            if len(push_item.users) > 0:
                try:
                    push_logs.append(self.push(push_item))
                except Exception as e:
                    self._exception("push error")
        success_users = DuplicatedItemSet()
        for index, push_log in enumerate(push_logs):
            log_push_result(push_log[0], push_log[1], push_log[2], flush=(index == len(push_log) - 1))
            for log in push_log[2]:
                success_users.append(log['user_id'])
        self.user_rate_limit.return_permit(list(DuplicatedItemSet(allow_user_list) - success_users), prefix=prefix)
        self._info(
            "user_ids %s, allow users %s, success %s" % (len(user_ids), len(allow_user_list), len(success_users)))
        self._info("start speed limit")
        if len(success_users) > 0:
            if self.server_rate_limit.acquire(len(success_users), timeout=10 * 60):
                self._info("speed limit end")
            else:
                self._info("speed limit failed")

    def push_list(self, push_items: List[PushItem], push_per_hour, push_per_day):
        common_user_push_items = []
        follow_push_items = []
        replied_push_items = []
        news_audit_push_items = []
        news_be_commented_push_item = []
        news_be_liked_push_item = []
        incentive_income_push_items = []
        for push_item in push_items:
            if push_item.push_type in {'authorimage_text', 'authorvideo', 'authorarticle', 'comment_like'}:
                follow_push_items.append(push_item)
            elif push_item.push_type in {'comment_replied'}:
                replied_push_items.append(push_item)
            elif push_item.push_type in {'news_audit'}:
                news_audit_push_items.append(push_item)
            elif push_item.push_type in {'news_be_liked'}:
                news_be_liked_push_item.append(push_item)
            elif push_item.push_type in {'news_be_commented'}:
                news_be_commented_push_item.append(push_item)
            elif push_item.push_type in {'incentive_income'}:
                incentive_income_push_items.append(push_item)
            else:
                common_user_push_items.append(push_item)
        if len(common_user_push_items) > 0:
            self._info('common users items %s' % len(common_user_push_items))
            self._push_list(common_user_push_items, push_per_hour=push_per_hour, push_per_day=push_per_day)
        if len(follow_push_items) > 0:
            self._info('follow users items %s' % len(follow_push_items))
            self._push_list(follow_push_items, push_per_hour=1, push_per_day=3, prefix='F')
        if len(replied_push_items) > 0:
            self._info('comment replied items %s' % len(replied_push_items))
            self._push_list(replied_push_items, push_per_hour=10, push_per_day=10, prefix='R')
        if len(news_audit_push_items) > 0:
            self._info('news audit items %s' % len(news_audit_push_items))
            self._push_list(news_audit_push_items, push_per_hour=3, push_per_day=3, prefix='N')
        if len(news_be_liked_push_item) > 0:
            self._info('news be liked items %s' % len(news_be_liked_push_item))
            self._push_list(news_be_liked_push_item, push_per_hour=10, push_per_day=10, prefix='NbL')
        if len(news_be_commented_push_item) > 0:
            self._info('news be commented items %s' % len(news_be_commented_push_item))
            self._push_list(news_be_commented_push_item, push_per_hour=10, push_per_day=10, prefix='NbC')
        if len(incentive_income_push_items) > 0:
            self._info('incentive income items %s' % len(incentive_income_push_items))
            self._push_list(incentive_income_push_items, push_per_hour=1, push_per_day=1, prefix='B')


BATCH_SIZE = 5000


def get_messages(receiver: Receiver, batch_size=BATCH_SIZE) -> Dict[PushQueue, List[PushItem]]:
    messages = {}  # type: Dict[PushQueue, List[PushItem]]
    count = 0
    push_queue = reversed([queue for queue in PushQueue])
    for queue in push_queue:
        current_queue_message = []  # type: List[PushItem]
        message_in_queue = receiver.get_messages(queue, 1)
        current_queue_message += message_in_queue
        count += sum([len(item.users) for item in message_in_queue])
        while count < batch_size and len(message_in_queue) > 0:
            message_in_queue = receiver.get_messages(queue, 1)
            for item in message_in_queue:
                item.queue = queue
            current_queue_message += message_in_queue
            count += sum([len(item.users) for item in message_in_queue])
        if len(current_queue_message) > 0:
            messages[queue] = current_queue_message
        if count >= batch_size:
            break
    return messages


def main():
    receiver = context.context.receiver
    push_client = PushClient(server_rate_limit=context.context.server_rate_limit,
                             user_rate_limit=context.context.user_rate_limit)
    empty_time = 0
    while True:
        try:
            messages = get_messages(receiver)
            for queue, message_list in messages.items():
                logger.info("receiver message len %s" % len(message_list))
                push_client.push_list(message_list,
                                      push_per_hour=queue.push_per_hour,
                                      push_per_day=queue.push_per_day)
            if len(messages) == 0:
                empty_time += 1
                if empty_time > 30:
                    logger.info('no item, sleep 20s')
                    time.sleep(20)
                else:
                    logger.info('no item, sleep 1s')
                    time.sleep(1)
            else:
                empty_time = 0
        except:
            if logger is not None:
                logger.exception('run error')
            break


if __name__ == '__main__':
    from common import loggers

    logger = loggers.get_logger('push_client', 'push_client.log')

    main()
