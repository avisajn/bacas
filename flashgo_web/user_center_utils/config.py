import os

from common.config import MYSQL_CLIENT_CONFIG
from user_center_utils.mysqlclient import PaydayLoanDbClient


def __on_prod():
    env = os.environ.get("PAYDAY_LOAN_ENV")
    if env is not None and env == "prod":
        return True
    if env is not None and env == "test":
        return False
    test_mark = "/etc/payday/env/test_mark_74b10347-8822-40e2-ba45-93ace66d0545"
    if os.path.exists(test_mark):
        return False
    else:
        return True


prod = __on_prod()

user_center_db = PaydayLoanDbClient(MYSQL_CLIENT_CONFIG)
login_url = 'https://flashgo.baca.co.id/api/v1/user/login'
total_money_url = "https://flashgo.baca.co.id/api/v1/action/money/total"
user_status_url = "https://flashgo.baca.co.id/api/v1/action/user/status"
invite_base_url = 'https://invite.flashgo.live/api/v1/invite/'
coin_base_url_format = 'https://flashgo.baca.co.id/api/v1/action/reserve/{}/{}/{}'
MONEY_COIN_BASE_URL_FORMAT = 'https://flashgo.baca.co.id/api/v1/action/reserve/{action_id}/{coin}/{time_str}/{money}'
