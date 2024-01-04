import json
import os
import queue
import socket
import threading
import time
import uuid
from datetime import datetime, timedelta
from typing import List

from common import loggers
from recsys.models import ImpressionItem

LOG_PATH = '/datadrive/flashgo/logs/python/'
LOG_PATH_PATTERN = LOG_PATH + '%s'

logger = loggers.get_logger(__name__, 'file_log.log')


class Log(object):
    def __init__(self):
        self._current_time = ''
        self._unique_name = None
        self.buffer = []

    def append(self, data):
        self.buffer.append(data)

    def __current_file_name(self):
        # 一段时间以内的放在同一个文件下
        current_time = datetime.utcnow().strftime('%Y-%m-%d-%H-%M')
        times = {(datetime.utcnow() - timedelta(minutes=i)).strftime('%Y-%m-%d-%H-%M') for i in range(0, 5)}
        if self._current_time not in times:
            self._unique_name = 'flashgo-to-s3-events-%s-%s-%s' % (
                int(time.time()), current_time, str(uuid.uuid4()))
            self._current_time = current_time
        return LOG_PATH_PATTERN % self._unique_name

    def flush(self, messages=None):
        if messages is not None:
            for message in messages:
                self.append(message)
        if len(self.buffer) > 0:
            with open(self.__current_file_name(), 'a', encoding='utf-8') as f:
                for line in self.buffer:
                    f.write(line + '\n')
            self.buffer = []

    def clear(self):
        prev_buffer = self.buffer
        self.buffer = []
        return prev_buffer


class Consumer(object):
    def __init__(self, maxsize=100):
        self._queue = queue.Queue(maxsize=maxsize)
        self.worker = threading.Thread(name='Log-Consumer-%s' % os.getpid(), target=self.work)
        self.work_start_flag = False

    def start_consumer(self):
        if self.work_start_flag:
            return
        if not self.worker.is_alive():
            self.work_start_flag = True
            self.worker.start()

    def work(self):
        count = 0
        log = Log()
        while True:
            try:
                messages = self._queue.get()
                if messages is not None and len(messages) != 0 and (count == 100 or count < 10):
                    logger.info('consumer %s , data %s' % (count, messages[0]))
                    if count > 1000000:
                        count = 0
                    count += 1
                if messages is None:
                    time.sleep(1)
                else:
                    log.flush(messages)
            except:
                logger.exception('FileLogger work error')
                time.sleep(1)

    def send(self, messages):
        try:
            self.start_consumer()
            self._queue.put_nowait(messages)
            return True
        except:
            logger.exception('flush log error')
            return False


class FileLog(object):
    def __init__(self, max_line_count=200, max_seconds=5):
        self.max_line_count = max_line_count
        self.max_seconds = max_seconds
        self._first_write_time = 0
        self._log = Log()
        self._consumer = Consumer()
        self.__register_exit_callback()

    def __register_exit_callback(self):
        import atexit
        atexit.register(self.flush)

    def flush(self, background=False):
        self._first_write_time = 0
        if background:
            if not self._consumer.send(self._log.clear()):
                self._log.flush()
        else:
            self._log.flush()

    def info(self, message):
        self._log.append(message)
        if len(self._log.buffer) >= self.max_line_count \
                or (self._first_write_time > 0 and int(time.time()) - self._first_write_time > self.max_seconds):
            self.flush(True)
        else:
            if self._first_write_time == 0:
                self._first_write_time = int(time.time())


class Sender(object):
    def __init__(self):
        self.log = FileLog()
        try:
            self._host_name = socket.gethostname()
        except:
            self._host_name = 'unknown'

    def send_event(self, event_name, **kwargs):
        kwargs["event_name"] = event_name
        if 'created_time' not in kwargs:
            kwargs['created_time'] = int(time.time())
        data = {
            'host': {
                'name': self._host_name
            },
            'message': kwargs,
        }
        self.log.info(json.dumps(data, separators=(",", ":")))

    def send_change_gender_event(self, user_id, gender):
        return self.send_event('change_gender', user_id=user_id, gender=gender)

    def send_select_interests_event(self, user_id, categories):
        return self.send_event('select_interests', user_id=user_id, categories=categories)

    def send_search_event(self, user_id, keyword, terms=None):
        return self.send_event('search', user_id=user_id, keyword=keyword, terms=terms)

    def send_like_event(self, user_id, item_id):
        return self.send_event('like', user_id=user_id, item_id=item_id)

    def send_impression_event(self, user_id, impression_id, from_page, item_list: List[ImpressionItem], page_id,
                              gender, select_interests, package_id='com.cari.promo.diskon'):
        return self.send_event('impression', user_id=user_id, impression_id=impression_id, from_page=from_page,
                               item_list=[item.to_dict() for item in item_list], page_id=page_id, gender=gender,
                               select_interests=select_interests, package_id=package_id)

    def send_click_event(self, user_id, item_id, impression_id, from_page=''):
        return self.send_event('click', user_id=user_id, impression_id=impression_id, item_id=item_id,
                               from_page=from_page)


sender = Sender()


class Receiver(object):
    def receive(self, line):
        data = line
        if isinstance(line, str) or isinstance(line, bytes):
            data = json.loads(line)
        if data['event_name'] == 'impression':
            item_list = [ImpressionItem.parse(item) for item in data['item_list']]
            return self.receive_impression_event(data['user_id'],
                                                 data['impression_id'],
                                                 from_page=data['from_page'],
                                                 item_list=item_list)
        else:
            event_process_method = 'receive_%s_event' % data['event_name']
            if hasattr(self, event_process_method):
                return getattr(self, event_process_method)(**{k: v for k, v in data.items() if k != 'event_name'})

    def receive_change_gender_event(self, user_id, gender, created_time=None, **kwargs):
        pass

    def receive_select_interests_event(self, user_id, categories, created_time=None, **kwargs):
        pass

    def receive_search_event(self, user_id, keyword, created_time=None, **kwargs):
        pass

    def receive_like_event(self, user_id, item_id, created_time=None, **kwargs):
        pass

    def receive_impression_event(self, user_id, impression_id, from_page, item_list: List[ImpressionItem], page_id,
                                 gender, select_interests, created_time=None, **kwargs):
        pass

    def receive_click_event(self, user_id, item_id, impression_id, created_time=None, **kwargs):
        pass


def _test():
    data = {'event_name': 'change_gender', 'user_id': 'abc', 'gender': 'Male'}

    class ReceiveTest(Receiver):
        def __init__(self):
            self.return_data = {}

        def receive_change_gender_event(self, user_id, gender):
            self.return_data['user_id'] = user_id
            self.return_data['gender'] = gender

    receiver = ReceiveTest()
    receiver.receive(json.dumps(data))
    assert receiver.return_data['user_id'] == 'abc'
    assert receiver.return_data['gender'] == 'Male'

    receiver = ReceiveTest()
    receiver.receive(data)
    assert receiver.return_data['user_id'] == 'abc'
    assert receiver.return_data['gender'] == 'Male'
