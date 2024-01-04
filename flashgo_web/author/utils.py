import base64

import requests

from common.mysqlclient import mysql_client
from common.redisclient import cache, redis_client
from common.sql_models import UserFollowing
from common.utils import filter_by_user_impression, pick_from_array
from news.models import News
from users.constants import UserTypeMapping
from users.models import UserExtraInfo
from users.utils import get_user_author_info


@cache(lambda user_id: 'U_Following_%s' % user_id, ex=10 * 60)
def get_following_author_ids(user_id):
    authors = mysql_client.retrieve_objects_by_conditions(UserFollowing, UserFollowing.user_id == user_id)
    authors = sorted(authors, key=lambda author: author.created_time, reverse=True)
    return [author.author_id for author in authors]


def get_followers_count(author_id, real=False):
    follow_count = redis_client.get_followers_count(author_id, real=real)
    if follow_count is None:
        author = mysql_client.retrieve_object_by_unique_key(UserExtraInfo, id=author_id)
        count = 0 if author is None else author.be_follows_count
        fake_count = author_id % 200
        redis_client.set_followers_count(author_id, count, fake_count)
        if real:
            return count
        else:
            return count + fake_count
    else:
        return follow_count


def get_author_info(author_id: int, user_id: str, with_image_base64: bool = False) -> dict:
    common_user_info = get_user_author_info(author_id, with_avatar=True)
    data = {'id': common_user_info["id"],
            'name': common_user_info["name"],
            'user_id': common_user_info['user_id'],
            'user_type': common_user_info['user_type'],
            'avatar_url': common_user_info["avatar"]["url"],
            'desc': "" if common_user_info["description"] is None else common_user_info["description"],
            'show_on_feed': common_user_info['show_on_feed'],
            'follow_status': check_follow_status(author_id, user_id)}

    if common_user_info['user_type'] == UserTypeMapping.REAL_USER:
        data['follower_count'] = get_followers_count(author_id, real=True)
    else:
        data['follower_count'] = get_followers_count(author_id)
    online_like_count = redis_client.get_author_total_likes(author_id)
    if online_like_count is None:
        redis_client.cache_author_total_likes(author_id, common_user_info['be_likes_count'])
        data['like_count'] = common_user_info['be_likes_count']
    else:
        data['like_count'] = online_like_count

    if with_image_base64:
        data['avatar_base64'] = get_author_base64_avatar(author_id, common_user_info["avatar"]["url"])

    return data


def check_follow_status(author_id, user_id):
    return author_id in get_following_author_ids(user_id)


def get_user_recommended_authors(user_id, interest_ids, page_id, count):
    author_feed = redis_client.get_user_cache_author_feed(user_id)
    if len(author_feed) == 0 or page_id == 0:
        array = []
        for interest_id in interest_ids:
            feed = redis_client.get_interest_author_feed(interest_id)
            if len(feed) > 0:
                array.append(feed)
        author_feed = pick_from_array(array, 10000)
        redis_client.set_user_cache_author_feed(user_id, author_feed)
    filter_ids = list(redis_client.get_impression_authors(user_id)) + get_following_author_ids(user_id)
    author_feed = filter_by_user_impression(author_feed, filter_ids, with_impression=True)
    if page_id == 0:
        author_feed = author_feed[:20]
    else:
        page_id -= 1
        author_feed = author_feed[20:]
        author_feed = author_feed[count * page_id: (page_id + 1) * count]
    redis_client.set_impression_authors(user_id, author_feed)
    return [int(author_id) for author_id in author_feed]


@cache(key=lambda author_id, avatar_cdn: 'Author_base64_%s' % author_id, ex=10 * 60)
def get_author_base64_avatar(author_id, avatar_cdn):
    avatar_base64 = base64.b64encode(requests.get(avatar_cdn).content).decode()
    return avatar_base64


def filter_valid_author(res, invalid_media_ids: set = None):
    if invalid_media_ids is None:
        invalid_media_ids = set()
    ret = []
    for data in res:
        if data['show_on_feed'] >= 1 and data['id'] not in invalid_media_ids:
            if data['user_type'] == UserTypeMapping.SPIDER_USER:
                if len(data.get('tiny_articles', [])) >= 3:
                    ret.append(data)
            elif data['user_type'] == UserTypeMapping.REAL_USER:
                ret.append(data)
            elif data['user_type'] == UserTypeMapping.FAKE_USER:
                ret.append(data)
            else:
                pass
    return ret


@cache(key=lambda user_author_id: f'Common_U_N_{user_author_id}', ex=30 * 60)
def _get_common_user_news_feed(user_author_id):
    news_list = mysql_client.retrieve_objects_by_conditions(News, News.media_id == user_author_id, News.valid > 0)
    news_list = sorted(news_list, key=lambda news: news.publish_time, reverse=True)
    return [news.news_id for news in news_list]


def get_common_user_news_feed(author_id, page_id, count):
    return _get_common_user_news_feed(author_id)[page_id * count: (page_id + 1) * count]
