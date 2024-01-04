import json
import time
import uuid
from datetime import datetime

from django.core.serializers.json import DjangoJSONEncoder
from django.views.decorators.gzip import gzip_page
from django.views.decorators.http import require_http_methods

from author.utils import get_author_info
from common import requestutils, loggers, exps
from common.constants import NEWS_TYPE_MAPPING, NewsFeedTypeMapping, NewsType
from common.exps import get_user_bucket, play_video_directly_exp
from common.mysqlclient import mysql_client
from common.pageutils import Pageable, wrap_filter_to_filter_list, wrap_filter_list
from common.recommend_logger import concat_bucket_name, deal_logger
from common.redisclient import redis_client
from common.requestutils import parse_get_schema, parse_headers
from common.s3client import s3_client
from common.sql_models import TopicNews
from common.utils import get_user_id_from_request_header, get_app_version_from_header, get_random_ids, \
    get_id_from_request, auth, generate_cdn_url, check_guid_valid, check_negative_words_valid, check_valid_rate_by_words
from deals.utils import get_deal_detail_by_deal_id, filter_deals_by_app_version, filter_by_blacklist
from events.utils import send_news_impression, wrapper_news_ids
from news.constants import NewsFeedbackReasonId, CreateNewsErrorData, NewsStatus, GetNewsErrorData, \
    RAW_NEWS_NEGATIVE_WORDS
from news.forms import cache_web_feeds_schema, get_recommendation_feed_schema, get_topic_news_schema, \
    web_news_info_schema, user_news_feedback_schema, relative_video_schema, set_single_click_impression_schema, \
    create_news_schema, get_my_news_schema, search_suggest_tags_schema, news_detail_schema
from news.models import UserNewsFeedback, News, NewsImages, UGCNewsTags, UGCNewsDelete, UGCNewsReject, NewsVideo
from news.utils import get_news_detail_by_id, get_news_relative_deal_ids, get_news_recommendation_feeds, \
    get_relative_news, filter_news_feeds, get_news_info, search_relative_news_feed, \
    get_pageable_relative_video, _get_feed_recommended_author, get_cache_content, get_web_recommendation, \
    get_web_feeds, get_topic_news_ids, _get_pageable_my_news, get_pageable_my_news, _get_news_info, get_tags_suggest, \
    filter_by_news_info, add_news_info_title_and_desc_for_test, filter_by_short_video
from recsys.events import sender
from recsys.models import FeedItem
from topic.utils import get_total_topic_ids, get_topic_data
from users.utils import get_user_info
from users.views import get_user_gender

logger = loggers.get_logger(__name__)


def get_news_detail(request):
    try:
        query_data = parse_get_schema(request, news_detail_schema)

        news_id = query_data['news_id']
        user_id = get_user_id_from_request_header(request.META)
        res = get_news_detail_by_id(news_id, user_id)

        # 记录性别点击数据
        gender = get_user_gender(user_id)
        redis_client.set_click_news(news_id, gender=gender)

        # 记录点击日志
        impression_id = query_data['impression_id']
        from_page = query_data['from_page']
        sender.send_click_event(user_id, news_id, impression_id, from_page)

        return requestutils.get_success_response(res)
    except:
        logger.exception('get news detail error.')
        return requestutils.get_internal_error_response()


def get_relative_deals(request):
    try:
        news_id = int(request.GET.get('news_id', 0))
        user_id = get_user_id_from_request_header(request.META)
        app_version = get_app_version_from_header(request.META)
        relative_deal_ids = get_news_relative_deal_ids(news_id)
        res = []
        for deal_id in relative_deal_ids:
            try:
                data = get_deal_detail_by_deal_id(deal_id, user_id=user_id, force_skip_out=True)
                res.append(data)
            except:
                logger.info('news relative deals {} not found'.format(deal_id))
        res = filter_deals_by_app_version(res, app_version)
        res = filter_by_blacklist(res)
        impression_id = str(uuid.uuid4())
        deal_logger.set_impression(page_id=impression_id, user_id=user_id, buckets=concat_bucket_name(user_id),
                                   deal_ids=[data['deal']['id'] for data in res],
                                   channel='news_relative_deals')
        return requestutils.get_success_response(res, cls=DjangoJSONEncoder,
                                                 extra_param={'impression_id': uuid.uuid4()})
    except:
        logger.exception('news get relative deals error')
        return requestutils.get_internal_error_response()


def get_news_relative_news(request):
    try:
        news_id = int(request.GET.get('news_id', 0))
        count = int(request.GET.get('count', 5))
        user_id = get_user_id_from_request_header(request.META)
        res = []
        relative_news_ids = get_relative_news(news_id, count)
        for news_id in relative_news_ids:
            try:
                data = get_news_detail_by_id(news_id, user_id=user_id)
                # fix bug of client
                if int(data['news']['type']) in {1, 2}:
                    res.append(data)
            except:
                logger.info('news {} not found'.format(news_id))
        res = filter_news_feeds(res)
        return requestutils.get_success_response(res, cls=DjangoJSONEncoder,
                                                 extra_param={'impression_id': uuid.uuid4()})
    except:
        logger.exception('news get relative news error')
        return requestutils.get_internal_error_response()


def get_news_recommend_feeds(request):
    try:
        user_id = get_user_id_from_request_header(request.META)
        header_data = parse_headers(request)
        if user_id is None:
            user_id = str(request.GET.get('user_id', ''))
        page_id = request.GET.get('page_id', None)
        if page_id == '' or page_id is None:
            page_id = 0
        else:
            page_id = int(page_id)
        news_items = get_news_recommendation_feeds(user_id, 10, page_id)
        impression_id = str(uuid.uuid4())
        send_news_impression(user_id, impression_id, page_id, news_items, package_id=header_data.get_package_id())
        news_ids = [item.item_id for item in news_items]
        res = []
        for news_id in news_ids:
            try:
                res.append(get_news_detail_by_id(news_id, user_id))
            except:
                logger.info('news(%s) not found' % news_id)
        res = filter_news_feeds(res)
        return requestutils.get_success_response(res, cls=DjangoJSONEncoder,
                                                 extra_param={'impression_id': impression_id})
    except:
        logger.exception('get news recommendation error.')
        return requestutils.get_internal_error_response()


@gzip_page
def get_recommendation_feed(request):
    try:
        headers = parse_headers(request)
        user_id = headers.get_user_id()
        query_data = parse_get_schema(request, get_recommendation_feed_schema)
        page_id = query_data['page_id']
        count = query_data['count']

        if user_id == 'web':
            news_items = []
            res = get_web_recommendation(count)
        else:
            gender = get_user_gender(user_id)
            news_items = get_news_recommendation_feeds(user_id, count, page_id, gender, add_top=True)
            res = []
            is_test_mode = headers.get_test_mode_extra_info()
            bucket_name = get_user_bucket(user_id).name
            play_video_directly = play_video_directly_exp(user_id)
            for news_item in news_items:
                try:
                    news_info = get_news_info(news_item.item_id, user_id, use_chinese=is_test_mode,
                                              with_tiny_article=False, play_video_directly=play_video_directly)
                    if is_test_mode:
                        news_info['title'] = f'{bucket_name.upper()}|{news_item.recall.upper()}|' \
                                             f'{news_item.item_id}|{news_info["title"]}'

                    res.append(news_info)
                except:
                    logger.info('news(%s) not found' % news_item.item_id)
        res = filter_news_feeds(res, redis_client.get_user_filter_author_ids(user_id))
        news_type_id = NewsFeedTypeMapping.ARTICLE
        res = [{'type': news_type_id, 'article': news_data} for news_data in res]

        # 添加推荐话题
        if len(res) >= 2 and page_id in {0, 2}:
            topic_ids = []
            try:
                total_topic_ids = get_total_topic_ids()
                topic_ids = get_random_ids(total_topic_ids, count=1)
                if len(topic_ids) > 0:
                    rec_topic = get_topic_data(topic_ids[0])
                    res[-1] = {'type': NewsFeedTypeMapping.TOPIC, 'topic': rec_topic}
            except:
                logger.exception(f'get rec topic error, topic_id {topic_ids[0]}.')

        impression_id = str(uuid.uuid4())
        extra_param = {'impression_id': impression_id}
        send_news_impression(user_id, impression_id, page_id, news_items, package_id=headers.get_package_id())
        if len(news_items) > 0:
            extra_param['next_page_id'] = str(page_id + 1)
        return requestutils.get_success_response(res, cls=DjangoJSONEncoder, extra_param=extra_param)
    except:
        logger.exception('get news recommendation error.')
        return requestutils.get_internal_error_response()


def cache_web_feeds(request):
    try:
        req = parse_get_schema(request, cache_web_feeds_schema)
        return requestutils.get_success_response(get_web_feeds(req['start_pos'], req['index'], req['force']),
                                                 cls=DjangoJSONEncoder)
    except:
        logger.exception('cache web feeds error')
        return requestutils.get_internal_error_response()


@gzip_page
def news_detail(request):
    try:
        headers = parse_headers(request)
        query_data = parse_get_schema(request, news_detail_schema)
        user_id = headers.get_user_id()
        is_test_mode = headers.get_test_mode_extra_info()
        news_id = query_data['news_id']
        ret = get_news_info(news_id, user_id, with_relative_deals=True, with_topic=True, use_chinese=is_test_mode,
                            play_video_directly=True, use_data_in_audited=True, check_valid_by_user=True)

        myself_feeds = user_id == ret['author']['user_id']

        # 对于单个news进行有效性过滤
        app_version = headers.get_app_version()
        if len(filter_news_feeds([ret], myself_feeds=myself_feeds)) == 0:
            if app_version >= 3049:
                return requestutils.get_success_response(data={}, extra_param=GetNewsErrorData.INVALID)
            else:
                return requestutils.get_internal_error_response()
        # 如果新闻状态是审核通过, 做相应的统计
        if ret['valid_id'] == NewsStatus.SUCCESS:
            gender = get_user_gender(user_id)
            redis_client.set_click_news(news_id, gender=gender)

            if user_id not in {'web', None, 'test'} and exps.is_all_user_bucket(exps.get_user_bucket(user_id)):
                redis_client.add_active_users(user_id, 'click')

            if user_id not in {'web', 'test', None}:
                redis_client.add_user_click_news(user_id, news_id)

            sender.send_click_event(user_id, news_id, query_data['impression_id'], query_data['from_page'])

        return requestutils.get_success_response(ret, extra_param=GetNewsErrorData.SUCCESS)
    except:
        logger.exception('get news detail error.')
        return requestutils.get_internal_error_response()


@gzip_page
def get_relative_news_feed(request):
    try:
        news_id = int(request.GET.get('news_id', 0))
        page_id = get_id_from_request(request, 'page_id')
        user_id = get_user_id_from_request_header(request.META)
        headers = parse_headers(request)
        count = int(request.GET.get('count', 8))
        res = []
        relative_news_ids = search_relative_news_feed(news_id, page_id, count)
        for news_id in relative_news_ids:
            try:
                res.append(get_news_info(news_id, user_id=user_id, play_video_directly=False))
            except:
                logger.info('news {} not found'.format(news_id))

        res = filter_news_feeds(res)
        news_ids = [item['id'] for item in res]
        redis_client.set_user_impression_news_ids(user_id, news_ids)
        news_type_id = NewsFeedTypeMapping.ARTICLE
        res = [{'type': news_type_id, 'article': data} for data in res]

        if len(res) >= 2 and page_id in {0, 3}:
            try:
                recommended_author = _get_rec_author_info(user_id)
                if recommended_author is not None:
                    res[-1] = {'type': NewsFeedTypeMapping.AUTHOR, 'author': recommended_author}
            except:
                logger.exception('Error occurred in /author/relative_news, {} get rec author error.'.format(user_id))

        impression_id = str(uuid.uuid4())
        send_news_impression(user_id, impression_id, page_id,
                             wrapper_news_ids(relative_news_ids, FeedItem(0, 'default', 'default', 'default')),
                             from_page='article_detail_relative_article', package_id=headers.get_package_id())
        extra_param = {'impression_id': impression_id}
        if len(relative_news_ids) > 0:
            extra_param['next_page_id'] = str(page_id + 1)
        return requestutils.get_success_response(res, extra_param=extra_param)
    except:
        logger.exception('Error occurred in get relative news feed.')
        return requestutils.get_internal_error_response()


@gzip_page
def web_news_info(request):
    try:
        header_data = parse_headers(request)
        user_id = header_data.get_user_id()
        query_data = parse_get_schema(request, web_news_info_schema)
        news_id = query_data['news_id']
        news_data = get_news_info(news_id, user_id, with_relative_deals=True)

        ret = filter_news_feeds([news_data])

        if query_data['token'] != '982c9d07-d0b8-48ec-8197-55c4feea487' and len(ret) == 0:
            return requestutils.get_internal_error_response()
        else:
            if int(news_data['type']) == NEWS_TYPE_MAPPING.get('article', 0):
                news_data['content_html'] = get_cache_content(news_id)
            else:
                news_data['content_html'] = ""
            if 'video' not in news_data:
                news_data['video'] = {'url': '', 'duration': 0}
            if 'images' not in news_data:
                news_data['images'] = []
            gender = get_user_gender(user_id)
            redis_client.set_click_news(news_id, gender=gender)
            sender.send_click_event(user_id, news_id, query_data['impression_id'], query_data['from_page'])
            return requestutils.get_success_response(news_data)
    except:
        logger.exception('get news detail error.')
        return requestutils.get_internal_error_response()


class TopicFeed(Pageable):
    def __init__(self, page_id, count, topic_id, user_id, order_by):
        super().__init__(page_id, count)
        self.__topic_id = topic_id
        self.__user_id = user_id
        self.__order_by = order_by

    def _next_page(self):
        return get_topic_news_ids(self.__topic_id, self.__user_id, page_id=self._next_page_id, count=self._count,
                                  order_by=self.__order_by)


@gzip_page
def get_topic_news(request, topic_id):
    """
    version: 3.0.3.3
    """
    try:
        headers_data = parse_headers(request)
        user_id = headers_data.get_user_id()
        query_data = parse_get_schema(request, get_topic_news_schema)

        topic_feed = TopicFeed(topic_id=topic_id, user_id=user_id, page_id=query_data['page_id'],
                               count=query_data['count'], order_by=query_data['order_by'])

        filters = [wrap_filter_to_filter_list(filter_by_news_info, user_id=user_id,
                                              with_tiny_article=False,
                                              use_chinese=headers_data.get_test_mode_extra_info(),
                                              play_video_directly=True,
                                              with_topic=True)]
        if headers_data.get_test_mode_extra_info():
            filters.append(wrap_filter_to_filter_list(add_news_info_title_and_desc_for_test))
        if query_data['only_short_video']:
            filters.append(wrap_filter_to_filter_list(filter_by_short_video))
        filters.append(filter_news_feeds)
        ret = topic_feed.get_next_page(*filters)

        extra_param = {'impression_id': str(uuid.uuid4())}
        next_page_id = topic_feed.get_next_page_id(*filters)
        if len(ret) > 0 and next_page_id is not None:
            extra_param['next_page_id'] = str(next_page_id)
        return requestutils.get_success_response(data=ret, extra_param=extra_param)
    except:
        logger.exception('Error occurred in news.views.get_topic_news, topic_id {}'.format(topic_id))
        return requestutils.get_internal_error_response()


def user_news_feedback(request):
    """
    version: 3036
    """
    user_id = None
    news_id = None
    try:
        header_data = parse_headers(request)
        body_data = user_news_feedback_schema(json.loads(request.body))
        user_id = header_data.get_user_id()
        news_id = body_data['news_id']
        reason_id = body_data['reason_id']

        try:
            mysql_client.create_object(UserNewsFeedback(user_id=user_id, news_id=news_id, reason_id=reason_id))
        except:
            logger.info("Error occurred in news.views.user_news_feedback. user_id {}, news_id {}, reason_id {}".format(
                user_id, news_id, reason_id))

        if reason_id == NewsFeedbackReasonId.UNINTERESTED_AUTHOR:
            news_info = get_news_info(news_id, user_id, with_tiny_article=False)
            author_id = news_info.get('author', {}).get('id', -1)
            if author_id != -1:
                redis_client.add_user_filter_author_ids(user_id, author_id)

        return requestutils.get_success_response({})
    except:
        logger.exception(f"Error occurred in news.views.user_news_feedback, user_id {user_id}, news_id {news_id}.")
        return requestutils.get_internal_error_response()


def relative_video(request, news_id):
    """
    version: 3.0.4.0
    """
    try:
        header_data = parse_headers(request)
        user_id = header_data.get_user_id()
        news_info = get_news_info(news_id, user_id, with_relative_deals=False, use_chinese=False,
                                  with_tiny_article=False, with_topic=False, with_gif=False,
                                  play_video_directly=True)
        if news_info['type'] == NEWS_TYPE_MAPPING['video'] and news_info['play_video_directly']:
            query_data = parse_get_schema(request, relative_video_schema)
            page_id = query_data['page_id']
            count = query_data['count']

            news_ids = get_pageable_relative_video(news_id, page_id, count)
            ret = []
            for news_id in news_ids:
                try:
                    ret.append(
                        get_news_info(news_id, user_id, with_relative_deals=False, use_chinese=False,
                                      with_tiny_article=False, with_topic=True, with_gif=False,
                                      play_video_directly=True))
                except:
                    logger.info(f'Get news detail error, news_id {news_id}.')

            ret = filter_news_feeds(ret)

            extra_param = {'impression_id': str(uuid.uuid4())}
            if len(get_pageable_relative_video(news_id, page_id + 1, count)) > 0:
                extra_param['next_page_id'] = str(page_id + 1)

            return requestutils.get_success_response(data=ret, extra_param=extra_param)
        else:
            logger.info(f'Error, news_id {news_id} should not use news.views.relative_video, '
                        f'news_type {news_info["type"]}, '
                        f'play_video_directly {news_info["play_video_directly"]}.')
            return requestutils.get_internal_error_response()
    except:
        logger.exception(f'Error occurred in news.views.relative_video, news_id {news_id}')
        return requestutils.get_internal_error_response()


@gzip_page
def set_single_click_impression(request):
    user_id = ''
    news_id = ''
    try:
        header_data = parse_headers(request)
        user_id = header_data.get_user_id()

        query_data = parse_get_schema(request, set_single_click_impression_schema)
        news_id = query_data['news_id']
        impression_id = query_data['impression_id']
        from_page = query_data['from_page']

        sender.send_click_event(user_id, news_id, impression_id, from_page)
        send_news_impression(user_id, impression_id, 0,
                             wrapper_news_ids([news_id], FeedItem(0, recall='default', sort='default', exp='default')),
                             from_page='short_video_detail')

        return requestutils.get_success_response(data={})
    except:
        logger.exception(
            f'Error occurred in news.views.set_single_click_impression, user_id {user_id}, news_id {news_id}.')
        return requestutils.get_internal_error_response()


@auth(facebook_login=True, must_use_encryption=False)
def create_news(request):
    user_id = request.user_id
    try:
        # 用户权限验证
        user_info = get_user_info(user_id)
        if not user_info['rights']['create_news']:
            return requestutils.get_success_response(data={}, extra_param=CreateNewsErrorData.USER_BANNED)

        body_data = create_news_schema(json.loads(request.body))
        title: str = body_data['title']

        # 验证内容是否只含有空格
        if len(title.strip()) == 0:
            return requestutils.get_success_response(data={}, extra_param=CreateNewsErrorData.ONLY_CONTAINS_SPACE)

        # 验证字数规范
        if len(title) < 10 or len(title) > 1000:
            return requestutils.get_success_response(data={}, extra_param=CreateNewsErrorData.LENGTH_UNQUALIFIED)

        # 验证guid是有效的
        images = body_data['images']
        guid_list = [image['image_guid'] for image in images]
        if body_data['news_type'] == NewsType.Video:
            guid_list.append(body_data['video']['video_guid'])
        for guid in guid_list:
            if not check_guid_valid(guid):
                return requestutils.get_internal_error_response()

        # 验证视频时长符合限制
        if body_data['news_type'] == NewsType.Video and body_data['video']['duration'] > 180:
            return requestutils.get_success_response(data={}, extra_param=CreateNewsErrorData.DURATION_TOO_LONG)

        # 在s3中创建thumb_image
        thumb_image_data = images[0]
        from_file_path = f"news-images/full/{thumb_image_data['image_guid']}.jpg"
        dest_file_name = f"news-images/thumbs/refine/{thumb_image_data['image_guid']}.jpg"
        s3_client.copy_s3_file(from_file_path, dest_file_name)

        # 创建news表数据
        valid = NewsStatus.IN_AUDIT if check_valid_rate_by_words(title) else NewsStatus.AUDIT_FAILED
        instance = News(title=title, created_time=datetime.now(), publish_time=datetime.now(), media_id=user_info['id'],
                        type=body_data['news_type'], valid=valid, updated_time=datetime.now(),
                        publish_timestamp=int(time.time()))
        news = mysql_client.create_object(instance, return_id=False)

        # 如果敏感词占比过多, 服务直接设置成审核拒绝, 反之加入自动审核队列
        if valid == NewsStatus.AUDIT_FAILED:
            mysql_client.create_object(UGCNewsReject(news_id=news.news_id, **UGCNewsReject.AUTO_REJECT_MESSAGE))
        else:
            redis_client.add_auto_audit_queue(news_id=news.news_id)

        # 在mysql中创建thumb_image
        thumb_image = images[0]
        news_thumb_image = NewsImages(news_id=news.news_id, index=0, image_guid=thumb_image['image_guid'],
                                      description=title, width=thumb_image['width'], height=thumb_image['height'])
        news = mysql_client.create_object(news_thumb_image)

        # 创建相关数据
        if body_data['news_type'] == NewsType.Video:
            video = body_data['video']
            news_video = NewsVideo(news_id=news.news_id, video_url=generate_cdn_url('news-video', video['video_guid']),
                                   duration=video['duration'], created_time=datetime.utcnow(),
                                   video_guid=video['video_guid'], width=video['width'], height=video['height'])
            news = mysql_client.create_object(news_video)
        elif body_data['news_type'] == NewsType.ImageText:
            # 创建news_images表数据
            images_list = []
            for index, image_data in enumerate(images):
                if index != 0:
                    news_image = NewsImages(news_id=news.news_id, index=index, image_guid=image_data['image_guid'],
                                            description='', width=image_data['width'], height=image_data['height'])
                    images_list.append(news_image)
            mysql_client.create_objects(images_list)
        else:
            logger.info(f"not support news_type {body_data['news_type']}")
            return requestutils.get_internal_error_response()

        # 把topic和tags加到待审核表中
        if 'topic_id' in body_data and body_data['topic_id'] > 0:
            mysql_client.create_object(TopicNews(news_id=news.news_id, topic_id=body_data['topic_id'], status=0))
        if 'tags' in body_data and len(body_data['tags']) > 0:
            tags = body_data['tags']
            instances = []
            for tag_name in tags:
                tag_name = tag_name.strip()
                instances.append(UGCNewsTags(news_id=news.news_id, tag_id=None, tag_name=tag_name, status=0))
            mysql_client.create_objects(instances)

        # 清除我发布的新闻列表的缓存
        _get_pageable_my_news.clear(user_info['id'])

        news_info = get_news_info(news.news_id, user_id, with_tiny_article=False, play_video_directly=True,
                                  use_data_in_audited=True)
        return requestutils.get_success_response(data=news_info, extra_param=CreateNewsErrorData.CREATE_NEWS_SUCCESS)
    except:
        logger.exception(f'Error occurred in news.views.create_news, user_id {user_id}, request body {request.body}')
        return requestutils.get_internal_error_response()


class MyNewsFeed(Pageable):
    def __init__(self, page_id, count, media_id: int):
        super().__init__(page_id, count)
        self.__media_id = media_id

    def _next_page(self):
        return get_pageable_my_news(self.__media_id, self._next_page_id, self._count)


@auth(facebook_login=True, must_use_encryption=False)
def get_my_news(request):
    user_id = request.user_id
    try:
        query_data = parse_get_schema(request, get_my_news_schema)
        page_id = query_data['page_id']
        only_short_video = query_data['only_short_video']
        count = 8
        user_info = get_user_info(user_id, with_avatar=False)
        my_news_feed = MyNewsFeed(page_id, count, user_info['id'])
        header_data = parse_headers(request)
        filters = [wrap_filter_to_filter_list(filter_by_news_info,
                                              user_id=user_id,
                                              with_tiny_article=False,
                                              play_video_directly=True,
                                              check_valid_by_user=True)]
        if header_data.get_test_mode_extra_info():
            filters.append(wrap_filter_to_filter_list(add_news_info_title_and_desc_for_test))
        if only_short_video:
            filters.append(wrap_filter_to_filter_list(filter_by_short_video))
        filters.append(wrap_filter_list(filter_news_feeds, myself_feeds=True))
        ret = my_news_feed.get_next_page(*filters)
        extra_param = {'impression_id': str(uuid.uuid4())}
        next_page_id = my_news_feed.get_next_page_id(*filters)
        if len(ret) > 0 and next_page_id is not None:
            extra_param['next_page_id'] = str(next_page_id)
        return requestutils.get_success_response(data=ret, extra_param=extra_param)
    except:
        logger.exception(f'Error occurred in news.views.get_my_news, user_id {user_id}')
        return requestutils.get_internal_error_response()


@require_http_methods(['DELETE'])
@auth(facebook_login=True, must_use_encryption=False)
def delete_news(request, news_id):
    user_id = request.user_id
    try:
        user_info = get_user_info(user_id)
        news_info = get_news_info(news_id, user_id, with_tiny_article=False, play_video_directly=True)

        # 验证用户是这个新闻的作者
        if user_info['id'] != news_info['author']['id']:
            return requestutils.get_error_response(-2, f'User {user_id} has no enough rights.')

        # 在mysql中"删除"这条新闻
        update_result = mysql_client.del_news(news_id)

        # 在mysql中"删除"帖子下面的评论
        mysql_client.del_comments_be_news_id(news_id)

        # 下掉该新闻的topic
        mysql_client.update_topic_status_by_news_id(news_id, status=0)

        # 清除新闻在redis里面的缓存, 让状态及时生效
        _get_news_info.clear(news_id)
        _get_pageable_my_news.clear(user_info['id'])

        # 记录删前状态, 运营后台使用, 因API调用, 可能依次出现两个删除操作, 忽略后者
        if news_info['valid_id'] != NewsStatus.DELETED_BY_USER:
            mysql_client.create_object(
                UGCNewsDelete(news_id=news_id, before_status=news_info['valid_id'], execute_time=datetime.now()))

        # 该新闻作者需要更新点赞总数
        redis_client.add_media_to_update_sequence(news_info['author']['id'])

        if update_result:
            return requestutils.get_success_response(data={})
        else:
            return requestutils.get_error_response(-2, 'Can\'t find news')
    except:
        logger.exception(f"Error occurred in news.views.delete_news, news_id {news_id}, user_id {user_id}")
        return requestutils.get_internal_error_response()


@require_http_methods(['GET'])
def search_suggest_tags(request):
    keyword = None
    try:
        query_data = parse_get_schema(request, search_suggest_tags_schema)
        keyword = query_data['keyword']
        if not check_negative_words_valid(keyword.lower().strip(), RAW_NEWS_NEGATIVE_WORDS):
            return requestutils.get_success_response(data=[])
        else:
            return requestutils.get_success_response(get_tags_suggest(keyword))
    except:
        pass
        logger.exception(f'Error occurred in news.views.search_suggest_tags, keyword {keyword}')
        return requestutils.get_internal_error_response()


####################################
# The functions followed are utils.#
####################################
def _get_rec_author_info(user_id):
    author_ids = _get_feed_recommended_author(user_id)
    if len(author_ids) > 0:
        rec_author_id = get_random_ids(author_ids, count=1)[0]
        return get_author_info(rec_author_id, user_id)
    else:
        return None
