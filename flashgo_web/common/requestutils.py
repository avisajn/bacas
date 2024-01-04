import base64
import json

import pyDes
from django.http import HttpResponse
from django.utils.decorators import available_attrs
from voluptuous import Schema, wraps, MultipleInvalid

from common import loggers
from common.forms import header_schema
from user_center_utils.tokens import jwt_token_generator

logger = loggers.get_logger(__name__)

TEST_TOKEN = "6992273a-bedc-11e7-95ac-acde48001122"
ERROR_NO_SUCCESS = 0
ERROR_NO_BUSINESS = -1
ERROR_NO_SERVER = -2
ERROR_NO_API = -3
ERROR_NO_APP = -4
ERROR_DB_SERVER = -5

#

# sales add_deal 错误码
ERROR_ADD_DEAL = -6

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
    try:
        des = pyDes.des("bacanews", pyDes.ECB, padmode=pyDes.PAD_PKCS5)
        return json.loads(des.decrypt(base64.b64decode(body.decode("utf-8"))).decode("utf-8"))
    except:
        return None


def decode_request_body_with_bytes(body):
    try:
        des = pyDes.des("bacanews", pyDes.ECB, padmode=pyDes.PAD_PKCS5)
        return des.decrypt(base64.b64decode(body.decode("utf-8"))).decode("utf-8")
    except:
        return None


def get_unauthorized_response(reason, no=ERROR_NO_BUSINESS):
    return get_error_response(no, reason)


def get_internal_error_response(exception=""):
    return get_error_response(ERROR_NO_SERVER, exception)


def get_db_error_response(exception=""):
    return get_error_response(ERROR_DB_SERVER, exception)


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


def get_success_response(data, cls=None, extra_param=None):
    data = {
        "errno": ERROR_NO_SUCCESS,
        "errmsg": "",
        "data": data
    }
    if extra_param is not None:
        data.update(extra_param)
    response = HttpResponse(
        json.dumps(data, cls=cls, separators=(",", ":")),
        content_type="application/json"
    )
    return response


def get_success_response_without_wrapper(data):
    response = HttpResponse(
        json.dumps(data, separators=(",", ":")),
        content_type="application/json"
    )
    return response


def get_image_response(data):
    return HttpResponse(data, content_type="image/png")


def parse_get_params(request) -> dict:
    return {key: request.GET.get(key) for key in request.GET if len(str(request.GET.get(key)).strip()) > 0}


def parse_get_schema(request, schema: callable, nullable=False):
    if nullable:
        data = {key: request.GET.get(key) for key in request.GET}
    else:
        raw_data = {key: request.GET.get(key) for key in request.GET}
        data = {k: v for k, v in raw_data.items() if v is not None and len(str(v)) > 0}
    return schema(data)


class HeaderData(object):
    USER_ID = 'X_USER_ID'
    APP_VERSION = 'X_APP_VERSION'
    TEST_MODE_EXTRA_INFO = 'X_TM_EXTRA_INFO'
    GOOGLE_AD_ID = 'X_GOOGLE_AD_ID'
    PACKAGE_ID = 'X_APP_PACKAGE_ID'
    AUTHORIZATION = 'AUTHORIZATION'
    INVITE_CODE = 'X_INVITE_CODE'
    USER_TOKEN = 'X_USER_TOKEN'

    def __init__(self, app_data: dict, raw_data: dict):
        self.app_data = app_data
        self.raw_data = raw_data

    def get_user_id(self):
        return self._get(self.USER_ID, None)

    def get_app_version(self):
        return self._get(self.APP_VERSION, None)

    def get_test_mode_extra_info(self):
        return self._get(self.TEST_MODE_EXTRA_INFO, False)

    def get_package_id(self):
        return self._get(self.PACKAGE_ID, None)

    def keys(self, raw_data=False):
        if raw_data:
            return self.raw_data.keys()
        else:
            return self.app_data.keys()

    def _get(self, header_name, default_value, raw_data=False):
        if raw_data:
            data = self.raw_data
        else:
            data = self.app_data
        return data.get(header_name, default_value)

    def get_login_user_id(self):
        authorization = self._get(self.AUTHORIZATION, default_value='')
        user_id = None
        # 是否需要验证token有没有过期
        try:
            user_id = jwt_token_generator.decode((authorization.strip()[len('Bearer'):]).strip()).get('userId', None)
        except:
            pass
        return user_id


def parse_headers(request, schema: Schema = header_schema):
    raw_data = {}
    app_data = {}
    for key, value in request.META.items():
        if key.startswith('HTTP_'):
            app_data[key[5:]] = value
        raw_data[key] = value
    return HeaderData(schema(app_data), raw_data)


class Resource(object):
    def __call__(self, request, *args, **kwargs):
        handlers = {
            'GET': self.get,
            'POST': self.post,
            'PATCH': self.patch,
            'PUT': self.put,
            'DELETE': self.delete
        }
        try:
            if request.method not in handlers:
                response = self.unsupported_response
            else:
                response = handlers[request.method](request, *args, **kwargs)
        except Exception as e:
            response = get_internal_error_response()
        if isinstance(response, HttpResponse):
            return response
        elif response is None:
            return self.resource_not_found
        else:
            return get_success_response(response)

    @property
    def unsupported_response(self):
        return get_error_response(400, 'method not supported')

    @property
    def resource_not_found(self):
        return get_error_response(404, 'resource not found')

    def get(self, request, *args, **kwargs):
        return self.unsupported_response

    def post(self, request, *args, **kwargs):
        return self.unsupported_response

    def patch(self, request, *args, **kwargs):
        return self.unsupported_response

    def put(self, request, *args, **kwargs):
        return self.unsupported_response

    def delete(self, request, *args, **kwargs):
        return self.unsupported_response


def unpack(f=None, form=None):
    def decorator(inner_func):
        @wraps(inner_func, assigned=available_attrs(inner_func))
        def inner(request, *args, **kwargs):
            if request.method == 'GET':
                post_data = parse_get_params(request)
            else:
                post_data = json.loads(request.body)
            if form is not None:
                kwargs.update(form(post_data))
            else:
                kwargs.update(post_data)
            return inner_func(request, *args, **kwargs)

        return inner

    if f is None:
        return decorator
    else:
        return decorator(f)


def is_enable_dev(request):
    headers = parse_headers(request)
    return headers.get_test_mode_extra_info()


def catch_exception(f, module_name):
    def inner(request, *args, **kwargs):
        try:
            response = f(request, *args, **kwargs)
            if response is None:
                raise ValueError('response is None')
            else:
                return response
        except MultipleInvalid as e:
            logger.exception(f'error when for {e}')
            if is_enable_dev(request):
                return get_internal_error_response(str(e))
            else:
                return get_internal_error_response()
        except:
            logger.exception(f'error when for {module_name}')
            return get_internal_error_response()

    return inner


def get_ip(request):
    try:
        ip_address = request.META.get('REMOTE_ADDR', '')
        ip_address = ip_address.split(",")
        ip = None
        if len(ip_address) > 0:
            ip = ip_address[0]
        forward_ip = request.META.get('HTTP_X_FORWARDED_FOR', '')
        if forward_ip is not None and len(forward_ip) > 0:
            ip = forward_ip
        return ip if ip is not None else ""
    except:
        logger.exception('get ip error')
    return ""
