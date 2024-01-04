"""
上传日志文件到s3上
"""
import os
import time

from common import loggers
from common.s3client import s3_client
from recsys.events import LOG_PATH

LOG_BUCKET = 'flashgo-rec-events'

logger = loggers.get_logger(__name__, 'upload_file.log')


def get_local_path(filename):
    return os.path.abspath(os.path.join(LOG_PATH, filename))


def get_create_time(filename):
    created_time = str(filename[len('flashgo-to-s3-events-'):])
    return int(created_time[:created_time.index('-')])


def get_remote_path(filename: str):
    date_path_str = filename[len('flashgo-to-s3-events-' + str(get_create_time(filename)) + '-'):]
    return '/'.join(date_path_str.split('-')[:4]) + '/' + filename


def upload_file(filename):
    remote_path = get_remote_path(filename)
    local_path = get_local_path(filename)
    logger.info('upload "%s" to "%s" ' % (local_path, remote_path))
    s3_client.upload_private_file(local_path, remote_path, LOG_BUCKET)


def main():
    current_time = int(time.time())
    for filename in os.listdir(LOG_PATH):
        if filename.startswith('flashgo-to-s3-events-'):
            created_time = get_create_time(filename)
            if current_time - 84600 < created_time < current_time - 60 * 8:
                try:
                    logger.info('prepare upload file %s' % filename)
                    upload_file(filename)
                    local_path = get_local_path(filename)
                    logger.info('upload file %s successfully, will remove' % local_path)
                    os.remove(local_path)
                except:
                    logger.exception('upload file error %s' % filename)
            else:
                logger.info('do not upload file %s' % filename)


if __name__ == '__main__':
    logger.info('start to run')
    while True:
        next_time = int(time.time()) + 60 * 2
        try:
            main()
        except:
            logger.exception('upload file to s3 error')
        diff = next_time - int(time.time())
        if diff > 0:
            logger.info('will sleep %s seconds' % diff)
            time.sleep(diff)
