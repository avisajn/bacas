import json

from django.http import HttpRequest
from django.views.decorators.http import require_POST

from common import loggers, requestutils, utils
from common.constants import ADMIN_TOKEN
from push.context import context
from push.handler_create_news import get_user_fcm_tokens
from push.models import PushUser, PushItem
from push.push_client import PushClient
from users.forms import admin_clear_user_cache_schema
from users.utils import _get_user_info, get_user_info

logger = loggers.get_logger(__name__)

push_client = PushClient(server_rate_limit=context.server_rate_limit,
                         user_rate_limit=context.user_rate_limit)


@require_POST
def clear_user_cache(request: HttpRequest):
    user_id = None
    try:
        # 身份验证
        post_data = admin_clear_user_cache_schema(json.loads(request.body))
        admin_email = post_data['email']
        token = post_data['token']
        user_id = post_data['user_id']
        if token != ADMIN_TOKEN or not admin_email.endswith('@newsinpalm.com'):
            logger.info(f'Error admin user or token, email {admin_email}')
            return requestutils.get_error_response(-2, 'Access denied, error email or token.')
        # 清除缓存
        _get_user_info.clear(user_id)
        user_info = get_user_info(user_id)

        # TODO 目前不需要主动推送 修改App本地用户权限的缓存
        # 给客户端发送权限变化的推送
        # fcm_tokens = get_user_fcm_tokens([user_id])
        # if len(fcm_tokens) > 0:
        #     data_message = {
        #         'title': '',
        #         'body': '',
        #         'click_action': 'FLUTTER_NOTIFICATION_CLICK',
        #         'routeName': 'user_rights_change',
        #         'create_news': user_info['rights']['create_news'],
        #         'add_comment': user_info['rights']['add_comment'],
        #         'batchId': '',
        #     }
        #     to_push_users = [PushUser(user_id=_user_id, fcm_token=fcm_token) for _user_id, fcm_token in
        #                      fcm_tokens.items() if not utils.is_empty(fcm_token)]
        #     push_item = PushItem(users=to_push_users, push_type='user_rights_change', data_message=data_message)
        #     push_client.push(push_item)

        return requestutils.get_success_response(data={})
    except:
        logger.exception(f'Error occurred users.admin_views.clear_user_cache, user_id {user_id}')
        return requestutils.get_internal_error_response()
