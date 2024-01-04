import time
from datetime import datetime

import pytz
from django.core.management.base import BaseCommand

from common import pushutils, utils, loggers
from common.mysqlclient import mysql_client
from common.redisclient import redis_client
from common.sql_models import PushHistory

BATCH_SIZE = 50

logger = loggers.get_push_logger(__name__)


class Command(BaseCommand):
    help = 'Send notifications'

    def handle(self, *args, **options):
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
            new_fcm_token_list, old_fcm_token_list = pushutils.load_users(push_task.target, push_task.fcm_token)
            for i in range((len(new_fcm_token_list) // BATCH_SIZE) + 1):
                start_index, end_index = i * BATCH_SIZE, (i + 1) * BATCH_SIZE
                batch_fcm_token_list = [fcm_token for fcm_token in new_fcm_token_list[start_index:end_index] if
                                        not utils.is_empty(fcm_token)]
                try:
                    pushutils.push_message(
                        batch_fcm_token_list,
                        push_type=push_task.push_type,
                        title=push_task.title,
                        body=push_task.body,
                        image_url=push_task.image,
                        content_id=int(push_task.deal_id),
                        batch_id=push_task.batch_id,
                        remote_view=True
                    )
                    logger.info('push round finished, batch_id: %s, deal_id: %s, round: %s'
                                % (push_task.batch_id, push_task.deal_id, i))
                except:
                    logger.exception('error during push')
            for i in range((len(old_fcm_token_list) // BATCH_SIZE) + 1):
                start_index, end_index = i * BATCH_SIZE, (i + 1) * BATCH_SIZE
                batch_fcm_token_list = [fcm_token for fcm_token in old_fcm_token_list[start_index:end_index] if
                                        not utils.is_empty(fcm_token)]
                try:
                    pushutils.push_message(
                        batch_fcm_token_list,
                        push_type=push_task.push_type,
                        title=push_task.title,
                        body=push_task.body,
                        image_url=push_task.image,
                        content_id=int(push_task.deal_id),
                        batch_id=push_task.batch_id
                    )
                    logger.info('push round finished, batch_id: %s, deal_id: %s, round: %s'
                                % (push_task.batch_id, push_task.deal_id, i))
                except:
                    logger.exception('error during push')
