"""
定时更新feeds里面的数据
"""
import datetime
import json
import random
import time
from typing import List

import arrow
import numpy as np
import requests
from scipy import stats

from common import loggers, config
from common.constants import FLASH_BLACK_ECOMMERCE_IDS, USE_MAPPING_SELL
from common.constants import STATISTIC
from common.es_client import es_client, ESClient
from common.redisclient import RI_CATEGORY, RI_HOT, RI_FLASH_DELAS, RI_CATEGORY_WITHOUT_S, RI_CLICK_HOT, \
    RI_CLICK_FLASH_DEAL_HOT, RI_SELL_HOT, RI_HOT_JSON, RI_SELL_HOT_JSON, DEAL_CACHE_PATTERN, RI_SHARE_DEALS, \
    ZSET_HOT_DEALS, ZSET_SELL_HOT_DEALS, RI_GENDER_HOT, CASHBACK_RECOMMEND_FEEDS, CASHBACK_CHANNEL_FEEDS, RI_CHANNEL
from common.sql_models import FlashDeal, ShareDeals, NativeCategory, SearchHistory, CategoryMapping, FlashGoCategory
from common.utils import list_to_chunk, pick_from_array, random_pick, UniqueItemList, OfferUtils
from deals.sql_models import Offer, _Deal
from favorite.sql_model import SelectedInterests
from offline.binlog_to_es.function import handler as es_handler
from offline.binlog_to_redis.function import RedisClient as LoadRedisClient, CHEAPEST_CATEGORY, LambdaHandler, \
    DEAL_CACHE, Deal
from offline.filters import filter_by_rules, filter_by_similar
from offline.loader.load_native_categories import CategoryNode, get_category_deals
from offline.loader.mysqlclient import mysql_client, MySQLClient
from offline.loader.redisclient import RedisClient as LoaderRedisClient

hot_size = 50000
category_size = 20000
channel_size = 20000
flash_size = 20000
D_START_END_TIME = 'D_S_E_TIME_%s'

logger = loggers.get_offline_logger(__name__, 'offline.log')


def set_logger(name):
    global logger
    logger = loggers.get_offline_logger(__name__, name + '.log')


def object_to_dict(instance):
    data = {k: v for k, v in instance.__dict__.items() if not k.startswith('_')}
    if hasattr(instance, 'created_time'):
        data['createdtime'] = instance.created_time.strftime('%Y-%m-%d %H:%M:%S')
    if hasattr(instance, 'start_time'):
        data['starttime'] = instance.start_time.strftime('%Y-%m-%d %H:%M:%S')
    if hasattr(instance, 'end_time'):
        data['endtime'] = instance.end_time.strftime('%Y-%m-%d %H:%M:%S')
    return data


def sort_and_filter_flash_feeds(redis_client, deals):
    deal_map = redis_client.batch_get_object(DEAL_CACHE, deals)

    def __score(deal_id):
        return deal_map.get(deal_id, {}).get('sales', 0)

    groups = {}
    for deal in deals:
        ecommerce_id = deal_map.get(deal, {}).get('ecommerce_id', 'other')
        groups.setdefault(ecommerce_id, list())
        groups[ecommerce_id].append(deal)

    for v in groups.values():
        v.sort(key=__score)
    new_deals = pick_from_array(groups.values(), len(deals))
    return new_deals


class RedisClient(LoaderRedisClient, LoadRedisClient):
    def __init__(self, host, port=6379, db=0, password=None):
        LoaderRedisClient.__init__(self, host, port, db, password)
        LoadRedisClient.__init__(self, host, port, db, password)

    def cache_category_deals(self, category_id: int, feeds: list, with_similar=True):
        if with_similar:
            name = RI_CATEGORY % category_id
        else:
            name = RI_CATEGORY_WITHOUT_S % category_id
        self._cache_feeds(name, feeds)

    def cache_flash_deals(self, feeds: list):
        self._cache_feeds(RI_FLASH_DELAS, feeds)

    def cache_share_deals(self, feeds: list):
        self._cache_feeds(RI_SHARE_DEALS, feeds)

    def cache_hot_deals(self, feeds: list, gender=None):
        if gender is None:
            self._cache_feeds(RI_HOT, feeds)
            self.redis_client.set(RI_HOT_JSON, json.dumps(feeds))
        else:
            self._cache_feeds(RI_GENDER_HOT % gender, feeds)
            self.redis_client.set(RI_GENDER_HOT % gender, json.dumps(feeds))

    def cache_sell_hot_deals(self, sell_id, feeds):
        name = RI_SELL_HOT % sell_id
        self._cache_feeds(name, feeds)
        name = RI_SELL_HOT_JSON % sell_id
        self.redis_client.set(name, json.dumps(feeds))

    def cache_click_hot_deals(self, feeds, flash_deal=False):
        if flash_deal:
            self._cache_feeds(RI_CLICK_FLASH_DEAL_HOT, feeds)
        else:
            self._cache_feeds(RI_CLICK_HOT, feeds)

    def cache_deal_click_score(self, deal_scores, date: datetime.datetime, flash_deal=False):
        name = 'DEAL_CLICK_SCORE_F_%s' if flash_deal else 'DEAL_CLICK_SCORE_%s'
        return self.cache_object(name % date.strftime('%Y%m%d'), deal_scores, ex=3 * 24 * 60 * 60)

    def get_deal_click_scores(self, date: datetime.datetime, flash_deal=False):
        name = 'DEAL_CLICK_SCORE_F_%s' if flash_deal else 'DEAL_CLICK_SCORE_%s'
        result = self.get_object(name % date.strftime('%Y%m%d'))
        return result if result is not None else {}

    def cache_zset_hot_deals(self, deals_data, sell_id=None):
        def _get_score(deal_dict):
            statistic = STATISTIC.get(deal_dict['ecommerce_id'])
            sales = _get_indicator(deal_dict['sales'], statistic['s_sales'], statistic['a_sales'])
            comments = _get_indicator(deal_dict['comments'], statistic['s_comments'], statistic['a_comments'])
            view_count = _get_indicator(deal_dict['view_count'], statistic['s_view_count'], statistic['a_view_count'])
            stars = _get_indicator(deal_dict['stars'], statistic['s_stars'], statistic['a_stars'])
            return sales * 2 + stars + comments + view_count + deal_dict['is_hot']

        def _get_indicator(value, std, avg):
            if std == 0 or avg == 0:
                return 0
            else:
                return stats.norm.cdf((value - avg) / std)

        if sell_id is None:
            name = ZSET_HOT_DEALS
        else:
            name = ZSET_SELL_HOT_DEALS % sell_id
        click_mean = self.get_click_mean()
        click_standard = self.get_click_standard()
        click_count = self.batch_get_clicked_count(self.get_clicked_deals())
        pipeline = self._connection.pipeline()
        for deal_id, deal in deals_data.items():
            if deal_id in click_count:
                deal['is_hot'] = _get_indicator(click_count[deal['deal_id']], click_standard, click_mean)
            else:
                deal['is_hot'] = 0
            score = _get_score(deal)
            pipeline.zadd(name, {deal['deal_id']: score})
        pipeline.execute()


class LoadTask(object):
    def __init__(self, redis_client: RedisClient, mysql_client: MySQLClient, es_client: ESClient,
                 handler: LambdaHandler, es_handler=None):
        self.redis_client = redis_client
        self.mysql_client = mysql_client
        self.es_client = es_client
        self.handler = handler
        self.es_handler = es_handler

    def load_category_feeds(self):
        category_tree = CategoryNode.from_json(self.redis_client.get_category_tree())
        categories = self.redis_client.get_categories()
        categories.add(CHEAPEST_CATEGORY)
        sells = self.redis_client.get_sells(without_black_sells=True)
        for category in categories:
            sell_deals = []
            for sell in sells:
                if (sell in USE_MAPPING_SELL) and (category in {31, 40}):
                    new_category = 1 if category == 31 else 56
                    native_categories = self.mysql_client.get_mapping_native_category_ids(new_category)
                    deal_array = []
                    for ecom_category_id in native_categories:
                        native_node = category_tree.get_node(ecom_category_id)
                        deals = get_category_deals(native_node, sell)
                        deal_array.append(deals)
                    deals = pick_from_array(deal_array)[:category_size]
                else:
                    deals = self.redis_client.get_deals(category, sell)[:category_size]
                sell_deals.append(deals)
                logger.info('sell {} category {} deal size {}'.format(sell, category, len(deals)))
            feeds = pick_from_array(sell_deals, category_size)
            if category == CHEAPEST_CATEGORY:
                feed_length = len(feeds)
                # 低价产品由于更新频繁较低，随机让用户可以看到比较多的新数据
                feeds = filter_by_rules(feeds)
                recent_feeds = list(feeds[:500])
                random.shuffle(recent_feeds)
                unique_item = UniqueItemList()
                for deal_id in recent_feeds:
                    unique_item.append(deal_id)
                for deal_id in feeds:
                    unique_item.append(deal_id)
                feeds = unique_item.to_list()
                logger.info("category %s, len %s, after filter %s" % (category, feed_length, len(feeds)))
            self.redis_client.cache_category_deals(category, feeds)
            self.redis_client.cache_category_deals(category, feeds, False)
            logger.info("category %s, len %s" % (category, len(feeds)))

    def load_interest_category_feeds(self):
        category_tree = CategoryNode.from_json(self.redis_client.get_category_tree())
        interest_ids = [interest.id for interest in self.mysql_client.retrieve_objects_by_conditions(SelectedInterests,
                                                                                                     SelectedInterests.status == 1)]
        category_cache = {}
        for interest_id in interest_ids:
            category_ids = self.mysql_client.get_interests_category_ids(interest_id)
            for sell_id in self.redis_client.get_sells(without_black_sells=True):
                cate_array = []
                for category_id in category_ids:
                    if category_id in category_cache:
                        deal_ids = category_cache.get(category_id)
                    else:
                        node = category_tree.get_node(category_id)
                        deal_ids = get_category_deals(node, sell_id)
                        category_cache[category_id] = deal_ids
                    if len(deal_ids) > 0:
                        cate_array.append(deal_ids)
                deals = pick_from_array(cate_array)
                self.redis_client.cache_interest_deals(interest_id, sell_id, deals)
                logger.info('cache interest {} deals, size'.format(interest_id, len(deals)))

    def clean_data(self):
        categories = self.redis_client.get_categories()
        categories.add(CHEAPEST_CATEGORY)
        sells = self.redis_client.get_sells(without_black_sells=False)
        logger.info("start clean data")
        for category in categories:
            for sell in sells:
                deals = self.redis_client.get_deals(category, sell)
                new_deals = self.batch_set_deal_cache(deals)
                deal_set1 = set(deals)
                deal_set2 = set(new_deals)
                for deal in (deal_set1 - deal_set2):
                    logger.info("delete deal %s" % deal)
                    self.redis_client.del_deal(deal)

        # 清理低价格的数据
        category = CHEAPEST_CATEGORY
        for sell in sells:
            deal_ids = self.redis_client.get_deals(category, sell)
            deals = self.mysql_client.retrieve_deals_by_deal_id_list(deal_ids)
            for deal in deals:
                if not (5000 < deal.current_price <= 30000):
                    logger.info("del cheapest deal %s" % deal.id)
                    self.redis_client.del_deal(deal.id, category_id=category)
        logger.info("end clean data")

    def cache_sell_hot_deals(self, array, sell_id, hot_deal_ids=None):
        if hot_deal_ids is None:
            hot_deal_ids = []
        deals = UniqueItemList()
        for deal_id in hot_deal_ids:
            deals.append(deal_id)
        for deal_id in pick_from_array(array, hot_size * 2):
            deals.append(deal_id)
        deals = deals.to_list()
        logger.info('10th deals %s' % deals[:10])
        sell_feeds = self.filter_by_deal_cache(deals)
        sell_feeds = list(filter_by_rules(sell_feeds))[:hot_size]
        self.redis_client.cache_sell_hot_deals(sell_id, sell_feeds)
        logger.info("sell {}, hot size {}, {}".format(sell_id, len(sell_feeds), sell_feeds[:10]))

    def load_hot_feeds(self):
        base_category = [31, 40, 61, 51, 113]
        sells = self.redis_client.get_sells(without_black_sells=True)
        sell_weights = self.redis_client.get_weights()
        feed_list = []
        for sell in sells:
            sell_deals = []
            random.shuffle(base_category)
            categories = base_category + [135, 51, 61, 68, 74, 80, 93, 104, 113, 126, 144, 149, 156]
            for category in categories:
                deals = self.redis_client.get_deals(category, sell)[:hot_size]
                if category in base_category:
                    size = hot_size // len(base_category)
                else:
                    # 暂时对laz进行特殊处理, 因为laz的品类都归到了others里面了
                    if sell == 2:
                        size = hot_size // len(base_category)
                    else:
                        size = hot_size // (len(base_category) * 10)
                deals = deals[:size]
                sell_deals.append(deals)

            # 增加热门搜索的deal
            current_sell_deal_ids = set()
            hot_deals = []  # 暂时不加载hot deals
            logger.info('%s hot deal %s' % (sell, len(hot_deals)))
            hot_deal_ids = []
            for hot_deal in hot_deals:
                if 'deal_id' in hot_deal:
                    deal_id = int(hot_deal['deal_id'])
                    if deal_id not in current_sell_deal_ids:
                        hot_deal_ids.append(deal_id)
                        current_sell_deal_ids.add(deal_id)
            logger.info('%s hot deal %s(after filter), 10th %s, size %s' % (
                sell, len(hot_deal_ids), hot_deal_ids[:10], len(hot_deal_ids)))
            self.cache_sell_hot_deals(sell_deals, sell, hot_deal_ids)
            feed_list.append(pick_from_array(sell_deals))

        weights = [sell_weights.get(int(sell), 0.001) for sell in sells]
        logger.info('weights for sells %s,%s' % (weights, sells))
        feeds = self.filter_by_deal_cache(random_pick(feed_list, weights, hot_size * 2))
        feeds = list(filter_by_rules(feeds))[:hot_size]
        self.redis_client.cache_hot_deals(feeds)
        logger.info("hot size %s" % len(feeds))
        self._cache_hot_deals(feeds[:200])

    @staticmethod
    def _cache_hot_deals(feeds):
        try:
            logger.info('deals len %s' % len(feeds))
            logger.info("cache data")
            resp = requests.post('http://dev.hadoop.network/sales/deals/load_deal_details/', json=feeds,
                                 timeout=30)
            logger.info("cache data end %s" % resp.text)
        except:
            logger.exception('cache hot deal error')

    def load_channel_feeds(self):
        # 31 Men Fashion
        # 32 Women Fashion
        # 33 Food & Drink
        channel_categories = {
            1: [CHEAPEST_CATEGORY],
            2: [31],
            3: [40],
            4: [135],
        }
        for channel in channel_categories:
            category_deals = []
            for category in channel_categories[channel]:
                category_deals.append(self.redis_client.get_deal_ids_by_category(category))
            feeds = pick_from_array(category_deals, channel_size)
            self.redis_client.cache_channel_feeds(channel, self.filter_by_deal_cache(feeds))
            logger.info("channel %s %s" % (channel, len(feeds)))
            self._cache_hot_deals(feeds[:200])

    def _cache_start_and_end_time(self, deals: list, deal_type='flash'):
        items = list_to_chunk(deals, 200)
        for item in items:
            if deal_type == 'flash':
                deals = self.mysql_client.retrieve_objects_by_conditions(FlashDeal, FlashDeal.deal_id.in_(
                    item))  # type: List[FlashDeal]
            else:
                deals = self.mysql_client.retrieve_objects_by_conditions(ShareDeals, ShareDeals.deal_id.in_(
                    item))
            self.redis_client.batch_cache_start_and_end_time([deal.to_json() for deal in deals])

    def get_flash_deals(self):
        from common.sql_models import FlashDeal
        min_start_time = datetime.datetime.now() - datetime.timedelta(days=10)
        max_end_time = datetime.datetime.now() + datetime.timedelta(days=10)
        flash_deals = self.mysql_client.retrieve_objects_by_conditions(FlashDeal,
                                                                       FlashDeal.start_time >= min_start_time,
                                                                       FlashDeal.end_time <= max_end_time)
        flash_deal_ids = [deal.deal_id for deal in flash_deals]
        deals = self.mysql_client.retrieve_deals_by_deal_id_list(flash_deal_ids)
        flash_deal_ids = [deal.id for deal in deals if deal.ecommerce_id not in FLASH_BLACK_ECOMMERCE_IDS]
        logger.info('flash deal which on going size %s' % len(flash_deal_ids))
        return flash_deal_ids

    def load_flash_feeds(self):
        flash_deals = self.get_flash_deals()
        share_deals = {deal.deal_id for deal in self.mysql_client.get_share_deals()}
        deal_list = [deal_id for deal_id in flash_deals if deal_id not in share_deals]
        logger.info('amount of flash deals which also are share deals: {}'.format(len(flash_deals) - len(deal_list)))
        deals = sort_and_filter_flash_feeds(self.redis_client, deal_list)
        self.redis_client.batch_delete_object([DEAL_CACHE_PATTERN % (deal_id, 0) for deal_id in deal_list])
        self.batch_get_or_cache_deal_cache(deal_list, delete_old_data=True)
        # 缓存开始和结束时间
        self._cache_start_and_end_time(deals)
        # 删除过期的数据
        ret = {}
        for index in range(0, len(deals), 100):
            deal_list = deals[index: index + 100]
            flash_deals = self.redis_client.batch_get_start_and_end_time(deal_list)
            ret.update(**flash_deals)
        logger.info('cache start and end time deals %s' % len(ret))
        can_work_feeds = set()
        now = datetime.datetime.now().timestamp()
        ongoing_count = 0
        min_end_time = now - 60 * 60
        for v in ret.values():
            if v['end_time'] >= min_end_time:
                can_work_feeds.add(int(v['deal_id']))
            if v['start_time'] < now < v['end_time']:
                ongoing_count += 1
        logger.info("ongoing count %s" % ongoing_count)
        feeds = []
        for deal in deals:
            if int(deal) in can_work_feeds:
                feeds.append(deal)
        feeds = self.filter_by_deal_cache(feeds, flash=True)
        logger.info('filter by deal cache left %s' % len(feeds))
        count = len(feeds)
        feeds = filter_by_similar(feeds, rate=0.9)
        logger.info('flash filter by rules, before filter %s, after filter %s' % (count, len(feeds)))
        self.redis_client.cache_flash_deals(feeds)
        self._cache_hot_deals(feeds)

    def batch_set_deal_cache(self, deal_ids: list) -> list:
        return list(self.batch_get_or_cache_deal_cache(deal_ids).keys())

    def batch_get_or_cache_deal_cache(self, deal_ids: list, delete_old_data=False) -> dict:
        if delete_old_data:
            deal_caches = {}
        else:
            deal_caches = self.redis_client.batch_get_deal_cache(deal_ids)
        to_cache_deals = [deal_id for deal_id in deal_ids if deal_id not in deal_caches]
        deal_models = []
        for chunk in list_to_chunk(to_cache_deals, size=100):
            deals = self.mysql_client.retrieve_deals_by_deal_id_list(chunk)
            for deal in deals:
                if deal.valid != 1:
                    continue
                deal_models.append(Deal(**object_to_dict(deal)))
        self.redis_client.batch_cache_deals(deal_models)
        deal_caches = self.redis_client.batch_get_deal_cache(deal_ids)
        return deal_caches

    def filter_by_deal_cache(self, deal_ids, flash=False) -> list:
        if not flash:
            return list(deal_ids)
        logger.info("filter by deal cache top tenth deal %s, size %s" % (deal_ids[:10], len(deal_ids)))
        deal_cache = set(self.batch_set_deal_cache(deal_ids))
        valid_deals = set([str(deal_id) for deal_id in deal_cache])
        result = []
        for item in deal_ids:
            if str(item) in valid_deals:
                result.append(item)
        logger.info("end filter by deal cache top tenth deal %s, size %s" % (deal_ids[:10], len(result)))
        return result

    def load_recent_deals(self):

        def _get_score(deal_data):
            score1 = ((deal_data['comments'] / 5) / 3 + deal_data['stars'] / 3 + deal_data['view_count'] / 900) * 50 / 4
            if score1 >= 1 * 50:
                score1 = 50
            score2 = (deal_data['sales'] / 30) * 50
            return score1 + score2

        def to_dict(deal_data):
            return {'type': 'insert', 'data': deal_data}

        def handler_table(l, method):
            for item in l:
                method(self.redis_client, to_dict(item))

        now = arrow.utcnow()
        start_time = now.shift(minutes=-10, seconds=-10).isoformat()
        end_time = now.isoformat()
        for deal_ids in self.es_client.get_update_recently_deals(start_time, end_time):
            # 如果是deal被更新, 那么清理原本存在redis中的deal_cache
            self.redis_client.batch_delete_object([DEAL_CACHE_PATTERN % (deal_id, 0) for deal_id in deal_ids])
            # 存在删除但从新抓取的情况, 把新抓取的deals从最近删除列表中去掉
            self.redis_client.remove_deals_from_recent_del(deal_ids)
            deals_info = [deal_info for deal_info in self.es_client.batch_get_deals_detail(deal_ids)
                          if 'flash' not in deal_info or 'share' not in deal_info]
            # load native category
            native_deal_categories = []
            for deal in deals_info:
                try:
                    data = dict()
                    data['deal_id'] = deal['deal']['deal_id']
                    data['ecommerce_id'] = deal['deal']['ecommerce_id']
                    data['score'] = _get_score(deal['deal'])
                    data['native_category_id'] = sorted(deal['ecom_category'], key=lambda c: int(c['level']))[-1][
                        'category_id']
                    native_deal_categories.append(data)
                except:
                    pass
            self.redis_client.batch_set_native_category_deals(native_deal_categories)
            # load deal
            deals = [deal_info['deal'] for deal_info in deals_info]
            handler_table(deals, self.handler.process_table_deals)
            # load category
            deal_categories = []
            for deal_info in deals_info:
                for category in deal_info['category']:
                    deal_categories.append({'deal_id': deal_info['deal_id'],
                                            'category_id': category['category_id'],
                                            'level': category['level']})
            handler_table(deal_categories, self.handler.process_table_deal_category)
            logger.info('load deals size %s, top tenth deal %s' % (len(deals_info),
                                                                   [deal['deal_id'] for deal in deals_info][:10]))

    def load_hot_deal_by_score(self):
        # 缓存click的平均值和标准差
        self.load_click_mean_and_std()

        # 按商家缓存新算法下的hot deals
        sell_ids = self.redis_client.get_sells(without_black_sells=True)

        for sell_id in sell_ids:
            sell_deals = self.redis_client.get_hot_deal_ids_by_sell(sell_id)
            for item in list_to_chunk(sell_deals, size=2000):
                deals_data = mysql_client.retrieve_deals_by_deal_id_list(item, to_dict=True)
                self.redis_client.cache_zset_hot_deals(deals_data, sell_id)
            logger.info('sell {}, zset hot size: {}'.format(sell_id, len(sell_deals)))

        # 缓存推荐的zset_hot_deal
        feeds = self.redis_client.get_json_hot_deal()
        deals_data = self.mysql_client.retrieve_deals_by_deal_id_list(feeds, to_dict=True)
        self.redis_client.cache_zset_hot_deals(deals_data)
        logger.info('cache {} zet hot deal'.format(len(deals_data)))

    @staticmethod
    def filter_invalid_deals(feeds):
        return filter_by_rules(feeds)

    def load_click_feeds(self, flash_deal=False):
        today = datetime.datetime.utcnow()
        clicked_count = self.redis_client.batch_get_clicked_count(self.redis_client.get_clicked_deals())

        # 获取昨天的分数
        recent_hot = self.redis_client.get_deal_click_scores(today - datetime.timedelta(days=1), flash_deal=flash_deal)
        deal_ids = set(clicked_count.keys()) | set(recent_hot.keys())
        hots = {}

        # 计算现在的分数
        for deal_id in deal_ids:
            hots[int(deal_id)] = recent_hot.get(deal_id, 0) * 0.8 + clicked_count.get(deal_id, 0)

        # 排名
        deal_cache = self.batch_get_or_cache_deal_cache(list(hots.keys()))
        deal_type = 'F' if flash_deal else 'N'
        hots = {k: v for k, v in hots.items() if
                k in deal_cache and deal_cache[k].get('type', '') == deal_type and deal_cache[k].get('current_price',
                                                                                                     0) > 30000}
        deals = filter_by_rules(
            sorted(list(hots.keys()), key=lambda deal_id: hots.get(deal_id, 0), reverse=True))[:2000]
        self.redis_client.cache_deal_click_score({deal_id: hots.get(deal_id) for deal_id in deals}, today,
                                                 flash_deal=flash_deal)
        logger.info('click feeds len %s, first 10th %s' % (len(deals), deals[:10]))
        self.redis_client.cache_click_hot_deals(deals, flash_deal=flash_deal)

    def load_share_feeds(self):
        share_deals = self.mysql_client.get_share_deals()
        logger.info('share count: {}'.format(len(share_deals)))
        flash_deals = set(self.get_flash_deals())
        deal_ids = [deal.deal_id for deal in share_deals if deal.deal_id not in flash_deals]
        logger.info('after filter by flash: {}'.format(len(deal_ids)))
        deals = sort_and_filter_flash_feeds(self.redis_client, deal_ids)
        self.redis_client.batch_delete_object([DEAL_CACHE_PATTERN % (deal_id, 0) for deal_id in deal_ids])
        self.batch_get_or_cache_deal_cache(deal_ids, delete_old_data=True)

        # 缓存开始和结束时间
        self._cache_start_and_end_time(deals, deal_type='share')

        # 删除过期的数据
        ret = {}
        for index in range(0, len(deals), 100):
            deal_list = deals[index: index + 100]
            share_deals = self.redis_client.batch_get_start_and_end_time(deal_list)
            ret.update(**share_deals)
        can_work_feeds = set()
        now = datetime.datetime.now().timestamp()
        share_count = 0
        for v in ret.values():
            if now - v['end_time'] <= 60 * 60:
                can_work_feeds.add(int(v['deal_id']))
            if v['start_time'] < now < v['end_time']:
                share_count += 1
        logger.info("after filter by time: %s" % share_count)
        feeds = []
        for deal in deals:
            if int(deal) in can_work_feeds:
                feeds.append(deal)

        feeds = self.filter_by_deal_cache(feeds, flash=True)
        count = len(feeds)
        feeds = filter_by_similar(feeds, rate=0.9)
        logger.info('Share filter by rules, before filter %s, after filter %s' % (count, len(feeds)))
        self.redis_client.cache_share_deals(feeds)
        self._cache_hot_deals(feeds)

    def load_click_mean_and_std(self):
        date_str = datetime.datetime.now().strftime('%Y%m%d')
        click_count = self.redis_client.batch_get_clicked_count(list(self.redis_client.get_clicked_deals()))
        logger.info('{} deals had been click in {}'.format(len(click_count), date_str))
        length = len(click_count)
        total = 0
        values = []
        for value in click_count.values():
            value = int(value)
            values.append(value)
            total += value
        mean = total / length

        std_total = 0
        for value in values:
            std_total += (value - mean) ** 2
        standard = (std_total / length) ** 0.5
        logger.info('deal click mean is {}, standard is {}'.format(mean, standard))
        self.redis_client.cache_click_statistic(mean, standard)

    def get_category_count(self, deal_ids, native=False):
        """计算deals的native类别的count"""
        ret = {}
        for items in list_to_chunk(deal_ids, size=400):
            categories = self.mysql_client.batch_get_deals_categories(items, native=native, to_dict=True)
            if len(categories) == 0:
                continue
            for deal_id, category in categories.items():
                if native:
                    category_id = sorted(category.items(), key=lambda item: item[1])[-1][1]
                else:
                    category_id = category.get(2)
                ret[category_id] = ret.get(category_id, 0) + 1
        return ret

    def cache_category_sell_mapping(self, category_ids):
        for item in list_to_chunk(category_ids):
            categories = self.mysql_client.retrieve_objects_by_conditions(NativeCategory, NativeCategory.id.in_(item))
            self.redis_client.batch_cache_category_sell_mapping(categories)

    def _load_gender_fav_cate(self, gender):
        wins = self.get_category_count(list(self.redis_client.get_clicked_deals(gender=gender)), native=True)
        for cate_id, clicks in wins.items():
            self.redis_client.cache_gender_click_count(gender, cate_id, clicks)
        logger.info('{} click categories, size {}'.format(gender, len(wins)))
        trails = self.get_category_count(list(self.redis_client.get_recommend_show(gender=gender)), native=True)
        for cate_id, show in trails.items():
            self.redis_client.cache_gender_show_count(gender, cate_id, show)
        logger.info('{} show categories, size {}'.format(gender, len(wins)))

    @staticmethod
    def _pick_deal_for_sell(clicks, shows, deal_map, batch_size):
        result = UniqueItemList()
        for i in range(1000):
            for category_id in list(deal_map.keys()):
                if len(deal_map[category_id]) <= 0:
                    del deal_map[category_id]
            if len(deal_map) <= 0:
                return result.to_list()[:batch_size]
            current_scores = []
            for category_id in deal_map:
                a = 1 + clicks.get(category_id, 1)
                b = 1 + shows.get(category_id, 1) - clicks.get(category_id, 1)
                b = 1 if b <= 0 else b
                a = 1 if a <= 0 else a
                for j in range(0, 100):
                    score = np.random.beta(a, b)
                    current_scores.append((score, category_id))
            current_scores = sorted(current_scores, key=lambda t: t[0], reverse=True)[:1000]
            for _, category_id in current_scores:
                if len(deal_map[category_id]) > 0:
                    result.append(deal_map[category_id].pop(0))
            if len(result) > batch_size:
                return result.to_list()[:batch_size]
        return result.to_list()[:batch_size]

    def _load_gender_hot_feeds_random(self, gender):
        category_ids = self.redis_client.get_leaf_categories()
        sells = self.redis_client.get_sells(without_black_sells=True)
        self.cache_category_sell_mapping(category_ids)
        logger.info('cache {} categories-sells mapping'.format(len(category_ids)))
        sell_categories = self.redis_client.batch_get_category_sell_mapping(category_ids, divide_by_sell=True)
        sell_weights = self.redis_client.get_weights()
        feed_list = []
        for sell_id in sells:
            category_ids = sell_categories.get(sell_id, [])
            logger.info("%s have categories size %s, top 10 %s" % (sell_id, len(category_ids), category_ids[:10]))
            deal_maps = {}
            clicks, shows = self.redis_client.batch_get_clicks_and_shows(gender, category_ids)
            for category_id in category_ids:
                deals = self.redis_client.get_native_category_deals(category_id, sell_id)
                deal_maps[category_id] = deals
            sell_feeds = self._pick_deal_for_sell(clicks, shows, deal_maps, hot_size)
            self.redis_client.cache_sell_gender_hot_deals(sell_id, gender, sell_feeds)
            logger.info('cache {} {} hot deals, size {}'.format(sell_id, gender, len(sell_feeds)))
            feed_list.append(sell_feeds)
        weights = [sell_weights.get(int(sell), 0.001) for sell in sells]
        logger.info('weights for sells %s,%s' % (weights, sells))
        feeds = self.filter_by_deal_cache(random_pick(feed_list, weights, hot_size * 2))
        feeds = list(filter_by_rules(feeds))[:hot_size]
        self.redis_client.cache_hot_deals(feeds, gender=gender)
        logger.info("%s hot size %s" % (gender, len(feeds)))
        self._cache_hot_deals(feeds[:200])

    def load_gender_data(self):
        genders = ['Male', 'Female']
        for gender in genders:
            self._load_gender_fav_cate(gender)
            self._load_gender_hot_feeds_random(gender)

    def storage_hot_query(self):
        hot_query = self.redis_client.get_hot_query_yesterday()
        if hot_query is not None:
            hot_query = {word: count for word, count in
                         sorted(hot_query.items(), key=lambda word_count: int(word_count[1]), reverse=True)[:1000]}
            date_time = datetime.datetime.now() - datetime.timedelta(days=1)
            record = SearchHistory(date_time=date_time, query_json_data=json.dumps(hot_query))
            self.mysql_client.create_object(record)
            logger.info(f'Cache search history, size {len(hot_query)}.')

    def storage_user_app_version(self):
        date_str = (datetime.datetime.now() - datetime.timedelta(days=1)).strftime('%Y%m%d')
        data = self.redis_client.get_user_app_version(date_str, del_old_data=True)
        logger.info('{} get user app version, size {}.'.format(date_str, len(data)))
        for user_id, app_version in data:
            mysql_client.updated_or_created_user_version(user_id, app_version)

    def load_cashback_feeds(self):

        def _get_score(deal: Deal):
            score1 = ((deal.comments / 5) / 3 + deal.stars / 3 + deal.view_count / 900) * 50 / 4
            if score1 >= 1 * 50:
                score1 = 50
            score2 = (deal.sales / 30) * 50
            return score1 + score2

        def _load_cashback_recommend(deal_list: List[_Deal]):
            deal_ids = [deal.id for deal in deal_list]
            self.redis_client.cache_object(CASHBACK_RECOMMEND_FEEDS, deal_ids, ex=60 * 60)
            logger.info(f"cache recommend cashback, size {len(deal_ids)}, 10th {deal_ids[:10]}")

        def _load_cashback_cheapest(deal_list: List[_Deal]):
            channel_id = -3
            deal_ids = [deal.id for deal in deal_list if deal.current_price < 30000]
            self.redis_client.cache_channel_feeds(channel_id, deal_ids)
            logger.info(f"cache cheapest cashback, channel_id {channel_id}, size {len(deal_ids)}, 10th {deal_ids[:10]}")

        def _load_cashback_high_rate(deal_list: List[_Deal], high_rate_deal_ids: List[int]):
            channel_id = -4
            high_rate_deal_ids = set(high_rate_deal_ids)
            deal_ids = [deal.id for deal in deal_list if deal.id in high_rate_deal_ids]
            self.redis_client.cache_channel_feeds(channel_id, deal_ids)
            logger.info(f"cache highrate cashback, channel_id {channel_id}, size {len(deal_ids)}, 10th {deal_ids[:10]}")

        def _load_cashback_channels(deal_list: List[_Deal]):
            if len(deal_list) > 50000:
                deal_list = deal_list[:50000]
            channel_categories = {
                -5: [159, 540]
            }
            mapping = {}
            for deal in deal_list:
                ecom_cate_ids = self.mysql_client.get_category_ids_by_deal_id(deal.id, native=True).values()
                for ecom_cate_id in ecom_cate_ids:
                    category_deal_ids = mapping.get(ecom_cate_id, [])
                    category_deal_ids.append(deal.id)
                    mapping[ecom_cate_id] = category_deal_ids
            for channel_id, category_ids in channel_categories.items():
                for level in [2, 3]:
                    categories = self.mysql_client.retrieve_objects_by_conditions(FlashGoCategory,
                                                                                  FlashGoCategory.parent_id.in_(
                                                                                      category_ids),
                                                                                  FlashGoCategory.level == level,
                                                                                  FlashGoCategory.valid == 1)
                    category_ids += [instance.id for instance in categories]

                cate_map = self.mysql_client.retrieve_objects_by_conditions(CategoryMapping,
                                                                            CategoryMapping.fg_cate_id.in_(category_ids))
                total_ecom_cate_ids = [mapping.ecom_cate_id for mapping in cate_map]
                array = [mapping.get(ecom_cate_id, []) for ecom_cate_id in total_ecom_cate_ids]
                channel_deal_ids = pick_from_array(array)
                unique_deal_ids = UniqueItemList()
                for deal_id in channel_deal_ids:
                    unique_deal_ids.append(deal_id)
                channel_deal_ids = unique_deal_ids.to_list()
                self.redis_client.cache_channel_feeds(channel_id, channel_deal_ids)
                logger.info(f"cache cashback, channel_id {channel_id}, size {len(channel_deal_ids)}, "
                            f"10th {channel_deal_ids[:10]}")

        min_timestamp = time.time() - 10 * 24 * 60 * 60
        max_timestamp = time.time() + 24 * 60 * 60
        offers = self.mysql_client.retrieve_objects_by_conditions(Offer,
                                                                  Offer.start_timestamp > min_timestamp,
                                                                  Offer.end_timestamp < max_timestamp,
                                                                  Offer.end_timestamp > time.time() + 60 * 30,
                                                                  Offer.status == 1)
        offers_deal_ids = [offer.deal_id for offer in offers if offer.base_bonus > 0]
        deals = self.mysql_client.retrieve_deals_by_deal_id_list(offers_deal_ids)
        deals = sorted(deals, key=_get_score, reverse=True)
        logger.info(f"get offers deals, size {len(deals)}, 10th {[deal.id for deal in deals[:10]]}")

        # 缓存recommend返现商品
        _load_cashback_recommend(deals)

        # 缓存低价返现channel商品
        _load_cashback_cheapest(deals)

        # 缓存高返现率channel返现商品
        filter_rate = OfferUtils.get_filter_rate(0.1, 0.8)
        _load_cashback_high_rate(deals, [offer.deal_id for offer in offers if offer.bonus_rate > filter_rate])

        # 缓存电子产品channel返现商品
        _load_cashback_channels(deals)


def load_data(action=None):
    # redis_client = RedisClient('ip-172-31-6-101.ap-southeast-1.compute.internal', 6379, db=0, password='8888@swdcggz')
    redis_config = config.OFFLINE_REDIS_CLIENT_CONFIG
    redis_client = RedisClient(**redis_config)
    handler = LambdaHandler(redis_config['host'], redis_config['port'], redis_db=redis_config['db'],
                            redis_password=redis_config['password'])
    load_task = LoadTask(redis_client, mysql_client, es_client, handler=handler, es_handler=es_handler)
    logger.info("start")
    if action == 'flash':
        set_logger(action)
        load_task.load_flash_feeds()
    elif action == 'share':
        set_logger(action)
        load_task.load_share_feeds()
    elif action == 'redis-normal':
        set_logger(action)
        load_task.load_recent_deals()
    elif action == 'zset-hot-deal':
        set_logger(action)
        load_task.load_hot_deal_by_score()
    elif action == 'gender':
        set_logger(action)
        load_task.load_gender_data()
    elif action == 'hot-query':
        set_logger(action)
        load_task.storage_hot_query()
    elif action == 'app-version':
        set_logger(action)
        load_task.storage_user_app_version()
    elif action == 'interest':
        set_logger(action)
        load_task.load_interest_category_feeds()
    elif action == "cashback":
        set_logger(action)
        load_task.load_cashback_feeds()
    else:
        load_task.load_hot_feeds()
        load_task.load_category_feeds()
        load_task.load_channel_feeds()
        load_task.load_click_feeds()
    logger.info("end")


def main(action=None):
    import sys

    if action is None and len(sys.argv) > 1:
        action = sys.argv[1]
    try:
        load_data(action)
    except:
        logger.exception('load feeds error')


if __name__ == '__main__':
    main()
