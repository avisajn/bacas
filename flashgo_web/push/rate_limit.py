import datetime
from typing import List, Set

import redis
import time


class ServerRateLimit(object):
    """
    内存控速，如果需要再改成redis控速度.
    """

    def __init__(self, rate, max_permits=None):
        self.store_permits = rate
        self.rate = rate
        self._last_calc_time = int(time.time())
        self.max_permits = max_permits if max_permits is not None and max_permits >= rate else rate * 2
        self._suggest_rate = self.rate // 2
        if self._suggest_rate <= 0:
            self._suggest_rate = 1

    def try_acquire_permit(self, permits):
        """
           通过令牌桶实现了流量控制和整形
        """
        if self.store_permits < permits:
            current_time = int(time.time())
            self.store_permits += (current_time - self._last_calc_time) * self.rate
            self._last_calc_time = current_time
            if self.store_permits > self.max_permits:
                self.store_permits = self.max_permits
        if self.store_permits >= permits:
            self.store_permits -= permits
            return True
        else:
            return False

    def acquire(self, permits, timeout=30):
        current_time = time.time()
        current_permits = permits
        while time.time() - current_time <= timeout and current_permits < permits:
            diff = permits - current_permits
            if diff > self._suggest_rate:
                diff = self._suggest_rate
            if self.try_acquire_permit(diff):
                current_permits += diff
            else:
                time.sleep(1)
        return current_permits >= permits


class DoNothingServerRateLimit(object):
    def __init__(self, *args, **kwargs):
        pass

    def try_acquire_permit(self, permits):
        return True

    def acquire(self, permits, timeout=30):
        return True


PUSH_INTERVAL = 'P_ITVAL_%s_%s'


class UserRateLimit(object):
    _pool_map = {}  # type: dict[(str, int, int, str), redis.ConnectionPool]

    @classmethod
    def create_pool(cls, host, port, db, password):
        if (host, port, db, password) not in cls._pool_map:
            cls._pool_map[(host, port, db, password)] = redis.ConnectionPool(
                host=host,
                port=port,
                db=db,
                password=password
            )

    def __init__(self, host, port, db, password=None):
        UserRateLimit.create_pool(host, port, db, password)
        self._connection = redis.Redis(connection_pool=self._pool_map[(host, port, db, password)])

    def try_acquire_permit(self, user_ids: List[str], push_per_hour, push_per_day, prefix='') -> List[str]:
        current_date = datetime.datetime.now().strftime('%Y%m%d')
        pipeline = self._connection.pipeline()
        for user in user_ids:
            pipeline.lrange(PUSH_INTERVAL % (current_date, prefix + user), -(push_per_day + 1), -1)
        allow_user = []
        current_time = int(time.time())
        user_current_counts = {}
        for index, result in enumerate(pipeline.execute()):
            recent_time = [int(t) for t in result]
            user_id = user_ids[index]
            if user_id not in user_current_counts:
                user_current_counts[user_id] = recent_time
            if len(user_current_counts[user_id]) < push_per_day and len(
                    [t for t in user_current_counts[user_id] if current_time - t <= 60 * 60]) < push_per_hour:
                user_current_counts[user_id].append(int(time.time()))
                allow_user.append(user_id)
        if len(allow_user) > 0:
            for user in allow_user:
                name = PUSH_INTERVAL % (current_date, prefix + user)
                pipeline.rpush(name, current_time)
                pipeline.expire(name, 86400 * 3)
            pipeline.execute()
        return allow_user

    def return_permit(self, user_ids: List[str], prefix=''):
        current_date = datetime.datetime.now().strftime('%Y%m%d')
        pipeline = self._connection.pipeline()
        for user in user_ids:
            pipeline.rpop(PUSH_INTERVAL % (current_date, prefix + user))
        pipeline.execute()


class DoNothingRateLimit(object):
    def __init__(self, *args, **kwargs):
        pass

    def try_acquire_permit(self, user_ids: List[str], push_per_hour, push_per_day) -> List[str]:
        return user_ids

    def return_permit(self, user_ids: List[str]):
        pass
