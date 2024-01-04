import os
import queue
import threading

import itertools
import time
from random import shuffle
from users.views import get_user_gender
from common import utils, loggers
from common.constants import CACHE_FEEDS_TIMEOUT, FEEDS_SHORTCUT_LENGTH, CACHE_FEEDS_LENGTH, \
    PRE_LOAD_CACHE_FEEDS_TIMEOUT
from common.mysqlclient import mysql_client
from common.sql_models import DEALS_CATEGORIES_MAP
from common.redisclient import redis_client, cache
from common.utils import UniqueItemList
from favorite.sql_model import UserInterests, Interests
from home.models import ChannelDealItem


def _need_update_feeds(user_id: str):
    updated_time = redis_client.get_update_time_of_feeds(user_id=user_id)
    now_time = int(time.time())
    return now_time - updated_time > CACHE_FEEDS_TIMEOUT


def _need_preload_feeds(user_id: str):
    updated_time = redis_client.get_update_time_of_feeds(user_id=user_id)
    now_time = int(time.time())
    return now_time - updated_time > PRE_LOAD_CACHE_FEEDS_TIMEOUT


RECOMMEND_BY_FAV_CAT = False

logger = loggers.get_logger(__name__)


def _filter_invalid_deals(feeds):
    del_deals = redis_client.get_recent_del_deals()
    return [int(deal_id) for deal_id in feeds if int(deal_id) not in del_deals]


def get_user_fav_categories(user_id):
    # 暂时不按用户的需求来过滤，因为类型相同的，有过多相似的deal
    if RECOMMEND_BY_FAV_CAT:
        interest_category = {str(o.id): o.category_id for o in mysql_client.retrieve_all_objects(Interests)}
        user_interests = mysql_client.retrieve_objects_by_conditions(UserInterests, UserInterests.user_id == user_id)
        categories = set()
        for user_interest in user_interests:
            if str(user_interest.interest_id) in interest_category:
                categories.add(interest_category[str(user_interest.interest_id)])
        return list(categories)
    else:
        return []


def get_weighted_hot_deals(user_id):
    sell_weights = redis_client.get_weights()
    sells_list = list(sell_weights.keys())
    weights_list = [sell_weights[sell_id] for sell_id in sells_list]

    sell_deals = redis_client.get_hot_deal_ids_by_sells(sells_list)
    hot_deals = set()
    for deals in sell_deals.values():
        hot_deals |= set(deals)
    filtered_hot_deals = set(filter_by_users(user_id, list(hot_deals)))
    for sell_id in sells_list:
        sell_deals[sell_id] = [deal_id for deal_id in sell_deals[sell_id] if int(deal_id) in filtered_hot_deals]

    return utils.random_pick([sell_deals[sell_id] for sell_id in sells_list], weights_list)


def get_weighted_zset_hot_deals(user_id):
    sell_weights = redis_client.get_weights()
    sells_list = list(sell_weights.keys())
    weights_list = [sell_weights[sell_id] for sell_id in sells_list]
    sell_deals = []
    for sell_id in sells_list:
        deals = redis_client.get_sell_zset_hot_deals(sell_id)
        sell_deals.append(deals)
    feeds = utils.random_pick(sell_deals, weights_list)
    return filter_by_users(user_id, feeds)


def get_gender_weighted_hot_deals(user_id, gender):
    sell_weights = redis_client.get_weights()
    sells_list = list(sell_weights.keys())
    weights_list = [sell_weights[sell_id] for sell_id in sells_list]
    feed_array = []
    for sell_id in sells_list:
        deals = redis_client.get_sell_gender_hot_deals(sell_id, gender)
        feed_array.append(deals)
    feeds = utils.random_pick(feed_array, weights_list)
    return filter_by_users(user_id, feeds)


def _update_recommend_feeds(user_id: str, update_by_weights=False):
    user_id = str(user_id)
    gender = get_user_gender(user_id)
    # 增加热门的deals
    if len(user_id) > 0 and (gender is not None) and (user_id[-1] == '1' or
                                                      user_id == 'Facebook_101300667608677' or
                                                      user_id == 'Facebook_345527022947127' or
                                                      user_id == 'Facebook_127372291695409'):
        old_hot_deals = redis_client.get_gender_json_hot_deal(gender)
        if len(old_hot_deals) == 0:
            old_hot_deals = redis_client.get_json_hot_deal()
    else:
        old_hot_deals = redis_client.get_json_hot_deal()
    # 是否按商家的比重来组成feeds
    if update_by_weights:
        if len(user_id) > 0 and (gender is not None) and (user_id[-1] == '1' or
                                                          user_id == 'Facebook_101300667608677' or
                                                          user_id == 'Facebook_345527022947127' or
                                                          user_id == 'Facebook_127372291695409'):
            hot_deals = get_gender_weighted_hot_deals(user_id, gender)
            if len(hot_deals) == 0:
                hot_deals = get_weighted_hot_deals(user_id)
        else:
            hot_deals = get_weighted_hot_deals(user_id)
    else:
        hot_deals = old_hot_deals

    # rank
    unique_item_list = utils.UniqueItemList()
    first_deals = list(hot_deals[:50])
    shuffle(first_deals)
    for deal in first_deals:
        unique_item_list.append(int(deal))
    for deal in hot_deals:
        unique_item_list.append(int(deal))
        if len(unique_item_list) >= CACHE_FLASH_FEED_SIZE:
            break

    deals = filter_by_users(user_id, unique_item_list.to_list(), True)
    if len(deals) > 0:
        redis_client.cache_feeds(user_id, deals)


def _merge_feeds(feeds_dict: dict):
    return [x for x in itertools.chain.from_iterable(itertools.zip_longest(feeds_dict.values())) if x]


class Consumer(object):
    def __init__(self, maxsize=100):
        self._queue = queue.Queue(maxsize=maxsize)
        self.worker = threading.Thread(name='consumer-%s' % os.getpid(), target=self.work)

    def start_consumer(self):
        if not self.worker.is_alive():
            self.worker.start()

    def work(self):
        while True:
            try:
                user_id, force = self._queue.get()
                if user_id is None:
                    time.sleep(1)
                else:
                    if force or _need_preload_feeds(user_id):
                        _update_recommend_feeds(user_id, update_by_weights=True)
            except:
                logger.exception('work error')
                time.sleep(1)

    def add(self, user_id):
        self.start_consumer()
        try:
            self._queue.put_nowait(user_id)
        except:
            logger.exception('put user_id(%s) error' % user_id)


_consumer = Consumer()


def get_recommend_feeds(user_id, count=8, with_impression=False):
    if _need_preload_feeds(user_id):
        _consumer.add((user_id, False))
    if _need_update_feeds(user_id):
        _update_recommend_feeds(user_id)
        _consumer.add((user_id, True))
    feeds = filter_by_users(user_id, redis_client.get_cache_feeds(user_id), with_impression)
    deals = _filter_invalid_deals(feeds)
    deals = deals[:count]
    if len(deals) < count:
        return []
    else:
        gender = get_user_gender(user_id)
        redis_client.set_impressed_feeds(user_id, deals, gender=gender)
        return deals


def get_deal_category(deal_id):
    categories = redis_client.get_deal_categories(deal_id)
    if categories is not None:
        return categories
    else:
        categories = [category.to_json() for category in
                      mysql_client.retrieve_objects_by_deal_id(DEALS_CATEGORIES_MAP, deal_id=deal_id)]
        redis_client.set_deal_categories(deal_id, categories)
        return categories


@cache(key=lambda deal_id, count: 'R_D_cat_%s_%s' % (deal_id, count), ex=10 * 60)
def get_deal_relative_feeds(deal_id, count):
    categories = {category['level']: category['category_id'] for category in get_deal_category(deal_id)}
    unique_item = UniqueItemList()
    for level in [3, 2, 1]:
        if level in categories:
            category_id = categories[level]
            deals = _filter_invalid_deals(redis_client.get_deal_ids_by_category(category_id, filter_by_similar=True))
            deals = deals[:count * 2]
            for _deal_id in deals:
                if int(_deal_id) != int(deal_id):
                    unique_item.append(_deal_id)
    raw_deals = unique_item.to_list()
    deal_caches = redis_client.batch_get_deal_cache(raw_deals)
    titles = set()
    deals = UniqueItemList()
    for deal_id in raw_deals:
        if int(deal_id) not in deal_caches:
            continue
        k = deal_id
        v = deal_caches[k]
        title = v.get("title", '')
        if title not in titles:
            titles.add(title)
            deals.append(int(k))
    for k in raw_deals:
        deals.append(int(k))
    deals = deals.to_list()[:count]
    shuffle(deals)
    return deals


def get_relative_feeds(deal_id, count=FEEDS_SHORTCUT_LENGTH, user_id=None):
    deals = get_deal_relative_feeds(deal_id, count)
    if len(deals) < count:
        return None
    else:
        if user_id is not None:
            redis_client.set_impressed_feeds(user_id, deals)
        return deals


def classify_by_impression(user_id, feeds):
    if user_id is None:
        return feeds, []
    if len(feeds) == 0:
        return [], []
    feeds = [int(deal_id) for deal_id in feeds]
    impressed_feeds = redis_client.get_impressed_feeds(user_id=user_id)
    result = UniqueItemList()
    result.append(*(filter(lambda deal_id: deal_id not in impressed_feeds, feeds)))
    return result.to_list(), [int(deal_id) for deal_id in feeds if int(deal_id) in impressed_feeds]


def filter_by_users(user_id, feeds, with_impression=False):
    unread_feeds, read_feeds = classify_by_impression(user_id, feeds)
    if with_impression:
        return unread_feeds + read_feeds
    else:
        return unread_feeds


CACHE_FLASH_FEED_SIZE = 2000


def get_channel_feeds(channel_id: int, user_id=None, count=8, record_impression=True, with_impression=False):
    deals = redis_client.get_deal_ids_by_channel(channel_id)
    if user_id is not None:
        deals = filter_by_users(user_id, deals, with_impression)
    deals = _filter_invalid_deals(deals)
    deals = deals[:count]
    if len(deals) != count:
        return None
    else:
        if record_impression:
            redis_client.set_impressed_feeds(user_id, deals)
        return deals


def get_custom_channel_feeds(channel_id: int, user_id=None, page_id=0, count=8):
    if user_id is not None:
        deals = _get_or_cache_custom_channel_feeds(user_id, channel_id, force_flush=(page_id == 0))
        deals = deals[_get_page_index(page_id, count)]
        if deals:
            redis_client.set_impressed_feeds(user_id, deals)
    else:
        deals = _get_or_cache_channel_feeds(channel_id)
        deals = _filter_invalid_deals(deals)
        deals = deals[_get_page_index(page_id, count)]
    return deals


def _get_or_cache_channel_feeds(channel_id):
    if channel_id in {1, 2, 3, 4}:
        raise ValueError('%s channel is not supported' % channel_id)
    channel_deals = redis_client.get_deal_ids_by_channel(channel_id)
    if channel_deals is None or len(channel_deals) == 0:
        deals = mysql_client.retrieve_objects_by_conditions(ChannelDealItem, ChannelDealItem.channel_id == channel_id,
                                                            limit=10000)
        channel_deals = [deal.deal_id for deal in deals]
        redis_client.cache_channel_feeds(channel_id, channel_deals, ex=30 * 60)
    return channel_deals


def _get_or_cache_custom_channel_feeds(user_id, channel_id, force_flush=False):
    feeds = redis_client.get_user_custom_channel_feeds(user_id, channel_id)
    if len(feeds) == 0 or force_flush:
        feeds = _get_or_cache_channel_feeds(channel_id)
        unread_feeds, read_feeds = classify_by_impression(user_id, feeds)
        shuffle(unread_feeds)
        shuffle(read_feeds)
        feeds = unread_feeds + read_feeds
        redis_client.cache_user_custom_channel_feeds(user_id, channel_id, feeds)
    return feeds


def _get_flash_feeds(user_id):
    cache_name = 'P_FEED_C_%s' % user_id
    deals = redis_client.get_object(cache_name)
    if deals is None:
        deals = list(redis_client.get_flash_deal())
        shuffle(deals)
        if user_id is not None:
            new_deals = set(filter_by_users(user_id, deals))
            old_deals = list(deals)
            deals = []
            for deal in new_deals:
                deals.append(deal)
            for deal in old_deals:
                if deal not in new_deals:
                    deals.append(deal)
            deals = _filter_invalid_deals(list(deals))
            shuffle(deals)
            redis_client.cache_object(cache_name, deals, ex=3 * 60)
    deal_times = redis_client.batch_get_start_and_end_time(deals)
    on_going_deals = []
    coming_deals = []
    invalid_deals = []
    now = int(time.time())
    for v in deal_times.values():
        if now >= v['start_time']:
            if now > v['end_time']:
                invalid_deals.append(v['deal_id'])
            else:
                on_going_deals.append(v['deal_id'])
        else:
            coming_deals.append(v['deal_id'])
    # check ongoing
    deal_caches = redis_client.batch_get_deal_cache(on_going_deals)
    new_on_going_deals = []
    for deal_id in on_going_deals:
        if deal_id in deal_caches and deal_caches[int(deal_id)].get('current_price', 0) > 0:
            new_on_going_deals.append(deal_id)
    return list(new_on_going_deals), list(coming_deals), list(invalid_deals)


CHEAPEST_CACHE_TIME = 10 * 60


def get_cheapest_feeds(page_id, count, user_id):
    cache_name = 'P_CHEAP_FEED_C_%s' % user_id
    deals = redis_client.get_object(cache_name)
    if deals is None or len(deals) == 0 or page_id == 0:
        deals = redis_client.get_deal_ids_by_channel(1)
        deals = _filter_invalid_deals(filter_by_users(user_id, deals, with_impression=True))
        deals = deals[:CACHE_FEEDS_LENGTH]
        redis_client.cache_object(cache_name, deals, ex=CHEAPEST_CACHE_TIME)
    feeds = deals[_get_page_index(page_id, count)]
    if len(feeds) == count:
        redis_client.set_impressed_feeds(user_id, feeds)
        return feeds
    else:
        return None


def get_flash_feeds(user_id=None, count=8):
    ongoing_deals, coming_deals, invalid_deals = _get_flash_feeds(user_id)
    deals = UniqueItemList()
    for deal in ongoing_deals:
        deals.append(deal)
    for deal in coming_deals:
        deals.append(deal)
    feeds = deals.to_list()
    if len(feeds) < count:
        for item in invalid_deals:
            feeds.insert(0, item)
    feeds = feeds[:count]
    if len(feeds) >= count:
        redis_client.set_impressed_feeds(user_id, feeds)
        return feeds
    else:
        return None


def _get_page_index(page_id, count):
    start_index = page_id * count
    end_index = (page_id + 1) * count
    return slice(start_index, end_index)


def get_ongoing_feeds(page_id, count, user_id):
    ongoing_deals, _, _ = _get_flash_feeds(user_id)
    total = (page_id + 1) * count
    feeds = ongoing_deals[:total]
    feeds = feeds[_get_page_index(page_id, count)]
    if len(feeds) >= count:
        redis_client.set_impressed_feeds(user_id, feeds)
        return feeds
    else:
        return None


def get_coming_feeds(page_id, count, user_id):
    _, coming_deals, _ = _get_flash_feeds(user_id)
    feeds = coming_deals[_get_page_index(page_id, count)]
    if len(feeds) >= count:
        redis_client.set_impressed_feeds(user_id, feeds)
        return feeds
    else:
        return None


def get_share_feeds(user_id, page_id, count):
    if user_id is not None:
        deals = redis_client.get_user_share_feeds(user_id)
        if page_id == 0:
            new_deals, old_deals = classify_by_impression(user_id, deals)
            shuffle(new_deals)
            shuffle(old_deals)
            load_deals = new_deals + old_deals
            redis_client.cache_user_share_feeds(user_id, load_deals)
    else:
        deals = redis_client.get_share_feeds()
    deals = deals[_get_page_index(page_id, count)]
    if deals and user_id is not None:
        redis_client.set_impressed_feeds(user_id, deals)
    return deals
