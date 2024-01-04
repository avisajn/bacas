import uuid
from urllib.parse import urlencode

from requests.models import PreparedRequest

from common.constants import ROUTE_NAME_TARGET_MAPPING
from common.mysqlclient import mysql_client
from common.redisclient import cache
from home.models import NewsBanner, NewsTopChannel, DealChannel, Banner, TopChannel, TrendingChannel


@cache(lambda target, gender: 'H_OL_BANNERS_{}-{}'.format(target, gender), ex=10 * 60, cache_on_memory=5)
def _get_online_banners(target, gender):
    if gender not in {'Male', 'Female'}:
        gender = 'male'
    else:
        gender = gender.lower()
    banners = mysql_client.retrieve_objects_by_conditions(Banner, Banner.status == 1,
                                                          Banner.target == f'{target}-{gender}')
    ret = []
    for banner in banners:
        ret.append(banner.to_dict())
    ret = sorted(ret, key=lambda o: int(o['position']))
    return ret


@cache(lambda target, gender: 'H_TOP_CHANNELS_{}-{}'.format(target, gender), ex=10 * 60, cache_on_memory=5)
def _get_top_channels(target, gender):
    if gender not in {'Male', 'Female'}:
        gender = 'male'
    else:
        gender = gender.lower()
    channels = mysql_client.retrieve_objects_by_conditions(TopChannel, TopChannel.status == 1,
                                                           TopChannel.target == f'{target}-{gender}')
    if len(channels) >= 5:
        channels = list(sorted(channels, key=lambda o: o.position))[:5]
    ret = []
    for channel in channels:
        ret.append(channel.to_dict())
    return ret


@cache(lambda target, gender: 'H_HOT_CATEGORIES_{}-{}'.format(target, gender), ex=10 * 60, cache_on_memory=5)
def _get_hot_categories(target, gender):
    if gender not in {'Male', 'Female'}:
        gender = 'male'
    else:
        gender = gender.lower()
    trending_categories = mysql_client.retrieve_objects_by_conditions(TrendingChannel, TrendingChannel.status == 1,
                                                                      TrendingChannel.target == f'{target}-{gender}')
    trending_categories = list(sorted(trending_categories, key=lambda o: o.position))
    channel_ids = [category.channel_id for category in trending_categories]
    position_map = {category.channel_id: category.position for category in trending_categories}
    channels = mysql_client.retrieve_objects_by_conditions(DealChannel, DealChannel.id.in_(channel_ids))
    ret = []
    for channel in channels:
        channel_dict = channel.to_dict()
        channel_dict['channel_id'] = channel_dict['id']
        channel_dict['position'] = int(position_map[channel_dict['id']])
        ret.append(channel_dict)
    ret = list(sorted(ret, key=lambda o: o['position']))
    return ret


@cache(lambda gender, from_page: 'Home_Page_%s_%s' % (from_page, gender), ex=15 * 60, cache_on_memory=15)
def get_home_page(gender, from_page):
    if from_page == "news":
        target = f"app-{gender.lower()}"
        banners = mysql_client.retrieve_objects_by_conditions(NewsBanner, NewsBanner.status == 1,
                                                              NewsBanner.target == target)
        top_channels = mysql_client.retrieve_objects_by_conditions(NewsTopChannel, NewsTopChannel.status == 1,
                                                                   NewsTopChannel.target == target)
    elif from_page == "app-mall":
        target = f"{from_page}-{gender.lower()}"
        banners = mysql_client.retrieve_objects_by_conditions(Banner, Banner.status == 1,
                                                              Banner.target == target)
        top_channels = mysql_client.retrieve_objects_by_conditions(TopChannel, TopChannel.status == 1,
                                                                   TopChannel.target == target)
    else:
        raise ValueError(f"from page {from_page} not support")

    ret = []
    banners = sorted(banners, key=lambda obj: int(obj.position))
    banner_impression_id = str(uuid.uuid4())
    for banner in banners:
        try:
            data = {
                'id': banner.id,
                'type': 1,
                'image_url': banner.image,
                'title': banner.title,
                'target': _get_target_uri(banner.to_dict(), banner_impression_id, 'tab_content_banner'),
                'impression_id': banner_impression_id
            }
            ret.append(data)
        except:
            pass

    top_channels = list(sorted(top_channels, key=lambda o: o.position))[:5]
    top_channels_impression_id = str(uuid.uuid4())
    for top_channel in top_channels:
        try:
            data = {
                'id': top_channel.id,
                'type': 2,
                'image_url': top_channel.image,
                'title': top_channel.title,
                'target': _get_target_uri(top_channel.to_dict(), top_channels_impression_id, 'tab_content_top_channel'),
                'impression_id': top_channels_impression_id
            }
            ret.append(data)
        except:
            pass
    return ret


def _get_target_uri(banner_data, impression_id, from_page):
    route_name = banner_data.get('route_name')

    if ('http://' in route_name) or ('https://' in route_name):
        request_obj = PreparedRequest()
        request_obj.prepare_url(route_name, {'nipForceOutside': 'true'})
        return request_obj.url
    else:
        app_in_target_uri = 'http://flashgo.online/link/jump/{}'.format(ROUTE_NAME_TARGET_MAPPING.get(route_name))

        if route_name == 'channel':
            query_data = {'key_title_s': banner_data.get('title'), 'key_channel_id_i': banner_data.get('param')}

        elif route_name == 'cheapest':
            query_data = {'key_title_s': banner_data.get('title'), 'key_channel_id_i': 1}

        elif route_name == 'flash':
            query_data = {
                'key_tab_name_s': 'flash_on_going' if banner_data.get('param') == 'ongoing' else 'flash_come_soon'}

        elif route_name == 'deal_detail':
            query_data = {'key_deal_id_i': banner_data.get('param'), 'key_from_page_s': from_page,
                          'key_impression_id_s': impression_id}

        elif route_name == 'video_detail':
            query_data = {'key_video_id_l': banner_data.get('param'), 'key_from_page_s': from_page,
                          'key_impression_id_s': impression_id}

        elif route_name == 'news_detail':
            query_data = {'key_article_id_l': banner_data.get('param'), 'key_from_page_s': from_page,
                          'key_impression_id_s': impression_id}

        elif route_name == 'tab':
            query_data = {'key_tab_name_s': banner_data.get('param')}

        elif route_name == 'usercenter':
            query_data = {'key_tab_name_s': 'tab_user_center'}

        elif route_name == 'recommend':
            query_data = {'key_tab_name_s': 'tab_mall'}

        elif route_name == 'topic_detail':
            query_data = {'key_topic_id_l': banner_data.get('param')}

        # 往返利商品分享页面跳转, 暂时没用到
        elif route_name == 'cashback_share':
            query_data = {'key_deal_id_i': banner_data.get('param'), 'key_from_page_s': from_page,
                          'key_impression_id_s': impression_id}
        else:
            query_data = {}
        query_str = urlencode(query_data)
        return f'{app_in_target_uri}' if len(query_str) == 0 else f'{app_in_target_uri}?{query_str}'
