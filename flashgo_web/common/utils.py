import base64
import hashlib
import itertools
import json
import math
import os
import random
import re
from string import ascii_letters, digits
from typing import List

import jwt
import pyDes
from django.http import HttpResponse

from common import requestutils
from common.proxy import ObjectWrapperProxy
from news.constants import REGEX_NEWS_NEGATIVE_WORDS

TEST_TOKEN = "6992273a-bedc-11e7-95ac-acde48001122"
ERROR_NO_SUCCESS = 0
ERROR_NO_BUSINESS = -1
ERROR_NO_SERVER = -2
ERROR_NO_API = -3
ERROR_NO_APP = -4

# loan 相关

# 以下两个相同，后续使用第一个比较准确
ERROR_NOT_CANNOT_EDIT = -300
# 贷款中修改个人信息会报此错误
ERROR_NOT_CLOSE_APPLICATION = -300
ERROR_NOT_SUPPORTED_PRODUCT = -301

# 身份证重复
ERROR_DUP_KTP = -301

# user 相关 ： 4 开头

# HTTP 状态码，409表示请求冲突
ERROR_NO_CONFLICT = -409
# HTTP 状态码，410表示请求已经结束，被清理
ERROR_NO_GONE = -410
# 账户不存在
ERROR_NOT_EXIST = -411

ERROR_LOGIN_FAIL = -412

# 验证码错误
ERROR_WRONG_VERIFICATION_CODE = -413

# profile 相关
ERROR_PROFILE_MISSING = -420


def decode_request_body(body):
    # noinspection PyBroadException
    try:
        des = pyDes.des("bacanews", pyDes.ECB, padmode=pyDes.PAD_PKCS5)
        return json.loads(des.decrypt(base64.b64decode(body.decode("utf-8"))).decode("utf-8"))
    except:
        return None


def get_unauthorized_response(reason, no=ERROR_NO_BUSINESS):
    return get_error_response(no, reason)


def get_internal_error_response():
    return get_error_response(ERROR_NO_SERVER, "internal error")


class ErrorHttpResponse(HttpResponse):
    pass


def get_error_response(error_no, error_message):
    response = ErrorHttpResponse(
        json.dumps({
            "errno": error_no,
            "errmsg": error_message
        }),
        content_type="application/json"
    )
    response.status_code = 500
    return response


def get_success_response(data, cls=None):
    response = HttpResponse(
        json.dumps({
            "errno": ERROR_NO_SUCCESS,
            "errmsg": "",
            "data": data
        }, cls=cls, separators=(",", ":")),
        content_type="application/json"
    )
    return response


class JWTokenGenerator(object):
    def __init__(self, secret):
        self.secret = secret

    def encode(self, data: dict):
        return jwt.encode(data, key=self.secret)

    def decode(self, data):
        return jwt.decode(data, self.secret)


JWT_SECRET = '784ebd80-4d78-4d42-9abb-7edc2c1a4466'

jwt_token_generator = JWTokenGenerator(JWT_SECRET)

ANONYMOUS = 'anonymous'

from django.db.models.fields.related import ManyToManyField


def get_login_user_id(request):
    """
    if user login return user_id else return 0
    """
    authorization = request.META.get("HTTP_AUTHORIZATION", "")
    if authorization is None or len(authorization) == 0:
        authorization = request.META.get("AUTHORIZATION", "")
    jwt_token = (authorization.strip()[len('Bearer'):]).strip()
    user_id = None
    # 是否需要验证token有没有过期
    try:
        user_id = jwt_token_generator.decode(jwt_token).get('userId', None)
    except:
        pass
    return user_id


def login_with_facebook(user_id):
    return str(user_id).startswith('Facebook')


def auth(func=None, *, must_use_encryption=True, facebook_login=True):
    def decorator(inner_func):
        def inner(request, *args, **kwargs):
            user_id = get_login_user_id(request)
            if user_id is None or len(str(user_id)) == 0:
                return requestutils.get_unauthorized_response('token is wrong or expired')
            if facebook_login and not login_with_facebook(user_id):
                return requestutils.get_unauthorized_response('not login with facebook')
            if must_use_encryption:
                body = requestutils.decode_request_body_with_bytes(request.body)
            else:
                body = request.body
            return inner_func(ObjectWrapperProxy(request, body=body, user_id=user_id), *args, **kwargs)

        return inner

    return decorator(func) if func is not None else decorator


def to_dict(instance):
    if instance:
        opts = instance._meta
        data = {}
        for f in opts.concrete_fields + opts.many_to_many:
            if isinstance(f, ManyToManyField):
                if instance.pk is None:
                    data[f.name] = []
                else:
                    data[f.name] = list(f.value_from_object(instance).values_list('pk', flat=True))
            else:
                data[f.name] = f.value_from_object(instance)
    else:
        data = None
    return data


def to_dict_fav(instance):
    ret = {k: v for k, v in instance.__dict__.items() if not k.startswith('_')}
    if 'created_time' in ret and ret['created_time'] is not None:
        ret['created_time'] = ret.get('created_time').isoformat()
    if 'updated_time' in ret and ret['updated_time'] is not None:
        ret['updated_time'] = ret.get('updated_time').isoformat()
    return ret


def pick_from_array(array, size=2147384637):
    result = []
    sets = set()
    for items in itertools.zip_longest(*array):
        for item in items:
            if item is not None:
                if item not in sets:
                    result.append(item)
                    if len(result) >= size:
                        return result[:size]
                    sets.add(item)
    return result[:size]


def _next(iter):
    try:
        return next(iter)
    except StopIteration:
        return None


def random_pick(array, weights, size=2147384637):
    indexes = list(range(0, len(weights)))
    weights = {index: v for index, v in enumerate(weights)}
    current_weights = [weights[w] for w in indexes]
    iters = [iter(l) for l in array]
    result = UniqueItemList()
    empty_set = set()
    while len(result) <= size and len(indexes) > 0:
        r = random.choices(indexes, current_weights, k=20)
        random.shuffle(r)
        for index in r:
            item = _next(iters[index])
            if item is None:
                indexes.remove(index)
                empty_set.add(index)
                current_weights = [weights[w] for w in indexes]
                break
            else:
                result.append(item)
    return result.to_list()


def list_to_chunk(data: List, size=500):
    return [data[item:item + size] for item in range(0, len(data), size)]


class UniqueItemList(object):
    def __init__(self):
        self.l = []
        self.s = set()

    def append(self, *items):
        for item in items:
            if item not in self.s:
                self.l.append(item)
                self.s.add(item)

    def __len__(self):
        return len(self.l)

    def to_list(self):
        return list(self.l)


class DuplicatedItemSet(object):
    """
    可以有重复的数据的set
    """

    def __init__(self, l=None):
        self.data = {}
        if isinstance(l, dict):
            self.data = {k: v for k, v in l.items() if v > 0}
        else:
            if l is not None:
                for item in list(l):
                    self.append(item)

    def __delitem__(self, key):
        if key in self.data:
            self.data[key] -= 1
            if self.data[key] == 0:
                del self.data[key]

    def __sub__(self, other):
        values = {}
        for k, count in self.data.items():
            if k in other.data:
                left_count = count - other.data[k]
                if left_count > 0:
                    values[k] = left_count
            else:
                values[k] = count
        return DuplicatedItemSet(values)

    def __len__(self):
        return sum(self.data.values())

    def append(self, item):
        if item in self.data:
            self.data[item] += 1
        else:
            self.data[item] = 1

    def __contains__(self, item):
        return item in self.data and self.data[item] > 0

    def __repr__(self):
        return repr(self.to_list())

    def __iter__(self):
        return iter(self.to_list())

    def to_list(self):
        result = []
        for k, count in self.data.items():
            for i in range(0, count):
                result.append(k)
        return result


def is_empty(input_object):
    input_str_is_empty = input_object is None
    if not input_str_is_empty:
        if isinstance(input_object, list) or \
                isinstance(input_object, dict) or \
                isinstance(input_object, set):
            input_str_is_empty = len(input_object) == 0
        if isinstance(input_object, str):
            input_str_is_empty = len(input_object.strip()) == 0
    return input_str_is_empty


def get_gaid(request):
    for key in ["HTTP_USER_GAID", "HTTP_X_GOOGLE_AD_ID"]:
        gaid = request.META.get(key, "")
        if gaid is not None and len(gaid) > 0:
            return gaid
    return None


def divide_deal_ids_by_suffix(deal_ids):
    deal_ids_map = {}
    for deal_id in deal_ids:
        suffix = str(deal_id)[-2:]
        deal_ids = deal_ids_map.get(suffix, set())
        deal_ids.add(deal_id)
        deal_ids_map[suffix] = deal_ids
    return deal_ids_map


def get_headers_data(request):
    ret = dict()
    for key, value in request.META.items():
        if key.startswith('HTTP_'):
            key = key[5:]
        key: str = key.replace('_', '-').title()
        ret[key] = value
    return ret


def get_user_id_from_request_header(header):
    user_id = header.get('HTTP_X_USER_ID', None)
    return user_id


def get_app_version_from_header(header):
    for key in ['HTTP_X_APP_VERSION', 'HTTP_APP_VERSION']:
        app_version = header.get(key, "")
        if (app_version is not None) and len(app_version) > 0:
            return int(app_version)
    else:
        return 0


def read_file(filename):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(base_dir, filename), 'rb') as f:
        return f.read()


def filter_by_user_impression(feed_ids: List[int], filter_ids: List[int], with_impression: bool = True):
    impression_ids = set(filter_ids)
    unread = []
    read = []
    for item_id in feed_ids:
        if item_id in impression_ids:
            read.append(item_id)
        else:
            unread.append(item_id)
    if with_impression:
        return unread + read
    else:
        return unread


def get_random_ids(ids, count):
    if not isinstance(ids, list):
        ids = list(ids)
    if len(ids) <= count:
        return ids
    elif len(ids) == 0:
        return []
    else:
        return random.sample(ids, count)


def get_id_from_request(request, key):
    key_id = request.GET.get(key)
    # noinspection PyBroadException
    try:
        return int(key_id)
    except:
        return 0


def get_param_from_request_query(request, param_key, require_type, default=None):
    value = request.GET.get(param_key, None)
    if value is None:
        return default
    else:
        if isinstance(value, require_type):
            return value
        else:
            # noinspection PyBroadException
            try:
                value = require_type(value)
                return value
            except:
                return default


def get_user_bucket(user_id: str, buckets):
    user_id = str(user_id)
    md5_data = hashlib.md5(user_id.encode('utf-8'))
    hash_number = int(md5_data.hexdigest()[:5], 16) % buckets
    return hash_number


def generate_cdn_url(path, file_name):
    path = path.strip('/')
    return f'https://cdn.flashgo.online/{path}/{file_name}'


def concat_cdn_url(path: str):
    path = path.strip("/")
    return f'https://cdn.flashgo.online/{path}'


def parse_int(number, default: int):
    try:
        return int(number)
    except:
        return default


LETTERS_SET = set(ascii_letters)


def format_topic_keywords(word):
    result = []
    for char in word:
        if char in LETTERS_SET:
            result.append(char)
        else:
            pass
    return ''.join(result).lower()


def check_negative_words_valid(text, negative_words):
    ascii_text = []
    for ch in text:
        if ch.isalnum():
            ascii_text.append(ch)
        else:
            ascii_text.append(' ')
    text = f' {"".join(ascii_text).lower()} '
    for negative_word in negative_words:
        if f' {negative_word} ' in text:
            return False
    return True


def filter_sensitive_words(text: str, sensitive_words_list: List[str]):
    return re.sub("|".join(sensitive_words_list), "***", text, flags=re.IGNORECASE)


DIGITS_SET = set(digits)


def check_guid_valid(guid: str):
    valid_char_set = LETTERS_SET | DIGITS_SET | {'-'}
    for char in guid:
        if char not in valid_char_set:
            return False
    return True


def check_valid_rate_by_words(text: str, valid_words_rate: float = 0.4):
    filtered_title: str = filter_sensitive_words(text, REGEX_NEWS_NEGATIVE_WORDS)
    invalid_char_count = 0
    space_count = 0
    for char in filtered_title:
        if char == '*':
            invalid_char_count += 1
        elif char == ' ':
            space_count += 1
    filtered_valid_count = len(filtered_title) - invalid_char_count - space_count
    total_valid_count = len(text) - space_count
    total_valid_count = 1 if total_valid_count <= 0 else total_valid_count
    rate = filtered_valid_count / total_valid_count
    return rate > valid_words_rate


class OfferUtils(object):
    def __init__(self):
        raise Exception("this class cant init.")

    @staticmethod
    def get_offer_bonus(base_bonus: int, extra_bonus: int, cut_rate: float = 0.8) -> int:
        return math.floor((base_bonus + extra_bonus) * cut_rate)

    @staticmethod
    def get_filter_rate(target_rate: float, cut_rate: float = 0.8) -> float:
        return target_rate / cut_rate
