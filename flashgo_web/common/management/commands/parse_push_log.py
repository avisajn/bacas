import datetime
import glob

from django.core.management.base import BaseCommand

from common import loggers
from common.userutils import retrieve_push_users

PUSH_LOG_PATH = '/datadrive/flashgo/push_result/'
PUSH_LOG_SUMMARY_PATH = '/datadrive/flashgo/push_result/summary/%s'

logger = loggers.get_push_logger(__name__)


class Command(BaseCommand):
    help = 'parse push log'

    def add_arguments(self, parser):
        parser.add_argument('date', type=str, default='', nargs='?')

    def handle(self, *args, **options):
        date = options['date']
        if date is None or len(date) == 0:
            date = (datetime.datetime.now() - datetime.timedelta(days=1)).strftime('%Y-%m-%d')
        logger.info('parse log for %s' % date)
        fcm_users = {user.fcm_token: user.user_id for user in retrieve_push_users()}
        logger.info('the length of fcm_users %s, first fcm_token %s:user_id %s' % (len(fcm_users),
                                                                                   list(fcm_users.keys())[0],
                                                                                   list(fcm_users.values())[0]))
        summary_filename = PUSH_LOG_SUMMARY_PATH % date
        with open(summary_filename, 'w', encoding='utf-8') as f:
            for file in glob.glob(PUSH_LOG_PATH + '*.' + date + '.csv'):
                logger.info('read file %s' % file)
                for line in open(file, encoding='utf-8'):
                    lines = line.strip().split(',')
                    if len(lines) > 0 and lines[0] in fcm_users:
                        line = ','.join([fcm_users[lines[0]]] + list(lines[1:]))
                        f.write(line + '\n')
                    else:
                        f.write(line + '\n')
