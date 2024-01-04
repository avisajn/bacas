import json
import os
import uuid

from django.core.serializers.json import DjangoJSONEncoder
from django.shortcuts import render
from django.views.decorators.gzip import gzip_page
from django.views.decorators.http import require_GET

from common import requestutils, recommend, loggers
from common.mysqlclient import mysql_client
from common.recommend_logger import deal_logger, concat_bucket_name
from common.redisclient import redis_client, cache
from common.requestutils import parse_headers, parse_get_schema
from common.utils import get_login_user_id, get_app_version_from_header, get_user_id_from_request_header, auth
from deals import utils
from deals.forms import flash_deal_schema, get_topic_deals_feed_schema, get_channel_feeds_v2_schema, \
    get_recommendation_feeds_v2_schema, get_relative_deals_schema, get_flash_deals_schema, \
    get_user_browsing_history_v2_schema, get_user_offer_records_schema
from deals.models import AdDeal
from deals.utils import get_deal_detail_by_deal_id, _get_top_sellers, filter_deals_by_app_version, \
    filter_by_blacklist, get_topic_deal_ids, filter_deals_negative, get_deal_info, get_pageable_channel_feeds, \
    get_offer_income, get_pageable_cps_order_ids, get_cps_order_info, get_pageable_recommend_feeds, \
    get_flash_deal_feeds, get_pageable_relative_deals, generate_offer_share_link
from users.views import users, get_user_gender
from video.utils import _get_video_feeds
from .forms import deal_schema, deal_article_schema, channel_deal_schema, share_deal_schema, advertisement_data_schema

logger = loggers.get_logger(__name__)


@cache(key='channels', ex=5 * 60)
def _get_channels():
    channels = mysql_client.retrieve_channels()
    return [channel.to_dict() for channel in channels]


@gzip_page
@require_GET
def get_channels(request):
    """获取频道列表"""
    try:
        channels = _get_channels()
        channel_map = {
            'Male': [channel for channel in channels if channel['title'] in ["Pakaian Pria", "Makanan"]],
            'Female': [channel for channel in channels if channel['title'] in ["Pakaian Wanita", "Makanan"]],
        }
        user_id = get_login_user_id(request)
        user_channel = []
        try:
            gender = 'Male'
            if user_id is not None:
                user = users.get_user_by_id(user_id)
                if user is not None:
                    gender = str(user.gender)
            user_channel = channel_map.get(gender, [])
        except:
            logger.exception("get channels to user error %s" % user_id)
        if user_channel is None or len(user_channel) == 0:
            user_channel = channel_map['Male']
        redis_client.set_launch_history(user_id)
        return requestutils.get_success_response(user_channel)
    except:
        logger.exception('Error occurred in deals.views.get_channels.')
        return requestutils.get_internal_error_response()


@gzip_page
def get_relative_recommendation(request):
    """相关推荐"""
    try:
        res = []
        post_flash_deal = deal_schema(json.loads(request.body))
        count = post_flash_deal.get('count')
        channel = post_flash_deal.get('channel', 'no_channel')
        app_version = get_app_version_from_header(request.META)
        user_id = get_user_id_from_request_header(request.META)
        if user_id is None:
            user_id = post_flash_deal.get('user_id', '')
        deals = recommend.get_relative_feeds(post_flash_deal.get('deal_id'), count=count)
        if deals is None:
            deals = []
        for data in deals:
            deal_dict = get_deal_detail_by_deal_id(data, user_id=user_id)
            res.append(deal_dict)
        res = filter_deals_by_app_version(res, app_version)
        res = filter_by_blacklist(res)
        impression_id = str(uuid.uuid4())
        deal_logger.set_impression(impression_id, user_id, deals, concat_bucket_name(user_id), channel=channel)
        return requestutils.get_success_response(res, cls=DjangoJSONEncoder,
                                                 extra_param={'impression_id': impression_id})
    except Exception as e:
        logger.exception('get_relative_recommendation error')
        return requestutils.get_internal_error_response(str(e))


@gzip_page
def get_cheapest_feeds(request):
    """首页低价频道的八个item"""
    res = []
    try:
        post_flash_deal = deal_schema(json.loads(request.body))
        count = post_flash_deal.get('count')
        page_id = post_flash_deal.get('page_id')
        channel = post_flash_deal.get('channel', 'no_channel')
        app_version = get_app_version_from_header(request.META)
        user_id = get_user_id_from_request_header(request.META)
        if user_id is None:
            user_id = post_flash_deal.get('user_id', '')
        deals = recommend.get_cheapest_feeds(page_id, count * 3, user_id)
        if deals is None:
            deals = []
        for data in deals:
            deal_dict = get_deal_detail_by_deal_id(data, user_id=post_flash_deal.get('user_id', ''))
            res.append(deal_dict)
        res = filter_by_blacklist(res)
        res = filter_deals_negative(res)
        res = filter_deals_by_app_version(res, app_version)[:count]
        impression_id = str(uuid.uuid4())
        deal_logger.set_impression(impression_id, user_id, deals, concat_bucket_name(user_id), channel=channel)
        return requestutils.get_success_response(res, cls=DjangoJSONEncoder,
                                                 extra_param={'impression_id': impression_id})
    except:
        logger.exception('get_cheapest_feeds error')
        return requestutils.get_internal_error_response()


@gzip_page
def get_channel_feeds(request):
    """点击某个频道后的feed流"""
    res = []
    try:
        post_flash_deal = channel_deal_schema(json.loads(request.body))
        count = post_flash_deal.get('count')
        page_id = post_flash_deal.get('page_id')
        channel_id = post_flash_deal.get('channel_id')
        channel = post_flash_deal.get('channel', 'no_channel')
        app_version = get_app_version_from_header(request.META)
        user_id = get_user_id_from_request_header(request.META)
        if user_id is None:
            user_id = post_flash_deal.get('user_id', '')
        if channel_id == -2:
            res = []
            deals = [obj['deal']['deal_id'] for obj in res]
            impression_id = str(uuid.uuid4())
            deal_logger.set_impression(impression_id, user_id, deals, concat_bucket_name(user_id), channel=channel)
            return requestutils.get_success_response(res, cls=DjangoJSONEncoder,
                                                     extra_param={'impression_id': impression_id})
        # video
        elif channel_id == -1:
            res = _get_video_feeds(user_id, count, page_id)
            res = filter_deals_by_app_version(res, app_version)
            res = filter_by_blacklist(res)
            res = filter_deals_negative(res)
            return requestutils.get_success_response(res, cls=DjangoJSONEncoder,
                                                     extra_param={'impression_id': uuid.uuid4()})
        # custom channels and default channels
        else:
            if channel_id in {1, 2, 3, 4}:
                deals = recommend.get_channel_feeds(channel_id, user_id, count)
            else:
                deals = recommend.get_custom_channel_feeds(channel_id, user_id, page_id, count)
            if deals is None:
                deals = []
            for data in deals:
                deal_dict = get_deal_detail_by_deal_id(data, user_id=post_flash_deal.get('user_id', ''))
                res.append(deal_dict)
            res = filter_deals_by_app_version(res, app_version)
            res = filter_by_blacklist(res)
            res = filter_deals_negative(res)
            impression_id = str(uuid.uuid4())
            deal_logger.set_impression(impression_id, user_id, deals, concat_bucket_name(user_id), channel=channel)
            return requestutils.get_success_response(res, cls=DjangoJSONEncoder,
                                                     extra_param={'impression_id': impression_id})
    except:
        logger.exception('get_channel_feeds error')
        return requestutils.get_internal_error_response()


@gzip_page
def get_recommendation_feeds(request):
    """主页feed流"""
    res = []
    try:
        post_flash_deal = deal_schema(json.loads(request.body))
        count = post_flash_deal.get('count')
        page_id = post_flash_deal.get('page_id')
        channel = post_flash_deal.get('channel', 'no_channel')
        app_version = get_app_version_from_header(request.META)
        user_id = get_user_id_from_request_header(request.META)
        if user_id is None:
            user_id = post_flash_deal.get('user_id', '')
        deals = recommend.get_recommend_feeds(user_id, count, with_impression=(page_id == 0))
        if deals is None:
            deals = []
        for index, data in enumerate(deals):
            deal_dict = get_deal_detail_by_deal_id(data, user_id=post_flash_deal.get('user_id', ''))
            res.append(deal_dict)
        res = filter_by_blacklist(res)
        res = filter_deals_by_app_version(res, app_version)
        res = filter_deals_negative(res)
        if page_id == 0 and len(res) >= 3:
            try:
                ad_data = redis_client.get_advertisement_data()
                if ad_data is not None:
                    ad_data = advertisement_data_schema(ad_data)
                    res[2]['ad'] = AdDeal(**ad_data).to_dict()
            except:
                pass
            # clickserver.record_impression()
        impression_id = str(uuid.uuid4())
        deal_logger.set_impression(impression_id, user_id, deals, concat_bucket_name(user_id), channel=channel)
        return requestutils.get_success_response(res, cls=DjangoJSONEncoder,
                                                 extra_param={'impression_id': impression_id})
    except:
        logger.exception('get_recommendation_feeds error')
        return requestutils.get_internal_error_response()


@gzip_page
def get_search_recommendation(request):
    """搜索结果页面的feed流"""
    res = []
    try:
        post_flash_deal = deal_schema(json.loads(request.body))
        user_id = post_flash_deal.get('user_id')
        count = post_flash_deal.get('count')
        page_id = post_flash_deal.get('page_id')
        channel = post_flash_deal.get('channel', 'no_channel')
        app_version = get_app_version_from_header(request.META)
        deals = recommend.get_recommend_feeds(user_id, count, with_impression=(page_id == 0))
        if deals is None:
            deals = []
        for data in deals:
            deal_dict = get_deal_detail_by_deal_id(data, user_id=post_flash_deal.get('user_id', ''))
            res.append(deal_dict)
        impression_id = str(uuid.uuid4())
        deal_logger.set_impression(impression_id, user_id, deals, concat_bucket_name(user_id), channel=channel)
        res = filter_deals_by_app_version(res, app_version)
        res = filter_by_blacklist(res)
        res = filter_deals_negative(res)
        return requestutils.get_success_response(res, cls=DjangoJSONEncoder,
                                                 extra_param={'impression_id': impression_id})
    except:
        logger.exception('get_search_recommendation error')
        return requestutils.get_internal_error_response()


@gzip_page
def get_deal_detail(request):
    """详情页"""
    try:
        post_flash_deal = deal_article_schema(json.loads(request.body))
        user_id = post_flash_deal.get('user_id', '')
        deal_id = post_flash_deal.get("deal_id")
        gender = get_user_gender(user_id)
        deal_dict = get_deal_detail_by_deal_id(deal_id=deal_id, user_id=user_id)
        redis_client.set_user_browsing_history(user_id=user_id, deal_id=deal_id)
        redis_client.set_click_deal(user_id=user_id, deal_id=deal_id, gender=gender)
        impression_id = post_flash_deal.get('impression_id', '')
        deal_logger.set_click(user_id, deal_id, concat_bucket_name(user_id), channel='unknown', page_id=impression_id)
        return requestutils.get_success_response(deal_dict, cls=DjangoJSONEncoder)
    except:
        logger.exception('get_deal_detail error')
        return requestutils.get_internal_error_response()


def load_deal_details(request):
    try:
        deals = json.loads(request.body.decode('utf-8'))
        for deal_id in deals:
            try:
                get_deal_detail_by_deal_id(deal_id)
            except:
                logger.exception("deal_id %s get detail error" % deal_id)
        return requestutils.get_success_response(data={})
    except:
        logger.exception('load deal detail error')


def flash_deal_top_feeds(request):
    """首页闪购频道8个feed"""
    res = []
    try:
        post_flash_deal = flash_deal_schema(json.loads(request.body))
        channel = post_flash_deal.get('channel', 'no_channel')
        app_version = get_app_version_from_header(request.META)
        count = post_flash_deal.get('count')
        user_id = get_user_id_from_request_header(request.META)
        if user_id is None:
            user_id = post_flash_deal.get('user_id', '')
        deals = recommend.get_flash_feeds(user_id, count * 3)
        if deals is None:
            deals = []
        for data in deals:
            deal_dict = get_deal_detail_by_deal_id(data, user_id=user_id)
            res.append(deal_dict)
        res = filter_by_blacklist(res)
        res = filter_deals_negative(res)
        res = filter_deals_by_app_version(res, app_version)[:count]
        impression_id = str(uuid.uuid4())
        deal_logger.set_impression(impression_id, user_id, deals, concat_bucket_name(user_id), channel=channel)
        return requestutils.get_success_response(res, cls=DjangoJSONEncoder,
                                                 extra_param={'impression_id': impression_id})
    except:
        logger.exception('flash_deal_top_feeds error')
        return requestutils.get_internal_error_response()


def flash_deal_detail(request):
    """闪购详情页"""
    # TODO @renning
    pass


@gzip_page
def ongoing_flash_deal_feeds(request):
    """闪购频道feed"""
    try:
        res = []
        post_flash_deal = flash_deal_schema(json.loads(request.body))
        count = post_flash_deal.get('count')
        page_id = post_flash_deal.get('page_id')
        channel = post_flash_deal.get('channel', 'no_channel')
        app_version = get_app_version_from_header(request.META)
        user_id = get_user_id_from_request_header(request.META)
        if user_id is None:
            user_id = post_flash_deal.get('user_id', '')
        deals = recommend.get_ongoing_feeds(page_id, count, user_id)
        if deals is None:
            deals = []
        for data in deals:
            deal_dict = get_deal_detail_by_deal_id(data, user_id=post_flash_deal.get('user_id', ''))
            res.append(deal_dict)
        res = filter_deals_by_app_version(res, app_version)
        res = filter_by_blacklist(res)
        res = filter_deals_negative(res)
        impression_id = str(uuid.uuid4())
        deal_logger.set_impression(impression_id, user_id, deals, concat_bucket_name(user_id), channel=channel)
        return requestutils.get_success_response(res, cls=DjangoJSONEncoder,
                                                 extra_param={'impression_id': impression_id})
    except:
        logger.exception('ongoing_flash_deal_feeds error')
        return requestutils.get_internal_error_response()


@gzip_page
def comming_flash_deal_feeds(request):
    """闪购频道feed"""
    try:
        res = []
        post_flash_deal = flash_deal_schema(json.loads(request.body))
        count = post_flash_deal.get('count')
        page_id = post_flash_deal.get('page_id')
        channel = post_flash_deal.get('channel', 'no_channel')
        app_version = get_app_version_from_header(request.META)
        user_id = get_user_id_from_request_header(request.META)
        if user_id is None:
            user_id = post_flash_deal.get('user_id', '')
        deals = recommend.get_coming_feeds(page_id, count, user_id)
        if deals is None:
            deals = []
        for data in deals:
            deal_dict = get_deal_detail_by_deal_id(data, user_id=user_id)
            res.append(deal_dict)
        res = filter_deals_by_app_version(res, app_version)
        res = filter_by_blacklist(res)
        res = filter_deals_negative(res)
        impression_id = str(uuid.uuid4())
        deal_logger.set_impression(impression_id, user_id, deals, concat_bucket_name(user_id), channel=channel)
        return requestutils.get_success_response(res, cls=DjangoJSONEncoder,
                                                 extra_param={'impression_id': impression_id})
    except:
        logger.exception('comming_flash_deal_feeds error')
        return requestutils.get_internal_error_response()


def set_user_browsing_history(request):
    post_data = deal_article_schema(json.loads(request.body))
    redis_client.set_user_browsing_history(post_data.get("user_id"), post_data.get("deal_id"))
    return requestutils.get_success_response({}, cls=DjangoJSONEncoder)


def get_user_browsing_history(request):
    post_data = deal_schema(json.loads(request.body))
    user_id = post_data.get("user_id")
    page_id = post_data.get("page_id")
    count = post_data.get("count")
    channel = post_data.get('channel', 'no_channel')
    deal_ids = redis_client.get_user_browsing_history(user_id, page_id, count)
    res = []
    for deal_id in deal_ids:
        try:
            deal_dict = get_deal_detail_by_deal_id(deal_id, user_id=post_data.get('user_id', ''))
            res.append(deal_dict)
        except:
            logger.exception('deal_id not find %s' % deal_id)
    impression_id = str(uuid.uuid4())
    res = filter_deals_negative(res)
    deal_logger.set_impression(impression_id, user_id, deal_ids, concat_bucket_name(user_id), channel=channel)
    return requestutils.get_success_response(res, cls=DjangoJSONEncoder, extra_param={'impression_id': impression_id})


def webapp_detail(request, deal_id):
    try:
        inviter_id = request.GET.get('inviter_id', '')
        deal_dict = get_deal_detail_by_deal_id(deal_id)
        favorite_status = False
        falshremind_status = False
        deal_dict.setdefault("favorite_status", favorite_status)
        deal_dict.setdefault("falshremind_status", falshremind_status)
        relative_deals = []
        deals = recommend.get_relative_feeds(deal_id, count=8)
        if deals is None:
            deals = []
        for data in deals:
            relative_deal_dict = get_deal_detail_by_deal_id(data)
            relative_deals.append(relative_deal_dict)
        data = {
            'dealDetail': deal_dict,
            'relativeDeals': relative_deals,
            'to_datetime': utils.to_datetime,
            'inviter_id': inviter_id
        }
        return render(request, 'deals/detail.html', data)
    except:
        logger.exception('webapp detail error')
    return render(request, 'base/404.html', {})


def read_file(filename):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(base_dir, filename), 'rb') as f:
        return f.read()


deal_image = read_file('static/default_deal_image.png')


@gzip_page
def default_deal_image(request):
    return requestutils.get_image_response(deal_image)


def get_top_seller(request):
    user_id = request.GET.get('user_id', '')
    user_gender = request.GET.get('gender', '')
    channel = request.GET.get('channel', 'no_channel')
    try:
        if user_gender == '':
            gender = get_user_gender(user_id)
            if gender is None:
                gender = 'Male'
        else:
            gender = user_gender
        seller_ids = _get_top_sellers('app', gender)
        ret = []
        for deal_id in seller_ids:
            deal = get_deal_detail_by_deal_id(deal_id)
            ret.append(deal)
        impression_id = str(uuid.uuid4())
        deal_logger.set_impression(impression_id, user_id, seller_ids, concat_bucket_name(user_id), channel=channel)
        return requestutils.get_success_response(ret, cls=DjangoJSONEncoder,
                                                 extra_param={'impression_id': impression_id})
    except:
        logger.exception('get top sells error')
        return requestutils.get_internal_error_response()


def get_webapp_top_seller(request):
    user_id = request.GET.get('user_id', '')
    user_gender = request.GET.get('gender', '')
    channel = request.GET.get('channel', 'no_channel')
    try:
        if user_gender == '':
            gender = get_user_gender(user_id)
            if gender is None:
                gender = 'Male'
        else:
            gender = user_gender
        seller_ids = _get_top_sellers('web', gender)
        ret = []
        for deal_id in seller_ids:
            deal = get_deal_detail_by_deal_id(deal_id)
            ret.append(deal)
        impression_id = str(uuid.uuid4())
        deal_logger.set_impression(impression_id, user_id, seller_ids, concat_bucket_name(user_id), channel=channel)
        return requestutils.get_success_response(ret, cls=DjangoJSONEncoder,
                                                 extra_param={'impression_id': impression_id})
    except:
        logger.exception('get top sells error')
        return requestutils.get_internal_error_response()


@gzip_page
def share_deal_top_feeds(request):
    try:
        post_flash_deal = share_deal_schema(json.loads(request.body))
        count = post_flash_deal.get('count')
        page_id = post_flash_deal.get('page_id')
        channel = post_flash_deal.get('channel', 'no_channel')
        app_version = get_app_version_from_header(request.META)
        user_id = get_user_id_from_request_header(request.META)
        if user_id is None:
            user_id = post_flash_deal.get('user_id', '')
        deals = []
        res = []
        for data in deals:
            deal_dict = get_deal_detail_by_deal_id(data, user_id=user_id)
            res.append(deal_dict)
        res = filter_by_blacklist(res)
        res = filter_deals_by_app_version(res, app_version)[:count]
        impression_id = str(uuid.uuid4())
        deal_logger.set_impression(impression_id, user_id, deals, concat_bucket_name(user_id), channel=channel)
        return requestutils.get_success_response(res, cls=DjangoJSONEncoder,
                                                 extra_param={'impression_id': impression_id})
    except:
        logger.exception('share deal top feeds error')
        return requestutils.get_internal_error_response()


def get_share_links(request):
    user_id = request.GET.get('user_id', '')
    try:
        h5_link = redis_client.get_share_links('h5Link')
        video_link = redis_client.get_share_links('videoLink')
        news_link = redis_client.get_share_links('newsLink')
        if h5_link is None:
            h5_link = 'http://flashgo.online/webapp/deals/'
        if video_link is None:
            video_link = 'http://flashgo.online/webapp/videodetail/'
        if news_link is None:
            news_link = 'http://flashgo.online/webapp/newsdetail/'
        data = {
            'h5Link': h5_link,
            'videoLink': video_link,
            'newsLink': news_link
        }
        return requestutils.get_success_response(data=data, cls=DjangoJSONEncoder)
    except:
        return requestutils.get_internal_error_response()


@gzip_page
def get_topic_deals_feed(request, topic_id):
    """
    version: 3.0.3.3
    """
    try:
        headers_data = parse_headers(request)
        user_id = headers_data.get_user_id()
        query_data = parse_get_schema(request, get_topic_deals_feed_schema)

        page_id = query_data['page_id']
        count = query_data['count']
        deal_ids = get_topic_deal_ids(topic_id, user_id, page_id, count)

        ret = []
        for deal_id in deal_ids:
            try:
                ret.append(get_deal_detail_by_deal_id(deal_id, user_id=user_id))
            except:
                logger.exception('get deal detail error, {}'.format(deal_id))

        ret = filter_deals_negative(ret)
        extra_param = {'impression_id': str(uuid.uuid4())}
        if len(deal_ids) > 0:
            extra_param['next_page_id'] = str(page_id + 1)
        return requestutils.get_success_response(data=ret, extra_param=extra_param)
    except:
        logger.exception('Error occurred in get_topic_deals_feed, topic_id {}.'.format(topic_id))
        return requestutils.get_internal_error_response()


@require_GET
@gzip_page
def get_deal_detail_v2(request, deal_id):
    user_id = None
    try:
        headers = parse_headers(request)
        user_id = headers.get_login_user_id()
        ret = get_deal_info(deal_id)
        redis_client.set_user_browsing_history(user_id=user_id, deal_id=deal_id)
        redis_client.set_click_deal(user_id=user_id, deal_id=deal_id, gender=get_user_gender(user_id))
        return requestutils.get_success_response(data=ret)
    except:
        logger.exception(f"Error occurred in deals.views.get_deal_detail_v2; deal_id {deal_id}; user_id {user_id}")
        return requestutils.get_internal_error_response()


@require_GET
@gzip_page
def get_channel_feeds_v2(request, channel_id):
    user_id = None
    try:
        channel_id = int(channel_id)
        query_data = parse_get_schema(request, get_channel_feeds_v2_schema)
        count = query_data['count']
        page_id = query_data['page_id']
        headers = parse_headers(request)
        user_id = headers.get_login_user_id()
        deal_ids = get_pageable_channel_feeds(channel_id, page_id, count, user_id)
        ret = []
        for deal_id in deal_ids:
            try:
                deal_info = get_deal_info(deal_id)
                if deal_info["deal_show_on_feed"]:
                    ret.append(deal_info)
            except:
                logger.exception(f"deals.views.get_channel_feeds_v2#get_deal_info error, deal_id {deal_id}")

        extra_param = {"impression_id": str(uuid.uuid4())}
        if len(get_pageable_channel_feeds(channel_id, page_id + 1, count, user_id)) > 0:
            extra_param["next_page_id"] = str(page_id + 1)
        return requestutils.get_success_response(ret, cls=DjangoJSONEncoder, extra_param=extra_param)
    except:
        logger.exception(
            f"Error occurred in deals.views.get_channel_feeds_v2; channel_id {channel_id}; user_id {user_id}")
        return requestutils.get_internal_error_response()


@require_GET
@gzip_page
def get_recommendation_feeds_v2(request):
    user_id = None
    try:
        query_data = parse_get_schema(request, get_recommendation_feeds_v2_schema)
        page_id = query_data["page_id"]
        count = query_data["count"]
        headers_data = parse_headers(request)
        user_id = headers_data.get_login_user_id()
        deal_ids = get_pageable_recommend_feeds(user_id, page_id, count)
        ret = []
        for deal_id in deal_ids:
            try:
                deal_info = get_deal_info(deal_id)
                if deal_info["deal_show_on_feed"]:
                    ret.append(deal_info)
            except:
                logger.exception(f"deals.views.get_recommendation_feeds_v2#get_deal_info error, deal_id {deal_id}")
        extra_param = {"impression_id": str(uuid.uuid4())}
        if len(get_pageable_recommend_feeds(user_id, page_id + 1, count)) > 0:
            extra_param["next_page_id"] = str(page_id + 1)
        return requestutils.get_success_response(ret, cls=DjangoJSONEncoder, extra_param=extra_param)
    except:
        logger.exception(f"Error occurred in deals.views.get_recommendation_feeds_v2; user_id {user_id}")
        return requestutils.get_internal_error_response()


@require_GET
@gzip_page
def get_relative_deals(request, deal_id):
    user_id = None
    try:
        query_data = parse_get_schema(request, get_relative_deals_schema)
        page_id = query_data["page_id"]
        count = query_data["count"]
        headers_data = parse_headers(request)
        user_id = headers_data.get_login_user_id()
        deal_ids = get_pageable_relative_deals(deal_id, page_id, count)
        ret = []
        for deal_id in deal_ids:
            try:
                deal_info = get_deal_info(deal_id)
                if deal_info["deal_show_on_feed"]:
                    ret.append(deal_info)
            except:
                logger.exception(f"deals.views.get_relative_deals#get_deal_info error, deal_id {deal_id}")
        return requestutils.get_success_response(ret, cls=DjangoJSONEncoder,
                                                 extra_param={'impression_id': str(uuid.uuid4())})
    except:
        logger.exception(f"Error occurred in deals.views.get_relative_deals; deal_id {deal_id}; user_id {user_id}")
        return requestutils.get_internal_error_response()


@require_GET
@gzip_page
def get_flash_deals(request):
    user_id = None
    try:
        query_data = parse_get_schema(request, get_flash_deals_schema)
        page_id = query_data["page_id"]
        count = query_data["count"]
        headers_data = parse_headers(request)
        user_id = headers_data.get_login_user_id()
        deal_ids = get_flash_deal_feeds(user_id, page_id, count, query_data["feed_type"])
        ret = []
        for deal_id in deal_ids:
            try:
                deal_info = get_deal_info(deal_id)
                if deal_info["deal_show_on_feed"]:
                    ret.append(deal_info)
            except:
                logger.exception(f"deals.views.get_flash_deals#get_deal_info error, deal_id {deal_id}")

        extra_param = {"impression_id": str(uuid.uuid4())}
        if len(get_flash_deal_feeds(user_id, page_id + 1, count, query_data["feed_type"])) > 0:
            extra_param["next_page_id"] = str(page_id + 1)
        return requestutils.get_success_response(ret, cls=DjangoJSONEncoder, extra_param=extra_param)
    except:
        logger.exception(f"Error occurred in deals.views.get_flash_deals; user_id {user_id}")
        return requestutils.get_internal_error_response()


@require_GET
@gzip_page
def get_user_browsing_history_v2(request):
    user_id = None
    try:
        query_data = parse_get_schema(request, get_user_browsing_history_v2_schema)
        page_id = query_data["page_id"]
        count = query_data["count"]
        headers_data = parse_headers(request)
        user_id = headers_data.get_login_user_id()
        deal_ids = redis_client.get_user_browsing_history(user_id, page_id, count)
        ret = []
        for deal_id in deal_ids:
            try:
                deal_info = get_deal_info(deal_id)
                if deal_info["deal_show_on_feed"]:
                    ret.append(deal_info)
            except:
                logger.exception(f"deals.views.get_user_browsing_history_v2#get_deal_info error, deal_id {deal_id}")
        extra_param = {"impression_id": str(uuid.uuid4())}
        if len(redis_client.get_user_browsing_history(user_id, page_id + 1, count)) > 0:
            extra_param["next_page_id"] = str(page_id + 1)
        return requestutils.get_success_response(ret, cls=DjangoJSONEncoder, extra_param=extra_param)
    except:
        logger.exception(f"Error occurred in deals.views.get_user_browsing_history_v2; user_id {user_id}")
        return requestutils.get_internal_error_response()


@require_GET
@gzip_page
def get_topic_deals_feed_v2(request, topic_id):
    user_id = None
    try:
        headers_data = parse_headers(request)
        user_id = headers_data.get_user_id()
        query_data = parse_get_schema(request, get_topic_deals_feed_schema)
        page_id = query_data['page_id']
        count = query_data['count']
        deal_ids = get_topic_deal_ids(topic_id, user_id, page_id, count)
        ret = []
        for deal_id in deal_ids:
            try:
                deal_info = get_deal_info(deal_id)
                if deal_info["deal_show_on_feed"]:
                    ret.append(deal_info)
            except:
                logger.exception(f"deals.views.get_topic_deals_feed_v2#get_deal_info error, deal_id {deal_id}")

        # 记录用户的展示
        impression_deal_ids = [deal_info["deal_id"] for deal_info in ret]
        if len(impression_deal_ids) > 0:
            redis_client.set_impressed_feeds(user_id, impression_deal_ids, gender=get_user_gender(user_id))

        extra_param = {'impression_id': str(uuid.uuid4())}
        if len(get_topic_deal_ids(topic_id, user_id, page_id + 1, count)) > 0:
            extra_param['next_page_id'] = str(page_id + 1)
        return requestutils.get_success_response(ret, cls=DjangoJSONEncoder, extra_param=extra_param)
    except:
        logger.exception(f"Error occurred in deals.views.get_topic_deals_feed_v2; user_id {user_id}")
        return requestutils.get_internal_error_response()


@gzip_page
@require_GET
@auth(facebook_login=True)
def get_user_offer_income(request):
    user_id = None
    try:
        headers_data = parse_headers(request)
        user_id = headers_data.get_login_user_id()
        income = get_offer_income(user_id)
        return requestutils.get_success_response({"pending": income["pending"]})
    except:
        logger.exception(f'Error occurred in <users.views.get_user_income>, user_id {user_id}')
        return requestutils.get_internal_error_response()


@gzip_page
@require_GET
@auth(facebook_login=True)
def get_offer_share_link(request, deal_id):
    user_id = None
    try:
        headers_data = parse_headers(request)
        user_id = headers_data.get_login_user_id()
        share_link = generate_offer_share_link(user_id, deal_id)
        return requestutils.get_success_response({"offer_share_link": share_link})
    except:
        logger.exception(f'Error occurred in <deals.views.get_offer_share_link>, user_id {user_id}, deal_id {deal_id}')
        return requestutils.get_internal_error_response()


@gzip_page
@require_GET
@auth(facebook_login=True)
def get_user_offer_records(request):
    user_id = None
    try:
        headers_data = parse_headers(request)
        user_id = headers_data.get_login_user_id()
        query_data = parse_get_schema(request, get_user_offer_records_schema)
        page_id = query_data["page_id"]
        count = query_data["count"]
        order_type = query_data["order_type"] if len(query_data["order_type"]) else "all"
        ret = []
        cps_order_ids = get_pageable_cps_order_ids(user_id, order_type, page_id, count)
        for order_id in cps_order_ids:
            try:
                ret.append(get_cps_order_info(order_id))
            except:
                logger.exception(f"deals.views.get_user_offer_records#get_cps_order_info error, order_id {order_id}")
        income = get_offer_income(user_id)
        extra_param = {
            "impression_id": str(uuid.uuid4()),
            "pending_money": income["pending"],
            "successful_money": income["successful"]
        }
        return requestutils.get_success_response(data=ret, extra_param=extra_param)
    except:
        logger.exception(f'Error occurred in <deals.views.get_user_offer_records>, user_id {user_id}')
        return requestutils.get_internal_error_response()
