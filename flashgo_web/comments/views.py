import json
import time
import uuid

from django.views.decorators.gzip import gzip_page

from comments.constants import AddCommentErrorData, CommentNotificationType, COMMENT_NEGATIVE_WORDS
from comments.forms import get_news_comments_schema, add_comment_schema, get_user_comments_schema, \
    get_likes_notifications_schema, add_comment_likes_schema, get_attention_status_schema, get_sub_comments_schema, \
    get_comments_notifications_schema
from comments.models import Comments, CommentLikes
from comments.utils import get_news_pageable_comment_ids, get_comment_info, get_user_pageable_comment_ids, \
    get_likes_data_of_my_comments, get_news_comments_count, get_comment_like_info, check_comment_is_validation, \
    get_last_be_replied, get_sub_comment_ids, update_user_comment_list, get_comment_ids_replied, \
    get_comment_ids_relative, filter_comments, update_sub_comment_ids, update_news_comments, \
    update_news_author_comment_list
from common import loggers, requestutils
from common.mysqlclient import mysql_client
from common.redisclient import redis_client
from common.requestutils import parse_get_schema, parse_headers
from common.utils import auth, get_login_user_id, login_with_facebook, check_negative_words_valid
from favorite.sql_model import UserLike
from favorite.utils import _get_received_like
from news.constants import NewsStatus
from news.models import News
from news.utils import get_tiny_news_info, get_news_info
from users.constants import UserTypeMapping
from users.utils import get_user_info, get_tiny_user_info

logger = loggers.get_logger(__name__)


def _get_user_comment_ids(user_id: str, page_id: int, count: int = 10):
    today_comment_ids = redis_client.get_user_comments_today(user_id)
    today_total_count = len(today_comment_ids)
    if today_total_count == 0:
        return get_user_pageable_comment_ids(user_id, page_id, count)
    max_page_id = (today_total_count + count - 1) // count - 1
    if page_id <= max_page_id:
        comment_ids = today_comment_ids[page_id * count: (page_id + 1) * count]
        if len(comment_ids) < count:
            comment_ids = comment_ids + get_user_pageable_comment_ids(user_id, 0, count)
    else:
        comment_ids = get_user_pageable_comment_ids(user_id, page_id - max_page_id - 1, count)
    return comment_ids


@auth(facebook_login=True)
def get_my_comments(request):
    """
    version: 3.0.2.7
    """
    user_id = get_login_user_id(request)
    try:
        query_data = parse_get_schema(request, get_user_comments_schema)
        page_id = query_data['page_id']
        count = query_data['count']
        comment_ids = _get_user_comment_ids(user_id, page_id=page_id, count=count)
        ret = []
        for comment_id in comment_ids:
            try:
                ret.append(_get_comment_info(comment_id, user_id, with_tiny_article=True, with_sub_comments=False))
            except:
                logger.exception('Get comment {} error'.format(comment_id))
        ret = _filter_comment_info_list(ret)
        extra_param = {'impression_id': str(uuid.uuid4())}
        if len(comment_ids) > 0:
            extra_param['next_page_id'] = str(page_id + 1)
        return requestutils.get_success_response(data=ret, extra_param=extra_param)
    except:
        logger.exception('Error occurred in get_user_comments, user_id {}'.format(user_id))
        return requestutils.get_internal_error_response()


def get_news_comments(request):
    """
    version: 3.0.2.7
    """
    news_id = None
    try:
        query_data = parse_get_schema(request, get_news_comments_schema)
        news_id = query_data['news_id']
        page_id = query_data['page_id']
        count = query_data['count']
        comment_ids = get_news_pageable_comment_ids(news_id, page_id, count)

        headers = parse_headers(request)
        user_id = headers.get_user_id()
        ret = []
        for comment_id in comment_ids:
            try:
                ret.append(_get_comment_info(comment_id, user_id, with_tiny_article=False, with_sub_comments=True))
            except:
                logger.exception('Get comment {} error'.format(comment_id))

        ret = _filter_comment_info_list(ret)
        extra_param = {'impression_id': str(uuid.uuid4()), 'total_comments': get_news_comments_count(news_id, level=2)}
        if len(comment_ids) > 0 and (page_id + 1) * count < get_news_comments_count(news_id, level=1):
            extra_param['next_page_id'] = str(page_id + 1)

        return requestutils.get_success_response(data=ret, extra_param=extra_param)
    except:
        logger.exception('Error occurred in get_news_comments, news_id {}'.format(news_id))
        return requestutils.get_internal_error_response()


def add_comment(request):
    """
    version: 3.0.2.7
    """
    user_id = None
    try:
        user_id = get_login_user_id(request)
        if not login_with_facebook(user_id):
            return requestutils.get_success_response(data={}, extra_param=AddCommentErrorData.USER_NOT_LOGIN)

        user_info = get_user_info(user_id)
        if user_info['valid'] == 0:
            return requestutils.get_success_response(data={}, extra_param=AddCommentErrorData.USER_BANNED)

        request_body = add_comment_schema(json.loads(request.body))
        content = request_body['content'].strip()
        if len(content) == 0:
            return requestutils.get_success_response(data={}, extra_param=AddCommentErrorData.CONTENT_EMPTY)

        if len(content) > 500:
            return requestutils.get_success_response(data={}, extra_param=AddCommentErrorData.CONTENT_TOO_LONG)

        if not check_negative_words_valid(content, COMMENT_NEGATIVE_WORDS):
            return requestutils.get_success_response(data={}, extra_param=AddCommentErrorData.CONTENT_INVALID)

        # 验证新闻, 必须是审核通过的才可以评论
        news_id = request_body['news_id']
        news_info = get_news_info(news_id, user_id)
        if news_info['news_status']['valid_id'] != NewsStatus.SUCCESS:
            return requestutils.get_success_response(data={}, extra_param=AddCommentErrorData.NEWS_BE_COMMENTED_INVALID)

        # 创建评论
        comment = Comments(user_id=user_id, news_id=news_id, thread_id=request_body['comment_id_be_replied'],
                           like_count=0, content=content, root_id=request_body['root_id'])
        comment_id = mysql_client.create_object(comment)

        # 新评论添加到 评论作者 的 今日评论列表
        redis_client.add_to_user_today_comments(comment_id, user_id)

        data = _get_comment_info(comment_id, user_id, with_tiny_article=True, with_sub_comments=False)
        user_info_be_replied = data['user_info_be_replied']

        if data['root_id'] == 0:
            # 更新新闻的一级评论列表 & 更新新闻的一级评论数量
            update_news_comments(news_id, comment_id)
            redis_client.update_news_comments_count(news_id, level=1)

            # 如果新闻是 真实用户 发布的
            news_info = get_news_info(news_id, user_id)
            author_user_type = news_info['author']['user_type']

            # 加到 新闻被评论 推送队列 & 更新被评论新闻作者的红点 & 加到被评论新闻作者的相关评论列表
            if author_user_type == UserTypeMapping.REAL_USER:
                redis_client.add_push_news_be_commented(news_id, comment_id)
                redis_client.update_user_last_browser_time(news_info['author']['user_id'], time.time(), is_like=False)
                redis_client.add_to_user_today_comments(comment_id, news_info['author']['user_id'])
                update_news_author_comment_list(comment_id, news_info['author']['user_id'])
        else:
            # 加到 comment_replied 推送队列 & 更新相应的 二级评论列表 & 更新 被回复用户的 我的评论页面 的红点
            redis_client.add_to_reply_push_queue(data['comment_id'], user_info_be_replied['user_id'])
            update_sub_comment_ids(data['root_id'], data['comment_id'])
            redis_client.update_user_last_browser_time(user_info_be_replied['user_id'], time.time(), is_like=False)

        redis_client.update_news_comments_count(news_id, level=2)
        update_user_comment_list(comment_id, user_id, user_info_be_replied.get('user_id', ''))

        extra_param = AddCommentErrorData.COMMENT_SUCCESS
        extra_param['relative_comment'] = _get_comment_notification_info(user_id, comment_id)
        return requestutils.get_success_response(data=data, extra_param=extra_param)
    except:
        logger.exception('Error occurred in add_comment, user_id {}'.format(user_id))
        return requestutils.get_internal_error_response()


def _get_likes_of_my_comments_data(user_id, page_id, count=10):
    today_like_data = redis_client.get_likes_of_my_comments_today(user_id)
    today_total_count = len(today_like_data)
    if today_total_count == 0:
        return get_likes_data_of_my_comments(user_id, page_id, count)
    max_page_id = (today_total_count + count - 1) // count - 1
    if page_id <= max_page_id:
        likes_data = today_like_data[page_id * count: (page_id + 1) * count]
        if len(likes_data) < count:
            likes_data = likes_data + get_likes_data_of_my_comments(user_id, 0, count)
    else:
        likes_data = get_likes_data_of_my_comments(user_id, page_id - max_page_id - 1, count)
    return likes_data


@auth(facebook_login=True)
def get_likes_notifications(request):
    """
    version: 3.0.2.7
    """
    user_id = get_login_user_id(request)
    try:
        query_data = parse_get_schema(request, get_likes_notifications_schema)
        page_id = query_data['page_id']
        count = query_data['count']
        likes_data = _get_likes_of_my_comments_data(user_id, page_id, count)
        res = []
        for thump_up_user_id, comment_id in likes_data:
            try:
                comment_info = _get_thump_up_info(user_id, comment_id, thump_up_user_id=thump_up_user_id)
                if comment_info['comment']['valid'] == 1:
                    res.append(comment_info)
            except:
                pass
        extra_param = {'impression_id': str(uuid.uuid4())}
        if len(likes_data) > 0:
            extra_param['next_page_id'] = str(page_id + 1)
        return requestutils.get_success_response(data=res, extra_param=extra_param)
    except:
        logger.exception('Error occurred in get_likes_of_my_comments, user_id {}'.format(user_id))
        return requestutils.get_internal_error_response()


def add_comment_likes(request):
    """
    version: 3.0.2.7
    """
    user_id = None
    try:
        headers = parse_headers(request)
        user_id = headers.get_user_id()
        is_login_user = login_with_facebook(user_id)
        request_body = add_comment_likes_schema(json.loads(request.body))
        comment_id = request_body['comment_id']
        comment_user_id = request_body['comment_user_id']

        comment_like = CommentLikes(comment_id=comment_id, user_id=user_id, comment_owner=comment_user_id,
                                    login_status=1 if is_login_user else 0)
        mysql_client.create_if_not_exists(CommentLikes, comment_like, comment_id=comment_id, user_id=user_id)

        redis_client.add_to_recently_update_comment(comment_id)
        redis_client.update_comment_like_count(comment_id)
        if is_login_user:
            redis_client.add_to_push_like_queue(comment_id, user_id, comment_user_id)
            redis_client.add_to_likes_of_my_comments(comment_user_id, comment_id, user_id)
            redis_client.update_user_last_browser_time(comment_user_id)
            user_info = get_user_info(user_id)
            _get_received_like.clear(user_info['id'], user_info['user_id'])
        get_comment_like_info.clear(user_id, comment_id)
        return requestutils.get_success_response(data={})
    except:
        logger.exception('Error occurred in add_comment_likes, user_id {}'.format(user_id))
        return requestutils.get_internal_error_response()


# def cancel_comment_likes(request):
#     user_id = None
#     comment_id = None
#     try:
#         headers_data = get_headers_data(request)
#         user_id = headers_data['X-User-Id']
#         request_body = del_comment_likes_schema(json.loads(request.body))
#         comment_id = request_body['comment_id']
#         mysql_client.delete_object_by_unique_key(CommentLikes, user_id=user_id, comment_id=comment_id)
#         return requestutils.get_success_response(data={})
#     except:
#         logger.exception(
#             'Error occurred in cancel_comment_likes, user_id {}, comment_id {}'.format(user_id, comment_id))
#         return requestutils.get_internal_error_response()


@auth(facebook_login=True)
def get_attention_status(request):
    """
    version: 3.0.2.7
    """
    user_id = None
    try:
        user_id = get_login_user_id(request)
        query_data = parse_get_schema(request, get_attention_status_schema)

        if len(query_data) == 0:
            return requestutils.get_internal_error_response()

        data = {}
        user_info = get_user_info(user_id)
        if 'like_comment_att_time' in query_data:
            last_like_att_time = query_data['like_comment_att_time']
            if last_like_att_time == 0:
                data['like_comment_att_status'] = False
            else:
                last_like_time = _get_last_be_like_time(user_id, user_info['id'])
                data['like_comment_att_status'] = last_like_time > (last_like_att_time / 1000)

        if 'be_replied_att_time' in query_data:
            last_be_replied_time = query_data['be_replied_att_time']
            if last_be_replied_time == 0:
                data['be_replied_att_status'] = False
            else:
                last_be_replied = get_last_be_replied(user_id)
                data['be_replied_att_status'] = last_be_replied > (last_be_replied_time / 1000)

        return requestutils.get_success_response(data=data)
    except:
        logger.exception('Error occurred in get_likes_of_comments_status, user_id {}'.format(user_id))
        return requestutils.get_internal_error_response()


@gzip_page
def get_sub_comments(request, root_id):
    try:
        header_data = parse_headers(request)
        user_id = header_data.get_user_id()
        query_data = parse_get_schema(request, get_sub_comments_schema)

        comment_ids = get_sub_comment_ids(root_id, query_data['page_id'], query_data['count'], skip_two=True)
        next_comment_ids = get_sub_comment_ids(root_id, query_data['page_id'] + 1, query_data['count'], skip_two=True)
        ret = []
        for comment_id in comment_ids:
            try:
                comment_info = _get_comment_info(comment_id, user_id, with_tiny_article=False, with_sub_comments=False)
                ret.append(comment_info)
            except:
                logger.info(f"Get comment error, comment_id {comment_id}.")
        ret = _filter_comment_info_list(ret)
        extra_param = {'impression_id': str(uuid.uuid4())}
        if len(next_comment_ids) > 0:
            extra_param['next_page_id'] = str(query_data['page_id'] + 1)
        return requestutils.get_success_response(data=ret, extra_param=extra_param)
    except:
        logger.exception(f"Error occurred in comments.views.get_sub_comments, root_id {root_id}.")
        return requestutils.get_internal_error_response()


@gzip_page
@auth(facebook_login=True)
def get_comments_notifications(request):
    user_id = None
    try:
        header_data = parse_headers(request)
        user_id = header_data.get_user_id()
        query_data = parse_get_schema(request, get_comments_notifications_schema)
        notification_type = query_data['type']
        page_id = query_data['page_id']
        count = query_data['count']

        if notification_type == CommentNotificationType.REPLY_TO_ME:
            comment_ids = get_comment_ids_replied(user_id)[page_id * count: (page_id + 1) * count]
        elif notification_type == CommentNotificationType.ALL:
            comment_ids = get_comment_ids_relative(user_id)[page_id * count: (page_id + 1) * count]
        else:
            comment_ids = _get_user_comment_ids(user_id, page_id=page_id, count=count)

        ret = []
        for comment_id in comment_ids:
            try:
                comment_notification_info = _get_comment_notification_info(user_id, comment_id)
                if comment_notification_info['comment_current']['valid'] == 1 and \
                        comment_notification_info['comment_be_replied'].get('valid', 1) == 1:
                    ret.append(comment_notification_info)
            except:
                logger.exception(f"Get comment info error. comment_id {comment_id}")
        ret = filter_comments(ret)

        extra_param = {}
        if len(comment_ids) > 0:
            extra_param['next_page_id'] = str(page_id + 1)
        return requestutils.get_success_response(data=ret, extra_param=extra_param)

    except:
        logger.exception(f"Error occurred in comments.views.get_comments_notifications, user_id {user_id}.")
        return requestutils.get_internal_error_response()


####################################
# The functions followed are utils.#
####################################
def _get_comment_info(comment_id, user_id, *, with_tiny_article, with_sub_comments):
    comment_info = get_comment_info(user_id, comment_id)

    # 评论是否是作者本人
    news_info = get_news_info(comment_info['news_id'], user_id, with_tiny_article=False)
    comment_info['is_article_author'] = news_info['author']['id'] == comment_info['user_info']['id']

    tiny_article = get_tiny_news_info(comment_info.pop('news_id'), play_video_directly=True)
    if with_tiny_article:
        comment_info['tiny_article'] = tiny_article
    else:
        comment_info['tiny_article'] = {}

    if tiny_article['valid_id'] != 1:
        comment_info['valid'] = 0

    comment_info['sub_comments'] = {'comments_list': []}
    root_id = comment_info['root_id'] if 'root_id' in comment_info else comment_info['route_id']
    if with_sub_comments and root_id == 0:
        sub_comments_ids = get_sub_comment_ids(comment_id, 0, 5, skip_two=False)
        sub_comments_data = []
        for sub_comment_id in sub_comments_ids:
            try:
                sub_comment_info = get_comment_info(user_id, sub_comment_id)
                sub_comment_info['is_article_author'] = news_info['author']['id'] == sub_comment_info['user_info']['id']
                sub_comments_data.append(sub_comment_info)
            except:
                logger.info(f"Get comment error, comment_id {sub_comment_id}.")
        comment_info['sub_comments'] = {'comments_list': sub_comments_data[:2]}
        if len(sub_comments_data) > 2:
            comment_info['sub_comments'].update({'next_page_id': '0'})

    return comment_info


def _filter_comment_info_list(comment_info_list):
    ret = []
    for _comment_info in comment_info_list:
        if _comment_info['valid'] > 0:
            ret.append(_comment_info)
    return ret


def _get_thump_up_info(user_id, comment_id, *, thump_up_user_id):
    return {
        'comment': _get_comment_info(comment_id, user_id, with_tiny_article=True, with_sub_comments=False),
        'thump_up_user': get_tiny_user_info(thump_up_user_id),
        'thump_up_time': get_comment_like_info(thump_up_user_id, comment_id)['like_time']
    }


def _get_comment_notification_info(user_id, comment_id):
    comment_info = _get_comment_info(comment_id, user_id, with_tiny_article=True, with_sub_comments=False)
    if comment_info['comment_id_be_replied'] is not None and comment_info['comment_id_be_replied'] > 0:
        comment_info_be_replied = _get_comment_info(comment_info['comment_id_be_replied'], user_id,
                                                    with_tiny_article=True, with_sub_comments=False)
    else:
        comment_info_be_replied = {}
    return {
        'comment_current': comment_info,
        'comment_be_replied': comment_info_be_replied
    }


def _get_last_be_like_time(user_id, media_id):
    last_timestamp = redis_client.get_user_last_browser_time(user_id)
    if last_timestamp is None:
        comment_last_created_time = mysql_client.get_max_by_conditions(CommentLikes.created_time,
                                                                       CommentLikes.comment_owner == user_id)
        news_list = mysql_client.retrieve_objects_by_conditions(News, News.valid == NewsStatus.SUCCESS,
                                                                News.media_id == media_id)
        news_ids = [news.news_id for news in news_list]
        news_last_created_time = mysql_client.get_max_by_conditions(UserLike.created_time,
                                                                    UserLike.news_id.in_(news_ids))
        comment_last_timestamp = 0 if comment_last_created_time is None else comment_last_created_time.timestamp()
        news_last_timestamp = 0 if news_last_created_time is None else news_last_created_time.timestamp()
        last_timestamp = max(comment_last_timestamp, news_last_timestamp)
        redis_client.update_user_last_browser_time(user_id, last_timestamp)
        return last_timestamp
    else:
        return last_timestamp
