import base64
import csv
import gzip
import json

des_import = False
try:
    from Crypto.Cipher import DES

    des_import = True
except:
    des_import = False

import decimal
import pyDes

from django.http import HttpResponse

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
# 方法不支持
ERROR_METHOD_NOT_SUPPORTED = 400


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


def get_image_response(data):
    return HttpResponse(data, content_type="image/png")


def get_csv_response(filename, headers, data):
    """
    :param filename:
    :param headers: csv headers
    :param data: list of dict to write
    :return:
    """
    response = HttpResponse(content_type="text/csv")
    response['Content-Disposition'] = 'attachment; filename="%s"' % filename
    writer = csv.writer(response)
    writer.writerow(headers)
    for item in data:
        writer.writerow([item[key] for key in headers])
    return response


def admin_decode_request_body(body):
    try:
        return json.loads(body.decode("utf-8"))
    except:
        return None


def decode_request_body(body):
    try:
        des = pyDes.des("bacanews", pyDes.ECB, padmode=pyDes.PAD_PKCS5)
        return json.loads(des.decrypt(base64.b64decode(body.decode("utf-8"))).decode("utf-8"))
    except:
        return None


def _decrypt_v2(body):
    cipher = DES.new(b'bacanews', DES.MODE_ECB)
    data = cipher.decrypt(body)
    padding_bytes = data[-1]
    if 1 <= padding_bytes <= 16:
        data = data[:-padding_bytes]
    del cipher
    return data


def decode_request_body_v2(body):
    try:
        if des_import:
            return json.loads(_decrypt_v2(base64.b64decode(body.decode("utf-8"))).decode("utf-8"))
        else:
            return decode_request_body(body)
    except:
        return None


def encode_request_body(body_data):
    try:
        des = pyDes.des("bacanews", pyDes.ECB, padmode=pyDes.PAD_PKCS5)
        return base64.b64encode(des.encrypt(json.dumps(body_data, separators=(",", ":"))))
    except:
        return None


def decode_b64_gzip(input_str):
    try:
        return json.loads(gzip.decompress(base64.urlsafe_b64decode(input_str.encode('utf-8'))).decode('utf-8'))
    except:
        return None


def encode_b64_gzip(input_data):
    try:
        return base64.urlsafe_b64encode(
            gzip.compress(bytes(json.dumps(input_data, separators=(",", ":")), 'utf-8'))).decode('utf-8')
    except:
        return ""


def encode_token(user_data: dict):
    user_data["password"] = ""
    return encode_b64_gzip(user_data)


def decode_token(token):
    return decode_b64_gzip(token)


class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            if o % 1 > 0:
                return float(o)
            else:
                return int(o)
        return super(DecimalEncoder, self).default(o)


def get_success_response_using_decimal_encoder(data):
    response = HttpResponse(
        json.dumps({
            "errno": ERROR_NO_SUCCESS,
            "errmsg": "",
            "data": data
        }, cls=DecimalEncoder),
        content_type="application/json"
    )
    return response


def dispatch_by_app(default_method, router):
    def inner(request, *args, **kwargs):
        app_name = request.META.get('HTTP_APPNAME', None)
        if app_name in router:
            return router[app_name](request, *args, **kwargs)
        else:
            return default_method(request, *args, **kwargs)

    return inner


def decode_success_response(response: HttpResponse):
    if not isinstance(response, HttpResponse) or response.status_code != 200:
        raise ValueError('response must be an instance of HttpResponse and with status code 200')
    else:
        return json.loads(response.content).get('data')


def get_raw_response(data):
    response = HttpResponse(
        json.dumps(data, separators=(',', ':')),
        content_type="application/json"
    )
    return response
