import os
from typing import Optional

import requests

from common.constants import RedisKeyPrefix, USER_AVATAR_URL
from common.mysqlclient import mysql_client
from common.redisclient import cache
from common.s3client import s3_client
from common.utils import generate_cdn_url
from users.models import User, UserExtraInfo


@cache(key=lambda user_id: 'User_v3_%s' % user_id, ex=10 * 60, cache_on_memory=10, prefix=RedisKeyPrefix.USER)
def _get_user_info(user_id):
    if not isinstance(user_id, str):
        user_id = str(user_id)

    ret = {}

    user: User = mysql_client.retrieve_object_by_unique_key(User, user_id=user_id)
    ret.update(user.get_info())

    user_extra_info = mysql_client.retrieve_object_by_unique_key(UserExtraInfo, user_id=user_id)
    if user_extra_info is None:
        ret.update({'be_likes_count': 0,
                    'be_follows_count': 0})
    else:
        ret.update({'be_likes_count': user_extra_info.be_likes_count,
                    'be_follows_count': user_extra_info.be_follows_count})

    return ret


def _get_user_avatar(user_id: str, user_type: int) -> dict:
    if user_type == 1:
        avatar_url = generate_cdn_url('/user-avatars', user_id)
    elif user_type == 2:
        avatar_url = generate_cdn_url('/media-icons', f'{user_id}.jpg')
    else:
        avatar_url = f'{USER_AVATAR_URL}{user_id}'
    return {
        'url': avatar_url,
        'weight': 1,
        'height': 1
    }


WEB_USER_INFO = {
    'id': -1,
    'name': 'web',
    'user_id': 'web',
    'gender': 'Male',
    'fcm_token': None,
    'firebase_user_id': '',
    'facebook_login': False,
    'source_channel': None,
    'valid': 1,
    'user_type': 0,
    'description': 'use for web page',
    'show_on_feed': 1
}

TEST_USER_INFO = {
    'id': -1,
    'name': 'test',
    'user_id': 'test',
    'gender': 'Male',
    'fcm_token': None,
    'firebase_user_id': '',
    'facebook_login': False,
    'source_channel': None,
    'valid': 1,
    'user_type': 0,
    'description': 'use for test',
    'show_on_feed': 1
}


def get_user_info(user_id, with_avatar=True) -> Optional[dict]:
    # 对于web和test, 做特殊处理
    if user_id == 'web':
        user_info = WEB_USER_INFO
    elif user_id == 'test':
        user_info = TEST_USER_INFO
    else:
        user_info = _get_user_info(user_id)
    if with_avatar:
        user_info['avatar'] = _get_user_avatar(user_id, user_info['user_type'])

    valid = user_info['valid']
    rights = {
        'add_comment': valid > 0,
        'create_news': valid > 0
    }
    user_info['rights'] = rights
    return user_info


def get_tiny_user_info(user_id):
    user_info = _get_user_info(user_id)
    return {
        'id': user_info['id'],
        'user_id': user_info['user_id'],
        'name': user_info['name'],
        'avatar': _get_user_avatar(user_id, user_info['user_type'])
    }


class UploadAvatarType(object):
    URL = 'url'
    base64 = 'base64'


def upload_user_avatar(user_id: str, avatar: str, upload_type: str = UploadAvatarType.URL) -> str:
    """
    version 3.0.4.1
    :param user_id: 用户id, 作为储存的key
    :param avatar: 用户头像数据 或者 用户头像链接
    :param upload_type: 以何种方式上传
    :return: 上传成功后的cdn链接
    """
    local_file_path = f'./{user_id}.jpg'
    try:
        avatar: bytes = requests.get(avatar).content if upload_type == UploadAvatarType.URL else avatar.encode()
        with open(local_file_path, 'wb+') as f:
            f.write(avatar)
        s3_client.upload_file(local_file_path=local_file_path, file_name=f'user-avatars/{user_id}',
                              content_type='image/jpeg')
        return generate_cdn_url('/user-avatars', f'{user_id}')
    finally:
        if os.path.exists(local_file_path):
            os.remove(local_file_path)


@cache(key=lambda media_id: 'Author_v3_%s' % media_id, ex=10 * 60, cache_on_memory=10, prefix=RedisKeyPrefix.AUTHOR)
def _get_author_info(media_id):
    ret = {}
    user = mysql_client.retrieve_object_by_unique_key(User, id=media_id)
    ret.update(user.get_info())

    user_extra_info = mysql_client.retrieve_object_by_unique_key(UserExtraInfo, id=user.id)
    if user_extra_info is None:
        ret.update({'be_likes_count': 0,
                    'be_follows_count': 0})
    else:
        ret.update({'be_likes_count': user_extra_info.be_likes_count,
                    'be_follows_count': user_extra_info.be_follows_count})

    return ret


def get_user_author_info(author_id, with_avatar=False):
    user_info = _get_author_info(author_id)
    if with_avatar:
        user_info['avatar'] = _get_user_avatar(user_info['user_id'], user_info['user_type'])

    valid = user_info['valid']
    rights = {
        'add_comment': valid > 0,
        'create_news': valid > 0
    }
    user_info['rights'] = rights

    return user_info
