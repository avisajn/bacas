import time
import uuid

from django.core.serializers.json import DjangoJSONEncoder
from django.shortcuts import redirect
from django.views.decorators.gzip import gzip_page
from django.views.decorators.http import require_GET

from common import requestutils
from common.loggers import get_logger
from common.redisclient import redis_client
from common.requestutils import parse_headers, parse_get_schema
from common.utils import get_user_id_from_request_header, get_app_version_from_header
from home.forms import get_news_homepage_schema
from home.utils import _get_top_channels, _get_hot_categories, _get_online_banners, get_home_page
from topic.utils import get_hot_topic_ids, get_topic_data
from users.views import get_user_gender

logger = get_logger(__name__, 'service.log')


def get_online_banners(request):
    user_id = request.GET.get('user_id', '')
    user_gender = request.GET.get('gender', '')
    app_version = get_app_version_from_header(request.META)
    if len(user_id) > 0:
        redis_client.cache_user_app_version(user_id, app_version)
    try:
        if user_gender == '':
            gender = get_user_gender(user_id)
            if gender is None:
                gender = 'Male'
        else:
            gender = user_gender
        banners = _get_online_banners('app', gender)
        return requestutils.get_success_response(banners, cls=DjangoJSONEncoder)
    except Exception as e:
        logger.exception('get online banners error')
        return requestutils.get_internal_error_response(str(e))


def get_online_top_channels(request):
    user_id = request.GET.get('user_id', '')
    user_gender = request.GET.get('gender', '')
    try:
        if user_gender == '':
            gender = get_user_gender(user_id)
            if gender is None:
                gender = 'Male'
        else:
            gender = user_gender
        top_channels = _get_top_channels('app', gender)
        return requestutils.get_success_response(top_channels, cls=DjangoJSONEncoder)
    except:
        logger.exception('get top channels error')
        return requestutils.get_internal_error_response()


def get_hottest_categories(request):
    user_id = request.GET.get('user_id', '')
    user_gender = request.GET.get('gender', '')
    try:
        if user_gender == '':
            gender = get_user_gender(user_id)
            if gender is None:
                gender = 'Male'
        else:
            gender = user_gender
        hot_categories = _get_hot_categories('app', gender)
        return requestutils.get_success_response(hot_categories, cls=DjangoJSONEncoder)
    except:
        logger.exception('get hottest categories error')
        return requestutils.get_internal_error_response()


def get_bottom_notification(request):
    user_id = get_user_id_from_request_header(request.META)
    today_click = request.GET.get('todayClick', 0)
    history_click = request.GET.get('historyClick', 0)
    return requestutils.get_success_response(data=True, cls=DjangoJSONEncoder)


def get_webapp_banners(request):
    user_id = request.GET.get('user_id', '')
    try:
        gender = get_user_gender(user_id)
        gender = 'Male' if gender is None else gender
        banners = _get_online_banners('web', gender)
        return requestutils.get_success_response(banners, cls=DjangoJSONEncoder)
    except Exception as e:
        logger.exception('get online banners error')
        return requestutils.get_internal_error_response(str(e))


def get_webapp_top_channels(request):
    user_id = request.GET.get('user_id', '')
    try:
        gender = get_user_gender(user_id)
        gender = 'Male' if gender is None else gender
        top_channels = _get_top_channels('web', gender)
        return requestutils.get_success_response(top_channels, cls=DjangoJSONEncoder)
    except:
        logger.exception('get top channels error')
        return requestutils.get_internal_error_response()


def get_webapp_trending_channels(request):
    user_id = request.GET.get('user_id', '')
    try:
        gender = get_user_gender(user_id)
        gender = 'Male' if gender is None else gender
        trending_channels = _get_hot_categories('web', gender)
        return requestutils.get_success_response(trending_channels, cls=DjangoJSONEncoder)
    except:
        logger.exception('get hottest categories error')
        return requestutils.get_internal_error_response()


@gzip_page
def get_news_homepage(request):
    try:
        header_data = parse_headers(request)
        user_id = header_data.get_user_id()
        app_version = header_data.get_app_version()

        if user_id is not None and len(user_id) > 0:
            redis_client.cache_user_app_version(user_id, app_version)

        hot_topic = []
        topic_ids = get_hot_topic_ids()
        for topic_id in topic_ids:
            try:
                hot_topic.append(get_topic_data(topic_id))
            except:
                logger.exception(f'Error occurred in home.views.get_news_homepage, topic_id {topic_id}')
        extra_param = {'hot_topic_list': hot_topic, 'impression_id': str(uuid.uuid4())}

        query_data = parse_get_schema(request, get_news_homepage_schema)
        sex_id = query_data['sex_id']
        gender = 'Female' if sex_id == 2 else 'Male'
        ret = get_home_page(gender, "news")

        return requestutils.get_success_response(data=ret, extra_param=extra_param)
    except:
        logger.exception('Error occurs in getting news home page information.')
        return requestutils.get_internal_error_response()


def get_update_page(request, target):
    # return render(request, 'update/update.html')
    return redirect('http://cdn.flashgo.online/admin/update.html')


@require_GET
@gzip_page
def get_mall_homepage(request):
    user_id = None
    sex_id = None
    try:
        header_data = parse_headers(request)
        user_id = header_data.get_login_user_id()
        query_data = parse_get_schema(request, get_news_homepage_schema)
        sex_id = query_data["sex_id"]
        ret = get_home_page("Female" if sex_id == 2 else "Male", "app-mall")
        return requestutils.get_success_response(data=ret)
    except:
        logger.exception(f"Error occurs in home.views.get_mall_homepage; user_id {user_id}; sex_id {sex_id}.")
        return requestutils.get_internal_error_response()
