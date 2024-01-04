from datetime import datetime

import pytz
from django.test import TestCase

from common.mysqlclient import mysql_client
from common.sql_models import PushHistory
from user_center_utils import config


class MysqlclientTestCase(TestCase):
    def setUp(self):
        pass

    def test_raw_sql(self):
        for user in config.user_center_db.raw_sql(
                'select user_id from users where firebase_user_id=user_id and user_id not in '
                '(select firebase_user_id from users where firebase_user_id<>user_id)'):
            print(user.user_id)

    def test_retrieve_objects_by_conditions(self):
        for item in mysql_client.retrieve_objects_by_conditions(PushHistory, PushHistory.status == 0):
            print(item.schedule_time)
            print(datetime.now())
            if item.schedule_time.astimezone(pytz.UTC) > datetime.now().astimezone(pytz.UTC):
                print(item.to_json())
