import requests

from bonuses.constants import AwardOrderStatus
from bonuses.sql_models import UserAwardDetails, CommonIncentiveAction, ActivityTopic
from common.constants import RedisKeyPrefix
from common.mysqlclient import mysql_client
from common.redisclient import cache
from common.utils import read_file, UniqueItemList
from user_center_utils import config
from users.models import CoinUser


def _get_headers(user_id):
    coin_user = config.user_center_db.retrieve_object_by_unique_key(CoinUser, user_id=user_id)  # type: CoinUser
    if coin_user is None:
        raise ValueError('%s not login' % user_id)
    else:
        headers = {
            "X-User-Id": user_id,
            "X-User-Token": coin_user.facebook_token,
            "X-Invite-Code": coin_user.invite_code,
            "X-App-Package-Id": "com.cari.promo.diskon"
        }
    return headers


def get_total_money(user_id):
    """
    历史总收入
    """
    resp = requests.get(config.total_money_url, headers=_get_headers(user_id))
    if resp.ok:
        return int(resp.json())
    else:
        return Exception("get total money from server error %s" % resp.text)


def get_user_status(user_id):
    """
    获取用户现在的状态，包括现在拥有的钱
    """
    resp = requests.get(config.user_status_url, headers=_get_headers(user_id))
    if resp.ok:
        return resp.json()
    else:
        return Exception("get total money from server error %s" % resp.text)


@cache('share_app_html', cache_on_memory=10)
def get_share_app_html():
    return read_file('../templates/deals/download_app.html').decode('utf-8')


@cache(lambda user_id: 'N_Awards_%s' % user_id, ex=2 * 60 * 60, prefix=RedisKeyPrefix.BONUSES)
def _get_user_news_awards(user_id):
    news_awards = mysql_client.retrieve_objects_by_conditions(UserAwardDetails,
                                                              UserAwardDetails.user_id == user_id,
                                                              UserAwardDetails.order_status == AwardOrderStatus.COMPLETED)
    news_awards = sorted(news_awards, key=lambda news_award: news_award.created_time, reverse=True)
    unique_list = UniqueItemList()
    for news_award in news_awards:
        unique_list.append(news_award.news_id)
    return unique_list.to_list()


def get_pageable_user_news_awards(user_id, page_id, count=8):
    return _get_user_news_awards(user_id)[page_id * count: (page_id + 1) * count]


@cache(lambda news_id: 'N_Action_%s' % news_id, ex=2 * 60 * 60)
def _get_news_awards_actions_data(news_id):
    news_awards = mysql_client.retrieve_objects_by_conditions(UserAwardDetails, UserAwardDetails.news_id == news_id,
                                                              UserAwardDetails.order_status == AwardOrderStatus.COMPLETED)
    awards_data = {news_award.action_id: news_award.created_timestamp for news_award in news_awards}
    return awards_data


def get_news_awards_actions_data(news_id):
    award_data = _get_news_awards_actions_data(news_id)
    return {int(k): v for k, v in award_data.items()}


@cache(lambda action_id: 'Action_Detail_%s' % action_id, ex=24 * 60 * 60, cache_on_memory=30,
       prefix=RedisKeyPrefix.BONUSES)
def _get_action_detail(action_id):
    action: CommonIncentiveAction = mysql_client.retrieve_object_by_unique_key(CommonIncentiveAction, id=action_id)
    return action.to_json()


def get_single_award_data(action_id, has_viewed=True, has_finished=False):
    award_data = _get_action_detail(action_id)
    data = {
        'action_description': award_data['description'],
        'has_finished': has_finished,
        'has_viewed': has_viewed,
        'coin': award_data['coin'],
        'award_type': award_data['award_type']
    }
    return data


@cache(key=lambda user_id: 'Total_Coin_%s' % user_id, ex=2 * 60 * 60, prefix=RedisKeyPrefix.BONUSES)
def get_user_total_news_coin(user_id):
    news_awards = mysql_client.retrieve_objects_by_conditions(UserAwardDetails,
                                                              UserAwardDetails.user_id == user_id,
                                                              UserAwardDetails.order_status == AwardOrderStatus.COMPLETED)
    action_ids = [award.action_id for award in news_awards if award.news_id is not None]
    action_coin_mapping = {}
    total_coin = 0
    for action_id in action_ids:
        if action_id not in action_coin_mapping:
            action_coin_mapping[action_id] = _get_action_detail(action_id)['coin']
        coin = action_coin_mapping[action_id]
        total_coin += coin
    return total_coin


@cache('incentive_activity_topic_ids', ex=24 * 60 * 60, cache_on_memory=30, prefix=RedisKeyPrefix.BONUSES)
def get_incentive_topic_ids():
    topics = mysql_client.retrieve_objects_by_conditions(ActivityTopic, ActivityTopic.status == 1)
    return [int(topic.topic_id) for topic in topics]
