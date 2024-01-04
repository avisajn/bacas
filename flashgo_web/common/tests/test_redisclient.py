import time

from django.test import TestCase

from common.redisclient import redis_client


class RedisClientTestCase(TestCase):
    def setUp(self):
        pass

    def test_launch_history_functions(self):
        redis_client.set_launch_history('test1')
        redis_client.set_launch_history('test2')
        history = redis_client.batch_get_launch_history(['test1', 'test2', 'no_exist'])
        self.assertTrue('test1' in history and 'test2' in history and 'no_exist' not in history)
