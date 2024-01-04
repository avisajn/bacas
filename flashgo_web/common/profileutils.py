import json
import time

from common import loggers

logger = loggers.get_clean_logger(__name__, 'profiler.log')


class Timer(object):
    def __init__(self):
        self.current = 0
        self.start()

    def start(self):
        self.current = time.time()

    def reset(self):
        duration = int((time.time() - self.current) * 1000)
        self.start()
        return duration


class TimeRecoder(object):
    def __init__(self, event_name):
        self.timer = Timer()
        self.data = {"event_name": event_name}

    def record(self, name):
        self.data[name] = self.timer.reset()

    def flush(self):
        logger.info(json.dumps(self.data))
