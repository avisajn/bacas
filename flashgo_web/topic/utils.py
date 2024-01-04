from typing import List

from common.constants import RedisKeyPrefix
from common.mysqlclient import mysql_client
from common.redisclient import cache, TOPIC_NEWS_COUNT, redis_client, TOPIC_DEALS_COUNT
from common.sql_models import Topics, TopicNews, TopicDeals
from common.utils import get_random_ids
from topic.models import TopicFollows


@cache(key=lambda topic_id: 'Info_v2_%s' % topic_id, ex=30 * 60, prefix=RedisKeyPrefix.TOPIC)
def _get_topic_data(topic_id: int) -> dict:
    topic = mysql_client.retrieve_object_by_unique_key(Topics, id=topic_id, status=1)
    return topic.to_dict()


@cache(key=lambda topic_id: TOPIC_NEWS_COUNT % topic_id, ex=2 * 60 * 60, prefix=RedisKeyPrefix.TOPIC)
def _get_topic_news_count(topic_id: int) -> int:
    count = mysql_client.get_instances_count(TopicNews.news_id, TopicNews.topic_id == topic_id, TopicNews.status == 1)
    return count


@cache(key=lambda topic_id: TOPIC_DEALS_COUNT % topic_id, ex=2 * 60 * 60, prefix=RedisKeyPrefix.TOPIC)
def _get_topic_deals_count(topic_id: int) -> int:
    count = mysql_client.get_instances_count(TopicDeals.deal_id, TopicDeals.topic_id == topic_id)
    return count


def _update_topic_views_count(topic_data: dict) -> dict:
    topic_data['views_count'] = redis_client.get_topic_views_count(topic_data['id'])
    return topic_data


def get_topic_data(topic_id: int) -> dict:
    topic_data = _get_topic_data(topic_id)
    topic_data = _update_topic_views_count(topic_data)
    news_count = _get_topic_news_count(topic_id)
    return {
        'topic_id': topic_data['id'],
        'name': '#' + topic_data['name'],
        'description': topic_data['description'],
        'age_limit': topic_data['age_limit'] > 0,
        'views_count': topic_data['views_count'] + 1,
        'news_count': news_count,
        'has_news': news_count > 0,
        'has_deals': _get_topic_deals_count(topic_id) > 0,
        'image': {
            'url': topic_data['image_url'],
            'width': 1,
            'height': 1
        },
        'follow_count': get_topic_follow_count(topic_id) + topic_data['fake_follow']
    }


def get_total_topic_ids(add_top=False) -> List[int]:
    topic_ids = redis_client.get_topic_ids(reverse=True, with_scores=False)
    if len(topic_ids) == 0:
        online_topics = mysql_client.retrieve_objects_by_conditions(Topics, Topics.status == 1)
        redis_client.cache_topic_ids({topic.id: topic.views_count for topic in online_topics})
        topic_ids = [topic.id for topic in online_topics]

    if add_top:
        top_topic_ids = redis_client.get_topic_topic_ids()
        return top_topic_ids + [topic_id for topic_id in topic_ids if topic_id not in top_topic_ids]
    else:
        return topic_ids


def get_hot_topic_ids() -> List[int]:
    topic_ids = get_total_topic_ids(add_top=True)
    return get_random_ids(topic_ids, 10)


def get_pageable_topic_ids(page_id: int, count: int) -> List[int]:
    topic_ids = get_total_topic_ids(add_top=True)
    return topic_ids[page_id * count: (page_id + 1) * count]


def get_all_topic_ids() -> List[int]:
    return get_total_topic_ids(add_top=True)


def get_topic_follow_count(topic_id: int) -> int:
    count = redis_client.get_topic_follow_count(topic_id)
    if count is None:
        count = mysql_client.get_instances_count(TopicFollows.id, TopicFollows.topic_id == topic_id)
        redis_client.cache_topic_follow_count(topic_id, count)
        count = redis_client.get_topic_follow_count(topic_id)
    return count if count > 0 else 0


def change_topic_follow_count(topic_id: int, is_add: bool, count: int = 1):
    get_topic_follow_count(topic_id)
    redis_client.change_topic_follow_count(topic_id, is_add=is_add, count=count)


@cache(key=lambda user_id: 'Follow_%s' % user_id, ex=15 * 60, prefix=RedisKeyPrefix.TOPIC)
def get_total_follow_topic_ids(user_id: str) -> List[int]:
    topic_follows = mysql_client.retrieve_objects_by_conditions(TopicFollows, TopicFollows.user_id == user_id)
    topic_follows = sorted(topic_follows, key=lambda instance: instance.created_timestamp, reverse=True)
    return [topic_follow.topic_id for topic_follow in topic_follows]


def get_follow_topic_ids(user_id: str, page_id: int = 0, count=8) -> List[int]:
    topic_ids = get_total_follow_topic_ids(user_id)
    return topic_ids[page_id * count: (page_id + 1) * count]
