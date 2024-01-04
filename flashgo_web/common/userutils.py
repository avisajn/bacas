from typing import List, Dict

from common import utils, loggers
from user_center_utils import config
from users.models import User

logger = loggers.get_push_logger(__name__)


def retrieve_push_users() -> List[User]:
    fcm_map = {}
    users = config.user_center_db.retrieve_all_objects(clazz=User)
    count = 0
    for user in users:
        if not utils.is_empty(user.fcm_token):
            count += 1
            fcm_map[user.fcm_token] = user
    logger.info('push users %s of  %s which %s have fcm token' % (len(users), len(fcm_map), count))
    return list(fcm_map.values())


def retrieve_push_users_by_gender(gender: str = 'Male'):
    fcm_map = {}
    users = config.user_center_db.retrieve_objects_by_conditions(User, User.gender == gender)
    count = 0
    for user in users:
        if not utils.is_empty(user.fcm_token):
            count += 1
            fcm_map[user.fcm_token] = user
    logger.info('push users %s of  %s which %s have fcm token' % (len(users), len(fcm_map), count))
    return list(fcm_map.values())


def retrieve_fcm_tokens(user_ids: List[str]) -> Dict[str, str]:
    users = config.user_center_db.retrieve_users_by_user_id_list(user_ids)
    raw_users = config.user_center_db.retrieve_users_by_user_id_list([user.firebase_user_id for user in users])
    fcm_tokens = {}
    user_maps = {user.firebase_user_id: user.user_id for user in users}
    for user in raw_users:
        if not utils.is_empty(user.fcm_token) and user.user_id in user_maps:
            fcm_tokens[user_maps[user.user_id]] = user.fcm_token
    for user in users:
        if not utils.is_empty(user.fcm_token):
            fcm_tokens[user.user_id] = user.fcm_token
    return fcm_tokens


def _test():
    users = retrieve_push_users()
    print(len(users))


if __name__ == '__main__':
    _test()
