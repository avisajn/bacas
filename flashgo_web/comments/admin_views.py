import json
import time

from comments.forms import admin_clear_cache_schema, modify_comment_like_cache_schema
from comments.utils import get_comment_info, update_user_comment_list, \
    update_sub_comment_ids, update_news_comments
from common import loggers, requestutils
from common.constants import ADMIN_TOKEN
from common.redisclient import redis_client

logger = loggers.get_logger(__name__)


def modify_add_comment(request, comment_id):
    user_id = 'test'
    admin_email = ''
    try:
        # 身份验证
        post_data = admin_clear_cache_schema(json.loads(request.body))
        admin_email = post_data['email']
        token = post_data['token']
        if token != ADMIN_TOKEN or not admin_email.endswith('@newsinpalm.com'):
            logger.info(f'Error admin user or token, email {admin_email}')
            return requestutils.get_error_response(-2, 'Access denied, error email or token.')

        comment_info = get_comment_info(user_id, comment_id)
        news_id = comment_info['news_id']
        user_info_be_replied = comment_info['user_info_be_replied']

        if comment_info['root_id'] == 0:
            # 更新新闻一级评论列表 & 更新一级评论总数
            update_news_comments(news_id, comment_id)
            redis_client.update_news_comments_count(news_id, level=1)
        else:
            # 添加到推送队列
            redis_client.add_to_reply_push_queue(comment_info['comment_id'], user_info_be_replied['user_id'])

            # 更新二级评论列表
            update_sub_comment_ids(comment_info['root_id'], comment_info['comment_id'])

            # 更新红点
            redis_client.update_user_last_browser_time(user_info_be_replied['user_id'], time.time(), is_like=False)

        # 更新二级评论总数
        redis_client.update_news_comments_count(news_id, level=2)
        update_user_comment_list(comment_id, user_id, user_info_be_replied.get('user_id', ''))

        return requestutils.get_success_response(data={})
    except:
        logger.exception(
            'Error occurred in comments.admin_views.clear_cache, admin email {}'.format(admin_email))
        return requestutils.get_internal_error_response()


def modify_like_comment(request):
    admin_email = ''
    try:
        # 身份验证
        post_data = modify_comment_like_cache_schema(json.loads(request.body))
        admin_email = post_data['email']

        if post_data['token'] != ADMIN_TOKEN or not admin_email.endswith('@newsinpalm.com'):
            logger.info(f'Error admin user or token, email {admin_email}')
            return requestutils.get_error_response(-2, 'Access denied, error email or token.')

        user_id = post_data['user_id']
        comment_id = post_data['comment_id']
        comment_user_id = post_data['comment_user_id']

        # 更新评论被点赞数
        redis_client.update_comment_like_count(comment_id)

        # 添加到推送队列
        redis_client.add_to_push_like_queue(comment_id, user_id, comment_user_id)

        # 添加到用户被点赞列表 &　更新红点时间
        redis_client.add_to_likes_of_my_comments(comment_user_id, comment_id, user_id)
        redis_client.update_user_last_browser_time(comment_user_id)

        return requestutils.get_success_response(data={})
    except:
        logger.exception(
            'Error occurred in comments.admin_views.modify_comment_like_cache, admin email {}'.format(admin_email))
        return requestutils.get_internal_error_response()
