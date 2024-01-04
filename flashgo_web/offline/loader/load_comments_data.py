from comments.models import CommentLikes, Comments
from common import loggers
from common.es_client import es_client, ESClient
from offline.loader.mysqlclient import mysql_client, MySQLClient
from offline.loader.redisclient import redis_client, RedisClient

logger = loggers.get_offline_logger(__name__, 'offline_comment.log')


def set_logger(name):
    global logger
    logger = loggers.get_offline_logger(__name__, name + '.log')


class LoadTask(object):
    def __init__(self, redis_client: RedisClient, mysql_client: MySQLClient, es_client: ESClient):
        self.redis_client = redis_client
        self.mysql_client = mysql_client
        self.es_client = es_client

    def update_comments_info(self):
        update_comment_ids = self.redis_client.get_recent_like_comment(del_old_data=True)
        logger.info('update comments, size {}.'.format(len(update_comment_ids)))
        for comment_id in update_comment_ids:
            like_count = self.mysql_client.get_instances_count(CommentLikes.user_id,
                                                               CommentLikes.comment_id == comment_id)
            self.mysql_client.update_object(Comments, comment_id, contain_updated_time=False, like_count=like_count)
            logger.info('comment_id {}, like_count {}.'.format(comment_id, like_count))


def load_data(action):
    load_task = LoadTask(redis_client, mysql_client, es_client)
    logger.info("start")
    if action is None:
        load_task.update_comments_info()
    logger.info("end")


def main(action=None):
    import sys
    if action is None and len(sys.argv) > 1:
        action = sys.argv[1]
    try:
        load_data(action)
    except:
        logger.exception('news load news error')


def test():
    pass


if __name__ == '__main__':
    main()
