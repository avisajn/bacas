import json
from datetime import datetime, timedelta

from django.core.management.base import BaseCommand

from common import pushutils, utils, loggers, userutils
from deals.models import FlashDeals
from favorite.models import UserFlashRemind

BATCH_SIZE = 100

logger = loggers.get_push_logger(__name__)


class Command(BaseCommand):
    help = 'Send notifications'

    def add_arguments(self, parser):
        pass

    def handle(self, *args, **options):
        now = datetime.now()
        batch_id = pushutils.gen_batch_id(now, 'remind', 0, 'all')
        incoming_flash_deals = FlashDeals.objects.filter(starttime__gte=now,
                                                         starttime__lte=now + timedelta(minutes=30)).all()
        for flash_deal in incoming_flash_deals:
            logger.info("remind push for flashdeal %s:" % flash_deal.deal_id)
            remind_users = UserFlashRemind.objects.filter(deal_id=flash_deal.deal_id).all()
            for i in range((len(remind_users) // BATCH_SIZE) + 1):
                start_index, end_index = i * BATCH_SIZE, (i + 1) * BATCH_SIZE
                user_fcm_token = userutils.retrieve_fcm_tokens(
                    [remind_user.user_id for remind_user in remind_users[start_index:end_index]])
                fcm_token_list = [fcm_token for fcm_token in user_fcm_token.values() if not utils.is_empty(fcm_token)]
                if not utils.is_empty(fcm_token_list):
                    logger.info(json.dumps(fcm_token_list))
                    try:
                        pushutils.push_message(fcm_token_list, push_type="flash_start", batch_id=batch_id)
                    except:
                        logger.exception('remind push error')
