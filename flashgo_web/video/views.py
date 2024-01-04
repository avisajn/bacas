import uuid

from django.core.serializers.json import DjangoJSONEncoder
from django.shortcuts import render
from django.views.decorators.gzip import gzip_page

from common import requestutils, loggers
from common.recommend_logger import deal_logger, concat_bucket_name
from common.redisclient import redis_client
from common.utils import get_app_version_from_header
from deals.utils import get_deal_detail_by_deal_id
from news.utils import get_news_relative_deal_ids, get_relative_news
from recsys.events import sender
from video import videoclient
from video.utils import _get_video_relative_deals_detail, get_video_news_feeds, filter_invalid_video, \
    get_video_detail_from_news

logger = loggers.get_logger(__name__)


@gzip_page
def get_video_feeds(request):
    """搜索结果页面的feed流"""
    try:
        user_id = request.GET.get('user_id', '')
        count = int(request.GET.get('count', 0))
        page_id = int(request.GET.get('page_id', 0))
        channel = request.GET.get('channel', 'v_no_channel')
        app_version = get_app_version_from_header(request.META)
        res = []
        video_ids = get_video_news_feeds(user_id, page_id, count, app_version)
        for video_id in video_ids:
            try:
                video_item = get_video_detail_from_news(video_id, user_id)
                res.append(video_item)
            except:
                logger.info('video ({}) not found'.format(video_id))
        res = filter_invalid_video(res)
        impression_id = str(uuid.uuid4())
        deal_logger.set_impression(impression_id, user_id, [data['id'] for data in res], concat_bucket_name(user_id),
                                   channel=channel, type='news')
        return requestutils.get_success_response(res, cls=DjangoJSONEncoder,
                                                 extra_param={'show': True, 'impression_id': impression_id})
    except:
        logger.exception('get video feeds exception')
        return requestutils.get_internal_error_response()


@gzip_page
def get_video_detail(request, video_id):
    try:
        user_id = request.GET.get('user_id', '')
        sender.send_click_event(user_id, video_id, request.GET.get('impression_id', ''),
                                request.GET.get('from_page', ''))
        video_item = get_video_detail_from_news(video_id, user_id)
        return requestutils.get_success_response(video_item, cls=DjangoJSONEncoder)
    except:
        logger.exception('get video detail exception')
        return requestutils.get_internal_error_response()


@gzip_page
def get_relative_video_feeds(request, video_id):
    """搜索结果页面的feed流"""
    try:
        user_id = request.GET.get('user_id', '')
        count = int(request.GET.get('count', 0))
        channel = request.GET.get('channel', 'v_no_channel')
        res = []
        video_ids = get_relative_news(video_id, count, only_video=True)
        for video_id in video_ids:
            try:
                data = get_video_detail_from_news(video_id, user_id)
                res.append(data)
            except:
                logger.info('video {} not found'.format(video_id))
        res = filter_invalid_video(res)
        impression_id = str(uuid.uuid4())
        deal_logger.set_impression(impression_id, user_id, video_ids, concat_bucket_name(user_id), channel=channel,
                                   type='news')
        return requestutils.get_success_response(res, cls=DjangoJSONEncoder,
                                                 extra_param={'impression_id': impression_id})
    except:
        logger.exception('get video relative video exception')
        return requestutils.get_internal_error_response()


@gzip_page
def get_video_relative_deals(request, video_id):
    try:
        user_id = request.GET.get('user_id', '')
        channel = request.GET.get('channel', 'no_channel')
        deal_ids = get_news_relative_deal_ids(video_id)
        if deal_ids is None:
            deal_ids = []
        if len(deal_ids) > 0:
            redis_client.set_impressed_feeds(user_id, deal_ids)
        res = []
        for deal_id in deal_ids:
            try:
                deal_dict = get_deal_detail_by_deal_id(deal_id, user_id=user_id, force_skip_out=True)
                res.append(deal_dict)
            except:
                logger.info('deal ({}) not found.'.format(deal_id))
        # 打印埋点日志
        impression_id = str(uuid.uuid4())
        deal_logger.set_impression(impression_id, user_id, deal_ids, concat_bucket_name(user_id), channel=channel)
        return requestutils.get_success_response(res, cls=DjangoJSONEncoder,
                                                 extra_param={'impression_id': impression_id})
    except:
        logger.exception('get video relative video deal exception')
        return requestutils.get_internal_error_response()


@gzip_page
def webapp_detail(request, video_id):
    try:
        inviter_id = request.GET.get('inviter_id', '')
        video_data = videoclient.get_video_detail('test', video_id, with_relative_video=True)
        data = {
            'detail': video_data['detail'],
            'videos': video_data['relative_video'],
            'deals': _get_video_relative_deals_detail(video_id, 'test'),
            'inviter_id': inviter_id
        }
        return render(request, 'video/detail.html', data)
    except:
        logger.exception('webapp detail error')
    return render(request, 'base/404.html', {})
