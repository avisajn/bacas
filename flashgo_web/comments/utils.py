import datetime

import requests
from sqlalchemy import desc, or_, and_

from comments.models import Comments, CommentLikes
from common.constants import RedisKeyPrefix, CHECK_COMMENT_INVALIDATION_URL
from common.mysqlclient import mysql_client
from common.redisclient import cache, redis_client
from news.models import News
from users.utils import get_tiny_user_info


@cache(key=lambda comment_id: 'Comment_v4_%s' % comment_id, ex=10 * 60, cache_on_memory=15,
       prefix=RedisKeyPrefix.COMMENT)
def _get_comment_info(comment_id):
    comment: Comments = mysql_client.retrieve_object_by_unique_key(Comments, id=comment_id, valid=1)

    if comment is not None and comment.thread_id > 0:
        comment_replied = mysql_client.retrieve_object_by_unique_key(Comments, id=comment.thread_id, valid=1)
        user_id_replied = comment_replied.user_id if comment_replied is not None else ""
    else:
        user_id_replied = ''

    return {
        'comment_id': comment.id,
        'user_id': comment.user_id,
        'news_id': comment.news_id,
        'comment_id_be_replied': comment.thread_id,
        'like_count': comment.like_count + comment.fake_like_count,
        'content': comment.content,
        'created_time': int(comment.created_time.timestamp() * 1000),
        'root_id': comment.root_id,
        'route_id': comment.root_id,
        'user_id_be_replied': user_id_replied,
        'valid': comment.valid
    }


def _update_comment_like_count(comment_id, data):
    like_count = redis_client.get_comment_like_count(comment_id)
    if like_count is None:
        comment = mysql_client.retrieve_object_by_unique_key(Comments, id=comment_id, valid=1)
        count = comment.like_count + comment.fake_like_count
        redis_client.cache_comment_like_count(comment_id, count)
        data['like_count'] = count
    else:
        data['like_count'] = like_count
    return data


@cache(key=lambda user_id, comment_id: 'U_%s_C_%s_Like' % (user_id, comment_id), ex=20 * 60,
       prefix=RedisKeyPrefix.COMMENT)
def get_comment_like_info(user_id: str, comment_id: int):
    instance = mysql_client.retrieve_object_by_unique_key(CommentLikes, user_id=user_id, comment_id=comment_id)
    if instance is None:
        return {'like_status': False, 'like_time': 0}
    else:
        return {'like_status': True, 'like_time': int(instance.created_time.timestamp() * 1000)}


def get_comment_info(user_id: str, comment_id: int):
    comment_info = _get_comment_info(comment_id)
    comment_info['like_status'] = get_comment_like_info(user_id, comment_id)['like_status']
    _update_comment_like_count(comment_id, comment_info)

    # Check if the replier is news author.
    comment_info['is_article_author'] = False

    # Get information of user who is the comment owner.
    comment_info['user_info'] = get_tiny_user_info(comment_info.pop('user_id'))

    # Get information of user who is the comment reply to.
    user_id_replied = comment_info.pop('user_id_be_replied')
    if user_id_replied is not None and len(user_id_replied) > 0:
        comment_info['user_info_be_replied'] = get_tiny_user_info(user_id_replied)
    else:
        comment_info['user_info_be_replied'] = {}

    return comment_info


@cache(key=lambda news_id: 'News_%s' % news_id, ex=25 * 60, prefix=RedisKeyPrefix.COMMENT)
def _get_news_pageable_comment_ids(news_id: int):
    comments = mysql_client.retrieve_objects_by_conditions(Comments, Comments.news_id == news_id,
                                                           Comments.root_id == 0, Comments.valid > 0)
    comments_dict = {comment.id: comment for comment in comments}
    comment_like_dict = {}
    for comment in comments:
        comment_id = comment.id
        total_like_count = mysql_client.execute_sql(
            f'SELECT SUM(comments.like_count + comments.fake_like_count) FROM comments WHERE root_id = {comment_id} or id = {comment_id};')[
            0][0]
        total_like_count = int(total_like_count) if total_like_count is not None else 0
        comment_like_dict[comment_id] = total_like_count
    comment_like_tuple = sorted(comment_like_dict.items(),
                                key=lambda item: (item[1], comments_dict[item[0]].created_time), reverse=True)
    return [item[0] for item in comment_like_tuple]


def get_news_pageable_comment_ids(news_id: int, page_id: int, count: int):
    comment_ids = _get_news_pageable_comment_ids(news_id)
    return comment_ids[page_id * count: (page_id + 1) * count]


def update_news_comments(news_id, comment_id):
    comment_ids = redis_client.get_object('News_%s' % news_id, prefix=RedisKeyPrefix.COMMENT)
    if comment_ids is None:
        comment_ids = _get_news_pageable_comment_ids(news_id)
    else:
        comment_ids = [int(comment_id) for comment_id in comment_ids]
    ex = redis_client.get_object_ttl('News_%s' % news_id, prefix=RedisKeyPrefix.COMMENT)
    ex = 25 * 60 * 60 if ex is None or ex == -1 else ex
    redis_client.cache_object('News_%s' % news_id, comment_ids + [comment_id], ex=ex, prefix=RedisKeyPrefix.COMMENT)


@cache(key=lambda user_id, page_id, count: 'User_%s_P_%s_C_%s' % (user_id, page_id, count), ex=5 * 60,
       prefix=RedisKeyPrefix.COMMENT)
def get_user_pageable_comment_ids(user_id, page_id, count):
    max_created_time = datetime.datetime.utcnow()
    max_created_time.replace(hour=0, minute=0, microsecond=0)
    comments = mysql_client.get_pageable_instances_by_conditions(Comments,
                                                                 Comments.user_id == user_id,
                                                                 Comments.valid == 1,
                                                                 Comments.created_time < max_created_time,
                                                                 page_id=page_id,
                                                                 count=count,
                                                                 order_conditions=desc(Comments.created_time))
    return [comment.id for comment in comments]


@cache(key=lambda user_id, page_id, count: 'LoC_U_%s_P_%s_C_%s' % (user_id, page_id, count), ex=5 * 60,
       prefix=RedisKeyPrefix.COMMENT)
def get_likes_data_of_my_comments(user_id, page_id, count):
    max_created_time = datetime.datetime.utcnow()
    max_created_time.replace(hour=0, minute=0, microsecond=0)
    comment_likes = mysql_client.get_pageable_instances_by_conditions(CommentLikes,
                                                                      CommentLikes.comment_owner == user_id,
                                                                      CommentLikes.login_status == 1,
                                                                      CommentLikes.created_time < max_created_time,
                                                                      page_id=page_id,
                                                                      count=count,
                                                                      order_conditions=desc(CommentLikes.created_time))
    return [(comment_like.user_id, comment_like.comment_id) for comment_like in comment_likes]


def get_news_comments_count(news_id, level=1):
    count = redis_client.get_news_comments_count(news_id, level=level)
    if count is None:
        if level == 1:
            count = mysql_client.get_instances_count(Comments.id, Comments.news_id == news_id, Comments.valid == 1,
                                                     Comments.root_id == 0)
        else:
            count = mysql_client.get_instances_count(Comments.id, Comments.news_id == news_id, Comments.valid == 1)
        redis_client.cache_news_comments_count(news_id, count, level)
    return count


def check_comment_is_validation(user_id, content):
    try:
        resp = requests.post(CHECK_COMMENT_INVALIDATION_URL, json={'rawData': content, 'url': user_id}, timeout=1)
        if resp.status_code == 200:
            return resp.json() == 0
        else:
            return True
    except:
        return True


@cache(key=lambda user_id: 'C_Reply_to_%s' % user_id, ex=60 * 60, prefix=RedisKeyPrefix.COMMENT)
def get_comment_ids_replied(user_id):
    my_comments = mysql_client.retrieve_objects_by_conditions(Comments, Comments.user_id == user_id)
    my_comment_ids = {comment.id for comment in my_comments}
    news_list = mysql_client.retrieve_objects_by_conditions(News, News.media_id == get_tiny_user_info(user_id)['id'],
                                                            News.valid == 1)
    relative_news_ids = [news.news_id for news in news_list]
    comments = mysql_client.retrieve_objects_by_conditions(Comments,
                                                           or_(Comments.thread_id.in_(my_comment_ids),
                                                               and_(Comments.news_id.in_(relative_news_ids), Comments.root_id == 0)),
                                                           Comments.valid > 0)
    comments = sorted(comments, key=lambda comment: comment.created_time,
                      reverse=True)
    return [comment.id for comment in comments]


@cache(key=lambda user_id: 'C_Relative_to_%s' % user_id, ex=60 * 60, prefix=RedisKeyPrefix.COMMENT)
def get_comment_ids_relative(user_id):
    my_comments = mysql_client.retrieve_objects_by_conditions(Comments, Comments.user_id == user_id)
    my_comment_ids = {comment.id for comment in my_comments}

    news_list = mysql_client.retrieve_objects_by_conditions(News, News.media_id == get_tiny_user_info(user_id)['id'],
                                                            News.valid == 1)
    relative_news_ids = [news.news_id for news in news_list]
    comments = mysql_client.retrieve_objects_by_conditions(Comments,
                                                           or_(
                                                               Comments.user_id == user_id,
                                                               Comments.thread_id.in_(my_comment_ids),
                                                               and_(Comments.news_id.in_(relative_news_ids), Comments.root_id == 0)
                                                               ),
                                                           Comments.valid > 0)
    comments = sorted(comments, key=lambda comment: comment.created_time, reverse=True)
    return [comment.id for comment in comments]


def get_last_be_replied(user_id):
    last_timestamp = redis_client.get_user_last_browser_time(user_id, is_like=False)
    if last_timestamp is None:
        comment_ids = get_comment_ids_replied(user_id)
        created_time = mysql_client.get_max_by_conditions(Comments.created_time, Comments.id.in_(comment_ids))
        if created_time is None:
            last_timestamp = 0
        else:
            last_timestamp = created_time.timestamp()
        redis_client.update_user_last_browser_time(user_id, cache_timestamp=last_timestamp, is_like=False)
        return last_timestamp
    else:
        return last_timestamp


@cache(key=lambda comment_id: 'Sub_C_%s' % comment_id, ex=10 * 60,
       prefix=RedisKeyPrefix.COMMENT)
def _get_sub_comment_ids(comment_id):
    sub_comments = mysql_client.retrieve_objects_by_conditions(Comments, Comments.root_id == comment_id,
                                                               Comments.valid > 0)
    sub_comments = sorted(sub_comments, key=lambda comment: comment.created_time)
    return [sub_comment.id for sub_comment in sub_comments]


def get_sub_comment_ids(comment_id, page_id, count, skip_two=False):
    sub_comment_ids = _get_sub_comment_ids(comment_id)
    if skip_two:
        sub_comment_ids = sub_comment_ids[2:]
    else:
        sub_comment_ids = sub_comment_ids
    return sub_comment_ids[page_id * count: (page_id + 1) * count]


def update_sub_comment_ids(root_id, comment_id):
    sub_comment_ids = redis_client.get_object('Sub_C_%s' % root_id, prefix=RedisKeyPrefix.COMMENT)
    if sub_comment_ids is None:
        sub_comment_ids = _get_sub_comment_ids(root_id)
    else:
        sub_comment_ids = [int(comment_id) for comment_id in sub_comment_ids]
    redis_client.cache_object('Sub_C_%s' % root_id, sub_comment_ids + [comment_id], ex=10 * 60,
                              prefix=RedisKeyPrefix.COMMENT)


def update_user_comment_list(comment_id, user_id, user_id_be_replied: str):
    comment_id_relative = get_comment_ids_relative(user_id)
    redis_client.cache_object('C_Relative_to_%s' % user_id, [comment_id] + comment_id_relative, ex=20 * 60,
                              prefix=RedisKeyPrefix.COMMENT)
    if len(user_id_be_replied) > 0 and user_id_be_replied.startswith('Facebook'):
        comment_ids_be_replied = get_comment_ids_replied(user_id_be_replied)
        redis_client.cache_object('C_Reply_to_%s' % user_id_be_replied, [comment_id] + comment_ids_be_replied,
                                  ex=20 * 60,
                                  prefix=RedisKeyPrefix.COMMENT)

        if user_id_be_replied != user_id:
            comment_id_relative = get_comment_ids_relative(user_id_be_replied)
            redis_client.cache_object('C_Relative_to_%s' % user_id_be_replied, [comment_id] + comment_id_relative,
                                      ex=20 * 60,
                                      prefix=RedisKeyPrefix.COMMENT)


def filter_comments(data_list):
    ret = []
    filter_cache = set()
    for data in data_list:
        comment_id_current = data['comment_current'].get('comment_id', -1)
        comment_id_be_replied = data['comment_be_replied'].get('comment_id', -1)
        if comment_id_current != -1 and comment_id_be_replied != -1:
            key = f'{comment_id_current}_{comment_id_be_replied}'
            if key in filter_cache:
                pass
            else:
                ret.append(data)
                filter_cache.add(key)
        else:
            ret.append(data)
    return ret


def update_news_author_comment_list(comment_id: int, news_author_user_id: str):
    if news_author_user_id.startswith('Facebook'):
        comment_ids_be_replied = get_comment_ids_replied(news_author_user_id)
        redis_client.cache_object('C_Reply_to_%s' % news_author_user_id, [comment_id] + comment_ids_be_replied,
                                  ex=20 * 60,
                                  prefix=RedisKeyPrefix.COMMENT)
        comment_id_relative = get_comment_ids_relative(news_author_user_id)
        redis_client.cache_object('C_Relative_to_%s' % news_author_user_id, [comment_id] + comment_id_relative,
                                  ex=20 * 60,
                                  prefix=RedisKeyPrefix.COMMENT)
