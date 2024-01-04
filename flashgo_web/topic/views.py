import time
import uuid

from django.views.decorators.gzip import gzip_page
from django.views.decorators.http import require_http_methods

from common import loggers
from common import requestutils
from common.mysqlclient import mysql_client
from common.redisclient import redis_client
from common.requestutils import parse_get_schema, parse_headers, Resource
from common.utils import get_random_ids
from topic.forms import get_total_topics_schema, get_follow_topics_schema
from topic.models import TopicFollows
from topic.utils import get_topic_data, get_pageable_topic_ids, get_all_topic_ids, get_follow_topic_ids, \
    get_total_follow_topic_ids, get_total_topic_ids, change_topic_follow_count

logger = loggers.get_logger(__name__)


@gzip_page
def topic_detail(request, topic_id):
    """
    version: 3.0.3.3
    """
    try:
        header_data = parse_headers(request)

        if header_data.get_test_mode_extra_info() and topic_id == 37:
            topic_data = {
                "topic_id": 37,
                "name": "#test for NLP",
                "description": "This topic is test for NLP, do not edit in service or admin.",
                "age_limit": False,
                "views_count": 1,
                "news_count": 0,
                "has_news": True,
                "has_deals": True,
                "image": {
                    "url": "",
                    "width": 1,
                    "height": 1
                }
            }
        else:
            topic_data = get_topic_data(topic_id)
            redis_client.increase_topic_views_count(topic_id)

        return requestutils.get_success_response(data=topic_data)
    except:
        logger.exception('Error occurred in topic.views.get_topic_detail, topic_id {}'.format(topic_id))
        return requestutils.get_internal_error_response()


@gzip_page
def get_total_topics(request):
    """
    version: 3.0.3.3
    """
    try:
        query_data = parse_get_schema(request, get_total_topics_schema)
        page_id = query_data['page_id']
        count = query_data['count']
        topic_ids = get_pageable_topic_ids(page_id, count)

        ret = []
        for topic_id in topic_ids:
            try:
                ret.append(get_topic_data(topic_id))
            except:
                logger.exception('get topic detail error, topic_id {}'.format(topic_id))

        header_data = parse_headers(request)
        if header_data.get_test_mode_extra_info() and page_id == 0:
            ret = [{
                "topic_id": 37,
                "name": "#test for NLP",
                "description": "This topic is test for NLP, do not edit in service or admin.",
                "age_limit": False,
                "views_count": 1,
                "news_count": 0,
                "has_news": True,
                "has_deals": True,
                "image": {
                    "url": "",
                    "width": 1,
                    "height": 1
                }
            }] + ret
        extra_param = {'impression_id': str(uuid.uuid4())}
        if len(topic_ids) > 0:
            extra_param['next_page_id'] = str(page_id + 1)
        return requestutils.get_success_response(data=ret, extra_param=extra_param)
    except:
        logger.exception('Error occurred in topic.views.get_total_topics')
        return requestutils.get_internal_error_response()


@require_http_methods(['GET'])
def get_all_topics(request):
    try:
        topic_ids = get_all_topic_ids()
        ret = []
        for topic_id in topic_ids:
            try:
                data = get_topic_data(topic_id)
                if data['age_limit']:
                    pass
                else:
                    ret.append(data)
            except:
                logger.exception(f'Get topic error, topic_id {topic_id}.')
        return requestutils.get_success_response(data=ret)
    except:
        logger.exception('Error occurred in topic.views.get_all_topics.')
        return requestutils.get_internal_error_response()


@require_http_methods(['GET'])
def get_follow_topics(request):
    user_id = None
    try:
        headers_data = parse_headers(request)
        user_id = headers_data.get_login_user_id()
        query_data = parse_get_schema(request, get_follow_topics_schema)
        page_id = query_data['page_id']
        topic_ids = get_follow_topic_ids(user_id, page_id)
        topic_info_list = []
        for topic_id in topic_ids:
            try:
                topic_info_list.append(get_topic_data(topic_id))
            except:
                logger.exception(f'get topic data error in <topic.views.get_follow_topics>, topic_id {topic_id}')
        ret = {'topic_info_list': topic_info_list}

        # 是否返回用户关注的所有topic_ids
        if query_data['carry_follows']:
            ret['topic_ids'] = get_total_follow_topic_ids(user_id)

        extra_param = {'impression_id': str(uuid.uuid4())}
        if len(get_follow_topic_ids(user_id, page_id + 1)) > 0:
            extra_param['next_page_id'] = str(page_id + 1)

        return requestutils.get_success_response(data=ret, extra_param=extra_param)
    except:
        logger.exception(f'Error occurred in <topic.views.get_follow_topics>, user_id {user_id}')
        return requestutils.get_internal_error_response()


@require_http_methods(['GET'])
def get_recommend_topics(request):
    try:
        topic_ids = get_random_ids(get_total_topic_ids(), 3)
        ret = []
        for topic_id in topic_ids:
            try:
                ret.append(get_topic_data(topic_id))
            except:
                logger.exception(f'get topic data error in <topic.views.get_recommend_topics>, topic_id {topic_id}')
        return requestutils.get_success_response(data=ret,
                                                 extra_param={'next_page_id': '', 'impression_id': str(uuid.uuid4())})
    except:
        logger.exception('Error occurred in <topic.views.get_recommend_topics>')
        return requestutils.get_internal_error_response()


class TopicFollowHandler(Resource):
    def __init__(self, db=None):
        self.db = db

    def post(self, request, *args, **kwargs):
        user_id = None
        topic_id = None
        try:
            headers_data = parse_headers(request)
            user_id = headers_data.get_login_user_id()
            topic_id = kwargs['topic_id']
            topic_follows = TopicFollows(topic_id=topic_id, user_id=user_id, created_timestamp=int(time.time()))
            mysql_client.create_object(topic_follows, has_created_time=False)
            get_total_follow_topic_ids.clear(user_id)
            change_topic_follow_count(topic_id, True, 1)
            return get_total_follow_topic_ids(user_id)
        except:
            logger.exception(
                f'Error occurred in <topic.views.TopicFollowHandler.post>, user_id {user_id}, topic_id {topic_id}')
            raise

    def delete(self, request, *args, **kwargs):
        user_id = None
        topic_id = None
        try:
            headers_data = parse_headers(request)
            user_id = headers_data.get_login_user_id()
            topic_id = kwargs['topic_id']
            result = mysql_client.delete_object_by_unique_key(TopicFollows, user_id=user_id, topic_id=topic_id)
            if result:
                get_total_follow_topic_ids.clear(user_id)
                change_topic_follow_count(topic_id, False, 1)
                return get_total_follow_topic_ids(user_id)
            else:
                return None
        except:
            logger.exception(
                f'Error occurred in <topic.views.TopicFollowHandler.post>, user_id {user_id}, topic_id {topic_id}')
            raise


topic_follow_handler = TopicFollowHandler(db=mysql_client)
