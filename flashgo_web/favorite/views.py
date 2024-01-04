import json
import time
import uuid
from datetime import datetime

from django.core.serializers.json import DjangoJSONEncoder
from django.db import IntegrityError
from django.views.decorators.gzip import gzip_page
from django.views.decorators.http import require_GET

from bonuses.constants import BonusAction, AwardOrderStatus
from bonuses.sql_models import UserAwardDetails
from comments.views import _get_comment_info
from common import requestutils, loggers
from common.exps import play_video_directly_exp
from common.mysqlclient import mysql_client
from common.recommend_logger import deal_logger, concat_bucket_name
from common.redisclient import redis_client
from common.requestutils import parse_headers, parse_get_schema
from common.sql_models import UserFavoriteSelectedInterest
from common.utils import get_login_user_id, get_user_id_from_request_header, get_id_from_request, auth
from deals.utils import get_deal_detail_by_deal_id, get_deal_info
from events.utils import send_news_impression, wrapper_news_ids
from favorite.constants import LikedTypeMapping
from favorite.forms import add_favorite_schema, cancel_favorite_schema, get_my_favorite_schema, \
    flash_add_remind_schema, batch_cancel_favorite_schema, cancel_not_valid_favorite_schema, \
    add_user_interests_schema, add_user_reportdealerrors_schema, add_or_remove_user_like_schema, \
    add_selected_interest_schema, get_received_like_schema, get_favorite_deals_schema
from favorite.sql_model import UserInterests, UserFlashRemind, UserReportDealErrors, UserLike
from favorite.utils import USER_FAV_CACHE_PATTERN, USER_FAV_VIDEO_CACHE_PATTERN, get_user_fav_deals, \
    get_user_fav_videos, get_user_interests, get_common_interests, _get_selected_interests, get_user_likes_news_ids, \
    get_interests_category, _get_received_like, get_pageable_received_like, get_user_reminders
from news.constants import NewsStatus
from news.utils import get_news_detail_by_id, filter_news_feeds, get_news_info, update_news_like_count
from recsys.events import sender
from recsys.models import FeedItem
from users.constants import UserTypeMapping
from users.utils import get_user_info, get_tiny_user_info
from video.utils import get_video_detail_from_news, filter_invalid_video

logger = loggers.get_logger(__name__)


def clear_fav_cache(user_id):
    redis_client.clear_object_cache(USER_FAV_CACHE_PATTERN % user_id)
    redis_client.clear_object_cache(USER_FAV_VIDEO_CACHE_PATTERN % user_id)


def add_favorite(request, user_id=None, deal_id=None):
    """收藏"""
    try:
        if user_id is None or deal_id is None:
            post_data = add_favorite_schema(json.loads(request.body))
            user_id = post_data.get("user_id")
            favorite_type = post_data.get("type")
            deal_id = post_data.get("deal_id", None)
            if deal_id is None:
                deal_id = post_data.get("id")
        else:
            favorite_type = 'deal'
        if favorite_type == 'deal':
            try:
                mysql_client.set_favorite_deal(user_id, deal_id)
            except IntegrityError:
                logger.exception('save before for %s %s' % (user_id, deal_id))
        elif favorite_type == 'video':
            try:
                mysql_client.create_object(UserLike(user_id=user_id, news_id=deal_id, type=3))
                redis_client.update_news_like_count(deal_id, increase=True)
                redis_client.clear_object_cache('U_like_N_%s' % user_id)
            except:
                logger.exception('save favorite video error for {} {}'.format(user_id, deal_id))
        clear_fav_cache(user_id)
        return requestutils.get_success_response({"favorite_ids": get_user_fav_deals(user_id)}, cls=DjangoJSONEncoder)
    except Exception as e:
        if user_id is not None:
            clear_fav_cache(user_id)
        logger.exception('add favorite error')
        return requestutils.get_internal_error_response(str(e))


def cancel_favorite(request):
    """闪购取消提醒"""
    try:
        post_data = cancel_favorite_schema(json.loads(request.body))
        user_id = post_data.get("user_id")
        favorite_type = post_data.get("type")
        deal_id = post_data.get("deal_id", None)
        if deal_id is None:
            deal_id = post_data.get('id')
        if favorite_type == 'video':
            mysql_client.delete_objects_by_conditions(UserLike, UserLike.user_id == user_id,
                                                      UserLike.news_id == deal_id)
            redis_client.update_news_like_count(deal_id, increase=False)
            redis_client.clear_object_cache('U_like_N_%s' % user_id)
        elif favorite_type == 'deal':
            mysql_client.delete_favorite_deal(user_id=user_id, deal_id=deal_id)
            mysql_client.delete_objects_by_conditions(UserFlashRemind, UserFlashRemind.user_id == user_id,
                                                      UserFlashRemind.deal_id == deal_id)
            redis_client.clear_object_cache('user_reminds_%s' % user_id)
        clear_fav_cache(user_id)
        return requestutils.get_success_response({"favorite_ids": get_user_fav_deals(user_id)}, cls=DjangoJSONEncoder)
    except Exception as e:
        return requestutils.get_internal_error_response(str(e))


def cancel_invalid_favorite(request):
    """闪购取消提醒"""
    try:
        post_data = cancel_not_valid_favorite_schema(json.loads(request.body))
        logger.info(post_data)
        user_id = post_data.get("user_id")
        favorite_type = post_data.get("type")
        logger.info(favorite_type)
        if favorite_type == 'video':
            videos = mysql_client.retrieve_objects_by_conditions(UserLike, UserLike.user_id == user_id,
                                                                 UserLike.type == 3)
            to_del_video = []
            for video in videos:
                try:
                    # noinspection PyUnusedLocal
                    video_data = get_news_detail_by_id(video.news_id)
                except:
                    to_del_video.append(video.news_id)
            mysql_client.delete_objects_by_conditions(UserLike, UserLike.user_id == user_id,
                                                      UserLike.type == 3,
                                                      UserLike.news_id.in_(to_del_video))
        elif favorite_type == 'deal':
            user_favorite_data = mysql_client.get_user_fav_deals(user_id)
            deal_ids = [deal.deal_id for deal in user_favorite_data]
            mysql_client.check_and_del_fav_invalid_deals(user_id, deal_ids)
            mysql_client.delete_objects_by_conditions(UserFlashRemind, UserFlashRemind.user_id == user_id,
                                                      UserFlashRemind.deal_id.in_(deal_ids))
            redis_client.clear_object_cache('user_reminds_%s' % user_id)
        clear_fav_cache(user_id)
        return requestutils.get_success_response({"favorite_ids": get_user_fav_deals(user_id)}, cls=DjangoJSONEncoder)
    except Exception as e:
        logger.exception('cancel invalid favorite error')
        return requestutils.get_internal_error_response(str(e))


def batch_cancel_favorite(request):
    """批量取消收藏"""
    try:
        post_data = batch_cancel_favorite_schema(json.loads(request.body))
        user_id = post_data.get("user_id")
        ids = post_data.get("deal_ids", None)
        if ids is None:
            ids = post_data.get('ids')
        favorite_type = post_data.get("type")
        if favorite_type == 'video':
            mysql_client.delete_objects_by_conditions(UserLike, UserLike.user_id == user_id,
                                                      UserLike.type == 3,
                                                      UserLike.news_id.in_(ids))
        elif favorite_type == 'deal':
            mysql_client.batch_del_fav_deal(user_id, ids)
            mysql_client.delete_objects_by_conditions(UserFlashRemind, UserFlashRemind.user_id == user_id,
                                                      UserFlashRemind.deal_id.in_(ids))
            redis_client.clear_object_cache('user_reminds_%s' % user_id)
            clear_fav_cache(user_id)
        return requestutils.get_success_response({"favorite_ids": get_user_fav_deals(user_id)}, cls=DjangoJSONEncoder)
    except Exception as e:
        return requestutils.get_internal_error_response(str(e))


def get_my_favorite(request):
    """获取我的搜藏列表"""
    user_id = None
    try:
        res = []
        body = json.loads(request.body)
        if 'impression_id' in body:
            body.pop('impression_id')
        post_data = get_my_favorite_schema(body)
        user_id = post_data.get("user_id")
        favorite_type = post_data.get("type")
        count = post_data.get("count")
        page_id = post_data.get("page_id")
        channel = post_data.get("channel", "no_channel")

        impression_id = str(uuid.uuid4())
        if favorite_type == "deal":
            query_data = get_user_fav_deals(user_id)
            query_data = query_data[(count * page_id):
                                    (page_id + 1) * count]
            for deal_id in query_data:
                try:
                    favorite_dict = get_deal_detail_by_deal_id(deal_id, user_id=user_id)
                    res.append(favorite_dict)
                except:
                    logger.exception('fav_deal %s not found' % deal_id)
            deal_logger.set_impression(impression_id, user_id, query_data, concat_bucket_name(user_id), channel=channel)
        else:
            user_fav_videos = get_user_fav_videos(user_id)
            user_fav_videos = user_fav_videos[(count * page_id):
                                              (page_id + 1) * count]
            for video_id in user_fav_videos:
                try:
                    video_detail = get_video_detail_from_news(video_id, user_id)
                    res.append(video_detail)
                except:
                    logger.exception('fav_video %s not found' % video_id)
            res = filter_invalid_video(res)
            deal_logger.set_impression(impression_id, user_id, [data['id'] for data in res],
                                       concat_bucket_name(user_id), channel=channel)
        return requestutils.get_success_response(res, cls=DjangoJSONEncoder,
                                                 extra_param={'impression_id': impression_id})
    except:
        logger.exception("get_my_favorite error, user_id %s" % user_id)
        return requestutils.get_internal_error_response()


def get_interests(request):
    try:
        interests = get_common_interests()
        user_id = get_login_user_id(request)
        if user_id is None:
            res = []
        else:
            res = get_user_interests(user_id)
        return requestutils.get_success_response({'user_interests': res, 'interests': interests}, cls=DjangoJSONEncoder)
    except:
        logger.exception('get common interests error.')
        return requestutils.get_internal_error_response()


def add_user_interests(request):
    try:
        post_data = add_user_interests_schema(json.loads(request.body))
        user_id = post_data.get("user_id")
        interest_id = post_data.get("interest_id")
        mysql_client.create_object(UserInterests(user_id=user_id, interest_id=interest_id))
        redis_client.clear_object_cache('U_interests_%s' % user_id)
        return requestutils.get_success_response({}, cls=DjangoJSONEncoder)
    except:
        logger.exception('add user interest error.')
        return requestutils.get_internal_error_response()


def add_user_reportdealerrors(request):
    try:
        post_data = add_user_reportdealerrors_schema(json.loads(request.body))
        user_id = post_data.get("user_id")
        deal_id = post_data.get("deal_id")
        error = post_data.get("error")
        mysql_client.create_object(UserReportDealErrors(user_id=user_id, deal_id=deal_id,
                                                        error=error, createdtime=datetime.now()))
        return requestutils.get_success_response({}, cls=DjangoJSONEncoder)
    except:
        logger.exception('report deals error')
        return requestutils.get_internal_error_response()


def add_user_flashremind(request):
    try:
        post_data = flash_add_remind_schema(json.loads(request.body))
        user_id = post_data.get('user_id')
        deal_id = post_data.get('deal_id')
        try:
            mysql_client.create_object(UserFlashRemind(user_id=user_id, deal_id=deal_id, createdtime=datetime.now()))
            add_favorite(request=None, user_id=user_id, deal_id=deal_id)
            redis_client.clear_object_cache('user_reminds_%s' % user_id)
        except IntegrityError:
            logger.exception('save before for %s %s' % (user_id, deal_id))
        ret = {
            "favorite_ids": get_user_fav_deals(user_id),
            "flash_remind_ids": get_user_reminders(user_id)
        }
        return requestutils.get_success_response(data=ret, cls=DjangoJSONEncoder)
    except:
        logger.exception('add user flash remind error')
        return requestutils.get_internal_error_response()


def remove_user_flashremind(request):
    try:
        post_add = flash_add_remind_schema(json.loads(request.body))
        user_id = post_add.get("user_id")
        deal_id = post_add.get("deal_id")
        mysql_client.delete_object_by_unique_key(UserFlashRemind, user_id=user_id, deal_id=deal_id)
        mysql_client.delete_favorite_deal(user_id=user_id, deal_id=deal_id)
        redis_client.clear_object_cache('user_reminds_%s' % user_id)
        clear_fav_cache(user_id)
        ret = {
            "favorite_ids": get_user_fav_deals(user_id),
            "flash_remind_ids": get_user_reminders(user_id)
        }
        return requestutils.get_success_response(data=ret, cls=DjangoJSONEncoder)
    except:
        logger.exception('remove user flash remind error.')
        return requestutils.get_internal_error_response()


def get_user_like(request):
    try:
        headers = parse_headers(request)
        user_id = get_user_id_from_request_header(request.META)
        page_id = int(request.GET.get('page_id', 0))
        res = []
        news_ids = get_user_likes_news_ids(user_id)[page_id * 10: (page_id + 1) * 10]
        impression_id = str(uuid.uuid4())
        send_news_impression(user_id, impression_id, page_id,
                             wrapper_news_ids(news_ids, FeedItem(0, 'user_like', 'default', 'default')),
                             from_page='content_like_recommend', package_id=headers.get_package_id())
        for news_id in news_ids:
            try:
                data = get_news_detail_by_id(news_id, user_id)
                data['like_status'] = True
                res.append(data)
            except:
                logger.info('news({}) not found'.format(news_id))
        res = filter_news_feeds(res)
        return requestutils.get_success_response(res, cls=DjangoJSONEncoder,
                                                 extra_param={'impression_id': impression_id})
    except:
        logger.exception('get user like error')
        return requestutils.get_internal_error_response()


def add_user_like(request):
    try:
        post_data = add_or_remove_user_like_schema(json.loads(request.body))
        user_id = get_login_user_id(request)
        news_id = post_data.get('news_id')
        news_type = post_data.get('type')

        if user_id is None:
            return requestutils.get_internal_error_response()

        # 验证新闻, 必须是审核通过的才可以点赞
        news_info = get_news_info(news_id, user_id)
        if news_info['news_status']['valid_id'] != NewsStatus.SUCCESS:
            return requestutils.get_internal_error_response()

        user_like = mysql_client.retrieve_object_by_unique_key(UserLike, user_id=user_id, news_id=news_id)
        if user_like is None:
            mysql_client.create_object(obj=UserLike(user_id=user_id, news_id=news_id, type=news_type))
            count = update_news_like_count(news_id, increase=True)
            redis_client.clear_object_cache('U_like_N_%s' % user_id)
            redis_client.update_author_likes_count(news_info['author']['id'], increase=True)
            sender.send_like_event(user_id, news_id)
            first_like = True
        else:
            mysql_client.update_object(UserLike, user_like.id, contain_updated_time=False, created_time=datetime.now())
            first_like = False
            count = 0
        get_user_likes_news_ids.clear(user_id)

        # 如果这个用户是真实用户, 做以下操作
        if news_info['author']['user_type'] == UserTypeMapping.REAL_USER:
            _get_received_like.clear(news_info['author']['id'], news_info['author']['user_id'])
            redis_client.update_user_last_browser_time(news_info['author']['user_id'], is_like=True)
            redis_client.cache_be_like_real_media_id(news_info['author']['id'])

            # 如果是点赞达到20或50, 加入 优质内容待审核队列. 目前写死
            if first_like and (20 == count or 50 == count):
                redis_client.add_news_award_queue(news_id)

        return requestutils.get_success_response({}, cls=DjangoJSONEncoder)
    except:
        logger.exception('add user like error.')
        return requestutils.get_internal_error_response()


def remove_user_like(request):
    try:
        post_data = add_or_remove_user_like_schema(json.loads(request.body))
        user_id = get_login_user_id(request)

        if user_id is None:
            return requestutils.get_internal_error_response()

        news_id = post_data.get('news_id')
        del_success = mysql_client.delete_object_by_unique_key(UserLike, user_id=user_id, news_id=news_id)
        if del_success:
            update_news_like_count(news_id, increase=False)
        redis_client.clear_object_cache('U_like_N_%s' % user_id)
        news_info = get_news_info(news_id, user_id)
        redis_client.update_author_likes_count(news_info.get('author').get('id'), increase=False)
        return requestutils.get_success_response({}, cls=DjangoJSONEncoder)
    except:
        logger.exception('remove user like error.')
        return requestutils.get_internal_error_response()


@gzip_page
def get_selected_interests(request):
    try:
        gender = request.GET.get('gender')
        ret = _get_selected_interests(gender)
        return requestutils.get_success_response(ret, cls=DjangoJSONEncoder)
    except:
        logger.exception('get selected interests error')
        return requestutils.get_internal_error_response()


def add_user_selected_interests(request):
    try:
        post_data = add_selected_interest_schema(json.loads(request.body))
        user_id = get_user_id_from_request_header(request.META)
        if user_id is None:
            user_id = post_data.get('user_id', '')
        selected_interest_ids = post_data.get('selected_interest_ids')
        category_ids = []
        for interest_id in selected_interest_ids:
            category_ids += get_interests_category(interest_id)
        sender.send_select_interests_event(user_id, category_ids)
        if len(user_id) > 0:
            mysql_client.clear_user_selected_interests(user_id)
            for interest_id in selected_interest_ids:
                obj = UserFavoriteSelectedInterest(user_id=user_id, selected_interest_id=interest_id)
                mysql_client.create_object(obj)
        return requestutils.get_success_response({}, cls=DjangoJSONEncoder)
    except:
        logger.exception('add user selected interest error.')
        return requestutils.get_internal_error_response()


def get_my_like(request):
    try:
        user_id = get_user_id_from_request_header(request.META)
        page_id = get_id_from_request(request, 'page_id')
        headers = parse_headers(request)
        res = []
        news_ids = get_user_likes_news_ids(user_id)[page_id * 10: (page_id + 1) * 10]
        play_video_directly = play_video_directly_exp(user_id)
        for news_id in news_ids:
            try:
                data = get_news_info(news_id, user_id, play_video_directly=play_video_directly)
                res.append(data)
            except:
                logger.info('news({}) not found'.format(news_id))
        res = filter_news_feeds(res)
        # send log for statistics
        impression_id = str(uuid.uuid4())
        send_news_impression(user_id, impression_id, page_id,
                             wrapper_news_ids(news_ids, FeedItem(0, 'user_like', 'default', 'default')),
                             from_page='content_like_recommend',
                             package_id=headers.get_package_id())
        extra_param = {'impression_id': impression_id}
        if len(news_ids) > 0:
            extra_param['next_page_id'] = str(page_id + 1)
        return requestutils.get_success_response(res, cls=DjangoJSONEncoder, extra_param=extra_param)
    except:
        logger.exception('get user like error')
        return requestutils.get_internal_error_response()


@auth(facebook_login=True, must_use_encryption=False)
def get_received_like(request):
    """
    version: 3.0.4.3
    """
    user_id = request.user_id
    try:
        query_data = parse_get_schema(request, get_received_like_schema)
        page_id = query_data['page_id']
        count = query_data['count']
        user_info = get_user_info(user_id)
        received_like = get_pageable_received_like(user_info['id'], user_id, page_id, count)

        ret = []
        for be_liked_data in received_like:
            try:
                like_info = _get_received_like_info(be_liked_data, user_id)
                if like_info['valid'] == 1:
                    ret.append(like_info)
            except:
                logger.exception(f'_get_received_like_info error, data {be_liked_data}.')
        extra_param = {'impression_id': str(uuid.uuid4())}
        if len(get_pageable_received_like(user_info['id'], user_id, page_id + 1, count)) > 0:
            extra_param['next_page_id'] = str(page_id + 1)
        return requestutils.get_success_response(data=ret, extra_param=extra_param)
    except:
        logger.exception('Error occurred in favorite.views.get_received_like')
        return requestutils.get_internal_error_response()


@gzip_page
@require_GET
def get_favorite_deals(request):
    user_id = None
    try:
        headers_data = parse_headers(request)
        user_id = headers_data.get_login_user_id()
        query_data = parse_get_schema(request, get_favorite_deals_schema)
        page_id = query_data['page_id']
        count = query_data['count']
        total_deal_ids = get_user_fav_deals(user_id)
        page_deal_ids = total_deal_ids[(count * page_id):(page_id + 1) * count]
        deal_info_list = []
        for deal_id in page_deal_ids:
            try:
                deal_info = get_deal_info(deal_id)
                if deal_info["deal_show_on_feed"]:
                    deal_info_list.append(deal_info)
            except:
                logger.exception(f"favorite.views.get_favorite_deals#get_deal_info error, deal_id {deal_id}")
        ret = {
            "deal_info_list": deal_info_list,
        }
        if query_data["carry_favorites"]:
            ret["favorite_ids"] = total_deal_ids
        extra_param = {'impression_id': str(uuid.uuid4())}
        if len(total_deal_ids[(count * (page_id + 1)):(page_id + 2) * count]) > 0:
            extra_param['next_page_id'] = str(page_id + 1)
        return requestutils.get_success_response(ret, cls=DjangoJSONEncoder, extra_param=extra_param)
    except:
        logger.exception(f"Error occurred in deals.views.get_topic_deals_feed_v2; user_id {user_id}")
        return requestutils.get_internal_error_response()


####################################
# The functions followed are utils.#
####################################
def _get_received_like_info(be_liked_data, user_id):
    ret = {}
    liked_type = be_liked_data['liked_type']
    ret['liked_type'] = liked_type
    ret['thumb_up_user'] = get_tiny_user_info(be_liked_data['thumb_up_user_id'])
    ret['thumb_up_time'] = be_liked_data['created_time']
    if liked_type == LikedTypeMapping.NEWS:
        news_id = be_liked_data['news_id']
        ret[liked_type] = get_news_info(news_id, user_id, with_tiny_article=False, play_video_directly=True)
        if ret[liked_type]['valid_id'] == NewsStatus.SUCCESS and ret[liked_type]['author']['show_on_feed'] == 1:
            ret['valid'] = 1
        else:
            ret['valid'] = 0
    elif liked_type == LikedTypeMapping.COMMENT:
        comment_id = be_liked_data['comment_id']
        ret[liked_type] = _get_comment_info(comment_id, user_id, with_tiny_article=True, with_sub_comments=False)
        if ret[liked_type]['tiny_article']['valid_id'] == NewsStatus.SUCCESS and \
                get_news_info(ret[liked_type]['tiny_article']['id'], user_id)['author']['show_on_feed'] == 1:
            ret['valid'] = 1
        else:
            ret['valid'] = 0
    else:
        raise
    return ret
