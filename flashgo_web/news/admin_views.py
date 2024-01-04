import json

from django.views.decorators.http import require_POST

from author.utils import _get_common_user_news_feed
from bonuses.utils import get_incentive_topic_ids
from common import loggers, requestutils
from common.constants import ADMIN_TOKEN
from common.mysqlclient import mysql_client
from common.redisclient import redis_client
from common.sql_models import TopicNews
from news.constants import NewsStatus
from news.forms import news_audit_pass_schema
from news.models import News
from news.utils import _get_news_info

logger = loggers.get_logger(__name__)


@require_POST
def news_audit_change(request, news_id):
    admin_email = ''
    try:
        # 身份验证
        post_data = news_audit_pass_schema(json.loads(request.body))
        admin_email = post_data['email']
        token = post_data['token']
        if token != ADMIN_TOKEN or not admin_email.endswith('@newsinpalm.com'):
            logger.info(f'Error admin user or token, email {admin_email}')
            return requestutils.get_error_response(-2, 'Access denied, error email or token.')

        news = mysql_client.retrieve_object_by_unique_key(News, news_id=news_id)
        if news.valid == NewsStatus.SUCCESS:
            redis_client.add_push_news_audit(news_id)
            redis_client.cache_update_real_media_id(media_id=news.media_id)

            # 如果活动话题 和 新闻话题有交集, 加入奖励队列
            news_topics = mysql_client.retrieve_objects_by_conditions(TopicNews, TopicNews.news_id == news.news_id,
                                                                      TopicNews.status == 1)
            news_topic_ids = [news_topic.topic_id for news_topic in news_topics]
            award_topic_ids = get_incentive_topic_ids()
            if len(set(news_topic_ids) & set(award_topic_ids)) > 0:
                redis_client.add_news_award_queue(news_id)

        elif news.valid == NewsStatus.DELETED_BY_ADMIN:
            mysql_client.update_topic_status_by_news_id(news_id, status=0)
            mysql_client.update_tags_status_by_news_id(news_id, status=0)

        # 清楚相关缓存, 更新news的状态
        _get_news_info.clear(news_id)
        _get_common_user_news_feed.clear(News.media_id)

        return requestutils.get_success_response(data={})
    except:
        logger.exception(
            f'Error occurred in news.admin_views.news_audit_pass, news_id {news_id}, admin_email {admin_email}.')
        return requestutils.get_internal_error_response()
