import datetime
import time
from typing import List

import pytz
import requests

from bonuses.awards import award_factory, Award
from bonuses.constants import AwardOrderStatus
from bonuses.sql_models import UserAwardDetails
from bonuses.utils import _get_user_news_awards, get_user_total_news_coin, \
    _get_news_awards_actions_data
from common import loggers
from favorite.sql_model import UserLike
from news.models import News
from offline.loader.mysqlclient import mysql_client, MySQLClient
from offline.loader.redisclient import redis_client, RedisClient
from user_center_utils.config import coin_base_url_format
from users.models import User, CoinUser

logger = loggers.get_audit_premium_log(__name__)


class ActionConsumerTask(object):
    def __init__(self, mysql_client: MySQLClient, redis_client: RedisClient, coin_url_format: str):
        self._mysql_client = mysql_client
        self._redis_client = redis_client
        self.USER_HEADERS_CACHE = {}
        self.COIN_BASE_URL_FORMAT = coin_url_format

    def _get_user_headers(self, user_id):
        if user_id in self.USER_HEADERS_CACHE:
            return self.USER_HEADERS_CACHE[user_id]
        else:
            user: User = self._mysql_client.retrieve_object_by_unique_key(User, user_id=user_id)
            coin_user: CoinUser = self._mysql_client.retrieve_object_by_unique_key(CoinUser, user_id=user_id)
            headers = {
                'Content-Type': 'application/json',
                'X-User-Id': user.user_id,
                'X-Invite-Code': coin_user.invite_code,
                'X-App-Package-Id': user.package_id,
                'X-APP_VERSION': '3057',
                'X-User-Token': coin_user.facebook_token,
                'X-App-Secret': '784ebd80-4d78-4d42-9abb-7edc2c1a4466'
            }
            if len(self.USER_HEADERS_CACHE) > 500:
                self.USER_HEADERS_CACHE = {}
            self.USER_HEADERS_CACHE[user_id] = headers
            return headers

    def _send_action(self, user_id: str, action_id: int, coin: int, timestamp: int, news_id: int):
        headers = self._get_user_headers(user_id)
        time_str = datetime.datetime.fromtimestamp(timestamp, tz=pytz.timezone("Asia/Jakarta")).strftime('%Y%m%d%H%M%S')
        logger.info(f'news_id {news_id}, action_id {action_id}:'
                    f'send request,'
                    f'url <{self.COIN_BASE_URL_FORMAT.format(action_id, coin, time_str)}>, '
                    f'headers <{headers}>')
        resp = requests.post(self.COIN_BASE_URL_FORMAT.format(action_id, coin, time_str), headers=headers,
                             timeout=10)

        if resp.ok and resp.status_code == 200:
            logger.info(f'news_id {news_id}, action_id {action_id}:'
                        f'url <{self.COIN_BASE_URL_FORMAT.format(action_id, coin, time_str)}>, success.')
            return True
        else:
            logger.info(f'news_id {news_id}, action_id {action_id}:'
                        f'url <{self.COIN_BASE_URL_FORMAT.format(action_id, coin, time_str)}>, failed.')
            return False

    def _get_news_id(self):
        return self._redis_client.pop_news_award_queue()

    @classmethod
    def _generate_order_id(cls, user_id, action_id, news_id):
        return f'{user_id}_{action_id}_{news_id}'

    def _audit_news_award(self, news_id):
        news: News = self._mysql_client.retrieve_object_by_unique_key(News, news_id=news_id)
        news_user: User = self._mysql_client.retrieve_object_by_unique_key(User, id=news.media_id)

        awards: List[Award] = award_factory.get_available_tasks(news.publish_timestamp)
        if len(awards) > 0:
            logger.info(f"news_id {news_id}: available action_ids {[award.action_id for award in awards]}")
            now = int(time.time())
            for index, award in enumerate(awards):
                # 检查内容是否符合相应的奖励条件
                if not award.meet_conditions(user_id=news_user.user_id, news_id=news.news_id,
                                             news_publish_timestamp=news.publish_timestamp):
                    logger.info(f"news_id {news_id}, action_id {award.action_id}: meet_condition failed.")
                    continue

                order_id = self._generate_order_id(news_user.user_id, award.action_id, news.news_id)
                instance = UserAwardDetails(user_id=news_user.user_id, action_id=award.action_id,
                                            news_id=news.news_id, order_id=order_id,
                                            created_timestamp=now - index, created_time=time.time(),
                                            order_status=AwardOrderStatus.IN_AUDIT, complete_order=1)
                user_award: UserAwardDetails = self._mysql_client.create_if_not_exists(UserAwardDetails,
                                                                                       instance,
                                                                                       user_id=news_user.user_id,
                                                                                       action_id=award.action_id,
                                                                                       news_id=news.news_id,
                                                                                       complete_order=1)
                # 检查奖励是否已经完成
                if user_award.order_status not in {AwardOrderStatus.IN_AUDIT, AwardOrderStatus.PENDING}:
                    logger.info(f"news_id {news_id}, action_id {award.action_id}: already completed.")
                    continue

                self._mysql_client.update_object(UserAwardDetails, user_award.id,
                                                 contain_updated_time=False,
                                                 order_status=AwardOrderStatus.PENDING)
                user_award = self._mysql_client.retrieve_object_by_unique_key(UserAwardDetails, id=user_award.id)
                if user_award.order_status != AwardOrderStatus.PENDING:
                    logger.info(f"MySQL order_status update to {AwardOrderStatus.PENDING} error; id {user_award.id}")
                    continue

                # 检查给予金币请求是否成功
                if not self._send_action(news_user.user_id, award.action_id, award.coin,
                                         user_award.created_timestamp, news_id):
                    logger.info(f"news_id {news_id}, action_id {award.action_id}: _send_action failed.")
                    continue

                self._mysql_client.update_object(UserAwardDetails, user_award.id,
                                                 contain_updated_time=False,
                                                 order_status=AwardOrderStatus.COMPLETED)

                _get_user_news_awards.clear(news_user.user_id)
                _get_news_awards_actions_data.clear(news.news_id)
                get_user_total_news_coin.clear(news_user.user_id)
                self._redis_client.add_incentive_income_push(news_user.user_id)
                logger.info(f'news_id {news.news_id}, action_id {award.action_id}: success.')

    def start_consume(self):
        while True:
            news_id = None
            try:
                news_id = self._get_news_id()

                if news_id is None:
                    logger.info('no news in queue. sleep a 20s')
                    time.sleep(20)
                else:
                    self._audit_news_award(news_id)

            except KeyboardInterrupt:
                logger.exception(f'Something Error, news_id {news_id}')
                break
            except:
                logger.exception(f'Something Error, news_id {news_id}')
                logger.info("sleep 1s")
                time.sleep(1)

    def crontab_execute(self, hours: int):
        now = time.time()
        duration_timedelta = datetime.timedelta(hours=hours)
        start_time = datetime.datetime.fromtimestamp(now, tz=pytz.timezone("Asia/Jakarta")) - duration_timedelta

        liked_news_list = self._mysql_client.retrieve_objects_by_conditions(UserLike,
                                                                            UserLike.created_time > start_time)
        liked_news_ids = {like_news.news_id for like_news in liked_news_list}
        available_news_ids = set()
        for news_id in liked_news_ids:
            if self._mysql_client.get_instances_count(UserLike.id, UserLike.news_id == news_id) > 20:
                available_news_ids.add(news_id)

        start_timestamp = now - duration_timedelta.total_seconds()
        user_awards = self._mysql_client.retrieve_objects_by_conditions(UserAwardDetails,
                                                                        UserAwardDetails.order_status == AwardOrderStatus.PENDING,
                                                                        UserAwardDetails.created_timestamp > start_timestamp)
        for user_award in user_awards:
            available_news_ids.add(user_award.news_id)

        logger.info(f'crontab get news_ids, size {len(available_news_ids)}, {available_news_ids}')
        for news_id in available_news_ids:
            self._audit_news_award(news_id)


def main(hours):
    action_consumer_task = ActionConsumerTask(mysql_client=mysql_client, redis_client=redis_client,
                                              coin_url_format=coin_base_url_format)
    try:
        if hours is None:
            action_consumer_task.start_consume()
        else:
            action_consumer_task.crontab_execute(hours)
    except:
        logger.exception('news load news error')


if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument('--hours', type=int)
    args = parser.parse_args()
    main(args.hours)
