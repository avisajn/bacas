from common import loggers
from common.mysqlclient import mysql_client
from common.redisclient import cache, redis_client
from deals.utils import get_deal_detail_by_deal_id
from favorite.utils import batch_check_fav_status
from news.utils import get_news_detail_by_id
from video.models import VideoDeals
from video.videoclient import video_client

logger = loggers.get_logger(__name__)


@cache(key='D_VIDEO_FEEDS', ex=15 * 60)
def get_default_video_feeds(user_id=None):
    videos = mysql_client.retrieve_objects_by_conditions(VideoDeals, limit=30)
    video_ids = set([video.video_id for video in videos])
    res = [video_client.get_video_detail(user_id, video_id, raise_exception=False) for video_id in video_ids]
    return [video for video in res if video is not None]


def _get_video_feeds(user_id, count, page_id=None):
    res = video_client.get_videos(user_id, count)
    if page_id == 0 and (res is None or len(res) == 0):
        res = get_default_video_feeds(user_id)[:count]
    res = batch_check_fav_status(user_id, res, fav_type='video')
    return res


@cache(lambda video_id: 'video_relative_%s' % video_id, ex=10 * 60)
def _get_video_relative_deals(video_id):
    video_deals = mysql_client.retrieve_objects_by_conditions(VideoDeals, VideoDeals.video_id == video_id)
    return [video_deal.deal_id for video_deal in video_deals]


def _get_video_relative_deals_detail(video_id, user_id):
    res = []
    deals = _get_video_relative_deals(video_id)
    if deals is None:
        deals = []
    if len(deals) > 0:
        redis_client.set_impressed_feeds(user_id, deals)
    for data in deals:
        deal_dict = get_deal_detail_by_deal_id(data, user_id=user_id, force_skip_out=True)
        res.append(deal_dict)
    return res


def get_video_detail_from_news(news_id, user_id):
    news_data = get_news_detail_by_id(news_id, user_id)
    return {
        'id': news_data['news']['news_id'],
        'title': news_data['news']['title'],
        'image': news_data['news_thumb_image'],
        'url': news_data['news']['url'].strip(),
        'duration': news_data['news']['duration'],
        'favorite_status': news_data['like_status'],
        'likes_count': news_data['news']['likes_count'],
        'valid': news_data['news']['valid'],
        'media_id': news_data['news']['media_id'],
        'author': news_data['author']
    }


def get_video_feeds_by_app_version(app_version, gender=None):
    if app_version >= 2058:
        video_feeds = redis_client.get_normal_video_feeds(gender)
    else:
        video_feeds = redis_client.get_youtube_video_feeds(gender)
    return video_feeds


def get_video_news_feeds(user_id, page_id, count, app_version):
    if user_id is None:
        video_feeds = get_video_feeds_by_app_version(app_version)
    else:
        video_feeds = redis_client.get_user_video_feeds(user_id)
        if len(video_feeds) == 0:
            video_feeds = get_video_feeds_by_app_version(app_version)
    if (page_id == 0) and (user_id is not None):
        clicked_ids = redis_client.get_user_impression_video_ids(user_id)
        video_feeds = get_video_feeds_by_app_version(app_version)
        video_feeds = [video_id for video_id in video_feeds if video_id not in clicked_ids] + list(clicked_ids)
        redis_client.cache_user_video_feeds(user_id, video_feeds)
    ret = video_feeds[page_id * count: (page_id + 1) * count]
    redis_client.set_user_impression_video_ids(user_id=user_id, feeds=ret)
    return ret


def filter_invalid_video(feed_data, invalid_media_ids=None):
    if invalid_media_ids is None:
        invalid_media_ids = set()
    ret = []
    for data in feed_data:
        if data['valid'] == 1 and data['author']['show_on_feed'] >= 1 and data['author']['id'] not in invalid_media_ids:
            ret.append(data)
    return ret
