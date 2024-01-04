import base64
import datetime
import random
import uuid
from typing import List

import requests
from requests import Response

from author.utils import get_author_info, get_following_author_ids, get_user_recommended_authors
from comments.models import Comments
from comments.utils import get_news_comments_count
from common import loggers
from common.constants import NEWS_TYPE_MAPPING, TITLE_NEGATIVE_WORDS_LIST, ShareUrlMapping, NEWS_DEFAULT_THUMB_IMAGE, \
    RedisKeyPrefix, NEGATIVE_WORDS_SET, NewsType
from common.es_client import es_client
from common.exps import get_user_bucket
from common.loggers import DoNothingLogger
from common.memorycache import MemoryCache, UWSGICache
from common.mysqlclient import mysql_client
from common.redisclient import cache, redis_client, SORTED_TOPIC_NEWS_FEED
from common.sql_models import UserFavoriteSelectedInterest, NewsCategoryMapping, CommonNewsCategories, RssMedia, \
    TopicNews, Topics
from common.sqs_client import SQSQueueEntry, sqs_client
from common.utils import UniqueItemList, get_random_ids, check_negative_words_valid, \
    filter_sensitive_words
from common.utils import generate_cdn_url
from deals.utils import get_deal_detail_by_deal_id, get_deal_info
from favorite.sql_model import UserLike
from favorite.utils import get_user_likes_news_ids
from news.constants import FEED_NEWS_VALID_MESSAGE_MAPPING, DETAIL_NEWS_VALID_MESSAGE_MAPPING, \
    REGEX_NEWS_NEGATIVE_WORDS, NewsStatus
from news.constants import RAW_NEWS_NEGATIVE_WORDS
from news.models import News, NewsTags, NewsImages, NewsVideo, Tags, NewsDeals, NewsLikesCount, UGCNewsTags
from recsys.io import rec_redis_client
from recsys.models import ItemProfile, FeedItem, FeedType
from topic.utils import get_topic_data
from users.constants import UserTypeMapping, REAL_USER_SMALLEST_ID
from users.utils import get_user_info

try:
    logger = loggers.get_logger(__name__)
except:
    logger = DoNothingLogger()


@cache(key=lambda news_id, user_id=None: 'N_TMP_CACHE_%s' % news_id, ex=10 * 60)
def _get_news_detail(news_id):
    news = mysql_client.retrieve_objects_by_conditions(News, News.news_id == news_id)[0]
    news_type = news.type
    valid = news.valid
    title = news.title
    images = sorted(mysql_client.retrieve_objects_by_conditions(NewsImages, NewsImages.news_id == news_id),
                    key=lambda obj: int(obj.index))
    if len(images) == 0:
        news_thumb_image = 'https://cdn.flashgo.online/admin/20190619_392cf5d455e14db383f3e45327fe6e7b.png'
        news_thumb_image_width = 1
        news_thumb_image_height = 1
    else:
        news_thumb_image = 'https://cdn.flashgo.online/news-images/thumbs/refine/{}.jpg'.format(images[0].image_guid)
        news_thumb_image_width = images[0].width
        news_thumb_image_height = images[0].height
    # get specified data
    if news_type == 2 and len(images) > 0:
        description = images[0].description
        if description is not None:
            title = description
    if news_type == 0:
        cdn_url = 'https://cdn.flashgo.online/news-article/{}'.format(news_id)
    else:
        cdn_url = news.url
    if news_type == 3:
        video = mysql_client.retrieve_objects_by_conditions(NewsVideo, NewsVideo.news_id == news_id)[0]
        duration = video.duration
        if 'youtube' in video.video_url:
            cdn_url = video.video_url
        else:
            cdn_url = 'https://cdn.flashgo.online/news-video/{}'.format(video.video_guid)
    else:
        duration = None
    return {
        'news': {
            'news_id': news_id,
            'type': news.type,
            'created_time': news.created_time.strftime(
                '%d/%m/%Y') if news.publish_time is None else news.publish_time.strftime('%d/%m/%Y'),
            'publish_time': news.created_time.timestamp() if news.publish_time is None else news.publish_time.timestamp(),
            'abstract': news.abstract,
            'url': cdn_url,
            'author': news.author,
            'title': title,
            'duration': duration,
            'media_id': news.media_id,
            'valid': valid
        },
        'news_images': [{
            'origin_url': 'https://cdn.flashgo.online/news-images/full/{}.jpg'.format(obj.image_guid),
            'index': obj.index,
            'width': obj.width,
            'height': obj.height
        } for obj in images],
        'news_thumb_image': news_thumb_image,
        'thumb_image_width': news_thumb_image_width if news_thumb_image_width != 0 else 1,
        'thumb_image_height': news_thumb_image_height if news_thumb_image_height != 0 else 1,
        'news_tags': [{
            'id': obj.id,
            'name': _get_tag_name(obj.tag_id)
        } for obj in mysql_client.retrieve_objects_by_conditions(NewsTags, NewsTags.news_id == news_id)][:5]
    }


# for version 3014 and below
def get_news_detail_by_id(news_id, user_id=None, play_video_directly=False):
    data = _get_news_detail(news_id)
    data['news']['likes_count'] = get_likes_count(news_id)
    data['like_status'] = check_user_like_status(news_id, user_id)
    data['type'] = 'deal' if 'deal' in data else 'news'
    data['author'] = get_author_info(data['news']['media_id'], user_id)
    if data['author']['user_type'] == UserTypeMapping.REAL_USER:
        data['news']['title'] = filter_sensitive_words(data['news']['title'], REGEX_NEWS_NEGATIVE_WORDS)

    duration = 0 if data['news']['duration'] is None else data['news']['duration']
    data['play_video_directly'] = check_play_video_directly(play_video_directly, data['news']['type'],
                                                            data['news']['media_id'], data['news']['url'], duration)

    return data


@cache(key=lambda news_id: 'N_CAT_GENDER_%s' % news_id, ex=10 * 60, cache_on_memory=60)
def get_category_gender(category_id):
    category = mysql_client.retrieve_objects_by_conditions(CommonNewsCategories, CommonNewsCategories.id == category_id)
    if len(category) == 0:
        return 'Unknown'
    else:
        gender = category[0].gender
        if gender == 0:
            return 'All'
        elif gender == 1:
            return 'Male'
        else:
            return 'Female'


@cache(key=lambda rss_id: 'N_RSS_%s' % rss_id, ex=30 * 60, cache_on_memory=60)
def get_rss_media_id(rss_id):
    if int(rss_id) > 0:
        rss_medias = mysql_client.retrieve_objects_by_conditions(RssMedia, RssMedia.rss_id == int(rss_id))
        if len(rss_medias) > 0:
            return rss_medias[0].media_id
        else:
            return 0
    else:
        return 0


@cache(key=lambda news_id: 'N_Profile_v2_%s' % news_id, ex=60 * 60, cache_on_memory=60)
def get_news_profile(news_id):
    news_id = int(news_id)
    news = mysql_client.retrieve_objects_by_conditions(News, News.news_id == news_id)[0]
    news_type = news.type
    author = news.media_id if news.media_id is not None else 0
    news_categories: NewsCategoryMapping = \
        mysql_client.retrieve_objects_by_conditions(NewsCategoryMapping,
                                                    NewsCategoryMapping.news_id == news_id)
    if news_categories is not None and len(news_categories) > 0:
        category = news_categories[0].category_id
    else:
        category = 0
    category_gender = get_category_gender(category)
    # es_client.get_news_terms(news_id)[:10]
    # 暂时去掉ES的搜索
    keywords = []
    # 暂时用created_time
    publish_date = int(news.created_time.timestamp())
    images = mysql_client.retrieve_objects_by_conditions(NewsImages, NewsImages.news_id == news_id)
    image_count = len(images)
    if news_type == 3:
        video = mysql_client.retrieve_objects_by_conditions(NewsVideo, NewsVideo.news_id == news_id)[0]
        duration = video.duration
    else:
        duration = 0
    return ItemProfile(item_id=news_id,
                       item_type=news_type,
                       author=author,
                       category=category,
                       category_gender=category_gender,
                       keywords=keywords,
                       publish_date=publish_date,
                       image_count=image_count,
                       duration=duration,
                       click_count=0,
                       impression_count=0).to_dict()


def get_item_impression(news_ids: list) -> List[ItemProfile]:
    click_impressions = redis_client.get_news_clicks_and_impressions(news_ids)
    result = []
    for news_id in news_ids:
        try:
            news_profile = get_news_profile(news_id)
            news_profile['click_count'] = click_impressions.get(news_id, {}).get('click_count', 0)
            news_profile['impression_count'] = click_impressions.get(news_id, {}).get('impression_count', 0)
            result.append(ItemProfile.parse(news_profile))
        except:
            # TODO 后续需要把日志打出来
            pass
    return result


@cache(key=lambda tag_id: 'T_name_%s' % tag_id, ex=30 * 60)
def _get_tag_name(tag_id):
    tag = mysql_client.retrieve_object_by_id(Tags, tag_id)
    if tag is None:
        return None
    else:
        return tag.name


def check_user_like_status(news_id, user_id):
    like_news_ids = set(get_user_likes_news_ids(user_id))
    return news_id in like_news_ids


def get_likes_count(news_id, ugc_news=False):
    count = redis_client.get_news_likes_count(news_id)
    if count is None:
        news_likes_count = mysql_client.retrieve_object_by_unique_key(NewsLikesCount, news_id=news_id)
        if ugc_news:
            count = news_likes_count.likes_count if news_likes_count is not None else 0
        else:
            count = 0 if news_likes_count is None else news_likes_count.likes_count + news_likes_count.fake_likes_count
        redis_client.cache_news_likes_count(news_id, count)
    return count


@cache(key=lambda news_id: 'N_relative_D_%s' % news_id, ex=30 * 60)
def get_news_relative_deal_ids(news_id):
    news_deals = mysql_client.retrieve_objects_by_conditions(NewsDeals, NewsDeals.news_id == news_id)
    if len(news_deals) == 0:
        return []
    else:
        return [news_deal.deal_id for news_deal in news_deals]


@cache(key=lambda news_id, count, only_video=False: 'N_relative_N_%s' % news_id, ex=10 * 60, allow_kwargs=True)
def get_relative_news(news_id, count, only_video=False):
    return es_client.search_relative_news(news_id, count=count, only_video=only_video)


@cache(key=lambda news_id, page_id, count: 'N_relative_F_%s_P_%s_C_%s' % (news_id, page_id, count), ex=10 * 60)
def search_relative_news_feed(news_id, page_id, count):
    return es_client.search_relative_news_feed(news_id, page_id, count)


@cache(key=lambda user_id: 'U_I_Cate_%s' % user_id, ex=10 * 60)
def _get_user_interest_category_ids(user_id):
    interest_ids = _get_user_selected_interests(user_id)
    category_ids = mysql_client.get_interests_category_ids(interest_ids)
    return category_ids


@cache(key=lambda user_id: 'U_I_%s' % user_id, ex=10 * 60)
def _get_user_selected_interests(user_id):
    interest_ids = mysql_client.retrieve_objects_by_conditions(UserFavoriteSelectedInterest,
                                                               UserFavoriteSelectedInterest.user_id == user_id)
    return [interest_id.selected_interest_id for interest_id in interest_ids]


NEWS_CACHE_SIZE = 100 * 12
MIN_NEWS_CACHE_SIZE = 60


def _identity(obj):
    return obj


class MemoryFeeds(object):
    def __init__(self):
        self._cache = UWSGICache(max_size=10)
        self._author_cache = MemoryCache(max_size=300)

    def get_gender_hot_news(self, gender):
        return self._cache.get_cache('gender_%s' % gender, lambda: redis_client.get_gender_hot_news(gender),
                                     exp=20 * 60, from_json=_identity, to_json=_identity)

    def get_rec_gender_hot_news(self, gender, gender_type: FeedType):
        return self._cache.get_cache('rec_gender_%s_%s' % (gender, gender_type.value),
                                     lambda: rec_redis_client.get_hot_feeds(gender, gender_type),
                                     exp=20 * 60, from_json=lambda l: [FeedItem.parse(feed_item) for feed_item in l],
                                     to_json=lambda l: [feed_item.to_dict() for feed_item in l])

    def get_author_feeds(self, author_ids):
        left_author_ids = []
        author_news_mapping = {}
        for author_id in author_ids:
            news_ids = self._author_cache.get_cache('author_%s' % author_id)
            if news_ids is None:
                left_author_ids.append(author_id)
            else:
                author_news_mapping[author_id] = news_ids
        for index, news in enumerate(redis_client.get_author_feeds(left_author_ids)):
            author_news_mapping[left_author_ids[index]] = news
            self._author_cache.cache_object('author_%s' % left_author_ids[index], news, exp=5 * 60)
        return [author_news_mapping.get(author_id, []) for author_id in author_ids]


_memory_feeds = MemoryFeeds()

_rec_news_queue = SQSQueueEntry('recommend_news',
                                'https://sqs.ap-southeast-1.amazonaws.com/239801832578/recommend_news')

_mab_queue = SQSQueueEntry('mab_rec_users',
                           'https://sqs.ap-southeast-1.amazonaws.com/239801832578/mab_rec_users')


def send_update_event(queue, **message):
    sqs_client.send_message(queue, message)


def _get_recommended_news_from_online(user_id, count, page_id,
                                      gender_type: FeedType = FeedType.HOT_GENDER,
                                      interest_type: FeedType = FeedType.HOT_INTEREST,
                                      use_offline=False, exp=None, follow_author_news=True,
                                      use_lambda=True, gender=None) -> List[FeedItem]:
    if (page_id + 1) * count > NEWS_CACHE_SIZE:
        return []

    user_id = str(user_id)
    if user_id == 'web':
        gender = 'Male'
        news_feeds = _memory_feeds.get_rec_gender_hot_news(gender, gender_type)
        begin = random.randint(0, len(news_feeds) - count)
        ret = news_feeds[begin: begin + count]
        return ret

    user_impression = redis_client.get_user_recently_impression(user_id)
    if use_lambda:
        news_feeds = rec_redis_client.get_user_feeds(user_id, FeedType.ONLINE)
        if page_id == 0 or len(news_feeds) == 0:
            send_update_event(queue=_rec_news_queue, user_id=user_id,
                              gender_type=gender_type.value,
                              interest_type=interest_type.value,
                              use_offline=use_offline,
                              exp=exp,
                              follow_author_news=follow_author_news)
    else:
        news_feeds = rec_redis_client.get_user_feeds(user_id, FeedType.ALL)
        if len(news_feeds) == 0:
            if gender == 'Female':
                news_feeds = rec_redis_client.get_user_feeds('angel', FeedType.ALL)
            else:
                news_feeds = rec_redis_client.get_user_feeds('jupiter', FeedType.ALL)
        if page_id == 0 or len(news_feeds) == 0:
            send_update_event(queue=_mab_queue, user_id=user_id)

    if page_id == 0:
        rec_redis_client.expire_user_feeds(user_id, feed_type=FeedType.ONLINE if use_lambda else FeedType.ALL)

    if page_id == 0 or len(news_feeds) == 0:
        user_impression |= redis_client.get_user_impression_news_ids(user_id)
        if gender not in {'Male', 'Female'}:
            gender = 'Male'
        news_feeds = news_feeds + _memory_feeds.get_rec_gender_hot_news(gender, gender_type)
        news_feeds = [news_item for news_item in news_feeds if news_item.item_id not in user_impression]
        if len(news_feeds) < MIN_NEWS_CACHE_SIZE:
            # 通过旧的进行补充
            hot_feed_items = [FeedItem(item_id=item_id, recall='default', sort='default', exp='default') for item_id in
                              _memory_feeds.get_gender_hot_news(gender)]
            news_feeds_set = set(news_feeds)
            news_feeds += [item for item in hot_feed_items if
                           item not in news_feeds_set and item.item_id not in user_impression]
            news_feeds += [item for item in hot_feed_items if
                           item not in news_feeds_set and item.item_id in user_impression]
            unique_items = UniqueItemList()
            for item in news_feeds:
                unique_items.append(item)
            news_feeds = unique_items.to_list()

    if len(user_impression) > 0:
        ret = [item for item in news_feeds[page_id * count: (page_id + 1) * count] if
               item.item_id not in user_impression]
        if len(ret) >= 3:
            return ret
        else:
            return news_feeds[page_id * count: (page_id + 1) * count][:3]
    else:
        return news_feeds[page_id * count: (page_id + 1) * count]


def get_news_recommendation_feeds(user_id=None, count=10, page_id=0, gender=None, add_top=False) -> List[FeedItem]:
    bucket = get_user_bucket(user_id)
    if bucket.name == 'user_cf':
        news_feed = _get_recommended_news_from_online(user_id, count, page_id,
                                                      exp=bucket.name,
                                                      use_offline=True,
                                                      follow_author_news=False)
    elif bucket.name == 'user_cf_ctr':
        news_feed = _get_recommended_news_from_online(user_id, count, page_id,
                                                      exp=bucket.name,
                                                      follow_author_news=False)
    elif bucket.name == 'all':
        news_feed = _get_recommended_news_from_online(user_id, count, page_id,
                                                      follow_author_news=False,
                                                      use_lambda=False,
                                                      gender=gender)
    else:
        news_feed = _get_recommended_news_from_online(user_id, count, page_id,
                                                      follow_author_news=True,
                                                      gender=gender)

    news_ids = [item.item_id for item in news_feed]
    redis_client.set_user_impression_news_ids(user_id, news_ids)

    # 添加置顶帖子
    if add_top and page_id == 0:
        top_news_ids = redis_client.get_top_news_ids()
        top_news_feed = [FeedItem(item_id=news_id, recall='default', sort='default', exp='default') for news_id in
                         top_news_ids]
        return top_news_feed + [FeedItem(**item.to_dict()) for item in news_feed if item.item_id not in top_news_ids]
    else:
        return [FeedItem(**item.to_dict()) for item in news_feed]


def get_web_recommendation(count):
    index = random.randint(0, 10)
    start_pos = index * NEWS_CACHE_SIZE
    res = get_web_feeds(start_pos, index)
    if res is None or len(res) == 0:
        res = _get_web_feeds(0, count + 5)
    start_pos = random.randint(0, len(res) - count)
    return res[start_pos: start_pos + count]


def get_web_feeds(start_pos, index, force_update=False):
    if start_pos == -1:
        start_pos = index * NEWS_CACHE_SIZE
    cache_name = 'web_cache_index_%s' % index
    res = redis_client.get_object(cache_name)
    if res is None or len(res) == 0 or force_update:
        res = _get_web_feeds(start_pos)
        redis_client.cache_object(cache_name, res, ex=60 * 60)
    return res


def _get_web_feeds(start_pos, count=NEWS_CACHE_SIZE, allow_change_pos=True):
    news_feeds = _memory_feeds.get_rec_gender_hot_news('Male', FeedType.CTR_GENDER)
    news_items = news_feeds[start_pos: start_pos + count]
    if len(news_items) == 0 and len(news_feeds) > 0 and allow_change_pos:
        news_items = news_feeds[0:count]
    news_ids = [item.item_id for item in news_items]
    res = []
    for news_id in news_ids:
        try:
            res.append(get_news_info(news_id, 'web', with_tiny_article=False))
        except:
            pass
    return res


EMPTY_SET = frozenset()


def _check_news_valid(news_data, *, allow_status_set):
    valid = news_data['news']['valid'] if 'news' in news_data else news_data['valid_id']
    title = news_data['news']['title'] if 'news' in news_data else news_data['title']
    return check_negative_words_valid(title.lower(), NEGATIVE_WORDS_SET) and valid in allow_status_set


def check_news_valid(news_data, is_author: bool, invalid_media=EMPTY_SET):
    if is_author:
        return _check_news_valid(news_data, allow_status_set=NewsStatus.SELF_VALID_STATUS)
    else:
        return _check_news_valid(news_data, allow_status_set=NewsStatus.VALID_STATUS) \
               and news_data['author']['show_on_feed'] == 1 \
               and news_data['author']['id'] not in invalid_media


def filter_news_feeds(feeds, invalid_media=EMPTY_SET, *, myself_feeds=False):
    return [news_data for news_data in feeds if
            check_news_valid(news_data, is_author=myself_feeds, invalid_media=invalid_media)]


def check_play_video_directly(force: bool, news_type: int, media_id: int, video_url: str = '',
                              duration: int = 0, ):
    return force and \
           news_type == NewsType.Video and \
           'cdn.flashgo.online' in video_url and \
           (0 < duration < 300 or media_id > REAL_USER_SMALLEST_ID)


def get_tiny_news_info(news_id, impression_id=None, play_video_directly=False):
    news_data = _get_news_info(news_id)
    ret = {
        'id': news_data['id'],
        'title': news_data['title'],
        'publish_time': news_data['publish_time'],
        'thumb_image': news_data['thumb_image'],

        'type': news_data['type'],
        'valid_id': news_data['valid_id'],
        'play_video_directly': check_play_video_directly(play_video_directly, news_data['type'], news_data['media_id'],
                                                         news_data.get('video', {}).get('url', ''),
                                                         news_data.get('video', {}).get('duration', 0))
    }
    update_impression_id(ret, impression_id)
    return ret


def update_impression_id(ret, impression_id):
    if impression_id is not None:
        ret['impression_id'] = impression_id


@cache(key=lambda news_id: 'N_TMP_INFO_v3_%s' % news_id, ex=10 * 60, cache_on_memory=5)
def _get_news_info(news_id):
    news = mysql_client.retrieve_object_by_unique_key(News, news_id=news_id)

    images = sorted(mysql_client.retrieve_objects_by_conditions(NewsImages, NewsImages.news_id == news_id),
                    key=lambda obj: int(obj.index))

    all_topic_ids = [topic.topic_id for topic in
                     mysql_client.retrieve_objects_by_conditions(TopicNews, TopicNews.news_id == news_id,
                                                                 TopicNews.status == 1)]

    online_topic_ids = [topic.id for topic in
                        mysql_client.retrieve_objects_by_conditions(Topics, Topics.id.in_(all_topic_ids),
                                                                    Topics.status > 0)]
    topic_id = -1 if len(online_topic_ids) == 0 else get_random_ids(online_topic_ids, 1)[0]

    if news.media_id > REAL_USER_SMALLEST_ID:
        news_tags_list = mysql_client.retrieve_objects_by_conditions(UGCNewsTags, UGCNewsTags.news_id == news_id,
                                                                     UGCNewsTags.status > 0)
        news_tags_list = sorted(news_tags_list, key=lambda news_tag: news_tag.id)
        tags = [{'name': news_tag.tag_name} for news_tag in news_tags_list if
                news_tag.tag_id is not None and len(news_tag.tag_name) <= 30]
    else:
        tags = [{'name': _get_tag_name(obj.tag_id)} for obj in
                mysql_client.retrieve_objects_by_conditions(NewsTags, NewsTags.news_id == news_id)][:5]
        tags = [{'name': data['name']} for data in tags if len(data['name']) <= 30]

    ret = {
        'id': news.news_id,
        'type': news.type,
        'title': news.title,
        'desc': '' if news.abstract is None else news.abstract,
        'media_id': news.media_id,
        'publish_time': int(
            news.created_time.timestamp() if news.publish_time is None else news.publish_time.timestamp() * 1000),
        'valid': _check_title_validity(news.title) if news.valid >= 1 else 0,
        'valid_id': news.valid,
        'tags': tags,
        'share_url': ShareUrlMapping.NEWS.format(news.news_id),
        'thumb_image': _get_thumb_image_data(images),
        'topic_id': topic_id
    }

    ret = _add_data_according_news_type(ret, images)
    return ret


def _get_thumb_image_data(images: List[NewsImages]):
    if len(images) == 0:
        return NEWS_DEFAULT_THUMB_IMAGE
    else:
        thumb_image = images[0]
        if thumb_image.width == 0 or thumb_image.height == 0:
            width = 1
            height = 1
        else:
            width = thumb_image.width
            height = thumb_image.height
        return {
            'url': generate_cdn_url('news-images/thumbs/refine/', f'{thumb_image.image_guid}.jpg'),
            'width': width,
            'height': height
        }


def _add_data_according_news_type(ret, images: List[NewsImages]):
    news_id = ret['id']
    if ret['type'] == NEWS_TYPE_MAPPING.get('video'):
        video = mysql_client.retrieve_objects_by_conditions(NewsVideo, NewsVideo.news_id == news_id)[0]
        ret['video'] = {
            'url': video.video_url if 'youtube' in video.video_url else generate_cdn_url('news-video',
                                                                                         f'{video.video_guid}'),
            'duration': video.duration,
            'cover_url': '',
            'height': 1,
            'width': 1
        }
        if len(images) == 0:
            pass
        else:
            ret['video']['cover_url'] = generate_cdn_url('news-images/full/', f'{images[0].image_guid}.jpg')
            ret['video']['height'] = 1 if images[0].height == 0 else images[0].height
            ret['video']['width'] = 1 if images[0].width == 0 else images[0].width

    elif ret['type'] == NEWS_TYPE_MAPPING.get('article'):
        ret['content_url'] = generate_cdn_url('news-article', f'{news_id}')

    elif ret['type'] == NEWS_TYPE_MAPPING.get('image_text'):
        desc = images[0].description
        ret['desc'] = '' if desc is None else desc
        ret['images'] = [{'url': generate_cdn_url('news-images/full/', f'{obj.image_guid}.jpg'),
                          'width': obj.width,
                          'height': obj.height} for obj in images]
    return ret


def _check_title_validity(title: str):
    title_str = title.replace(' ', '').lower()
    for negative_word in TITLE_NEGATIVE_WORDS_LIST:
        if negative_word in title_str:
            return 0
    else:
        return 1


@cache(key=lambda author_id: 'A_tiny_articles_%s' % author_id, ex=10 * 60, cache_on_memory=3 * 60)
def _get_tiny_articles(author_id):
    news_ids = redis_client.get_author_feed(author_id, size=3)
    news_data = []
    impression_id = ''
    for tiny_news_id in news_ids:
        try:
            news_data.append(get_tiny_news_info(tiny_news_id, impression_id, play_video_directly=True))
        except:
            pass
    return news_data


def get_tiny_articles(author_id):
    news_data = _get_tiny_articles(author_id)
    impression_id = str(uuid.uuid4())
    for news_item in news_data:
        update_impression_id(news_item, impression_id)
    return news_data


@cache(key=lambda news_id: 'Topic_No_Audited_%s' % news_id, ex=30 * 60, prefix=RedisKeyPrefix.NEWS)
def _get_news_topic_id_without_audited(news_id):
    news_topic = mysql_client.retrieve_object_by_unique_key(TopicNews, news_id=news_id)
    topic_id = None if news_topic is None else news_topic.topic_id
    return topic_id


@cache(key=lambda news_id: 'Tags_No_Audited_%s' % news_id, ex=30 * 60, prefix=RedisKeyPrefix.NEWS)
def _get_news_tags_without_audited(news_id):
    news_tags_list = mysql_client.retrieve_objects_by_conditions(UGCNewsTags, UGCNewsTags.news_id == news_id)
    news_tags_list = sorted(news_tags_list, key=lambda instance: instance.id)
    return [news_tag.tag_name for news_tag in news_tags_list if len(news_tag.tag_name) <= 30]


# for version more than 3014
def get_news_info(news_id: int, user_id: str, with_relative_deals: bool = False, use_chinese: bool = False,
                  with_tiny_article: bool = True, with_topic: bool = False, with_gif: bool = False,
                  play_video_directly: bool = False, use_data_in_audited: bool = False,
                  check_valid_by_user: bool = False) -> dict:
    """
    :param news_id: 新闻id
    :param user_id: 用户id
    :param with_relative_deals: 是否包含相关商品
    :param use_chinese: 是否使用中文title
    :param with_tiny_article: 包含作者的情况下, 是否包含三个tiny_article
    :param with_topic: 是否包含话题信息(如果有的话)
    :param with_gif: 视频类型的新闻, 是否使用gif作为封面
    :param play_video_directly:  是否是竖版短视频
    :param use_data_in_audited:  是否使用未审核过的topic和tags
    :param check_valid_by_user:  是否通过users_id来验证valid
    :return: dict
    """
    ret = _get_news_info(news_id)
    ret['like_status'] = check_user_like_status(news_id, user_id)
    ret['comment_count'] = get_news_comments_count(news_id, level=2)
    ret['news_status'] = {
        'valid_id': ret['valid_id'],
        'feed_msg': FEED_NEWS_VALID_MESSAGE_MAPPING.get(ret['valid_id'], ''),
        'detail_msg': DETAIL_NEWS_VALID_MESSAGE_MAPPING.get(ret['valid_id'], '')
    }

    author_id = ret.pop('media_id')
    ret['author'] = get_author_info(author_id, user_id=user_id)
    user_info = get_user_info(user_id)
    if user_info is not None:
        ret['is_news_author'] = ret['author']['id'] == user_info['id']
    else:
        ret['is_news_author'] = False

    ret['like_count'] = get_likes_count(news_id, ugc_news=ret['author']['user_type'] == UserTypeMapping.REAL_USER)

    if with_tiny_article:
        ret['author']['tiny_articles'] = get_tiny_articles(author_id)

    if use_chinese:
        chinese_title = get_news_chinese_title(ret['id'])
        if chinese_title != '':
            ret['title'] = chinese_title
            if ret['type'] == NEWS_TYPE_MAPPING.get('article'):
                ret['content_url'] = generate_cdn_url(path='news_translate/article', file_name=news_id)

    if with_gif:
        if 'video' in ret and 'cdn.flashgo.online' in ret['video']['url']:
            ret['thumb_image']['url'] = 'https://cdn.flashgo.online/news-images/gif/%s.jpg' % ret['id']

    if with_relative_deals:
        relative_deals = []
        relative_deals_v2 = []
        relative_deal_ids = get_news_relative_deal_ids(news_id)
        for deal_id in relative_deal_ids:
            data = get_deal_detail_by_deal_id(deal_id=deal_id, user_id=user_id, force_skip_out=True)
            data['type'] = 'deal'
            relative_deals.append(data)
            relative_deals_v2.append(get_deal_info(deal_id))
        ret['relative_deals'] = relative_deals
        ret['relative_deals_v2'] = relative_deals_v2
        ret['relative_deals_impression_id'] = str(uuid.uuid4())

    topic_id = ret.pop('topic_id') if 'topic_id' in ret else 0
    if with_topic and topic_id > 0:
        ret['topic'] = get_topic_data(topic_id)
        ret['topic_impression_id'] = str(uuid.uuid4())

    ret['play_video_directly'] = check_play_video_directly(play_video_directly, ret['type'], author_id,
                                                           ret.get('video', {}).get('url', ''),
                                                           ret.get('video', {}).get('duration', 0))

    # 针对于真实用户发的帖子, 要把敏感词转化为***
    if ret['author']['user_type'] == UserTypeMapping.REAL_USER:
        ret['title'] = filter_sensitive_words(ret['title'], sensitive_words_list=REGEX_NEWS_NEGATIVE_WORDS)
        ret['desc'] = filter_sensitive_words(ret['desc'], sensitive_words_list=REGEX_NEWS_NEGATIVE_WORDS)

    if check_valid_by_user and ret['valid'] == 0 and ret['valid_id'] != NewsStatus.DELETED_BY_USER and \
            ret['author']['user_id'] == user_id:
        ret['valid'] = 1

    # 审核中, 审核失败的内容, 对于内容作者展示未过审的topic和tags
    if use_data_in_audited and ret['author']['id'] > REAL_USER_SMALLEST_ID and ret['author']['user_id'] == user_id and \
            ret['valid_id'] in {NewsStatus.IN_AUDIT, NewsStatus.AUDIT_FAILED}:
        topic_id_not_audited = _get_news_topic_id_without_audited(news_id)
        if topic_id_not_audited is not None:
            ret['topic'] = get_topic_data(topic_id_not_audited)

        tags_not_audited = _get_news_tags_without_audited(news_id)
        if len(tags_not_audited) > 0:
            ret['tags'] = [{'name': news_tag} for news_tag in tags_not_audited]

    return ret


def filter_by_news_info(news_id: int, **kwargs):
    try:
        news_info = get_news_info(news_id, **kwargs)
    except:
        logger.exception(f"get news_id({news_id}) error")
        news_info = None
    return news_info, news_info is not None


def filter_by_short_video(news_info):
    return news_info, news_info['play_video_directly']


def add_news_info_title_and_desc_for_test(news_info):
    if news_info is not None:
        news_id = news_info['id']
        news_info['title'] = f'{news_id} | {news_info["title"]}'
        news_info['desc'] = f'{news_id} | {news_info["desc"]}'
    return news_info, news_info is not None


@cache(key=lambda user_id: 'Rec_Author_%s' % user_id, ex=5 * 60)
def _get_feed_recommended_author(user_id):
    interest_ids = _get_user_selected_interests(user_id)
    author_ids = get_user_recommended_authors(user_id, interest_ids, 1, 128)
    invalid_author_ids = set(get_following_author_ids(user_id))
    return [int(author_id) for author_id in set(author_ids) if author_id not in invalid_author_ids]


@cache(key=lambda news_id: 'News_Html_%s' % news_id, ex=20 * 60)
def get_cache_content(news_id):
    content_cdn = generate_cdn_url(path='news-article', file_name=news_id)
    resp: Response = requests.get(content_cdn)
    if resp.status_code == 200:
        html_str = resp.content.decode()
    else:
        html_str = ''
    return html_str


@cache(key=lambda news_id: 'N_Title_%s' % news_id, ex=10 * 60, cache_on_memory=10)
def get_news_chinese_title(news_id):
    resp: Response = requests.get(generate_cdn_url(path='news_translate/title', file_name=news_id))
    if resp.status_code == 200:
        title = resp.content.decode()
    else:
        title = ''
    return title


@cache(key=lambda topic_id, order_by: SORTED_TOPIC_NEWS_FEED % (topic_id, order_by), ex=20 * 60,
       prefix=RedisKeyPrefix.NEWS)
def _get_topic_news_ids(topic_id: int, order_by: str) -> List[int]:
    def _get_news_hot_score(comment_count, like_count):
        return comment_count * 1 + like_count * 1

    topic_news_list = mysql_client.retrieve_objects_by_conditions(TopicNews,
                                                                  TopicNews.topic_id == topic_id,
                                                                  TopicNews.status == 1)

    topic_news_ids = [topic_news.news_id for topic_news in topic_news_list]
    valid_news = mysql_client.retrieve_objects_by_conditions(News, News.news_id.in_(topic_news_ids),
                                                             News.valid == NewsStatus.SUCCESS)
    # 计算news的热度分数
    hot_list = []
    common_list = []
    recent_list = []
    now = datetime.datetime.now()
    for news in valid_news:
        if news.publish_time is None:
            news.publish_time = news.created_time

        news.comment_count = mysql_client.get_instances_count(Comments.id,
                                                              Comments.news_id == news.news_id)
        news.like_count = mysql_client.get_instances_count(UserLike.id, UserLike.news_id == news.news_id)
        news.hot_score = _get_news_hot_score(news.comment_count, news.like_count)

        if news.hot_score > 0:
            if news.publish_time > now - datetime.timedelta(days=7):
                recent_list.append(news)
            else:
                hot_list.append(news)
        else:
            common_list.append(news)

    if order_by == 'hot':
        news_id_list = UniqueItemList()

        recent_list = sorted(recent_list, key=lambda instance: (instance.hot_score, news.publish_time))
        for news in reversed(recent_list):
            news_id_list.append(news.news_id)

        hot_list = sorted(hot_list, key=lambda instance: (instance.hot_score, news.publish_time))
        for news in reversed(hot_list):
            news_id_list.append(news.news_id)

        common_list = sorted(common_list, key=lambda instance: instance.publish_time, reverse=True)
        for news in common_list:
            news_id_list.append(news.news_id)

        hot_news_id_list = news_id_list.to_list()
        return hot_news_id_list
    elif order_by == 'created_time':
        sorted_news_list = sorted(valid_news, key=lambda instance: instance.publish_time, reverse=True)
        sorted_news_ids = [news.news_id for news in sorted_news_list]
        return sorted_news_ids
    else:
        raise Exception(f'order by {order_by} not support.')


def get_topic_news_ids(topic_id: int, user_id: str, page_id: int, count: int, order_by: str) -> List[int]:
    news_ids: List[int] = _get_topic_news_ids(topic_id, order_by)
    news_ids = news_ids[page_id * count: (page_id + 1) * count]
    if len(news_ids) > 0:
        redis_client.set_user_impression_news_ids(user_id, news_ids)
    return news_ids


@cache(key=lambda news_id: f"Short_Video_R_v1_{news_id}", ex=20 * 60, prefix=RedisKeyPrefix.NEWS)
def _search_relative_video(news_id):
    news_ids = es_client.search_ins_video_ids(news_id, max_count=64)
    return [item_id for item_id in news_ids if item_id != news_id]


def get_pageable_relative_video(news_id, page_id, count):
    news_ids = rec_redis_client.get_short_video_rec_feed(news_id) + _search_relative_video(news_id)
    unique_news_ids = UniqueItemList()
    for news_id in news_ids:
        unique_news_ids.append(news_id)
    news_ids = unique_news_ids.to_list()
    return news_ids[page_id * count: (page_id + 1) * count]


@cache(key=lambda media_id: f"My_News_{media_id}", ex=30 * 60, prefix=RedisKeyPrefix.NEWS)
def _get_pageable_my_news(media_id):
    news_list = mysql_client.retrieve_objects_by_conditions(News, News.media_id == media_id)
    news_list = sorted(news_list, key=lambda item: item.publish_time, reverse=True)
    return [item.news_id for item in news_list if item.valid > -3]


def get_pageable_my_news(media_id, page_id, count):
    news_ids = _get_pageable_my_news(media_id)
    return news_ids[page_id * count: (page_id + 1) * count]


@cache(key=lambda keyword: 'tags-suggest_%s' % (base64.b64encode(keyword.encode('utf-8')).decode('utf-8')),
       ex=20 * 60, cache_on_memory=30)
def get_tags_suggest(keyword):
    suggest_texts = UniqueItemList()
    for fuzziness in [None, 1, 2]:
        data = es_client.get_suggest(keyword, 10, fuzziness=fuzziness)
        for sug in data:
            suggest_texts.append(sug)
        if len(suggest_texts) >= 10:
            break
    suggest_list = [{'name': keyword} for keyword in suggest_texts.to_list()]

    filtered_sug = []
    for suggest in suggest_list:
        if check_negative_words_valid(suggest['name'].lower().strip(), RAW_NEWS_NEGATIVE_WORDS):
            filtered_sug.append(suggest)
    return filtered_sug[:10]


def update_news_like_count(news_id, increase=True):
    like_count = get_likes_count(news_id)
    return redis_client.update_news_like_count(news_id, increase)
