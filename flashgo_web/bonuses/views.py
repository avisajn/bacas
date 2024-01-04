import hashlib
import time
import uuid

from django.http.response import HttpResponse
from django.views.decorators.http import require_GET

from bonuses.constants import BonusAction
from bonuses.forms import get_news_awards_history_schema
from bonuses.sql_models import CommonIncentiveAction
from bonuses.utils import get_pageable_user_news_awards, get_news_awards_actions_data, \
    get_single_award_data, get_user_total_news_coin
from bonuses.utils import get_share_app_html
from common import requestutils
from common.loggers import get_logger
from common.redisclient import cache, redis_client
from common.requestutils import parse_headers, parse_get_schema
from common.utils import auth
from news.constants import NewsStatus
from news.utils import get_tiny_news_info
from user_center_utils import config
from user_center_utils.context import Resource

logger = get_logger(__name__)


class BonusesResource(Resource):
    def get(self, request, *args, **kwargs):
        return {
            'rewards': {
                BonusAction.LOGIN: {
                    'money': 800,
                    'coin': 0,
                    'count': 1,
                    'name': 'login'
                },
                BonusAction.SIGN: {
                    'money': 0,
                    'coin': 50,
                    'count': 1,
                    'name': 'sign'
                },
                BonusAction.SHARE_LINK: {
                    'money': 0,
                    'coin': 500,
                    'count': 1,
                    'name': 'share_link',
                },
                BonusAction.INVITE: {
                    'money': 800,
                    'coin': 0,
                    'count': -1,
                    'name': 'invite'
                },
                BonusAction.DEAL_SHARE: {
                    'money': 0,
                    'coin': 100,
                    'count': 1,
                    'name': 'deal_share'
                },
                BonusAction.DEAL_VIEW: {
                    'money': 0,
                    'coin': 100,
                    'count': 10,
                    'name': 'deal_view'
                },
            },
        }


@cache(key='MEMORY_INVITE_CODE', ex=10, cache_on_memory=20)
def get_invite_urls():
    urls = redis_client.get_invite_urls()
    if len(urls) == 0:
        return [config.invite_base_url]
    else:
        return urls


@cache(key='MEMORY_WEIGHT_INVITE_CODE', ex=10, cache_on_memory=20)
def get_weight_invite_urls():
    urls = redis_client.get_weight_invite_urls()
    if len(urls) == 0:
        return [config.invite_base_url]
    else:
        url_list = []
        for url, score in urls.items():
            url_list += [url] * score
        return url_list


def get_user_bucket(user_id: str, buckets):
    user_id = str(user_id)
    md5_data = hashlib.md5((user_id).encode('utf-8'))
    hash_number = int(md5_data.hexdigest()[:5], 16) % buckets
    return hash_number


@require_GET
def weighted_invite(_, invite_code):
    try:
        urls = get_weight_invite_urls()
        base_url = urls[get_user_bucket(invite_code, len(urls))]
        if invite_code == 'FaASYdRir':
            url = 'http://go.onelink.me/app/6ba3566f?referrer=pid%3Dcode%26c%3D{invite}&pid=code&c={invite}'. \
                format(invite=invite_code)
        else:
            url = base_url.format(invite=invite_code)
        return requestutils.get_success_response({'url': url})
    except:
        return requestutils.get_internal_error_response()


@require_GET
def invite(request, invite_code):
    urls = get_invite_urls()
    headers = parse_headers(request)
    if headers.get_package_id() == 'com.belanja.diskon.flashsale.bonus':
        url = f'https://app.appsflyer.com/{headers.get_package_id()}?pid=code&c={invite_code}'
    else:
        # base_url = urls[get_user_bucket(invite_code, len(urls))]
        # if 'sha' in base_url:
        #    url = base_url + '{}/{}'.format(str(int(datetime.datetime.now().timestamp())), invite_code)
        # else:
        #    url = base_url + invite_code
        url = f'https://play.google.com/store/apps/details?id=com.cari.promo.diskon&referrer=pid%3Dcode%26c%3D{invite_code}'
    return requestutils.get_success_response({'url': url})


def share_app(request, timestamp, invite_code):
    try:
        download_html = get_share_app_html()
        data = download_html.replace('INVITE_CODE', invite_code)
        return HttpResponse(data.encode('utf-8'), content_type="text/html")
    except:
        return requestutils.get_internal_error_response()


bonuses_resource = BonusesResource()


@require_GET
@auth(facebook_login=True)
def get_news_awards_history(request):
    user_id = None
    try:
        header_data = parse_headers(request)
        user_id = header_data.get_user_id()
        query_data = parse_get_schema(request, get_news_awards_history_schema)
        if len(query_data['page_id']) == 0:
            page_id = 0
            last_browser_time = redis_client.get_last_browser_news_awards(user_id,
                                                                          default_time=int(time.time()) - 12 * 60 * 60)
        else:
            page_id, last_browser_time = query_data['page_id'].split('_')
            page_id = int(page_id)
            last_browser_time = int(last_browser_time)

        count = query_data['count']
        news_award_list = []
        for news_id in get_pageable_user_news_awards(user_id, page_id, count=count):
            try:
                news_award_list.append(_get_news_award_list(news_id, last_browser_time))
            except:
                logger.exception(f'bonuses.views._get_news_awards_data error, user_id {user_id}, news_id {news_id}.')

        ret = {
            'news_award_list': news_award_list,
            'user_total_award': get_user_total_news_coin(user_id)
        }

        extra_param = {'impression_id': str(uuid.uuid4())}
        if len(get_pageable_user_news_awards(user_id, page_id + 1, count=count)) > 0:
            extra_param = {'next_page_id': f'{str(page_id + 1)}_{last_browser_time}'}

        if page_id == 0:
            redis_client.cache_last_browser_news_awards(user_id)
        return requestutils.get_success_response(data=ret, extra_param=extra_param)
    except:
        logger.exception(f'Error occurred in bonuses.views.get_news_awards_history, user_id {user_id}')
        return requestutils.get_internal_error_response()


####################################
# The functions followed are utils.#
####################################
def _get_news_award_list(news_id, last_browser_time):
    # 如果文章已被删除, 修改新闻title 和thumb_image
    tiny_article = get_tiny_news_info(news_id)
    if tiny_article['valid_id'] in {NewsStatus.DELETED_BY_USER, NewsStatus.DELETED_BY_ADMIN}:
        tiny_article['title'] = 'Konten kamu dihapus'
        tiny_article['thumb_image'] = {
            'url': "https://cdn.flashgo.online/admin/20200113_507c2842f2554d91996406cdf9a1562a.png",
            'weight': 1,
            'height': 1
        }

    news_has_viewed = True

    # 该新闻的任务完成情况
    actions_data = get_news_awards_actions_data(news_id)
    award_list = []
    for action_id in CommonIncentiveAction.PREMIUM_ACTION_IDS:
        if action_id not in actions_data:
            actions_data[action_id] = None
    actions_data = sorted(actions_data.items(), key=lambda item: int(item[0]))
    news_total_award = 0
    for action_id, completed_time in actions_data:
        has_finished = completed_time is not None
        has_viewed = True if completed_time is None else last_browser_time > completed_time
        data = get_single_award_data(action_id, has_viewed=has_viewed, has_finished=has_finished)
        award_list.append(data)
        if has_finished:
            news_total_award += data['coin']
        if has_viewed is False:
            news_has_viewed = False

    return {
        'news_total_award': news_total_award,
        'news_has_viewed': news_has_viewed,
        'tiny_article': tiny_article,
        'award_list': award_list
    }
