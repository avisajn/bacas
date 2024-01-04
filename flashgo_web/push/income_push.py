import datetime

import pytz

from bonuses.constants import AwardOrderStatus
from bonuses.sql_models import UserAwardDetails, CommonIncentiveAction
from common.mysqlclient import mysql_client
from common.redisclient import redis_client

ID_TIME_ZONE = pytz.timezone("Asia/Jakarta")


def get_midnight(timezone=ID_TIME_ZONE):
    return datetime.datetime.now(tz=timezone).replace(hour=0, minute=0, second=0, microsecond=0).astimezone(pytz.utc)


def main():
    end_time = get_midnight().timestamp()
    start_time = end_time - datetime.timedelta(days=1).total_seconds()
    actions_map = {
        action.id: action for action in mysql_client.retrieve_objects_by_conditions(CommonIncentiveAction)
    }
    push_user_ids = set()
    for days in [-1, 0, +1]:
        date_str = (datetime.datetime.utcnow() - datetime.timedelta(days=days)).strftime("%Y%m%d")
        user_ids = redis_client.get_incentive_income_push(date_str)
        push_user_ids |= set(user_ids)

    for user_id in push_user_ids:
        total_award = 0
        awards = mysql_client.retrieve_objects_by_conditions(UserAwardDetails,
                                                             UserAwardDetails.user_id == user_id,
                                                             UserAwardDetails.order_status == AwardOrderStatus.COMPLETED,
                                                             UserAwardDetails.created_timestamp >= start_time,
                                                             UserAwardDetails.created_timestamp <= end_time)
        for award in awards:
            total_award += actions_map[award.action_id].coin
        if total_award > 0:
            redis_client.add_incentive_income_queue(user_id, total_award)


if __name__ == '__main__':
    main()
