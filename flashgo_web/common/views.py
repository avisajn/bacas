import json
import json
import os
import pathlib
import random
import uuid

from django.shortcuts import render, redirect
from django.views.decorators.gzip import gzip_page
from django.views.decorators.http import require_GET

from author.utils import get_author_info
from common import loggers
from common import requestutils
from common.constants import APP_PACKAGE_NAMES, GENDER_CONFIG, UPLOAD_FILE_PATH, RedisKeyPrefix
from common.forms import upload_user_choices_schema
from common.mimetypesutils import guess_types
from common.mysqlclient import mysql_client
from common.redisclient import redis_client, cache
from common.s3client import s3_client
from common.sql_models import UserFavoriteSelectedInterest, InterestsRecommendAuthor
from common.utils import get_gaid, get_user_id_from_request_header, get_random_ids, auth, ERROR_NO_SUCCESS, \
    concat_cdn_url
from favorite.utils import get_interests_category, _get_selected_interests
from recsys.events import sender
from users.models import User
from users.utils import get_user_info

logger = loggers.get_logger(__name__)


def available(request):
    return requestutils.get_success_response({})


def newest_version(request):
    # noinspection PyBroadException
    try:
        data = redis_client.get_app_version()
        if data is None:
            data = {
                "version": 3020,
                "release_notes": "Update aplikasi kamu untuk menemukan review menarik lainnya!"
            }
        return requestutils.get_success_response(data)
    except:
        logger.exception('Error occurred in get version data.')
        return requestutils.get_internal_error_response()


def get_update_info(request):
    # noinspection PyBroadException
    try:
        return requestutils.get_success_response({
            "release_notes": 'Update aplikasi kamu untuk menemukan review menarik lainnya!',
            "force_update": False,
            "force_update_url": '',
        })
    except:
        return requestutils.get_internal_error_response()


def get_banners(request):
    # clickserver.record_impression(get_gaid(request))
    return requestutils.get_success_response([{
        'image': 'http://kasbon.cash/ads/flashgo/ad/shopee_april_banner.jpg',
        'trackinglink': 'https://app.appsflyer.com/com.shopee.id?pid=newsinpalm_int'
                        '&c=SH_CAC_1-30Apr_2019PilihShopeeFGO&af_adset=banner&af_click_lookback=7d'
                        '&advertising_id={advertising_id}'.format(advertising_id=get_gaid(request))
    }])


def get_app_package(request):
    data = redis_client.get_app_packages()
    if data is None:
        data = APP_PACKAGE_NAMES
    return requestutils.get_success_response(data)


def get_test_html(request):
    return render(request, '/test/test.html')


@cache(key=lambda option_id: f"cache_option_json_url_v2_{option_id}", ex=86400, cache_on_memory=60,
       prefix=RedisKeyPrefix.COMMON)
def get_or_cache_option(option_id):
    interest_data = []
    for gender in ['Male', 'Female']:
        interests = _get_selected_interests(gender)
        for data in interests:
            data.pop('en_name')
            data['name'] = data.pop('id_name')
            data['gender_id'] = 1 if gender == 'Male' else 2
            interest_data.append(data)
    author_data = []
    for interest_id in [data['id'] for data in interest_data]:
        rec_author_ids = _get_interest_rec_author(interest_id)
        if 0 < len(rec_author_ids) <= 6:
            author_ids = list(set(redis_client.get_interest_author_feed(interest_id)) - set(rec_author_ids))
            rec_author_ids += get_random_ids(author_ids, 6 - len(rec_author_ids))
        else:
            author_ids = redis_client.get_interest_author_feed(interest_id)
            rec_author_ids = author_ids[:3] + get_random_ids(author_ids[3:], 3)
        for author_id in rec_author_ids:
            try:
                author_info = get_author_info(author_id, None, False)
                author_info['interest_id'] = interest_id
                author_data.append(author_info)
            except:
                logger.info('Error occurred in get author {} info.'.format(author_id))
    data = {'gender': GENDER_CONFIG, 'interest': interest_data, 'author': author_data}
    response = {
        "errno": ERROR_NO_SUCCESS,
        "errmsg": "",
        "data": data,
        "impression_id": str(uuid.uuid4()),
    }
    file_name = f"admin/option_2020_{option_id}_v2.json"
    s3_client.upload_by_src_data(
        json.dumps(response, separators=(",", ":")).encode("utf-8"),
        file_name=file_name,
        content_type="application/json")
    return concat_cdn_url(file_name)


def get_options(_):
    try:
        option_id = random.randint(1, 20)
        url = get_or_cache_option(option_id)
        if url is not None:
            return redirect(url)
        else:
            raise Exception("url is None")
    except:
        logger.exception('get options error')
        return requestutils.get_internal_error_response()


def upload_choices(request):
    user_id = None
    # noinspection PyBroadException
    try:
        user_id = get_user_id_from_request_header(request.META)
        post_data = upload_user_choices_schema(json.loads(request.body))
        # update gender
        gender = 'Male' if post_data.get('sex_id', 1) == 1 else 'Female'
        user_model = mysql_client.retrieve_object_by_unique_key(User, user_id=user_id)
        if user_model.gender != gender:
            sender.send_change_gender_event(user_id, gender)
        mysql_client.update_object(User, user_model.id, gender=gender)
        redis_client.clear_object_cache('U_GENDER_%s' % user_id)
        # update selected interests
        category_ids = []
        mysql_client.clear_user_selected_interests(user_id)
        user_interest_objects = []
        for interest_id in post_data.get('interest_ids'):
            category_ids += get_interests_category(interest_id)
            obj = UserFavoriteSelectedInterest(user_id=user_id, selected_interest_id=interest_id)
            user_interest_objects.append(obj)
        mysql_client.create_objects(user_interest_objects)
        sender.send_select_interests_event(user_id, category_ids)
        # update following authors
        author_ids = post_data.get('author_ids')
        if author_ids is not None and len(author_ids) > 0:
            mysql_client.batch_add_following(user_id, author_ids, from_page=2)
            redis_client.clear_object_cache('U_Following_%s' % user_id)
            for author_id in author_ids:
                redis_client.update_following_count(author_id)
        return requestutils.get_success_response(data={})
    except:
        logger.exception(f'Error occurred in <common.views.upload_choices>, user_id {user_id}')
        return requestutils.get_internal_error_response()


@auth(facebook_login=True, must_use_encryption=False)
def upload_file(request):
    user_id = request.user_id
    object_uuid = str(uuid.uuid4())
    local_file_path = None
    try:
        # 验证用户创建新闻权限
        if not get_user_info(user_id)['rights']['create_news']:
            return requestutils.get_error_response(-2, f'{user_id} has no enough authorization.')

        file_type = request.POST['file_type']
        file_upload = request.FILES['file']
        _, mine_type = guess_types(file_upload._name)

        local_file_name = object_uuid

        if not os.path.exists(UPLOAD_FILE_PATH):
            pathlib.Path(UPLOAD_FILE_PATH).mkdir(parents=True, exist_ok=True)

        local_file_path = UPLOAD_FILE_PATH + local_file_name
        with open(local_file_path, 'wb+') as destination:
            for chunk in file_upload.chunks():
                destination.write(chunk)

        if file_type == 'image':
            dest_file_name = f'news-images/full/{local_file_name}.jpg'
        elif file_type == 'video':
            dest_file_name = f'news-video/{local_file_name}'
        else:
            return requestutils.get_error_response(-2, 'Not support for file_type.')

        s3_client.upload_file(local_file_path, dest_file_name, content_type=mine_type)
        return requestutils.get_success_response(data={'image_guid': object_uuid})
    except:
        logger.exception(f'Error occurred in common.views.upload_file, user_id {user_id}')
        return requestutils.get_internal_error_response()
    finally:
        if local_file_path is not None and os.path.exists(local_file_path):
            os.remove(local_file_path)


@gzip_page
@require_GET
@auth(must_use_encryption=False, facebook_login=True)
def get_s3_secret_key(request):
    try:
        session_id = int(random.randint(0, 10))
        secret_data = get_s3client_secret_key(session_id)
        return requestutils.get_success_response(data=secret_data)
    except:
        logger.exception('Error occurred in common.views.get_s3_secret_key.')
        return requestutils.get_internal_error_response()


####################################
# The functions followed are utils.#
####################################
@cache(key=lambda interest_id: 'Interest_rec_Authors_%s' % interest_id, ex=30 * 60, cache_on_memory=1)
def _get_interest_rec_author(interest_id):
    interests = mysql_client.retrieve_objects_by_conditions(InterestsRecommendAuthor,
                                                            InterestsRecommendAuthor.interest_id == interest_id,
                                                            InterestsRecommendAuthor.status == 1)
    interests = sorted(interests, key=lambda obj: int(obj.position))
    author_ids = [mapping.author_id for mapping in interests]
    return author_ids


@cache(lambda session_id: f'S3_SECRET_id_{session_id}', ex=30 * 60)
def get_s3client_secret_key(session_id):
    secret_key = s3_client.get_session_token(duration_in_seconds=4 * 60 * 60)
    return {
        "access_key_id": secret_key['access_key_id'],
        "secret_access_key": secret_key['secret_access_key'],
        "session_token": secret_key['session_token'],
        "region_name": secret_key['region_name'],
        "image_file_path": s3_client.image_path,
        "image_bucket": s3_client.image_bucket,
        "image_suffix": s3_client.image_suffix,
        "video_file_path": s3_client.video_path,
        "video_bucket": s3_client.video_bucket,
        "video_suffix": s3_client.video_suffix
    }
