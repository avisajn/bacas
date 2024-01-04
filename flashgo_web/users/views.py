import datetime
import json
import os
import time

import requests
from django.http import HttpResponse
from django.views.decorators.gzip import gzip_page
from django.views.decorators.http import require_http_methods

from author.utils import get_following_author_ids
from bonuses.constants import BonusAction
from common import loggers
from common.mysqlclient import mysql_client
from common.redisclient import redis_client, cache
from common.requestutils import parse_headers
from common.sql_models import UserFavoriteSelectedInterest
from favorite.utils import get_user_fav_deals, get_user_reminders
from recsys.events import sender
from topic.utils import get_total_follow_topic_ids
from user_center_utils import config, requestutils
from user_center_utils.context import Resource, auth
from user_center_utils.mysqlclient import PaydayLoanDbClient
from user_center_utils.tokens import jwt_token_generator
from users.models import User, CoinUser
from users.utils import get_user_info, _get_user_info

logger = loggers.get_coin_logger(__name__)

MAGIC_STRING = 'defbc3e1'

login_logger = loggers.get_clean_logger(MAGIC_STRING + __name__, 'login_facebook.log')


def get_ip(request):
    try:
        ip_address = request.META.get('REMOTE_ADDR', '')
        ip_address = ip_address.split(",")
        ip = None
        if len(ip_address) > 0:
            ip = ip_address[0]
        return ip if ip is not None else ""
    except:
        logger.exception('get ip error')
    return ""


def record_ip(request, user_id):
    try:
        ip = get_ip(request)
        redis_client.set_user_login_ip(user_id, ip)
    except:
        logger.exception('record ip error')


def add_new_user(user: User, current: datetime.datetime):
    try:
        if user.created_time >= current:
            redis_client.add_new_users(user.user_id)
    except:
        logger.exception('add new user error')


def _check_need_select_interest(user_id, raw_user_id):
    facebook_interests = mysql_client.retrieve_objects_by_conditions(UserFavoriteSelectedInterest,
                                                                     UserFavoriteSelectedInterest.user_id == user_id)
    if len(facebook_interests) > 0:
        return False
    else:
        raw_interests = mysql_client.retrieve_objects_by_conditions(UserFavoriteSelectedInterest,
                                                                    UserFavoriteSelectedInterest.user_id == raw_user_id)
        if len(raw_interests) == 0:
            return True
        else:
            mysql_client.update_raw_interest_to_facebook(raw_interests, user_id)
            return False


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


class Users(Resource):
    def __init__(self, db=None, login_url=None):
        self.db = db  # type: PaydayLoanDbClient
        self.login_url = login_url

    def get_header(self, request):
        headers = {}
        header_names = ["X-User-Id", "X-User-Token", "X-App-Package-Id"]
        for name in header_names:
            value = request.META.get('HTTP_%s' % name.upper().replace('-', '_'), '')
            headers[name] = value
        return headers

    def facebook_login(self, request, *args, **kwargs):
        timer = Timer()
        extra_data = kwargs.get('server_extra_data', {})

        headers = self.get_header(request)
        body = requestutils.decode_request_body_v2(request.body)
        extra_data['decode_time_ms'] = timer.reset()

        source_channel = body.get('SourceChannel', '')
        logger.info("receive fb login %s" % body)
        headers['X-FlashGo-Ip'] = get_ip(request)

        timer.reset()

        resp = None
        try:
            resp = requests.post(self.login_url, json=body, headers=headers, timeout=10)
        finally:
            extra_data['facebook_login_time_ms'] = timer.reset()
            extra_data['facebook_body'] = body
            extra_data['facebook_headers'] = headers
            if resp is not None:
                extra_data['facebook_status'] = resp.status_code
            else:
                extra_data['facebook_status'] = -100

        if not resp.ok:
            logger.info("login failed with %s, status %s" % (resp.text, resp.status_code))
            return requestutils.get_error_response(requestutils.ERROR_LOGIN_FAIL, 'login failed')

        fcm_token = body.get('GcmId', '')
        login_data = resp.json()
        login_data['FacebookLogin'] = True
        jwt_token = login_data['GwtToken']
        data = jwt_token_generator.decode(jwt_token)
        user_id = data['userId']
        raw_user_id = body['RawUserId']
        login_data['needSelectInterest'] = _check_need_select_interest(user_id, raw_user_id)
        login_data['FollowIds'] = {
            'author_ids': get_following_author_ids(user_id),
            'topic_ids': get_total_follow_topic_ids(user_id)
        }
        login_data["FavoriteDealIds"] = get_user_fav_deals(user_id)
        login_data["ReadDealIds"] = redis_client.get_user_browsing_history(user_id, 0, 100)
        login_data["FavoriteFlashRemindDealIds"] = get_user_reminders(user_id)

        extra_data['check_interest_time_ms'] = timer.reset()

        record_ip(request, user_id)
        if len(user_id) > 0:
            coin_user = CoinUser.from_json(login_data)
            coin_user = self.db.create_if_not_exists(CoinUser, coin_user, user_id=user_id)
            extra_data['coin_user_time_ms'] = timer.reset()
            current = datetime.datetime.now()
            user = User(user_id=user_id, firebase_user_id=body['RawUserId'], name=body.get('UserName', ''),
                        gender=None, fcm_token=fcm_token,
                        source_channel=source_channel,
                        created_time=datetime.datetime.now(),
                        updated_time=datetime.datetime.now(),
                        package_id=headers.get('X-App-Package-Id', ''))
            user = self.db.create_if_not_exists(User, user, user_id=user_id)
            if user.name != body.get('UserName', ''):
                self.db.update_object(User, user.id, name=body.get('UserName', ''))
            else:
                pass
            extra_data['user_time_ms'] = timer.reset()
            add_new_user(user, current)
            extra_data['add_new_user_time_ms'] = timer.reset()
            if user is None or coin_user is None:
                return requestutils.get_error_response(requestutils.ERROR_LOGIN_FAIL, 'login failed')
            else:
                return login_data
        else:
            return requestutils.get_error_response(requestutils.ERROR_LOGIN_FAIL, 'login failed')

    def post(self, request, *args, **kwargs):
        body = requestutils.decode_request_body_v2(request.body)
        user_id = body['UserId']
        source_channel = body.get('SourceChannel', '')
        record_ip(request, user_id)
        headers = self.get_header(request)

        start_time = time.time()
        server_extra_data = {}
        if user_id.startswith('Facebook'):
            try:
                login_data = self.facebook_login(request, *args, **kwargs, server_extra_data=server_extra_data)
                return login_data
            finally:
                server_extra_data['user_id'] = user_id
                server_extra_data['login_time_ms'] = int((time.time() - start_time) * 1000)
                login_logger.info(json.dumps(server_extra_data))
        else:
            fcm_token = body.get('GcmId', '')
            current = datetime.datetime.now()
            user = User(user_id=user_id, name=body.get('UserName', ''), firebase_user_id=user_id, gender=None,
                        source_channel=source_channel, fcm_token=fcm_token, created_time=datetime.datetime.now(),
                        updated_time=datetime.datetime.now(), package_id=headers.get('X-App-Package-Id', ''))
            user = self.db.create_if_not_exists(User, user, user_id=user_id)
            add_new_user(user, current)

            if user is None:
                return requestutils.get_error_response(requestutils.ERROR_LOGIN_FAIL, 'login failed')
            else:
                return {
                    'UserId': user_id,
                    'FacebookLogin': False,
                    'GwtToken': jwt_token_generator.encode({'userId': user_id}),
                    'needSelectInterest': True,
                    'FollowIds': {
                        'author_ids': get_following_author_ids(user_id),
                        'topic_ids': get_total_follow_topic_ids(user_id)
                    },
                    "FavoriteDealIds": get_user_fav_deals(user_id),
                    "FavoriteFlashRemindDealIds": get_user_reminders(user_id),
                    "ReadDealIds": redis_client.get_user_browsing_history(user_id, 0, 100)
                }

    @auth
    def get(self, request, *args, **kwargs):
        user_id = kwargs.get('user_id', '')
        user = self.db.retrieve_object_by_unique_key(User, user_id=user_id)
        if user is None:
            resp = HttpResponse('user not find')
            resp.status_code = 404
            return resp
        else:
            return user.to_json()

    def get_user_by_id(self, user_id) -> User:
        user = self.db.retrieve_object_by_unique_key(User, user_id=user_id)
        return user

    @auth
    def patch(self, request, *args, **kwargs):
        user_id = kwargs.get('user_id', '')
        post_data = kwargs.get('body', '')
        new_user_info = {k: v for k, v in post_data.items() if k not in {'user_id', 'id'}}
        try:
            old_user_info = get_user_info(user_id, with_avatar=False)

            need_update = False
            for key, value in new_user_info.items():
                if value != old_user_info.get(key, None):
                    need_update = True
                    break
            if not need_update:
                return old_user_info

            if 'gender' in new_user_info and new_user_info['gender'] in {'Male', 'Female'}:
                if old_user_info['gender'] != new_user_info['gender']:
                    sender.send_change_gender_event(user_id, new_user_info['gender'])

            if user_id not in {'web', None, 'test'}:
                redis_client.add_active_users(user_id, 'login')

            if 'id' in old_user_info:
                self.db.update_object(User, old_user_info['id'], **new_user_info)

            if 'gender' in new_user_info:
                _get_user_gender.clear(user_id)
            if 'fcm_token' in new_user_info:
                redis_client.clear_user_fcm_token(user_id)
            _get_user_info.clear(user_id)

            return _get_user_info(user_id)
        except:
            logger.exception('user_id(%s) not found' % user_id)
            return self.resource_not_found


class QAS(Resource):
    def __init__(self):
        def read_file(filename):
            base_dir = os.path.dirname(os.path.abspath(__file__))
            with open(os.path.join(base_dir, filename), 'rb') as f:
                return f.read()

        qas = json.loads(read_file('qas.json'))
        self.qas = []
        current_qas = {'category': None}
        for qa in qas:
            if qa['category'] != current_qas['category']:
                self.qas.append(list())
            self.qas[-1].append(qa)
            current_qas = qa

    def get(self, request, *args, **kwargs):
        return self.qas


@auth
def get_user_rights(request, **kwargs):
    user_id = kwargs['user_id']
    try:
        user_rights = get_user_info(user_id, with_avatar=False)['rights']
        return requestutils.get_success_response(data=user_rights)
    except:
        logger.exception(f'Error occurred in users.views.user_detail, {user_id}')
        return requestutils.get_internal_error_response()


def get_config(request):
    try:
        headers_data = parse_headers(request)
        user_id = headers_data.get_user_id()
        basic_actions = {
            BonusAction.SHARE_LINK: {
                'action_id': BonusAction.SHARE_LINK,
                'action_title': 'Undang teman',
                'action_description': "Berbagi aplikasi mendapatkan <font color='#FF6203'>500 koin</font> dan dapatkan <font color='#FF6203'>Rp800</font> untuk setiap teman yang berhasil kamu undang!",
            },
            BonusAction.DEAL_SHARE: {
                'action_id': BonusAction.DEAL_SHARE,
                'action_title': 'Bagikan produk ber-cashback',
                'action_description': "Dapatkan <font color='#FF6203'>100 koin</font> setiap hari dan dapatkan juga cashback tak terbatas",
            },
            BonusAction.NEWS_SHARE: {
                'action_id': BonusAction.NEWS_SHARE,
                'action_title': 'Bagikan konten',
                'action_description': "Dapatkan <font color='#FF6203'>100 koin</font> setiap hari",
            }
        }

        ret = {'incentive_tasks': json.dumps(basic_actions, separators=(',', ':'))}
        return requestutils.get_raw_response(data=ret)
    except:
        logger.exception('Error occurred in bonuses.views.get_incentive_actions.')
        return requestutils.get_internal_error_response()


@gzip_page
@require_http_methods(['GET'])
def get_user_follow(request):
    user_id = None
    try:
        headers_data = parse_headers(request)
        user_id = headers_data.get_login_user_id()
        ret = {
            'author_ids': get_following_author_ids(user_id),
            'topic_ids': get_total_follow_topic_ids(user_id)
        }
        return requestutils.get_success_response(data=ret)
    except:
        logger.exception(f'Error occurred in <users.views.get_user_follow>, user_id {user_id}')
        return requestutils.get_internal_error_response()


@gzip_page
@require_http_methods(['GET'])
def get_user_relative_ids(request):
    user_id = None
    try:
        headers_data = parse_headers(request)
        user_id = headers_data.get_login_user_id()
        ret = {
            'FollowIds': {
                'author_ids': get_following_author_ids(user_id),
                'topic_ids': get_total_follow_topic_ids(user_id)
            },
            "FavoriteDealIds": get_user_fav_deals(user_id),
            "FavoriteFlashRemindDealIds": get_user_reminders(user_id),
            "ReadDealIds": redis_client.get_user_browsing_history(user_id, 0, 100)
        }
        return requestutils.get_success_response(data=ret)
    except:
        logger.exception(f'Error occurred in <users.views.get_user_favorite>, user_id {user_id}')
        return requestutils.get_internal_error_response()


####################################
# The functions followed are utils.#
####################################
def get_user_gender(user_id):
    gender = _get_user_gender(user_id)
    if gender in {'Male', 'Female'}:
        return gender
    else:
        return None


@cache(lambda user_id: 'U_GENDER_V2_%s' % user_id, ex=20 * 60, cache_on_memory=3)
def _get_user_gender(user_id):
    user_model = config.user_center_db.retrieve_object_by_unique_key(User, user_id=user_id)
    return user_model.gender if user_model is not None else 'unknown'


users = Users(config.user_center_db, config.login_url)
qas = QAS()
