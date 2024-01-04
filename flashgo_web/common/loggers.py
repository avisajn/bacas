import logging
import os
import pathlib
from logging.handlers import RotatingFileHandler

LOG_BASE_PATH = os.environ.get('LOG_BASE_PATH')
if LOG_BASE_PATH is not None:
    LOGGING_PATH = LOG_BASE_PATH
else:
    LOGGING_PATH = '/datadrive/flashgo/logs/python'
LOGGING_FILE_NAME = 'service.log'
PUSH_LOGGING_FILE = LOGGING_PATH + '/push.log'


class DoNothingLogger(object):
    def info(self, *args, **kwargs):
        pass

    def error(self, *args, **kwargs):
        pass

    def debug(self, *args, **kwargs):
        pass

    def exception(self, *args, **kwargs):
        pass


def get_logger(name, filename=LOGGING_FILE_NAME) -> logging.Logger:
    logger = logging.getLogger(name)
    logger.setLevel(level=logging.INFO)

    # Formatter
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')

    if not os.path.exists(LOGGING_PATH):
        pathlib.Path(LOGGING_PATH).mkdir(parents=True, exist_ok=True)

    # FileHandler
    if not filename.startswith('/'):
        filename = '/' + filename
    file_handler = RotatingFileHandler(LOGGING_PATH + filename, maxBytes=100 * 1024 * 1024, backupCount=5)
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    return logger


def get_clean_logger(name, filename=LOGGING_FILE_NAME) -> logging.Logger:
    logger = logging.getLogger(name)
    logger.setLevel(level=logging.INFO)

    # Formatter
    formatter = logging.Formatter('%(message)s')

    if not os.path.exists(LOGGING_PATH):
        pathlib.Path(LOGGING_PATH).mkdir(parents=True, exist_ok=True)

    # FileHandler
    if not filename.startswith('/'):
        filename = '/' + filename
    file_handler = RotatingFileHandler(LOGGING_PATH + filename, maxBytes=100 * 1024 * 1024, backupCount=5)
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    return logger


def get_offline_logger(name, filename='offline.log') -> logging.Logger:
    return get_logger(name, filename=filename)


def get_coin_logger(name):
    return get_logger(name, filename='coin.log')


def get_push_logger(name) -> logging.Logger:
    logger = logging.getLogger(name)
    logger.setLevel(level=logging.INFO)

    # Formatter
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')

    if not os.path.exists(LOGGING_PATH):
        pathlib.Path(LOGGING_PATH).mkdir(parents=True, exist_ok=True)

    # FileHandler
    file_handler = RotatingFileHandler(PUSH_LOGGING_FILE, maxBytes=100 * 1024 * 1024, backupCount=5)
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    return logger


def get_audit_premium_log(name):
    return get_logger(name, 'coin_consumer.log')


def _test():
    logger = get_logger(__name__)
    logger.info('test')
    logger.info('are you ok')
    try:
        raise Exception('test')
    except:
        logger.exception('test exception')
        logger.exception('test exception')


if __name__ == '__main__':
    _test()
