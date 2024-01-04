from comments.models import CommentLikes
from common import loggers
from common.constants import NEWS_TYPE_MAPPING, RedisKeyPrefix
from common.mysqlclient import mysql_client
from common.redisclient import cache
from common.sql_models import UserFavoriteDeals, InterestNewsCategoryMapping, UserFavoriteSelectedInterest
from common.utils import to_dict_fav
from favorite.constants import LikedTypeMapping
from favorite.sql_model import UserFlashRemind, UserInterests, Interests, SelectedInterests, UserLike
from news.constants import NewsStatus
from news.models import News

logger = loggers.get_logger(__name__)


def batch_check_fav_status(user_id, deals, fav_type='deal'):
    if fav_type == 'deal':
        raise NotImplementedError()
    else:
        fav_video_ids = get_user_fav_videos(user_id)
        for deal in deals:
            deal['favorite_status'] = deal['id'] in fav_video_ids
        return deals


def check_user_favorite_status(user_id, deal_id, fav_type='deal'):
    # noinspection PyBroadException
    try:
        if fav_type == 'deal':
            deal_ids = get_user_fav_deals(user_id)
        else:
            deal_ids = get_user_fav_videos(user_id)
        return int(deal_id) in deal_ids
    except:
        logger.exception('check user_fav status error')
        return False


USER_FAV_CACHE_PATTERN = 'user_fav_d_%s'


@cache(key=lambda user_id: USER_FAV_CACHE_PATTERN % user_id, ex=5 * 60, cache_on_memory=1)
def get_user_fav_deals(user_id):
    deals = mysql_client.retrieve_objects_by_conditions(UserFavoriteDeals, UserFavoriteDeals.user_id == user_id)
    deals = sorted(deals, key=lambda obj: obj.created_time, reverse=True)
    return [int(deal.deal_id) for deal in deals]


USER_FAV_VIDEO_CACHE_PATTERN = 'user_fav_v_%s'


@cache(key=lambda user_id: USER_FAV_VIDEO_CACHE_PATTERN % user_id, ex=5 * 60, cache_on_memory=1)
def get_user_fav_videos(user_id):
    videos = mysql_client.retrieve_objects_by_conditions(UserLike, UserLike.user_id == user_id,
                                                         UserLike.type == NEWS_TYPE_MAPPING.get('video'))
    videos = sorted(videos, key=lambda obj: obj.created_time, reverse=True)
    return [int(video.news_id) for video in videos]


def check_user_flashremind_status(user_id, deal_id):
    # noinspection PyBroadException
    try:
        deal_ids = get_user_reminders(user_id)
        return int(deal_id) in deal_ids
    except:
        logger.exception('check user_fav status error')
        return False


@cache(key=lambda user_id: 'user_reminds_%s' % user_id, ex=5 * 60)
def get_user_reminders(user_id):
    deals = mysql_client.retrieve_objects_by_conditions(UserFlashRemind, UserFlashRemind.user_id == user_id)
    return [int(deal.deal_id) for deal in deals]


@cache(key='common_interests', ex=10 * 60)
def get_common_interests():
    return [to_dict_fav(data) for data in mysql_client.retrieve_all_objects(Interests)]


@cache(key=lambda user_id: 'U_interests_%s' % user_id, ex=10 * 60)
def get_user_interests(user_id):
    user_data = mysql_client.retrieve_objects_by_conditions(UserInterests, UserInterests.user_id == user_id)
    return [to_dict_fav(data) for data in user_data]


@cache(lambda gender: 'selected_interests_%s' % gender, ex=10 * 60, cache_on_memory=10)
def _get_selected_interests(gender):
    interests = mysql_client.retrieve_objects_by_conditions(SelectedInterests,
                                                            SelectedInterests.gender == gender,
                                                            SelectedInterests.status == 1)
    interests = sorted(interests, key=lambda obj: int(obj.order))
    return [to_dict_fav(data) for data in interests]


@cache(lambda user_id: 'selected_interests_cat_%s' % user_id, ex=30 * 60)
def get_selected_categories(user_id):
    favs = mysql_client.retrieve_objects_by_conditions(UserFavoriteSelectedInterest,
                                                       UserFavoriteSelectedInterest.user_id == user_id)
    categories = []
    for fav in favs:
        categories += get_interests_category(fav.selected_interest_id)
    return categories


@cache(lambda user_id: 'U_like_N_%s' % user_id, ex=10 * 60, cache_on_memory=3)
def get_user_likes_news_ids(user_id):
    user_likes = mysql_client.retrieve_objects_by_conditions(UserLike, UserLike.user_id == user_id)
    user_likes = sorted(user_likes, key=lambda obj: obj.created_time, reverse=True)
    news_ids = [user_like.news_id for user_like in user_likes]
    valid_news = mysql_client.retrieve_objects_by_conditions(News, News.news_id.in_(news_ids),
                                                             News.valid == NewsStatus.SUCCESS)
    valid_news_id = {news.news_id for news in valid_news}
    return [instance.news_id for instance in user_likes if instance.news_id in valid_news_id]


@cache(lambda interest_id: 'INTEREST_CAT_%s' % interest_id, ex=3 * 60 * 60, cache_on_memory=15)
def get_interests_category(interest_id):
    category_mappings = mysql_client.retrieve_objects_by_conditions(
        InterestNewsCategoryMapping, InterestNewsCategoryMapping.interest_id == interest_id)
    return list(set([category.news_category_id for category in category_mappings]))


@cache(key=lambda media_id, user_id: f'Be_Like_U_v2_{media_id}_{user_id}', ex=20 * 60, cache_on_memory=10,
       prefix=RedisKeyPrefix.FAVORITE)
def _get_received_like(media_id, user_id):
    news_list = mysql_client.retrieve_objects_by_conditions(News, News.valid == 1, News.media_id == media_id)
    news_ids = {news.news_id for news in news_list}
    be_liked_list: list = mysql_client.retrieve_objects_by_conditions(UserLike,
                                                                      UserLike.news_id.in_(news_ids))

    comment_list = mysql_client.retrieve_objects_by_conditions(CommentLikes, CommentLikes.comment_owner == user_id,
                                                               CommentLikes.login_status == 1)
    be_liked_list.extend(comment_list)
    be_liked_list = sorted(be_liked_list, key=lambda obj: obj.created_time, reverse=True)

    ret = []
    for liked_obj in be_liked_list:

        if isinstance(liked_obj, UserLike):
            ret.append({'liked_type': LikedTypeMapping.NEWS,
                        'news_id': liked_obj.news_id,
                        'thumb_up_user_id': liked_obj.user_id,
                        'created_time': int(liked_obj.created_time.timestamp() * 1000)})
        elif isinstance(liked_obj, CommentLikes):
            ret.append({'liked_type': LikedTypeMapping.COMMENT,
                        'comment_id': liked_obj.comment_id,
                        'thumb_up_user_id': liked_obj.user_id,
                        'created_time': int(liked_obj.created_time.timestamp() * 1000)})
        else:
            logger.info(f'Error occurred in favorite.utils._get_received_like, UserLike or CommentLikes required but '
                        f'{type(liked_obj)} provide.')

    return ret


def get_pageable_received_like(media_id: int, user_id: str, page_id: int, count: int):
    be_like_list = _get_received_like(media_id, user_id)
    return be_like_list[page_id * count: (page_id + 1) * count]
