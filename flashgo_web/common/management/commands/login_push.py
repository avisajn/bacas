from datetime import datetime, timedelta

from django.core.management.base import BaseCommand

from common import pushutils, utils, loggers

from user_center_utils import config

BATCH_SIZE = 100

logger = loggers.get_push_logger(__name__)


class Command(BaseCommand):
    help = 'Send notifications'

    def add_arguments(self, parser):
        pass

    def handle(self, *args, **options):
        users = config.user_center_db.raw_sql(
            'select * from users where firebase_user_id=user_id and user_id not in '
            '(select firebase_user_id from users where firebase_user_id<>user_id)')
        now = datetime.now()
        batch_id = pushutils.gen_batch_id(now, 'login', 0, 'all')
        to_push_fcm = list()
        for user in users:
            if now - timedelta(1) > user.created_time > now - timedelta(2) and \
                    not utils.is_empty(user.fcm_token):
                to_push_fcm.append(user.fcm_token)
            elif now - timedelta(3) > user.created_time > now - timedelta(4) and \
                    not utils.is_empty(user.fcm_token):
                to_push_fcm.append(user.fcm_token)

        logger.info('login push total count %s' % len(to_push_fcm))
        for i in range((len(to_push_fcm) // BATCH_SIZE) + 1):
            start_index, end_index = i * BATCH_SIZE, (i + 1) * BATCH_SIZE
            try:
                pushutils.push_message(to_push_fcm[start_index:end_index], push_type='login', batch_id=batch_id)
            except:
                logger.exception('login push error')
