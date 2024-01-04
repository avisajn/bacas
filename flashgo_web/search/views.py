import json
import uuid
from itertools import zip_longest

import voluptuous
from django.core.serializers.json import DjangoJSONEncoder
from django.views.decorators.gzip import gzip_page
from django.views.decorators.http import require_GET

from common import requestutils, loggers
from common.constants import NEGATIVE_WORDS_SET
from common.es_client import es_client
from common.recommend_logger import deal_logger, concat_bucket_name
from common.redisclient import redis_client
from common.requestutils import parse_get_schema, parse_headers
from common.utils import get_app_version_from_header, get_user_id_from_request_header, get_random_ids, \
    format_topic_keywords, check_negative_words_valid
from deals.utils import get_deal_detail_by_deal_id, filter_deals_by_app_version, filter_by_blacklist, \
    filter_deals_negative, get_deal_info
from news.utils import get_news_detail_by_id, filter_news_feeds, get_news_info
from recsys.events import sender
from search.forms import search_schema, suggest_schema, search_by_conditions_schema
from search.models import FilterCondition, SortMode
from search.utils import search_relative_topic_ids, get_hot_words, get_deal_ids, get_terms, _get_suggest, \
    get_default_topic_suggest
from topic.utils import get_topic_data

logger = loggers.get_logger(__name__)


def get_hot_query(request):
    """获取热搜词"""
    return requestutils.get_success_response(get_hot_words(), cls=DjangoJSONEncoder)


def get_search_result(request):
    # """搜索"""
    # """搜索结果页面的feed流"""
    res = []
    try:
        post_data = search_schema(json.loads(request.body))
        keywords = post_data.get('keywords')
        redis_client.increase_search_word(keywords)
        page_id = post_data.get('page_id')
        count = post_data.get('count', 30)
        search_type = post_data.get('search_type')
        channel = post_data.get('channel', 'no_channel')
        app_version = get_app_version_from_header(request.META)
        user_id = get_user_id_from_request_header(request.META)
        if user_id is None:
            user_id = post_data.get('user_id', '')
        sender.send_search_event(user_id, keywords, terms=get_terms(keywords))
        if search_type not in SUPPORTED_SEARCH_TYPE:
            search_type = 'all'
        impression_id = 'search-' + search_type + '-' + str(uuid.uuid4())
        if search_type == 'all':
            _deals = es_client.search_deals(keywords, page_id, count // 2)
            deal_ids = [deal['id'] for deal in _deals if 'id' in deal]
            deals = []
            for deal_id in deal_ids:
                try:
                    deals.append(get_deal_detail_by_deal_id(deal_id, user_id=user_id))
                except:
                    logger.info('deal ({}) not found'.format(deal_id))
            deals = filter_deals_by_app_version(deals, app_version)
            deals = filter_by_blacklist(deals)
            _news = es_client.search_news(keywords, page_id, count // 2)
            news = []
            for news_data in _news:
                try:
                    news.append(get_news_detail_by_id(int(news_data['_id']), user_id))
                except:
                    logger.info('news ({}) not found'.format(news_data['_id']))
            news = filter_news_feeds(news)
            for deal, news in zip_longest(deals, news):
                if deal is not None:
                    res.append(deal)
                if news is not None:
                    res.append(news)
            for data in res:
                data['type'] = 'deal' if 'deal' in data else 'news'
            # deal_logger.set_impression(0, user_id, res, concat_bucket_name(user_id), channel=channel)
            return requestutils.get_success_response(res, cls=DjangoJSONEncoder,
                                                     extra_param={'impression_id': impression_id})
        elif search_type == 'review':
            try:
                _news = es_client.search_news(keywords, page_id, count)
                for news_data in _news:
                    try:
                        res.append(get_news_detail_by_id(int(news_data['_id']), user_id))
                    except:
                        logger.info('news ({}) not found'.format(news_data['_id']))
                res = filter_news_feeds(res)
                for data in res:
                    data['type'] = 'deal' if 'deal' in data else 'news'
                # deal_logger.set_impression(0, user_id, [news['news']['news_id'] for news in res],
                #                            concat_bucket_name(user_id), channel=channel)
                return requestutils.get_success_response(res, cls=DjangoJSONEncoder,
                                                         extra_param={'impression_id': impression_id})
            except:
                logger.exception('search error')
        else:
            _deals = es_client.search_deals(keywords, page_id, count)
            deal_ids = [deal['id'] for deal in _deals if 'id' in deal]
            if user_id is not None and len(user_id) > 0 and (
                    user_id[-1] == '0' or user_id == 'Facebook_101300667608677'):
                native_deal_ids = get_deal_ids(keywords, page_id, count)
            else:
                native_deal_ids = []
            if native_deal_ids is not None and len(native_deal_ids) >= count:
                deal_ids = native_deal_ids[:count]
            else:
                deal_ids = deal_ids[:count]
            for deal_id in deal_ids:
                try:
                    deal_dict = get_deal_detail_by_deal_id(deal_id, user_id=user_id)
                    res.append(deal_dict)
                except:
                    logger.info('deal dict(%s) not found' % deal_id)
            res = filter_deals_by_app_version(res, app_version)
            res = filter_by_blacklist(res)
            for data in res:
                data['type'] = 'deal' if 'deal' in data else 'news'
            deal_logger.set_impression(impression_id, user_id, deal_ids, concat_bucket_name(user_id), channel=channel)
            return requestutils.get_success_response(res, cls=DjangoJSONEncoder,
                                                     extra_param={'impression_id': impression_id})
    except:
        logger.exception("search error")
        return requestutils.get_internal_error_response()


SUPPORTED_SEARCH_TYPE = {'review', 'all', 'product'}


@require_GET
def get_suggestion(request):
    try:
        query_data = parse_get_schema(request, suggest_schema)
        keyword = query_data['keyword']
        search_type = query_data['search_type']

        impression_id = str(uuid.uuid4())
        if keyword is None or len(str(keyword).strip()) == 0:
            topic_sug = get_default_topic_suggest()
            impression_id = 'hot-query-' + impression_id
        else:
            topic_sug = []
            impression_id = 'sug-' + impression_id

        if not check_negative_words_valid(keyword.lower().strip(), NEGATIVE_WORDS_SET):
            return requestutils.get_success_response(data=[])
        else:
            suggest_list = _get_suggest(keyword, search_type)
            return requestutils.get_success_response(topic_sug + suggest_list,
                                                     extra_param={'impression_id': impression_id})
    except Exception as e:
        logger.exception("search suggestion")
        if isinstance(e, voluptuous.error.MultipleInvalid):
            return requestutils.get_internal_error_response(str(e))
        else:
            return requestutils.get_internal_error_response()


@require_GET
@gzip_page
def search_by_conditions(request):
    try:
        header_data = parse_headers(request)
        user_id = header_data.get_user_id()

        query_data = parse_get_schema(request, search_by_conditions_schema)
        keyword = query_data['keyword']

        if keyword.lower() in NEGATIVE_WORDS_SET:
            return requestutils.get_success_response(data=[], cls=DjangoJSONEncoder)

        sender.send_search_event(user_id, keyword, get_terms(keyword))

        page_id = query_data['page_id']
        if page_id == 0:
            redis_client.increase_search_word(keyword)

        keyword_impression_id = query_data['impression_id']
        if keyword_impression_id is not None and str(keyword_impression_id).startswith('sug-'):
            keyword_input_method = 'sug'
        else:
            keyword_input_method = 'hot'

        topic_ids = search_relative_topic_ids(keyword)
        extra_param = {}
        try:
            if len(topic_ids) > 0:
                keywords = redis_client.get_topic_keywords()
                if format_topic_keywords(keyword) in keywords:
                    topic_id = topic_ids[0]
                else:
                    topic_id = get_random_ids(topic_ids, 1)[0]
                extra_param.update({'topic': get_topic_data(topic_id)})
        except:
            logger.exception('Error occurred in search.views.search_by_conditions')

        search_type = query_data['search_type']
        sort_mode = query_data['sort_mode']
        min_price = query_data['min_price']
        max_price = query_data['max_price']
        filter_ids = query_data['filter_ids']
        count = query_data['count']

        impression_id = 'search-' + search_type + '-' + keyword_input_method + '-' + str(uuid.uuid4())
        if search_type == 'product':
            _deals = es_client.search_deal_by_conditions(keyword, page_id, count,
                                                         min_price=min_price,
                                                         max_price=max_price,
                                                         sort_mode=SortMode(sort_mode),
                                                         **FilterCondition.to_conditions(filter_ids))
            deal_ids = [deal['id'] for deal in _deals if 'id' in deal]
            res = []
            for deal_id in deal_ids:
                try:
                    deal_dict = get_deal_detail_by_deal_id(deal_id, user_id=user_id)
                    deal_dict['type'] = 'deal'
                    res.append(deal_dict)
                except:
                    logger.info('deal dict(%s) not found' % deal_id)
            res = filter_by_blacklist(res)
            res = filter_deals_negative(res)
            tags = [tag.get('suggest', '') for tag in _get_suggest(keyword, search_type) if
                    len(tag.get('suggest', '').strip()) > 0 and tag.get('suggest', '') != keyword and
                    tag.get('search_type', '') != 'topic']
            extra_param.update({
                "impression_id": impression_id,
                "filters": [condition.to_dict() for condition in FilterCondition.create(search_type, tags=tags)]
            })
            if len(res) > 0:
                extra_param['next_page_id'] = str(page_id + 1)
            return requestutils.get_success_response(res, cls=DjangoJSONEncoder,
                                                     extra_param=extra_param)
        elif search_type == 'review':
            res = []
            _news = es_client.search_news_by_conditions(keyword, page_id, count,
                                                        min_price=min_price,
                                                        max_price=max_price,
                                                        sort_mode=SortMode(sort_mode),
                                                        **FilterCondition.to_conditions(filter_ids))
            for news_data in _news:
                try:
                    res.append(get_news_detail_by_id(int(news_data['_id']), user_id, play_video_directly=True))
                except:
                    logger.info('news ({}) not found'.format(news_data['_id']))
            res = filter_news_feeds(res)
            for data in res:
                data['type'] = 'deal' if 'deal' in data else 'news'
            tags = [tag.get('suggest', '') for tag in _get_suggest(keyword, search_type) if
                    len(tag.get('suggest', '').strip()) > 0 and tag.get('suggest', '') != keyword and
                    tag.get('search_type', '') != 'topic']
            extra_param.update({
                "impression_id": impression_id,
                "filters": [condition.to_dict() for condition in FilterCondition.create(search_type, tags=tags)]
            })
            if len(res) > 0:
                extra_param['next_page_id'] = str(page_id + 1)
            return requestutils.get_success_response(res, cls=DjangoJSONEncoder,
                                                     extra_param=extra_param)
        else:
            res = []
            _deals = es_client.search_deal_by_conditions(keyword, page_id, count // 2)
            deal_ids = [deal['id'] for deal in _deals if 'id' in deal]
            deals = []
            for deal_id in deal_ids:
                try:
                    deals.append(get_deal_detail_by_deal_id(deal_id, user_id=user_id))
                except:
                    logger.info('deal ({}) not found'.format(deal_id))
            deals = filter_by_blacklist(deals)
            deals = filter_deals_negative(deals)
            _news = es_client.search_news_by_conditions(keyword, page_id, count // 2)
            news = []
            for news_data in _news:
                try:
                    news.append(get_news_detail_by_id(int(news_data['_id']), user_id, play_video_directly=True))
                except:
                    logger.info('news ({}) not found'.format(news_data['_id']))
            news = filter_news_feeds(news)
            for deal, news in zip_longest(deals, news):
                if deal is not None:
                    res.append(deal)
                if news is not None:
                    res.append(news)
            for data in res:
                data['type'] = 'deal' if 'deal' in data else 'news'
            extra_param.update({
                "impression_id": impression_id,
                "filters": [],
            })
            if len(res) > 0:
                extra_param['next_page_id'] = str(page_id + 1)
            return requestutils.get_success_response(res, cls=DjangoJSONEncoder,
                                                     extra_param=extra_param)
    except Exception as e:
        logger.exception("search error")
        if isinstance(e, voluptuous.error.MultipleInvalid):
            return requestutils.get_internal_error_response(str(e))
        else:
            return requestutils.get_internal_error_response()


@require_GET
def get_slogan(request):
    default_slogan = 'Belanja apa hari ini?'
    slogan = redis_client.get_search_slogan()
    data = {'home': slogan.get('home', default_slogan),
            'recommendation': slogan.get('recommendation', default_slogan),
            'explore': slogan.get('explore', default_slogan)}
    return requestutils.get_success_response(data)


@gzip_page
@require_GET
def search_by_conditions_v2(request):
    keyword = None
    search_type = None
    try:
        header_data = parse_headers(request)
        user_id = header_data.get_user_id()
        query_data = parse_get_schema(request, search_by_conditions_schema)
        keyword = query_data['keyword']

        if keyword.lower() in NEGATIVE_WORDS_SET:
            return requestutils.get_success_response(data=[], cls=DjangoJSONEncoder)

        sender.send_search_event(user_id, keyword, get_terms(keyword))

        page_id = query_data['page_id']
        if page_id == 0:
            redis_client.increase_search_word(keyword)

        keyword_impression_id = query_data['impression_id']
        if keyword_impression_id is not None and str(keyword_impression_id).startswith('sug-'):
            keyword_input_method = 'sug'
        else:
            keyword_input_method = 'hot'

        topic_ids = search_relative_topic_ids(keyword)
        extra_param = {}
        try:
            if len(topic_ids) > 0:
                keywords = redis_client.get_topic_keywords()
                if format_topic_keywords(keyword) in keywords:
                    topic_id = topic_ids[0]
                else:
                    topic_id = get_random_ids(topic_ids, 1)[0]
                extra_param.update({'topic': get_topic_data(topic_id)})
        except:
            logger.exception('Error occurred in search.views.search_by_conditions')

        search_type = query_data['search_type']
        sort_mode = query_data['sort_mode']
        min_price = query_data['min_price']
        max_price = query_data['max_price']
        filter_ids = query_data['filter_ids']
        count = query_data['count']

        impression_id = 'search-' + search_type + '-' + keyword_input_method + '-' + str(uuid.uuid4())
        if search_type == 'product':
            _deals = es_client.search_deal_by_conditions(keyword, page_id, count,
                                                         min_price=min_price,
                                                         max_price=max_price,
                                                         sort_mode=SortMode(sort_mode),
                                                         only_cashback=True,
                                                         **FilterCondition.to_conditions(filter_ids))
            deal_ids = [deal['id'] for deal in _deals if 'id' in deal]
            ret = []
            for deal_id in deal_ids:
                try:
                    deal_info = get_deal_info(deal_id)
                    if deal_info["deal_show_on_feed"]:
                        ret.append({"type": "deal", "deal_info": deal_info})
                except:
                    logger.exception(f"search.views.search_by_conditions_v2#get_deal_info error, deal_id {deal_id}")

            tags = [tag.get('suggest', '') for tag in _get_suggest(keyword, search_type) if
                    len(tag.get('suggest', '').strip()) > 0 and tag.get('suggest', '') != keyword and
                    tag.get('search_type', '') != 'topic']
            extra_param.update({
                "impression_id": impression_id,
                "filters": [condition.to_dict() for condition in FilterCondition.create(search_type, tags=tags)]
            })
            if len(ret) > 0:
                extra_param['next_page_id'] = str(page_id + 1)
            return requestutils.get_success_response(ret, cls=DjangoJSONEncoder,
                                                     extra_param=extra_param)
        elif search_type == 'review':
            res = []
            _news = es_client.search_news_by_conditions(keyword, page_id, count,
                                                        min_price=min_price,
                                                        max_price=max_price,
                                                        sort_mode=SortMode(sort_mode),
                                                        **FilterCondition.to_conditions(filter_ids))
            news_ids = [int(news_data['_id']) for news_data in _news]
            for news_id in news_ids:
                try:
                    res.append(get_news_info(news_id, user_id, play_video_directly=True))
                except:
                    logger.exception(f"search.views.search_by_conditions_v2#get_news_info error, news_id {news_id}")
            res = [{"type": "news", "news_info": news_info} for news_info in filter_news_feeds(res)]

            tags = [tag.get('suggest', '') for tag in _get_suggest(keyword, search_type) if
                    len(tag.get('suggest', '').strip()) > 0 and tag.get('suggest', '') != keyword and
                    tag.get('search_type', '') != 'topic']
            extra_param.update({
                "impression_id": impression_id,
                "filters": [condition.to_dict() for condition in FilterCondition.create(search_type, tags=tags)]
            })
            if len(res) > 0:
                extra_param['next_page_id'] = str(page_id + 1)
            return requestutils.get_success_response(res, cls=DjangoJSONEncoder,
                                                     extra_param=extra_param)
        else:
            res = []
            _deals = es_client.search_deal_by_conditions(keyword, page_id, count // 2, only_cashback=True)
            deal_ids = [deal['id'] for deal in _deals if 'id' in deal]
            deals = []
            for deal_id in deal_ids:
                try:
                    deal_info = get_deal_info(deal_id)
                    if deal_info["deal_show_on_feed"]:
                        deals.append({"type": "deal", "deal_info": deal_info})
                except:
                    logger.exception(f"search.views.search_by_conditions_v2#get_deal_info error, deal_id {deal_id}")

            _news = es_client.search_news_by_conditions(keyword, page_id, count // 2)
            news_ids = [int(news_data['_id']) for news_data in _news]
            news = []
            for news_id in news_ids:
                try:
                    news.append(get_news_info(news_id, user_id, play_video_directly=True))
                except:
                    logger.exception(f"search.views.search_by_conditions_v2#get_news_info error, news_id {news_id}")
            res = [{"type": "news", "news_info": news_info} for news_info in filter_news_feeds(res)]
            for deal, news in zip_longest(deals, news):
                if deal is not None:
                    res.append(deal)
                if news is not None:
                    res.append(news)

            extra_param.update({
                "impression_id": impression_id,
                "filters": [],
            })
            if len(res) > 0:
                extra_param['next_page_id'] = str(page_id + 1)
            return requestutils.get_success_response(res, cls=DjangoJSONEncoder,
                                                     extra_param=extra_param)
    except:
        logger.exception(f"search.views.search_by_conditions_v2 error; key_word {keyword}; search_type {search_type}")
        return requestutils.get_internal_error_response()
