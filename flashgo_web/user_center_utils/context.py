"""
the context for request
"""
import django
from django.http import HttpResponse

from common import loggers
from user_center_utils import requestutils
from user_center_utils.tokens import jwt_token_generator


def get_user_id_from_request(request):
    authorization = request.META.get("HTTP_AUTHORIZATION", "")
    if authorization is None or len(authorization) == 0:
        authorization = request.META.get("AUTHORIZATION", "")
    jwt_token = (authorization.strip()[len('Bearer'):]).strip()
    user_id = None
    # 是否需要验证token有没有过期
    try:
        user_id = str(jwt_token_generator.decode(jwt_token).get('userId', None))
    except:
        pass
    return user_id


def auth(func=None, use_encryption=True):
    def decorator(inner_func):

        def inner(*args, **kwargs):
            try:
                request = None
                for arg in args:
                    if isinstance(arg, django.http.request.HttpRequest):
                        request = arg
                        break
                if request is None:
                    return requestutils.get_internal_error_response()
                user_id = get_user_id_from_request(request)
                if user_id is None or len(str(user_id)) == 0:
                    logger.exception('token is wrong or expired')
                    return requestutils.get_unauthorized_response('token is wrong or expired')
                request_user_id = str(kwargs.get('user_id', ''))
                if len(request_user_id) > 0 and request_user_id != str(user_id):
                    logger.exception('user_id is wrong')
                    return requestutils.get_unauthorized_response('user_id is wrong')
                kwargs['user_id'] = user_id
                if use_encryption:
                    body = requestutils.decode_request_body(request.body)
                    kwargs['body'] = body
                else:
                    body = request.body
                    if isinstance(body, bytes):
                        body = body.decode('utf-8')
                    kwargs['body'] = body
                return inner_func(*args, **kwargs)
            except:
                logger.exception("Error occurred in user_center_utils.context.auth.")
                return requestutils.get_internal_error_response()

        return inner

    return decorator(func) if func is not None else decorator


logger = loggers.get_logger(__name__)


def log_exception(*args, **kwargs):
    try:
        msg = str(args) + str(kwargs)
    except:
        msg = 'error'
    logger.exception(msg)


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
            log_exception(e)
            response = requestutils.get_internal_error_response()
        if isinstance(response, HttpResponse):
            return response
        else:
            return requestutils.get_success_response(response)

    @property
    def unsupported_response(self):
        return requestutils.get_error_response(requestutils.ERROR_METHOD_NOT_SUPPORTED, 'method not supported')

    @property
    def resource_not_found(self):
        return requestutils.get_error_response(404, 'resource not found')

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
