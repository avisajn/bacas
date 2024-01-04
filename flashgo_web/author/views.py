import json
import uuid

from django.views.decorators.gzip import gzip_page

from author.forms import add_or_cancel_following_schema, get_user_following_schema, get_author_feed_schema
from author.utils import get_following_author_ids, get_user_recommended_authors, get_author_info, filter_valid_author, \
    get_common_user_news_feed
from common import requestutils, loggers
from common.exps import is_follow_exp
from common.mysqlclient import mysql_client
from common.pageutils import Pageable, wrap_filter_to_filter_list
from common.redisclient import redis_client
from common.requestutils import parse_get_schema, parse_headers
from common.utils import get_user_id_from_request_header, get_id_from_request, get_param_from_request_query
from events.utils import send_news_impression, wrapper_news_ids
from favorite.utils import _get_selected_interests
from news.utils import _get_user_selected_interests, get_tiny_news_info, filter_news_feeds, \
    filter_by_news_info, filter_by_short_video
from recsys.io import rec_redis_client
from recsys.models import FeedItem
from users.constants import UserTypeMapping
from users.views import get_user_gender

logger = loggers.get_logger(__name__)


class AuthorFeed(Pageable):
    def __init__(self, page_id, count, author_id, spider_user=False):
        super().__init__(page_id, count)
        self.__author_id = author_id
        self.__spider_user = spider_user

    def _next_page(self):
        if self.__spider_user:
            news_ids = redis_client.get_author_feed(self.__author_id)[
                       self._count * self._next_page_id: self._count * (self._next_page_id + 1)]
        else:
            news_ids = get_common_user_news_feed(self.__author_id, self._next_page_id, self._count)
        return news_ids


@gzip_page
def get_author_feed(request):
    # noinspection PyBroadException
    try:
        query_data = parse_get_schema(request, get_author_feed_schema)
        author_id = query_data['author_id']
        page_id = query_data['page_id']
        count = query_data['count']
        only_short_video = query_data['only_short_video']

        header_data = parse_headers(request)
        user_id = header_data.get_user_id()
        author_info = get_author_info(author_id, user_id=user_id)

        spider_user = author_info['user_type'] == UserTypeMapping.SPIDER_USER
        author_feed = AuthorFeed(page_id, count, spider_user=spider_user, author_id=author_id)

        filters = [wrap_filter_to_filter_list(filter_by_news_info, user_id=user_id,
                                              use_chinese=header_data.get_test_mode_extra_info(),
                                              play_video_directly=True)]
        if only_short_video:
            filters.append(wrap_filter_to_filter_list(filter_by_short_video))
        filters.append(filter_news_feeds)
        ret = author_feed.get_next_page(*filters, min_count=3)
        news_ids = [item['id'] for item in ret]
        redis_client.set_user_impression_news_ids(user_id, [item['id'] for item in ret])
        impression_id = str(uuid.uuid4())

        # 如果是非竖版视频过滤模式, 打印impression日志
        if only_short_video:
            pass
        else:
            send_news_impression(user_id, impression_id, page_id,
                                 wrapper_news_ids(news_ids, FeedItem(0, 'default', 'default', 'default')),
                                 from_page='author_detail', package_id=header_data.get_package_id())

        extra_param = {'impression_id': impression_id}
        next_page_id = author_feed.get_next_page_id(*filters)
        if len(ret) > 0 and next_page_id is not None:
            extra_param['next_page_id'] = str(next_page_id)
        return requestutils.get_success_response(data=ret, extra_param=extra_param)
    except:
        logger.exception('Error occurred in get author feeds.')
        return requestutils.get_internal_error_response()


@gzip_page
def get_user_following(request):
    # noinspection PyBroadException
    try:
        headers = parse_headers(request)
        user_id = headers.get_user_id()
        is_test_mode = headers.get_test_mode_extra_info()
        query_data = parse_get_schema(request, get_user_following_schema)
        page_id = query_data['page_id']
        count = query_data['count']
        author_ids = get_following_author_ids(user_id)
        author_ids = author_ids[page_id * count: (page_id + 1) * count]
        res = []
        show_news_ids = []
        impression_id = str(uuid.uuid4())
        for author_id in author_ids:
            # noinspection PyBroadException
            try:
                author_info = get_author_info(author_id, user_id)
                if is_test_mode:
                    author_info['name'] = str(author_id) + ' | ' + author_info['name']

                # 对于真实用户和马甲号要做兼容
                if author_info['user_type'] == UserTypeMapping.REAL_USER:
                    news_ids = get_common_user_news_feed(author_id, 0, 3)
                elif author_info['user_type'] == UserTypeMapping.FAKE_USER:
                    news_ids = get_common_user_news_feed(author_id, 0, 3)
                elif author_info['user_type'] == UserTypeMapping.SPIDER_USER:
                    news_ids = redis_client.get_author_feed(author_id, size=3)
                else:
                    news_ids = []

                news_data = []
                for news_id in news_ids:
                    # noinspection PyBroadException
                    try:
                        news_data.append(
                            get_tiny_news_info(news_id, impression_id=impression_id, play_video_directly=True))
                        show_news_ids.append(news_id)
                    except:
                        logger.info('get news {} error'.format(news_id))
                author_info['tiny_articles'] = news_data
                res.append(author_info)
            except:
                logger.info('Error occurred in get author {} detail'.format(author_id))
        # Do not filter invalid author (custom topic) in dev service
        if is_test_mode:
            pass
        else:
            res = filter_valid_author(res)
        send_news_impression(user_id, impression_id, page_id,
                             wrapper_news_ids(show_news_ids,
                                              FeedItem(0, recall='default', sort='default', exp='default')),
                             from_page='large_picture_following_authors', package_id=headers.get_package_id())
        extra_param = {'impression_id': impression_id}
        if len(author_ids) > 0:
            extra_param['next_page_id'] = str(page_id + 1)
        return requestutils.get_success_response(data=res, extra_param=extra_param)
    except:
        logger.exception('Error occurred in get user following.')
        return requestutils.get_internal_error_response()


def add_following(request):
    # noinspection PyBroadException
    try:
        post_data = add_or_cancel_following_schema(json.loads(request.body))
        user_id = get_user_id_from_request_header(request.META)
        author_ids = post_data.get('author_id')
        if isinstance(author_ids, int):
            author_ids = [author_ids]
        mysql_client.batch_add_following(user_id, author_ids, from_page=1)
        redis_client.clear_object_cache('U_Following_%s' % user_id)
        for author_id in author_ids:
            redis_client.update_following_count(author_id)
        if is_follow_exp(user_id):
            rec_redis_client.expire_user_feeds(user_id)
        return requestutils.get_success_response({})
    except:
        logger.exception('Error occurred in following author.')
        return requestutils.get_internal_error_response()


def cancel_following(request):
    # noinspection PyBroadException
    try:
        post_data = add_or_cancel_following_schema(json.loads(request.body))
        author_id = post_data.get('author_id')
        user_id = get_user_id_from_request_header(request.META)
        mysql_client.cancel_following(user_id, author_id)
        redis_client.clear_object_cache('U_Following_%s' % user_id)
        redis_client.update_following_count(author_id, is_add=False)
        if is_follow_exp(user_id):
            rec_redis_client.expire_user_feeds(user_id)
        return requestutils.get_success_response({})
    except:
        logger.exception('Error occurred in cancel following.')
        return requestutils.get_internal_error_response()


@gzip_page
def get_recommended_authors(request):
    # noinspection PyBroadException
    try:
        res = []
        headers = parse_headers(request)
        user_id = get_user_id_from_request_header(request.META)
        page_id = get_id_from_request(request, 'page_id')
        count = 20 if page_id == 0 else 8
        interest_ids = _get_user_selected_interests(user_id)
        if len(interest_ids) == 0:
            gender = get_user_gender(user_id)
            if gender is None:
                gender = 'Male'
            interest_ids = [int(data['id']) for data in _get_selected_interests(gender)]

        try:
            ignore_author_ids = json.loads(get_param_from_request_query(request, 'ignore_authors', str, '[]'))
        except:
            ignore_author_ids = []

        filter_author_ids = set(get_following_author_ids(user_id)) | set(ignore_author_ids)
        author_ids = [author_id for author_id in get_user_recommended_authors(user_id, interest_ids, page_id, count) if
                      author_id not in filter_author_ids]
        show_news_ids = []
        impression_id = str(uuid.uuid4())
        for author_id in author_ids:
            # noinspection PyBroadException
            try:
                author_info = get_author_info(author_id, user_id)
                if author_info['user_type'] == UserTypeMapping.SPIDER_USER:
                    news_ids = redis_client.get_author_hot_feed(author_id)
                else:
                    news_ids = get_common_user_news_feed(author_id, page_id=0, count=3)
                news_data = []
                for news_id in news_ids:
                    # noinspection PyBroadException
                    try:
                        news_data.append(
                            get_tiny_news_info(news_id, impression_id=impression_id, play_video_directly=True))
                        show_news_ids.append(news_id)
                    except:
                        logger.info('get news {} error'.format(news_id))
                author_info['tiny_articles'] = news_data
                res.append(author_info)
            except:
                logger.info('Error occurred in get author {} detail'.format(author_id))
        res = filter_valid_author(res)
        if request.GET.get('show_article', 'false') == 'true':
            send_news_impression(user_id, impression_id, page_id,
                                 wrapper_news_ids(show_news_ids,
                                                  FeedItem(0, recall='default', sort='default', exp='default')),
                                 from_page='more_recommended_authors',
                                 package_id=headers.get_package_id())
        extra_param = {'impression_id': impression_id}
        if len(author_ids) > 0:
            extra_param['next_page_id'] = str(page_id + 1)
        return requestutils.get_success_response(data=res, extra_param=extra_param)
    except:
        logger.exception('Error occurred in get recommend authors.')
        return requestutils.get_internal_error_response()


def get_author_detail(request):
    author_id = get_id_from_request(request, 'author_id')
    # noinspection PyBroadException
    try:
        impression_id = request.GET.get('impression_id', '')
        user_id = get_user_id_from_request_header(request.META)
        data = get_author_info(author_id, user_id)
        return requestutils.get_success_response(data)
    except:
        logger.exception('get author {} detail error'.format(author_id))
        return requestutils.get_internal_error_response()
