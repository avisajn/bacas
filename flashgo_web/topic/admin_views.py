import json

from common import loggers, requestutils
from common.constants import ADMIN_TOKEN
from common.mysqlclient import mysql_client
from common.redisclient import redis_client
from common.sql_models import Topics
from topic.forms import admin_update_topic_schema
from topic.utils import _get_topic_data, get_topic_data

logger = loggers.get_logger(__name__)


def admin_update_topic(request, topic_id):
    admin_email = ''
    try:
        post_data = admin_update_topic_schema(json.loads(request.body))
        admin_email = post_data['email']
        token = post_data['token']
        if token != ADMIN_TOKEN or not admin_email.endswith('@newsinpalm.com'):
            logger.info(f'Error admin user or token, email {admin_email}')
            return requestutils.get_error_response(-2, 'Access denied, error email or token.')
        else:
            topic: Topics = mysql_client.retrieve_object_by_unique_key(Topics, id=topic_id)
            if topic is None:
                return requestutils.get_error_response(-2, f'The topic not found, topic_id {topic_id}')
            elif topic.status > 0:
                _get_topic_data.clear(topic_id)
                get_topic_data(topic_id)
                logger.info(f'Update topic data, topic_id {topic_id}, admin email {admin_email}.')
                return requestutils.get_success_response(data={})
            else:
                logger.info(f'Take topic offline, topic_id {topic_id}, admin email {admin_email}')
                redis_client.del_topic_from_list(topic_id)
                return requestutils.get_success_response(data={})
    except:
        logger.exception(
            f'Error occurred in topic.admin_views.admin_update_topic, topic_id {topic_id}, admin email {admin_email}')
        return requestutils.get_internal_error_response()
