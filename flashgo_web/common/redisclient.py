import base64
import datetime
import math
import time
import uuid
from contextlib import contextmanager
from typing import Dict, Tuple, Set, List

import redis
from django.core.serializers.json import DjangoJSONEncoder

from common import utils, config
from common.constants import FEEDS_RECALL_LENGTH, RedisKeyPrefix
from common.memorycache import MemoryCache
from common.redismodels import *
from common.utils import list_to_chunk, UniqueItemList

# keys of reverse index
RI_HOT = "RI_HOT"
RI_CLICK_HOT = "RI_CLICK_HOT"
RI_CLICK_FLASH_DEAL_HOT = "RI_CLICK_HOT_F"
RI_CATEGORY = 'RI_CAT_%s'
RI_CATEGORY_WITHOUT_S = 'RI_CAT_W_S_%s'
RI_FLASH_DELAS = 'RI_FLASH_D'
RI_SHARE_DEALS = 'RI_SHARE_D'
RI_KEYWORD = 'RI_KEYWORD_%s'
RI_CHANNEL = 'RI_CHANNEL_%s'
RI_INDEX = 'RI_INDEX_%s_%s_%s'

# keys of user preference
U_P_CHANNEL = 'U_P_CHANNEL_%s'  # hashmap of channel_id and weight
U_P_CATEGORY = 'U_P_CATEGORY_%s'  # hashmap of category_id and weight
U_P_KEYWORD = 'U_P_KEYWORD_%s'  # hashmap of keyword and weight
U_P_FAV_CATS = 'U_P_FAV_CATES_C_%s'
U_P_FAV_CATS_RECENT = 'U_P_FAV_CATES_R_%s_%s'
U_FCM_TOKENS = 'U_FCM_T_%s'

# keys of user click recently
U_CLICK_RECENT_D = 'U_CLICK_RECENT_D_%s'
U_LOGIN_IP = 'U_LOGIN_IP_%s'

# keys of deal item
D_LIST = 'D_LIST'  # hashmap
D_DETAIL = 'D_DETAIL_%s'  # detail info of a deal, json string
DEAL_CACHE = 'D_TMP_CACHE_%s'
D_HOT_WORD_DEAL = 'D_HOT_WORD_DEAL_%s'
D_HOT_WORD_DEAL_URL = 'D_HOT_WORD_DEAL_URL_%s'
# DEAL_CACHE_PATTERN = 'DL_M_V_%s_%s'
DEAL_CACHE_PATTERN = 'DL_M_V2_%s_%s'

# 某个用户的feed流，超过若干时间更新一次，每一刷的时候会看上次更新时间是否超过阈值，如果超过则走计算流程更新该feed流，否则直接从里面获取
# Cache Feeds of User
C_F_U = 'C_F_U_%s'
C_F_U_JSON = 'C_F_U_JSON_%s'

# Cache Feeds Updated Time
C_F_U_T = 'C_F_U_T_%s'

# Cache Feeds of User which have been Impressed
C_F_U_I = 'C_F_U_I_%s'

# Cache deals which user clicked
C_F_U_C = 'C_F_U_C_%s'

# 频道feed流缓存
# Cache Feeds of Channel
C_F_C = 'C_F_C_%s'

# 某个用户deal浏览历史缓存
# Cache Deal User Brower
C_D_U_B = 'C_D_U_B_%s'
C_ACTIVE_USERS = 'C_ACTIVE_U_%s'
C_ACTIVE_USERS_NEWS = 'C_ACTIVE_U_NEWS_%s'

BATCH_SIZE = 100

# flash deal的开始时间和结束的缓存
D_START_END_TIME = 'D_S_E_TIME_%s'
# deal的类型
D_CATEGORIES = 'D_C_%s'

# 用来缓存一般的对象
O_CACHE = 'O_C_%s'
O_CACHE_DEAL = 'O_C_deal_%s_0'
# 用来存用户刷的page

P_U = 'P_U_%s_%s_%s_%s'

# deal维度的统计数据
# 点击
S_DEAL_CLICK = 'S_DEAL_C_%s_%s'
S_DEAL_CLICK_TIME = 'S_DEAL_TIME_C_%s_%s'
S_DEAL_CLICK_SETS = 'S_DEAL_SET_%s'
S_DEAL_CLICK_MEAN = 'S_DEAL_C_MEAN'
S_DEAL_CLICK_STANDARD = 'S_DEAL_C_STD'
# 展示
S_DEAL_IMPRESSION = 'S_DEAL_I_%s_%s'
# 收藏
S_DEAL_F = 'S_DEAL_F'
# 提醒
S_DEAL_R = 'S_DEAL_R'
# 搜索词 zsort
S_HOT_TERM = 'S_HOT_TERM'
S_HOT_WORD = 'S_HOT_WORD'
S_D_HOT_WORD = 'S_D_HOT_WORD_%s'
S_SHOW_HOT_WORDS = 'S_SHOW_HOT_WORDS'

PUSH_HISTORY = "PUSH_HISTORY"
LAUNCH_HISTORY = "LAUNCH_HISTORY"

# 记录删除的deals
RECENT_DEL_DEAL_ARRAY = 'RECENT_DEL_D_ARRAY'

DEAL_SELL_SET = 'D_SELL_SET'

RI_SELL_HOT = 'RI_HOT_S_%s'

SELL_WEIGHT = 'S_WEIGHTS'
DEAL_CATEGORY_SET = 'D_CATEGORY_SET'

HOT_CATEGORIES = 'HOT_CATEGORIES'
HOT_BASE_CATEGORIES = 'HOT_B_CATEGORIES'

RI_HOT_JSON = 'RI_HOT_JSON'
RI_SELL_HOT_JSON = 'RI_HOT_S_J_%s'

# deals with native categories
N_NEW_CATEGORY_DEALS = 'N_C_D_SET_%s_%s'

# flash deals' native lowest level category_id
F_NATIVE_LOWEST_CATEGORY = 'F_N_L_CATE'
PUSH_DEAL_SET = "PUSH_DEAL_SET"
PUSH_VIDEO_SET = "PUSH_VIDEO_SET"
PUSH_ARTICLE_SET = "PUSH_ARTICLE_SET"
PUSH_IMAGE_TEXT_SET = "PUSH_IMAGE_TEXT_SET"
# 首页的数据
ONLINE_BANNERS = 'H_OL_BANNERS'
TOP_CHANNELS = 'H_TOP_CHANNELS'
HOME_HOT_CATEGORIES = 'H_HOT_CATEGORIES'

# 用户获取定制channel时的索引
USER_CHANNEL_INDEX = 'U_C_I_%s_%s'

# 用户获取定制的channel的feeds
USER_CUSTOM_CHANNEL_FEEDS = 'U_C_F_%s_%s'

# 用户自己的share feeds
USER_SHARE_FEEDS = 'U_S_F_%s'

# 按新算法排序的HOT_deals
ZSET_HOT_DEALS = 'Z_HOT_D'
ZSET_SELL_HOT_DEALS = 'Z_HOT_D_%s'
SHARE_LINK = 'SHARE_LINKS_%s'

# 用户当天点击最多的类别
MOST_CLICK_CATEGORIES = 'MOST_C_CATE_%s'
# 分男女推荐展示的deals
SHOW_RECOMMEND_D = 'SHOW_RECOMMEND_D_SET_%s'
CLICK_RECOMMEND_D = 'CLICK_RECOMMEND_D_SET_%s'
# native 类别点击的概率zset
FAV_CATEGORIES_GENDER = "FAV_CATE_G_%s"
RI_GENDER_HOT = "RI_HOT_G_%s"
RI_HOT_SELL_GENDER = "RI_HOT_SELL_G_%s_%s"
# package names
APP_PACKAGE_NAMES = 'APP_PACKAGE_NAMES'
NEWS_LIKES_COUNT = 'N_L_Count_v2_%s'
UPDATE_LIKES_NEWS_IDS = 'N_update_likes'
# the category_ids of news
NEWS_CATEGORY_IDS = 'N_cate_%s'
# the news with same category
NEWS_of_SELL_CATEGORY = 'News_RI_Cate_%s_%s'
HOT_NEWS_FEEDS = 'HOT_NEWS'
HOT_NEWS_FEEDS_GENDER = 'HOT_NEWS_%s'
NEWS_CLICK_GENDER = 'N_Click_%s_%s'
USER_NEWS_CLICK_WITH_TIME = 'U_N_TIME_Click_%s_%s'

NEWS_PROFILE_CLICK = 'N_PROFILE_CLICK_%s'
NEWS_PROFILE_IMPRESSION = 'N_PROFILE_IMP_%s'
NEWS_PROFILE_DATE = 'N_PROFILE_DATE_%s'

NEWS_FAV_CATE_GENDER = 'N_fav_cate_%s'
NEWS_TYPE_FEEDS = 'N_Feeds_T_{}'
BLACK_SELLS_SET = 'BLACK_SELLS_SET'

RECOMMEND_VIDEO = 'V_U_F_%s'
USER_IMPRESSION_VIDEO = 'U_I_V_%s'

RECOMMEND_NEWS_FEEDS = 'N_U_F_%s'
USER_IMPRESSION_NEWS = 'N_I_V_%s'

USER_APP_VERSION = 'User_App_version_%s'
INTEREST_DEALS = 'Interst_D_%s_%s'

AUTHOR_HOT_FEED = 'Author_H_%s'
AUTHOR_NORMAL_FEED = 'Author_N_%s'
AUTHOR_FOLLOWED_COUNT = 'A_Follow_Count_%s'
AUTHOR_LIKES_COUNT = 'Author_L_Count_%s'
AUTHOR_USER_CACHE_FEED = 'A_U_Cache_F_%s'
AUTHOR_INTEREST_FEED = 'A_Interest_F_%s'
AUTHOR_USER_IMPRESSION = 'A_User_I_%s'

NEED_UPDATE_AUTHOR_IDS = 'A_Need_Update'
NEED_UPDATE_COMMENT_IDS = 'C_Need_Update'

USER_TODAY_COMMENTS = 'User_%s_%s'
COMMENT_LIKES_COUNT = 'C_L_%s'
NEWS_COMMENTS_COUNT = 'C_C_v2_%s_%s'

USER_RECENT_IMPRESSION = 'Recent_I_U_%s'
USER_LAST_BROWSER_TIME = 'L_B_Time_%s'

# For topic
TOTAL_TOPIC_IDS = RedisKeyPrefix.TOPIC + 'Total_Topic_ids'
TOPIC_NEWS_COUNT = 'N_Count_%s'
TOPIC_DEALS_COUNT = 'D_Count_%s'
TOPIC_DEALS_FEED = 'Topic_D_%s'
TOPIC_NEWS_FEED = 'Topic_N_%s'
SORTED_TOPIC_NEWS_FEED = 'Topic_N_%s_%s_v3'
TOPIC_NEWS_HOT_FEED = 'Topic_N_%s_Hot'
TOPIC_NEWS_IDS_USER = 'Topic_%s_N_U_%s'
TOPIC_DEAL_IDS_USER = 'Topic_%s_D_U_%s'
TOPIC_SEARCH_KEYWORDS_SET = RedisKeyPrefix.TOPIC + 'Topic_Search_Keywords'

USER_UNINTERESTED_AUTHOR_IDS = RedisKeyPrefix.USER + 'Uninterested_A_%s'

USER_LAST_BROWSER_LIKE_TIME = RedisKeyPrefix.COMMENT + 'L_B_L_Time_%s'
USER_LAST_BROWSER_REPLY_TIME = RedisKeyPrefix.COMMENT + 'L_B_R_Time_%s'

COMMENT_REPLIED_EVENTS_QUEUE = RedisKeyPrefix.COMMENT + 'be_replied_%s'
COMMENT_LIKE_EVENTS_QUEUE = RedisKeyPrefix.COMMENT + 'like_message_%s'

NEWS_AUDIT_EVENTS_QUEUE = RedisKeyPrefix.NEWS + 'news_audit_%s'
NEWS_BE_COMMENTED_QUEUE = RedisKeyPrefix.NEWS + 'news_be_commented_%s'
NEWS_BE_LIKED_QUEUE = RedisKeyPrefix.NEWS + 'news_be_liked_%s'

UPDATE_MEDIA_IDS = RedisKeyPrefix.AUTHOR + 'Update_Media_ids_%s'
BE_LIKE_MEDIA_IDS = RedisKeyPrefix.AUTHOR + 'Be_Liked_Media_ids_%s'

# 用户上一次打开 优质内容奖励明细页 的时间
NEWS_AWARD_LAST_BROWSER = RedisKeyPrefix.BONUSES + 'News_Award_T_%s'

# 参与激励活动的新闻队列
NEWS_AWARD_QUEUE = 'News_Ids_Award_Queue'

# 激励队列
INCENTIVE_INCOME_USER = 'Incentive_Income_User_%s'
INCENTIVE_INCOME_PUSH_QUEUE = 'B:incentive_income_%s'

# Topic的被关注数量
TOPIC_FOLLOW_COUNT = RedisKeyPrefix.TOPIC + 'Follow_Count_%s'

USER_LOCK = 'LOCK:USER_%s'

CASHBACK_RECOMMEND_FEEDS = "Cashback_Recommend_Feeds"
CASHBACK_CHANNEL_FEEDS = "Cashback_Channel_Feeds_%s"


def script_load(script):
    """
    to preload and run lua script
    """
    sha = [None]

    def call(conn, keys=[], args=[], force_eval=False):
        if not force_eval:
            if not sha[0]:
                sha[0] = conn.execute_command('SCRIPT', 'LOAD', script, parse='LOAD')
            try:
                return conn.execute_command('EVALSHA', sha[0], len(keys), *(keys + args))
            except redis.exceptions.NoScriptError:
                sha[0] = None
                pass
            except redis.exceptions.ResponseError as msg:
                if not msg.args[0].startswith('NOSCRIPT'):
                    raise
        return conn.execute_command('EVAL', script, len(keys), *(keys + args))

    return call


acquire_lock_with_timeout_lua = script_load('''
if redis.call('exists', KEYS[1]) == 0 then
    return redis.call('setex', KEYS[1], unpack(ARGV))
end
''')

release_lock_lua = script_load('''
if redis.call('get', KEYS[1]) == ARGV[1] then
    return redis.call('del', KEYS[1]) or true
end
''')


class RedisClient(object):
    _pool_map = {}  # type: dict[(str, int, int, str), redis.ConnectionPool]

    def __init__(self, host, port=6379, db=0, password=None):
        RedisClient.create_pool(host, port, db, password)
        self._connection = redis.Redis(connection_pool=self._pool_map[(host, port, db, password)])
        # 200MB的内存
        self._cache = MemoryCache(max_size=200 * 1024 * 1024 / 8, size_per_item=8)

    @classmethod
    def create_pool(cls, host, port, db, password):
        if (host, port, db, password) not in cls._pool_map:
            cls._pool_map[(host, port, db, password)] = redis.ConnectionPool(
                host=host,
                port=port,
                db=db,
                password=password
            )

    def get_sells(self, without_black_sells=True):
        all_sells = {int(item) for item in self._connection.smembers(DEAL_SELL_SET)}
        if without_black_sells:
            black_sells = self.get_black_sells()
            return all_sells - black_sells
        else:
            return all_sells

    def get_black_sells(self):
        return {int(sell_ids) for sell_ids in self._connection.smembers(BLACK_SELLS_SET)}

    def get_hot_deals(self) -> Dict:
        ret = dict()  # type: ignore
        for item in self._connection.smembers(RI_HOT):
            deals = self._connection.zrange(RI_INDEX % ('hot', 'hot', item.decode('utf-8')), 0, 100)
            ret.setdefault(item.decode('utf-8'),
                           [parse_redis_json(from_byte_array=deal, to_cls=RIDealItem) for deal in deals])
        return ret

    def get_hot_deal_ids(self) -> list:
        return [int(item.decode('utf-8')) for item in self._connection.lrange(RI_HOT, 0, -1)]

    def get_most_clicked_deal_ids(self) -> list:
        return [int(item.decode('utf-8')) for item in self._connection.lrange(RI_CLICK_HOT, 0, -1)]

    def get_deals_by_category(self, category_id: int) -> dict:
        ret = dict()
        for item in self._connection.smembers(RI_CATEGORY % category_id):
            deals = self._connection.zrange(RI_INDEX % ('category', category_id, item.decode('utf-8')), 0,
                                            FEEDS_RECALL_LENGTH)
            ret.setdefault(item.decode('utf-8'),
                           [parse_redis_json(from_byte_array=deal, to_cls=RIDealItem) for deal in deals])
        return ret

    def get_deals_by_keyword(self, keyword: str):
        ret = dict()
        for item in self._connection.smembers(RI_KEYWORD % keyword):
            deals = self._connection.zrange(RI_INDEX % ('keyword', keyword, item.decode('utf-8')), 0,
                                            FEEDS_RECALL_LENGTH)
            ret.setdefault(item.decode('utf-8'),
                           [parse_redis_json(from_byte_array=deal, to_cls=RIDealItem) for deal in deals])
        return ret

    def get_deals_by_channel(self, channel_id: int):
        ret = dict()
        for item in self._connection.smembers(RI_CHANNEL % channel_id):
            deals = self._connection.zrange(RI_INDEX % ('channel', channel_id, item.decode('utf-8')), 0,
                                            FEEDS_RECALL_LENGTH)
            ret.setdefault(item.decode('utf-8'),
                           [parse_redis_json(from_byte_array=deal, to_cls=RIDealItem) for deal in deals])
        return ret

    def get_deal_ids_by_channel(self, channel_id: int):
        return [int(item.decode('utf-8')) for item in self._connection.lrange(RI_CHANNEL % channel_id, 0, -1)]

    def get_deal_ids_by_category(self, category_id: int, filter_by_similar=False):
        if filter_by_similar:
            name = RI_CATEGORY_WITHOUT_S % category_id
        else:
            name = RI_CATEGORY % category_id
        return [int(item.decode('utf-8')) for item in self._connection.lrange(name, 0, -1)]

    def get_flash_deal(self):
        return [int(item.decode('utf-8')) for item in self._connection.lrange(RI_FLASH_DELAS, 0, -1)]

    def get_category_by_user(self, user_id: str):
        pass

    def get_keyword_by_user(self, user_id: str):
        pass

    def get_channel_by_user(self, user_id: str):
        pass

    def get_deals_by_id_list(self, deal_id_list: list):
        deal_list = self._connection.hmget(D_LIST, [str(deal_id) for deal_id in deal_id_list])
        return [
            parse_redis_json(from_byte_array=deal, to_cls=ListDealItem)
            for deal in deal_list
        ]

    def get_deal_by_id(self, deal_id: int) -> Tuple[ListDealItem, DetailDealItem]:
        deal_abstract = self._connection.hget(D_LIST, str(deal_id))
        deal_detail = self._connection.get(D_DETAIL % deal_id)
        if deal_abstract and deal_detail:
            return parse_redis_json(from_byte_array=deal_abstract, to_cls=ListDealItem), \
                   parse_redis_json(from_byte_array=deal_detail, to_cls=DetailDealItem)

    def batch_set_deals(self, deal_list: list):
        for i in range(0, len(deal_list), BATCH_SIZE):
            pipeline = self._connection.pipeline()
            for deal in deal_list[i: i + BATCH_SIZE]:
                pipeline.hset(D_LIST, format_redis_json(from_obj=deal, to_cls=ListDealItem))
                pipeline.set(D_DETAIL % deal.id, format_redis_json(from_obj=deal, to_cls=DetailDealItem))
                ri_deal_item_str = format_redis_json(from_obj=deal, to_cls=RIDealItem)
                pipeline.sadd(RI_HOT, deal.ecommerce_id)
                pipeline.zadd(RI_INDEX % ('hot', 'hot', deal.ecommerce_id), ri_deal_item_str, deal.sales)

                pipeline.sadd(RI_CATEGORY % deal.category_id_one, deal.ecommerce_id)
                pipeline.zadd(RI_INDEX % ('category', deal.category_id_one, deal.ecommerce_id), ri_deal_item_str,
                              deal.sales)
                pipeline.sadd(RI_CATEGORY % deal.category_id_two, deal.ecommerce_id)
                pipeline.zadd(RI_INDEX % ('category', deal.category_id_two, deal.ecommerce_id), ri_deal_item_str,
                              deal.sales)
                pipeline.sadd(RI_CATEGORY % deal.category_id_three, deal.ecommerce_id)
                pipeline.zadd(RI_INDEX % ('category', deal.category_id_three, deal.ecommerce_id), ri_deal_item_str,
                              deal.sales)
                pipeline.sadd(RI_CHANNEL % deal.channel_id, deal.ecommerce_id)
                pipeline.zadd(RI_INDEX % ('channel', deal.channel_id, deal.ecommerce_id), ri_deal_item_str, deal.sales)
                for keyword in deal.keyword_list:
                    pipeline.sadd(RI_KEYWORD % keyword, deal.ecommerce_id)
                    pipeline.zadd(RI_INDEX % ('keyword', keyword, deal.ecommerce_id), ri_deal_item_str, deal.sales)
            pipeline.zrevrange()
            pipeline.execute()

    def get_update_time_of_feeds(self, user_id) -> int:
        """获取缓存的feeds列表上次更新的时间"""
        try:
            data = self._connection.get(C_F_U_T % user_id)
            if data is None:
                return 0
            else:
                update_time_of_feeds = data.decode("utf-8")
            return int(update_time_of_feeds)
        except ValueError:
            return 0

    def get_cache_feeds(self, user_id: str) -> list:
        """获取缓存的feeds列表, 该列表超过一定时间间隔会重新更新"""
        name = C_F_U_JSON % user_id
        data = self._connection.get(name)
        if data is None:
            return []
        else:
            return json.loads(data.decode("utf-8"))

    def cache_feeds(self, user_id: str, feeds: list):
        pipeline = self._connection.pipeline()
        name = C_F_U_JSON % user_id
        pipeline.delete(name)
        pipeline.set(name, json.dumps(feeds), ex=2 * 86400)
        pipeline.set(C_F_U_T % user_id, int(time.time()), ex=60 * 60)
        pipeline.execute()

    def get_impressed_feeds(self, user_id: str) -> set:
        """获取一个用户曾经刷过的feeds"""
        impressed_set = {
            int(deal_id_str.decode('utf-8'))
            for deal_id_str in
            self._connection.smembers(C_F_U_I % user_id)
        }
        click_set = self.get_click_deals(user_id)
        return impressed_set | click_set

    def set_impressed_feeds(self, user_id: str, deal_id_list: list, gender=None):
        """设置某个用户曾经刷过的feeds, 3天超时"""
        pipeline = self._connection.pipeline()
        # 按性别存展示给男女的recommend feed, 三天过期
        if gender is not None:
            name = SHOW_RECOMMEND_D % gender
            pipeline.sadd(name, *deal_id_list)
        # 按user_id存点击过的商品
        pipeline.sadd(C_F_U_I % user_id, *deal_id_list)
        pipeline.expire(C_F_U_I % user_id, 3600 * 24)
        pipeline.execute()
        self.increase_deal_impression(deal_id_list)

    def get_click_deals(self, user_id: str) -> set:
        """获取一个用户曾经刷过的feeds"""
        return {
            int(deal_id_str.decode('utf-8'))
            for deal_id_str in
            self._connection.smembers(C_F_U_C % user_id)
        }

    def set_click_deal(self, user_id: str, deal_id, gender=None):
        """设置某个用户曾经刷过的feeds, 3天超时"""
        pipeline = self._connection.pipeline()
        pipeline.sadd(C_F_U_C % user_id, deal_id)
        pipeline.expire(C_F_U_C % user_id, 3600 * 72)
        now = datetime.datetime.now().strftime('%Y%m%d')
        pipeline.sadd(C_ACTIVE_USERS % now, user_id)
        pipeline.expire(C_ACTIVE_USERS % now, 86400 * 10)
        # 设置用户最近点击的deal
        click_recent_key = U_CLICK_RECENT_D % user_id
        pipeline.lrem(name=click_recent_key, count=0, value=deal_id)
        pipeline.lpush(click_recent_key, deal_id)
        pipeline.ltrim(click_recent_key, 0, 1000)
        pipeline.expire(click_recent_key, 2 * 30 * 86400)
        # 分性别记录一段时见内click过的deals
        if gender is not None:
            gender_click_set = CLICK_RECOMMEND_D % gender
            pipeline.sadd(gender_click_set, deal_id)
        pipeline.execute()
        self.increase_deal_click(deal_id)

        return self._connection.lrange(U_CLICK_RECENT_D % user_id, 0, -1)

    def get_active_users(self, date: datetime.datetime = None) -> Set[str]:
        if date is None:
            date = datetime.datetime.now()
        name = C_ACTIVE_USERS % date.strftime('%Y%m%d')
        users = self._connection.smembers(name)
        if users is None:
            return set()
        else:
            return {user_id.decode('utf-8') for user_id in users}

    def add_active_users(self, user_id, event_name):
        try:
            date = datetime.datetime.utcnow()
            name = C_ACTIVE_USERS_NEWS % date.strftime('%Y%m%d')
            pipeline = self._connection.pipeline()
            pipeline.rpush(name, '%s,%s' % (event_name, user_id))
            pipeline.expire(name, 2 * 86400)
            pipeline.llen(name)
            result = pipeline.execute()
            length = int(result[-1])
            if length > 50000:
                self._connection.delete(name)
        except:
            pass

    def get_cache_channel_feeds(self, channel_id: int) -> list:
        return [
            int(deal_id_str.decode('utf-8'))
            for deal_id_str in
            self._connection.lrange(C_F_C % channel_id, 0, -1)
        ]

    def set_user_browsing_history(self, user_id: str, deal_id: str):
        deal_id = str(deal_id)
        name = C_D_U_B % user_id
        pipeline = self._connection.pipeline()
        pipeline.lrem(name=name, count=0, value=deal_id)
        pipeline.lpush(name, deal_id)
        pipeline.execute()
        self._connection.ltrim(C_D_U_B % user_id, 0, 99)

    def get_user_browsing_history(self, user_id: str, page_id: int, count: int):
        return [
            int(deal) for deal in self._connection.lrange(C_D_U_B % user_id, page_id * count, (page_id + 1) * count - 1)
        ]

    def batch_cache_start_and_end_time(self, deals):
        pipeline = self._connection.pipeline()
        for deal in deals:
            pipeline.set(D_START_END_TIME % deal['deal_id'], json.dumps(deal), ex=60 * 60 * 24)
        pipeline.execute()

    def batch_get_start_and_end_time(self, deals):
        ret = {}
        to_query_deals = []
        for deal_id in deals:
            name = D_START_END_TIME % deal_id
            deal = self._cache.get_cache(name)
            if deal is not None:
                ret[str(deal['deal_id'])] = deal
            else:
                to_query_deals.append(deal_id)
        for items in utils.list_to_chunk(to_query_deals):
            pipeline = self._connection.pipeline()
            for deal_id in items:
                if str(deal_id) not in ret:
                    pipeline.get(D_START_END_TIME % deal_id)
            for value in pipeline.execute():
                if value is not None:
                    deal = json.loads(value.decode('utf-8'))
                    self._cache.cache_object(D_START_END_TIME % deal['deal_id'], deal, exp=60)
                    ret[str(deal['deal_id'])] = deal
        return ret

    def get_deal_categories(self, deal_id):
        data = self._connection.get(D_CATEGORIES % deal_id)
        if data is not None:
            return json.loads(data.decode('utf-8'))
        else:
            return None

    def set_deal_categories(self, deal_id, categories):
        data = json.dumps(categories)
        self._connection.set(D_CATEGORIES % deal_id, data, ex=10 * 60)

    def get_deal_detail(self, deal_id):
        data = self._connection.get(D_DETAIL % deal_id)
        if data is None:
            return None
        else:
            return json.loads(data.decode('utf-8'))

    def set_deal_detail(self, deal_id, data):
        data = json.dumps(data)
        self._connection.set(D_DETAIL % deal_id, data, ex=2 * 60)

    def cache_object(self, name, obj, ex, cls=None, cache_on_memory=None, prefix=None):
        cache_name = O_CACHE % name
        if prefix is not None:
            cache_name = prefix + cache_name
        data = json.dumps(obj, cls=cls)
        if cache_on_memory is not None:
            self._cache.cache_object(cache_name, data, exp=cache_on_memory)
        self._connection.set(cache_name, data, ex=ex)

    def get_object(self, name, cls=None, prefix=None):
        cache_name = O_CACHE % name
        if prefix is not None:
            cache_name = prefix + cache_name
        data = self._cache.get_cache(cache_name)
        if data is None:
            data = self._connection.get(cache_name)
        if data is None:
            return None
        else:
            if isinstance(data, bytes):
                data = data.decode('utf-8')
            return json.loads(data, cls=cls)

    def batch_delete_object(self, name_list):
        for names in utils.list_to_chunk(name_list):
            pipeline = self._connection.pipeline()
            for name in names:
                cache_name = O_CACHE % name
                pipeline.delete(cache_name)
            pipeline.execute()

    def clear_object_cache(self, name, prefix=None):
        cache_name = O_CACHE % name
        if prefix is not None:
            cache_name = prefix + cache_name
        self._connection.delete(cache_name)

    def expire_object_cache(self, name, ttl, min_ttl=None):
        cache_name = O_CACHE % name
        if min_ttl is None:
            self._connection.expire(cache_name, ttl)
        else:
            if self._connection.ttl(cache_name) > min_ttl:
                self._connection.expire(cache_name, ttl)

    def get_object_ttl(self, name, prefix=None):
        cache_name = O_CACHE % name
        if prefix is not None:
            cache_name = prefix + cache_name
        ttl = int(self._connection.ttl(cache_name))
        if ttl == -2:
            return None
        else:
            return ttl

    def batch_get_object(self, prefix, ids):
        res = {}
        for i in range(0, len(ids), 500):
            items = ids[i: i + 500]
            pipeline = self._connection.pipeline()
            for object_id in items:
                pipeline.get(prefix % object_id)
            for index, value in enumerate(pipeline.execute()):
                if value is not None:
                    res[str(items[index])] = json.loads(value.decode('utf-8'))
        return res

    def batch_get_deal_cache(self, deal_ids) -> dict:
        res = {}
        for chunk in list_to_chunk(deal_ids):
            pipeline = self._connection.pipeline()
            for deal_id in chunk:
                pipeline.get(DEAL_CACHE % deal_id)
            for value in pipeline.execute():
                if value is not None:
                    value = json.loads(value.decode('utf-8'))
                    res[int(value['id'])] = value
        return res

    def set_push_history(self, push_type):
        self._connection.set(PUSH_HISTORY, push_type, ex=3600 * 18)

    def get_push_history(self):
        try:
            return self._connection.get(PUSH_HISTORY).decode("utf-8")
        except:
            return None

    def set_launch_history(self, user_id):
        try:
            self._connection.hset(LAUNCH_HISTORY, user_id, str(int(time.time())))
        except:
            pass

    def batch_get_launch_history(self, user_id_list) -> dict:
        ret = dict()
        try:
            value_list = self._connection.hmget(LAUNCH_HISTORY, user_id_list)
            for idx, key in enumerate(user_id_list):
                if value_list[idx] is not None:
                    ret[key] = int(value_list[idx].decode('utf-8'))
        except:
            pass
        return ret

    def increase_deal_click(self, deal_id):
        now = datetime.datetime.now().strftime('%Y%m%d')
        name = S_DEAL_CLICK % (now, deal_id)
        click_set = S_DEAL_CLICK_SETS % now
        pipeline = self._connection.pipeline()
        pipeline.incr(name)
        pipeline.expire(name, 3 * 24 * 60 * 60)
        pipeline.sadd(click_set, int(deal_id))
        pipeline.expire(click_set, 3 * 24 * 60 * 60)

        res = pipeline.execute()
        if len(res) > 0 and int(res[0]) <= 1:
            self._connection.set(S_DEAL_CLICK_TIME % (datetime.datetime.now().strftime('%Y%m%d'), deal_id),
                                 int(time.time()))

    def batch_get_clicked_count(self, deal_ids):
        now = datetime.datetime.now().strftime('%Y%m%d')
        click_count = {}
        for deal_chunk in list_to_chunk(list(deal_ids), 100):
            pipeline = self._connection.pipeline()
            for deal_id in deal_chunk:
                name = S_DEAL_CLICK % (now, deal_id)
                pipeline.get(name)
            res = pipeline.execute()
            for index, value in enumerate(res):
                if value is not None:
                    click_count[int(deal_chunk[index])] = int(value)
        return click_count

    def get_clicked_deals(self, gender=None):
        now = datetime.datetime.now().strftime('%Y%m%d')
        if gender is not None:
            name = CLICK_RECOMMEND_D % gender
        else:
            name = S_DEAL_CLICK_SETS % now
        click_set = self._connection.smembers(name)
        if gender is not None:
            self._connection.delete(name)
        return {int(deal_id) for deal_id in click_set}

    def increase_deal_impression(self, deal_ids):
        pipeline = self._connection.pipeline()
        for deal_id in deal_ids:
            name = S_DEAL_IMPRESSION % (datetime.datetime.now().strftime('%Y%m%d'), deal_id)
            pipeline.incr(name)
            pipeline.expire(name, 3 * 24 * 60 * 60)
        pipeline.execute()

    def increase_search_word(self, term: str):
        word = term.lower().strip().encode('utf-8')
        now = datetime.datetime.now().strftime('%Y%m%d')
        pipeline = self._connection.pipeline()
        pipeline.zincrby(S_D_HOT_WORD % now, 1, word)
        pipeline.expire(S_D_HOT_WORD % now, 86400 * 7)
        pipeline.execute()

    def get_hot_query_yesterday(self, date_str=None):
        if date_str is None:
            date_str = (datetime.datetime.now() - datetime.timedelta(days=1)).strftime('%Y%m%d')
        else:
            date_str = date_str
        return {word.decode(): int(count) for word, count in self._connection.zrange(S_D_HOT_WORD % date_str, 0, -1,
                                                                                     withscores=True, desc=True)}

    def get_hot_word(self, count=10, date=None):
        if date is None:
            return {term.decode('utf-8'): count for term, count in
                    self._connection.zrevrange(S_HOT_TERM, 0, count, withscores=True)}
        else:
            now = date.strftime('%Y%m%d')
            return {term.decode('utf-8'): count for term, count in
                    self._connection.zrevrange(S_D_HOT_WORD % now, 0, count, withscores=True)}

    def get_recent_del_deals(self):
        return {int(deal_id) for deal_id in
                self._connection.lrange(RECENT_DEL_DEAL_ARRAY, 0, -1)}

    def remove_deals_from_recent_del(self, deal_ids):
        pipeline = self._connection.pipeline()
        for deal_id in deal_ids:
            pipeline.lrem(RECENT_DEL_DEAL_ARRAY, 0, deal_id)
        pipeline.execute()

    def batch_get_attributes_by_ids(self, deals, attributes):
        pipeline = self._connection.pipeline()
        for deal_id in deals:
            pipeline.get(O_CACHE_DEAL % deal_id)
        ret = {}
        for value in pipeline.execute():
            if value is not None:
                deal = json.loads(value, encoding='utf8')['deal']
                ret[deal['id']] = {k: v for k, v in deal.items() if k in attributes}
        return ret

    def get_weights(self):
        return {int(sell_id): score for sell_id, score in self._connection.zrange(SELL_WEIGHT, 0, -1, withscores=True)}

    def get_online_banner(self):
        banners = json.loads(self._connection.get(ONLINE_BANNERS))
        return banners

    def cache_online_banner(self, banners_data):
        pipeline = self._connection.pipeline()
        pipeline.set(ONLINE_BANNERS, json.dumps(banners_data))
        pipeline.execute()

    def get_top_channels(self):
        channels = json.loads(self._connection.get(TOP_CHANNELS))
        return channels

    def cache_top_channels(self, channels_data):
        pipeline = self._connection.pipeline()
        pipeline.set(TOP_CHANNELS, json.dumps(channels_data))
        pipeline.execute()

    def get_hot_categories(self):
        hot_categories = json.loads(self._connection.get(HOT_CATEGORIES))
        return hot_categories

    def cache_hot_categories(self, hot_categories_data):
        pipeline = self._connection.pipeline()
        pipeline.set(HOT_CATEGORIES, json.dumps(hot_categories_data))
        pipeline.execute()

    def cache_most_click_categories(self, hot_categories_data: dict):
        name = MOST_CLICK_CATEGORIES % datetime.datetime.now().strftime('%Y%m%d')
        pipeline = self._connection.pipeline()
        pipeline.delete(name)
        for category_id, click_count in hot_categories_data.items():
            pipeline.zadd(name, {category_id: click_count})
        pipeline.expire(name, 60 * 60)
        pipeline.execute()

    def get_most_click_categories(self, withscores=False):
        name = MOST_CLICK_CATEGORIES % datetime.datetime.now().strftime('%Y%m%d')
        category_ids = self._connection.zrange(name, 0, -1, desc=True, withscores=withscores)
        return category_ids

    def get_hot_deal_ids_by_sell(self, sell_id):
        name = RI_SELL_HOT % sell_id
        return [int(item.decode('utf-8')) for item in self._connection.lrange(name, 0, -1)]

    def get_hot_deal_ids_by_sells(self, sell_ids: list):
        sell_deals = {}
        for sell_id in sell_ids:
            name = RI_SELL_HOT_JSON % sell_id
            deals = self._cache.get_cache(name)
            if deals is not None:
                sell_deals[name] = deals
        sell_ids = [sell_id for sell_id in sell_ids if sell_id not in sell_deals]
        sell_deals.update(self._get_hot_deal_ids_by_sells(sell_ids))
        for sell_id in sell_ids:
            name = RI_SELL_HOT_JSON % sell_id
            self._cache.cache_object(name, sell_deals[sell_id], exp=60)
        return sell_deals

    def _get_hot_deal_ids_by_sells(self, sell_ids: list):
        pipeline = self._connection.pipeline()
        for sell_id in sell_ids:
            name = RI_SELL_HOT % sell_id
            pipeline.lrange(name, 0, -1)
        sell_deals = {}
        for index, value in enumerate(pipeline.execute()):
            if value is not None:
                sell_deals[sell_ids[index]] = [int(item.decode('utf-8')) for item in value]
            else:
                sell_deals[sell_ids[index]] = []
        return sell_deals

    def get_hot_category_ids(self, base=False):
        name = HOT_BASE_CATEGORIES if base else HOT_CATEGORIES
        return [item.decode('utf-8') for item in self._connection.lrange(name, 0, -1)]

    def get_json_hot_deal(self):
        return json.loads(self._connection.get(RI_HOT_JSON))

    def get_gender_json_hot_deal(self, gender):
        deals = self._connection.get(RI_GENDER_HOT % gender)
        if deals is not None:
            return [int(deal_id) for deal_id in json.loads(deals)]
        else:
            return []

    def add_deal_into_recent_del_array(self, deal_id):
        self._connection.lpush(RECENT_DEL_DEAL_ARRAY, deal_id)
        if self._connection.llen(RECENT_DEL_DEAL_ARRAY) > 1000:
            self._connection.ltrim(RECENT_DEL_DEAL_ARRAY, 0, 1000)

    def get_user_most_click_categories_and_score(self, user_id: str):
        name = U_P_FAV_CATS % user_id
        ret = self._connection.get(name)
        if ret:
            categories_and_user_ids = json.loads(ret)
            return {int(k): v for k, v in categories_and_user_ids.items() if k.isdecimal()}
        else:
            return {}

    def get_native_category_deals(self, category_id, sell_id):
        name = N_NEW_CATEGORY_DEALS % (category_id, sell_id)
        deals = self._connection.zrange(name, 0, -1)
        if deals is not None:
            return list(reversed([int(deal_id) for deal_id in deals]))
        else:
            return []

    def cache_flash_deal_category(self, deal_with_category):
        self._connection.set(F_NATIVE_LOWEST_CATEGORY, json.dumps(deal_with_category))

    def get_flash_deal_native_category(self):
        ret = json.loads(self._connection.get(F_NATIVE_LOWEST_CATEGORY))
        return {int(k): int(v) for k, v in ret.items()}

    def get_hot_keyword_ids(self, keyword):
        keyword = base64.b64encode(keyword.encode('utf-8')).decode('utf-8')
        data = self._connection.get(D_HOT_WORD_DEAL % keyword)
        if data is None:
            return []
        else:
            return json.loads(data)

    def get_show_hot_words(self):
        return [word.decode('utf-8') for word in self._connection.lrange(S_SHOW_HOT_WORDS, 0, -1)]

    def set_user_login_ip(self, user_id, ip):
        name = 'U_LOGIN_IP_%s' % user_id
        self._connection.set(name, ip, ex=86400)

    def add_new_users(self, user_id):
        name = 'U_NEWS_USER_LIST_%s' % datetime.datetime.now().strftime('%Y%m%d')
        pipeline = self._connection.pipeline()
        pipeline.sadd(name, user_id)
        pipeline.expire(name, 86400 * 4)
        pipeline.execute()

    def get_new_users(self, which_days):
        pipeline = self._connection.pipeline()
        for day in which_days:
            name = 'U_NEWS_USER_LIST_%s' % day.strftime('%Y%m%d')
            pipeline.smembers(name)
        users = set()
        for data in pipeline.execute():
            if data is not None:
                users |= set([user.decode('utf-8') for user in data])
        return users

    def get_recent_users(self):
        days = [datetime.datetime.now() - datetime.timedelta(days=day) for day in range(0, 3)]
        return self.get_new_users(days)

    def get_share_feeds(self):
        return [int(deal) for deal in self._connection.lrange(RI_SHARE_DEALS, 0, -1)]

    def add_push(self, push_type, content_id):
        try:
            if push_type == 'item' or push_type == 'deal':
                self._connection.sadd(PUSH_DEAL_SET, content_id)
            elif push_type == 'video':
                self._connection.sadd(PUSH_VIDEO_SET, content_id)
            elif push_type == 'article':
                self._connection.sadd(PUSH_ARTICLE_SET, content_id)
            elif push_type == 'image_text':
                self._connection.sadd(PUSH_IMAGE_TEXT_SET, content_id)
        except:
            pass

    def get_user_custom_channel_feeds(self, user_id, channel_id):
        name = USER_CUSTOM_CHANNEL_FEEDS % (user_id, channel_id)
        return [int(deal_id) for deal_id in self._connection.lrange(name, 0, -1)]

    def cache_user_custom_channel_feeds(self, user_id, channel_id, feeds):
        name = USER_CUSTOM_CHANNEL_FEEDS % (user_id, channel_id)
        pipeline = self._connection.pipeline()
        pipeline.delete(name)
        if len(feeds) > 0:
            pipeline.rpush(name, *feeds)
            pipeline.expire(name, 10 * 60)
        pipeline.execute()

    def cache_channel_feeds(self, channel_id: int, feeds, ex=None):
        name = RI_CHANNEL % channel_id
        self._cache_feeds(name, feeds, ex=ex)

    def _cache_feeds(self, name, feeds: list, ex=None):
        pipeline = self._connection.pipeline()
        pipeline.delete(name)
        if len(feeds) == 0:
            pipeline.lpush(name, 1)
            pipeline.lpop(name)
        else:
            pipeline.rpush(name, *feeds)
        if ex is not None:
            pipeline.expire(name, ex)
        pipeline.execute()

    def get_user_share_feeds(self, user_id):
        name = USER_SHARE_FEEDS % user_id
        feeds = [int(deal_id) for deal_id in self._connection.lrange(name, 0, -1)]
        if len(feeds) == 0:
            return self.get_share_feeds()
        else:
            return feeds

    def cache_user_share_feeds(self, user_id, feeds):
        name = USER_SHARE_FEEDS % user_id
        pipeline = self._connection.pipeline()
        pipeline.delete(name)
        if len(feeds) > 0:
            pipeline.rpush(name, *feeds)
            pipeline.expire(name, 3 * 60)
        pipeline.execute()

    def get_zset_hot_deals(self):
        return [int(deal) for deal in self._connection.zrange(ZSET_HOT_DEALS, 0, -1, desc=True)]

    def cache_click_statistic(self, mean, standard):
        pipeline = self._connection.pipeline()
        pipeline.set(S_DEAL_CLICK_MEAN, mean, ex=25 * 60 * 60)
        pipeline.set(S_DEAL_CLICK_STANDARD, standard, ex=25 * 60 * 60)
        pipeline.execute()

    def get_click_mean(self):
        return float(self._connection.get(S_DEAL_CLICK_MEAN).decode())

    def get_click_standard(self):
        return float(self._connection.get(S_DEAL_CLICK_STANDARD).decode())

    def get_sell_zset_hot_deals(self, sell_id):
        return [int(deal) for deal in self._connection.zrange(ZSET_SELL_HOT_DEALS % sell_id, 0, -1, desc=True)]

    def get_invite_urls(self):
        data = self._connection.lrange('INVITE_CODE_URL', 0, -1)
        return [url.decode('utf-8') for url in data]

    def get_weight_invite_urls(self):
        data = self._connection.zrange('INVITE_WIGHT_CODE_URL', 0, -1, withscores=True)
        return {url.decode('utf-8'): int(score) for url, score in data}

    def cache_share_links(self, share_type, url):
        name = SHARE_LINK % share_type
        pipeline = self._connection.pipeline()
        pipeline.delete(name)
        pipeline.set(name, url)
        pipeline.execute()

    def get_share_links(self, share_type):
        name = SHARE_LINK % share_type
        link = self._connection.get(name)
        if link is not None:
            link = link.decode()
        return link

    def get_app_version(self):
        version = self._connection.get('NEWEST_APP_VERSION')
        if version is not None:
            data = json.loads(version)
            data['version'] = int(data['version'])
            return data
        else:
            return None

    def cache_app_version(self, data):
        self._connection.set('NEWEST_APP_VERSION', json.dumps(data))

    def get_recommend_show(self, gender):
        name = SHOW_RECOMMEND_D % gender
        deals_set = self._connection.smembers(name)
        self._connection.delete(name)
        if len(deals_set) == 0:
            return set()
        else:
            return {int(deal_id) for deal_id in deals_set}

    def get_gender_fav_categories(self, gender, with_probability=False):
        name = FAV_CATEGORIES_GENDER % gender
        categories = self._connection.zrange(name, 0, -1, desc=True, withscores=True)
        if categories is not None:
            if with_probability:
                return {int(category_id): float(probability) for category_id, probability in categories}
            else:
                return [int(category_id) for category_id, _ in categories]
        else:
            return None

    def cache_gender_fav_categories(self, gender, data):
        name = FAV_CATEGORIES_GENDER % gender
        pipeline = self._connection.pipeline()
        for category_id, probability in data.items():
            pipeline.zadd(name, {category_id: probability})
        pipeline.execute()

    def cache_sell_gender_hot_deals(self, sell_id, gender, deals):
        name = RI_HOT_SELL_GENDER % (sell_id, gender)
        pipeline = self._connection.pipeline()
        pipeline.delete(name)
        if len(deals) != 0:
            pipeline.rpush(name, *deals)
        pipeline.execute()

    def get_sell_gender_hot_deals(self, sell_id, gender):
        name = RI_HOT_SELL_GENDER % (sell_id, gender)
        deal_ids = self._connection.lrange(name, 0, -1)
        if deal_ids:
            return [int(deal_id) for deal_id in deal_ids]
        else:
            return []

    def get_app_packages(self):
        ret = self._connection.get('APP_PACKAGE_NAMES')
        if ret is None:
            return None
        else:
            return json.loads(ret)

    def get_skip_out(self):
        sell_ids = self._connection.smembers('SKIP_OUT_SELL_IDS')
        if sell_ids is not None and len(sell_ids) > 0:
            return {int(sell_id) for sell_id in sell_ids}
        else:
            return {}

    def get_advertisement_data(self):
        ret = self._connection.get('ADVERTISEMENT_DATA')
        if ret is None:
            return None
        else:
            return json.loads(ret)

    def get_news_likes_count(self, news_id):
        count = self._connection.get(NEWS_LIKES_COUNT % news_id)
        return int(count) if count else None

    def cache_news_likes_count(self, news_id, count):
        name = NEWS_LIKES_COUNT % news_id
        pipeline = self._connection.pipeline()
        pipeline.set(name, count, ex=60 * 60)
        pipeline.execute()

    def update_news_like_count(self, news_id: int, increase: bool = True, count: int = 1):
        name = NEWS_LIKES_COUNT % news_id
        count = self._connection.incrby(name, count) if increase else self._connection.decrby(name, count)
        self._connection.sadd(UPDATE_LIKES_NEWS_IDS, news_id)
        return int(count) if int(count) > 0 else 0

    def get_and_del_update_likes_news_set(self, delete_old_data=False):
        pipeline = self._connection.pipeline()
        pipeline.smembers(UPDATE_LIKES_NEWS_IDS)
        if delete_old_data:
            pipeline.delete(UPDATE_LIKES_NEWS_IDS)
        news_ids = pipeline.execute()[0]
        return {int(news_id) for news_id in news_ids}

    def get_news_ids_by_category(self, category_id, news_type):
        news_ids = self._connection.lrange(NEWS_of_SELL_CATEGORY % (category_id, news_type), 0, -1)
        if news_ids is None:
            return []
        else:
            return [int(news_id) for news_id in news_ids]

    def cache_news_ids_by_category(self, category_id, news_type, news_ids: list):
        name = NEWS_of_SELL_CATEGORY % (category_id, news_type)
        old_news_ids = self._connection.lrange(name, 0, -1)
        if old_news_ids is not None:
            old_news_ids = {int(news_id) for news_id in old_news_ids}
        else:
            old_news_ids = set()
        pipeline = self._connection.pipeline()
        for news_id in news_ids:
            if news_id not in old_news_ids:
                pipeline.rpush(name, news_id)
        pipeline.execute()

    def get_news_page_cache(self, count, page_id, gender):
        if gender is None:
            name = 'N_page_%s_count_%s' % (page_id, count)
        else:
            name = 'N_page_%s_count_%s_%s' % (page_id, count, gender)
        feeds = self._connection.lrange(name, 0, -1)
        if len(feeds) > 0:
            return [int(news_id) for news_id in feeds]
        else:
            return []

    def cache_news_page_cache(self, feeds, count, page_id, gender):
        if gender is None:
            name = 'N_page_%s_count_%s' % (page_id, count)
        else:
            name = 'N_page_%s_count_%s_%s' % (page_id, count, gender)
        pipeline = self._connection.pipeline()
        pipeline.delete(name)
        pipeline.rpush(name, *feeds)
        pipeline.expire(name, 10 * 60)
        pipeline.execute()

    def cache_advertisement_data(self, ad_data):
        self._connection.set('ADVERTISEMENT_DATA', json.dumps(ad_data))

    def set_click_news(self, news_id, gender=None):
        pipeline = self._connection.pipeline()
        if gender is not None:
            name = NEWS_CLICK_GENDER % (gender, datetime.datetime.now().strftime('%Y%m%d'))
            pipeline.zincrby(name, 1, news_id)
            pipeline.expire(name, 36 * 60 * 60)
        name = NEWS_PROFILE_CLICK % news_id
        pipeline.incr(name)
        pipeline.expire(name, 86400 * 10)
        pipeline.execute()

    def add_user_click_news(self, user_id, news_id):
        name = USER_NEWS_CLICK_WITH_TIME % (datetime.datetime.utcnow().strftime('%Y%m%d'), user_id)
        pipeline = self._connection.pipeline()
        pipeline.rpush(name, '%s_%s' % (int(time.time()), news_id))
        pipeline.expire(name, 3 * 86400)
        pipeline.execute()

    def get_recent_user_click_with_time(self, user_id):
        pipeline = self._connection.pipeline()
        for date in [datetime.datetime.utcnow() - datetime.timedelta(days=1), datetime.datetime.utcnow()]:
            name = USER_NEWS_CLICK_WITH_TIME % (date.strftime('%Y%m%d'), user_id)
            pipeline.lrange(name, 0, -1)
        ret = []
        for time_news_ids in pipeline.execute():
            for time_news_id in time_news_ids:
                timestamp, news_id = time_news_id.decode('utf-8').split('_')
                ret.append((int(timestamp), news_id))
        return sorted(ret, reverse=True)

    def get_gender_click_news(self, gender, with_scores=False, date=None):
        if date is None:
            date = datetime.datetime.now()
        name = NEWS_CLICK_GENDER % (gender, date.strftime('%Y%m%d'))
        pipeline = self._connection.pipeline()
        pipeline.zrange(name, 0, -1, desc=True, withscores=with_scores)
        news_ids = pipeline.execute()[0]
        if with_scores:
            return {int(news_id): int(count) for news_id, count in news_ids}
        else:
            return [int(news_id) for news_id in news_ids]

    def cache_fav_news_cate(self, gender, category_count):
        name = NEWS_FAV_CATE_GENDER % gender
        pipeline = self._connection.pipeline()
        pipeline.delete(name)
        pipeline.zadd(name, category_count)
        pipeline.execute()

    def get_fav_news_cate(self, gender):
        name = NEWS_FAV_CATE_GENDER % gender
        category_ids = self._connection.zrange(name, 0, -1, desc=True)
        if category_ids is None:
            return []
        else:
            return [int(category_id) for category_id in category_ids]

    def cache_gender_news_feeds(self, gender, feeds):
        name = HOT_NEWS_FEEDS_GENDER % gender
        if len(feeds) > 0:
            feeds_json = json.dumps(feeds)
            self._connection.set(name, feeds_json)

    def get_gender_hot_news(self, gender):
        name = HOT_NEWS_FEEDS_GENDER % gender
        feeds_json = self._connection.get(name)
        if feeds_json is None:
            return []
        else:
            return [int(news_id) for news_id in json.loads(feeds_json)]

    def cache_news_feeds_by_type(self, type, news_ids):
        self._connection.set(NEWS_TYPE_FEEDS.format(type), json.dumps(news_ids))

    def get_news_feeds_by_type(self, type):
        news_ids = self._connection.get(NEWS_TYPE_FEEDS.format(type))
        if news_ids is None:
            return []
        else:
            return [int(news_id) for news_id in json.loads(news_ids)]

    def cache_youtube_video_feeds(self, feeds, gender=None):
        if gender in {'Male', 'Female'}:
            name = 'Youtube_Video_Feed_%s' % gender
        else:
            name = 'Youtube_Video_Feed_default'
        self._connection.set(name, json.dumps(feeds))

    def get_youtube_video_feeds(self, gender=None):
        if gender in {'Male', 'Female'}:
            name = 'Youtube_Video_Feed_%s' % gender
        else:
            name = 'Youtube_Video_Feed_default'
        feed_json = self._connection.get(name)
        if feed_json is not None:
            return [int(video_id) for video_id in json.loads(feed_json)]

    def cache_normal_video_feeds(self, feeds, gender=None):
        if gender in {'Male', 'Female'}:
            name = 'Normal_Video_Feed_%s' % gender
        else:
            name = 'Normal_Video_Feed_default'
        self._connection.set(name, json.dumps(feeds))

    def get_normal_video_feeds(self, gender=None):
        if gender in {'Male', 'Female'}:
            name = 'Normal_Video_Feed_%s' % gender
        else:
            name = 'Normal_Video_Feed_default'
        feed_json = self._connection.get(name)
        if feed_json is not None:
            return [int(video_id) for video_id in json.loads(feed_json)]

    def get_user_video_feeds(self, user_id):
        feed_json = self._connection.get(RECOMMEND_VIDEO % user_id)
        if feed_json is not None:
            return [int(video_id) for video_id in json.loads(feed_json)]
        else:
            return []

    def cache_user_video_feeds(self, user_id, feeds):
        name = RECOMMEND_VIDEO % user_id
        pipeline = self._connection.pipeline()
        if len(feeds) > 0:
            feed_json = json.dumps(feeds)
            pipeline.set(name, feed_json)
            pipeline.expire(name, 10 * 60)
        pipeline.execute()

    def get_user_impression_video_ids(self, user_id):
        name = USER_IMPRESSION_VIDEO % user_id
        video_ids = self._connection.smembers(name)
        if video_ids is not None:
            return {int(video_id) for video_id in video_ids}
        else:
            return {}

    def set_user_impression_video_ids(self, user_id, feeds):
        name = USER_IMPRESSION_VIDEO % user_id
        pipeline = self._connection.pipeline()
        if len(feeds) > 0:
            for video_id in feeds:
                pipeline.sadd(name, video_id)
        pipeline.expire(name, 3 * 24 * 60 * 60)
        pipeline.execute()

    def get_user_news_feeds(self, user_id):
        feed_json = self._connection.get(RECOMMEND_NEWS_FEEDS % user_id)
        if feed_json is not None:
            return [int(news_id) for news_id in json.loads(feed_json)]
        else:
            return []

    def cache_user_news_feeds(self, user_id, feeds):
        name = RECOMMEND_NEWS_FEEDS % user_id
        pipeline = self._connection.pipeline()
        if len(feeds) > 0:
            feed_json = json.dumps(feeds)
            pipeline.set(name, feed_json)
            pipeline.expire(name, 10 * 60)
        pipeline.execute()

    def get_user_impression_news_ids(self, user_id):
        name = USER_IMPRESSION_NEWS % user_id
        news_ids = self._connection.smembers(name)
        if news_ids is not None:
            return {int(news_id) for news_id in news_ids}
        else:
            return {}

    def set_user_impression_news_ids(self, user_id, feeds):
        pipeline = self._connection.pipeline()

        user_impression_key = USER_IMPRESSION_NEWS % user_id
        if len(feeds) > 0:
            for news_id in feeds:
                pipeline.sadd(user_impression_key, news_id)
        if len(feeds) > 0:
            pipeline.sadd(NEWS_PROFILE_DATE % datetime.datetime.now().strftime('%Y%m%d'), *feeds)
            pipeline.expire(NEWS_PROFILE_DATE % datetime.datetime.now().strftime('%Y%m%d'), 86400 * 10)
        for news_id in feeds:
            pipeline.incr(NEWS_PROFILE_IMPRESSION % news_id)
            pipeline.expire(NEWS_PROFILE_IMPRESSION % news_id, 86400 * 10)
        pipeline.expire(user_impression_key, 10 * 24 * 60 * 60)

        recent_impression_key = RedisKeyPrefix.NEWS + USER_RECENT_IMPRESSION % user_id
        if len(feeds) > 0:
            pipeline.lpush(recent_impression_key, *feeds)
            pipeline.ltrim(recent_impression_key, 0, 999)
            pipeline.expire(recent_impression_key, 24 * 60 * 60)
        pipeline.execute()

    def get_user_recently_impression(self, user_id) -> Set[int]:
        name = RedisKeyPrefix.NEWS + USER_RECENT_IMPRESSION % user_id
        return {int(news_id) for news_id in self._connection.lrange(name, 0, -1)}

    def get_news_clicks_and_impressions(self, news_ids: list):
        pipeline = self._connection.pipeline()
        for news_id in news_ids:
            pipeline.get(NEWS_PROFILE_IMPRESSION % news_id)
        for news_id in news_ids:
            pipeline.get(NEWS_PROFILE_CLICK % news_id)
        res = {}
        values = pipeline.execute()
        for index, value in enumerate(values):
            if index < len(news_ids):
                res[news_ids[index]] = {
                    'impression_count': int(value) if value is not None else 0
                }
            else:
                res.setdefault(news_ids[index % len(news_ids)], {})
                res[news_ids[index % len(news_ids)]]['click_count'] = int(value) if value is not None else 0
        return res

    def cache_user_app_version(self, user_id, app_version):
        now = datetime.datetime.now().strftime('%Y%m%d')
        name = USER_APP_VERSION % now
        self._connection.zadd(name, {user_id: app_version})

    def get_user_app_version(self, date_str, del_old_data):
        name = USER_APP_VERSION % date_str
        data = self._connection.zrange(name, 0, -1, withscores=True)
        if data is not None:
            data = [(user_id.decode('utf8'), int(app_version)) for user_id, app_version in data]
        if del_old_data:
            self._connection.delete(name)
        return data

    def cache_interest_deals(self, interest_id, sell_id, deal_ids):
        name = INTEREST_DEALS % (interest_id, sell_id)
        if len(deal_ids) > 0:
            self._connection.set(name, json.dumps(deal_ids))

    def get_interest_deals(self, interest_id, sell_id):
        name = INTEREST_DEALS % (interest_id, sell_id)
        data_json = self._connection.get(name)
        if data_json is None:
            return []
        else:
            return [int(deal_id) for deal_id in json.loads(data_json)]

    def cache_deal_logger(self, page_id, user_id, deal_ids, buckets, channel):
        data_str = json.dumps({
            'page_id': page_id,
            'user_id': user_id,
            "deal_ids": deal_ids,
            'buckets': buckets,
            'channel': channel
        })
        self._connection.rpush('TMP_Deal_Logger_%s' % datetime.datetime.now().strftime("%Y%m%d"), data_str)

    def remove_news_from_list(self, cate_id, news_type, invalid_news_ids):
        name = NEWS_of_SELL_CATEGORY % (cate_id, news_type)
        pipeline = self._connection.pipeline()
        for news_id in invalid_news_ids:
            pipeline.lrem(name, 1, news_id)
        pipeline.execute()

    def get_search_slogan(self):
        slogan = self._connection.hgetall('SEARCH_SLOGAN')
        if slogan is not None:
            ret = {}
            for k, v in slogan.items():
                ret[k.decode()] = v.decode()
            return ret
        else:
            return {}

    def get_author_feed(self, author_id, size=None):
        name = AUTHOR_NORMAL_FEED % author_id
        if size is None:
            news_ids = self._connection.lrange(name, 0, -1)
        else:
            news_ids = self._connection.lrange(name, 0, size - 1)
        return [int(news_id) for news_id in news_ids]

    def get_author_hot_feed(self, author_id, size=3):
        name = AUTHOR_HOT_FEED % author_id
        news_ids = self._connection.lrange(name, 0, -1)
        if len(news_ids) == 0:
            news_ids = self._connection.lrange(AUTHOR_NORMAL_FEED % author_id, 0, -1)
        return [int(news_id) for news_id in news_ids[:size]]

    def get_author_feeds(self, author_ids, count_per_author=100):
        pipeline = self._connection.pipeline()
        for author_id in author_ids:
            name = AUTHOR_NORMAL_FEED % author_id
            pipeline.lrange(name, 0, count_per_author)
        ret = []
        for index, result in enumerate(pipeline.execute()):
            if result is not None:
                ret.append([int(news_id) for news_id in result])
        return ret

    def get_followers_count(self, author_id, real=True):
        data = self.get_object(AUTHOR_FOLLOWED_COUNT % author_id)
        if data is None:
            return None
        else:
            if real:
                return data['real']
            else:
                return sum(data.values())

    def set_followers_count(self, author_id, real, fake):
        self.cache_object(AUTHOR_FOLLOWED_COUNT % author_id, {'real': real, 'fake': fake}, ex=3 * 60 * 60)

    def update_following_count(self, author_id, is_add=True):
        data = self.get_object(AUTHOR_FOLLOWED_COUNT % author_id)
        self._connection.sadd(NEED_UPDATE_AUTHOR_IDS, author_id)
        if data is None:
            return False
        else:
            count = data.get('real', 0)
            if is_add:
                count += 1
            else:
                count = count - 1 if count > 0 else 0
            data['real'] = count
            self.cache_object(AUTHOR_FOLLOWED_COUNT % author_id, data, ex=3 * 60 * 60)
            return True

    def get_user_cache_author_feed(self, user_id):
        name = AUTHOR_USER_CACHE_FEED % user_id
        return [int(author_id) for author_id in self._connection.lrange(name, 0, -1)]

    def set_user_cache_author_feed(self, user_id, author_ids):
        name = AUTHOR_USER_CACHE_FEED % user_id
        pipeline = self._connection.pipeline()
        if len(author_ids) > 0:
            pipeline.delete(name)
            pipeline.rpush(name, *author_ids)
            pipeline.execute()

    def get_interest_author_feed(self, interest_id):
        name = AUTHOR_INTEREST_FEED % interest_id
        return [int(author_id) for author_id in self._connection.lrange(name, 0, -1)]

    def get_impression_authors(self, user_id):
        name = AUTHOR_USER_IMPRESSION % user_id
        return [int(author_id) for author_id in self._connection.smembers(name)]

    def set_impression_authors(self, user_id, author_ids):
        if len(author_ids) > 0:
            name = AUTHOR_USER_IMPRESSION % user_id
            pipeline = self._connection.pipeline()
            pipeline.sadd(name, *author_ids)
            pipeline.expire(name, 3 * 24 * 60 * 60)
            pipeline.execute()

    def get_author_total_likes(self, author_id):
        name = AUTHOR_LIKES_COUNT % author_id
        count = self._connection.get(name)
        return int(count) if count is not None else None

    def cache_author_total_likes(self, author_id, like_count):
        name = AUTHOR_LIKES_COUNT % author_id
        pipeline = self._connection.pipeline()
        pipeline.set(name, like_count)
        pipeline.expire(name, 65 * 60)
        pipeline.execute()

    def update_author_likes_count(self, author_id, increase):
        name = AUTHOR_LIKES_COUNT % author_id
        pipeline = self._connection.pipeline()
        count = self._connection.get(name)
        if increase:
            count = 1 if count is None else int(count) + 1
        else:
            if count is None or int(count) == 0:
                count = 0
            else:
                count = int(count) - 1
        pipeline.set(name, count)
        pipeline.expire(name, 10 * 60)
        pipeline.sadd(NEED_UPDATE_AUTHOR_IDS, author_id)
        pipeline.expire(NEED_UPDATE_AUTHOR_IDS, 2 * 60 * 60)
        pipeline.execute()

    def get_user_fcm_tokens(self, user_ids) -> Dict[str, str]:
        pipeline = self._connection.pipeline()
        for user_id in user_ids:
            pipeline.get(U_FCM_TOKENS % user_id)
        tokens = {}
        for index, result in enumerate(pipeline.execute()):
            if result is not None:
                tokens[user_ids[index]] = result.decode('utf-8')
        return tokens

    def cache_user_fcm_tokens(self, tokens: Dict[str, str]):
        pipeline = self._connection.pipeline()
        for user_id, token in tokens.items():
            pipeline.set(U_FCM_TOKENS % user_id, token, ex=10 * 60)
        pipeline.execute()

    def clear_user_fcm_token(self, user_id):
        if user_id is not None and len(user_id) > 0:
            key = U_FCM_TOKENS % user_id
            self._connection.delete(key)

    def get_and_del_need_update_authors(self):
        author_id = [int(author_id) for author_id in self._connection.smembers(NEED_UPDATE_AUTHOR_IDS)]
        self._connection.delete(NEED_UPDATE_AUTHOR_IDS)
        return author_id

    def get_comment_like_count(self, comment_id):
        name = RedisKeyPrefix.COMMENT + COMMENT_LIKES_COUNT % comment_id
        count = self._connection.get(name)
        return None if count is None else int(count)

    def cache_comment_like_count(self, comment_id, count):
        name = RedisKeyPrefix.COMMENT + COMMENT_LIKES_COUNT % comment_id
        self._connection.set(name, count, ex=2 * 60 * 60)

    def update_comment_like_count(self, comment_id, is_add=True):
        name = RedisKeyPrefix.COMMENT + COMMENT_LIKES_COUNT % comment_id
        count = self._connection.get(name)
        if count is not None:
            count = int(count)
        else:
            count = 0
        if is_add:
            count += 1
        pipeline = self._connection.pipeline()
        pipeline.set(name, count)
        pipeline.execute()

    def get_news_comments_count(self, news_id, level=1):
        name = RedisKeyPrefix.COMMENT + NEWS_COMMENTS_COUNT % (level, news_id)
        count = self._connection.get(name)
        return None if count is None else int(count)

    def update_news_comments_count(self, news_id, level, is_add=True):
        name = RedisKeyPrefix.COMMENT + NEWS_COMMENTS_COUNT % (level, news_id)
        count = self._connection.get(name)
        if count is not None:
            count = int(count)
        else:
            count = 0
        if is_add:
            count += 1
        self._connection.set(name, count, ex=2 * 60 * 60)

    def cache_news_comments_count(self, news_id, count, level=1):
        name = RedisKeyPrefix.COMMENT + NEWS_COMMENTS_COUNT % (level, news_id)
        self._connection.set(name, count, ex=2 * 60 * 60)

    def add_to_push_like_queue(self, comment_id, user_id, comment_user_id):
        now = datetime.datetime.utcnow()
        name = COMMENT_LIKE_EVENTS_QUEUE % now.strftime('%Y%m%d')
        pipeline = self._connection.pipeline()
        message = json.dumps(
            {'comment_id': comment_id, 'user_id': user_id, 'comment_user_id': comment_user_id,
             'created_time': int(time.time())})
        pipeline.lpush(name, message)
        pipeline.expire(name, 36 * 60 * 60)
        pipeline.execute()

    def add_to_user_today_comments(self, comment_id, user_id):
        name = RedisKeyPrefix.COMMENT + USER_TODAY_COMMENTS % (user_id, datetime.datetime.utcnow().strftime('%Y%m%d'))
        pipeline = self._connection.pipeline()
        pipeline.lpush(name, comment_id)
        pipeline.expire(name, 30 * 60 * 60)
        pipeline.execute()

    def get_user_comments_today(self, user_id):
        name = RedisKeyPrefix.COMMENT + USER_TODAY_COMMENTS % (user_id, datetime.datetime.utcnow().strftime('%Y%m%d'))
        return [int(comment_id) for comment_id in self._connection.lrange(name, 0, -1)]

    def add_to_likes_of_my_comments(self, comment_user_id, comment_id, like_user_id):
        name = RedisKeyPrefix.COMMENT + 'LoC_%s_%s' % (comment_user_id, datetime.datetime.utcnow().strftime('%Y%m%d'))
        pipeline = self._connection.pipeline()
        pipeline.lpush(name, json.dumps((like_user_id, comment_id)))
        pipeline.expire(name, 30 * 60 * 60)
        pipeline.execute()

    def get_likes_of_my_comments_today(self, user_id):
        name = RedisKeyPrefix.COMMENT + 'LoC_%s_%s' % (user_id, datetime.datetime.utcnow().strftime('%Y%m%d'))
        return [json.loads(likes_data) for likes_data in self._connection.lrange(name, 0, -1)]

    def get_user_last_browser_time(self, user_id, is_like=True):
        name = USER_LAST_BROWSER_LIKE_TIME % user_id if is_like else USER_LAST_BROWSER_REPLY_TIME % user_id
        last_browser_time = self._connection.get(name)
        return last_browser_time if last_browser_time is None else float(last_browser_time)

    def update_user_last_browser_time(self, user_id: str, cache_timestamp: float = None, is_like=True):
        name = USER_LAST_BROWSER_LIKE_TIME % user_id if is_like else USER_LAST_BROWSER_REPLY_TIME % user_id
        if cache_timestamp is None:
            cache_timestamp = time.time()
        self._connection.set(name, cache_timestamp, ex=24 * 60 * 60)

    def add_to_recently_update_comment(self, comment_id):
        pipeline = self._connection.pipeline()
        name = RedisKeyPrefix.COMMENT + NEED_UPDATE_COMMENT_IDS
        pipeline.sadd(name, comment_id)
        pipeline.expire(name, 20 * 60)
        pipeline.execute()

    def cache_topic_ids(self, topics):
        name = TOTAL_TOPIC_IDS
        pipeline = self._connection.pipeline()
        pipeline.delete(name)
        if len(topics) > 0:
            pipeline.zadd(name, topics)
        pipeline.expire(name, 2 * 60 * 60)
        pipeline.execute()

    def get_topic_ids(self, reverse: bool = True, with_scores: bool = False):
        topics = self._connection.zrange(TOTAL_TOPIC_IDS, 0, -1, withscores=with_scores)
        if with_scores:
            return {int(topic_id): score for topic_id, score in topics}
        else:
            topic_ids = [int(topic_id) for topic_id in topics]
            if reverse:
                return list(reversed(topic_ids))
            else:
                return topic_ids

    def increase_topic_views_count(self, topic_id: int) -> None:
        name = TOTAL_TOPIC_IDS
        self._connection.zincrby(name, 1, topic_id)

    def get_topic_views_count(self, topic_id: int) -> int:
        name = TOTAL_TOPIC_IDS
        score = self._connection.zscore(name, topic_id)
        if score is None:
            return 0
        else:
            return int(score)

    def cache_topic_keywords(self, keywords_set: set):
        pipeline = self._connection.pipeline()
        name = TOPIC_SEARCH_KEYWORDS_SET
        if len(keywords_set) > 0:
            pipeline.delete(name)
            pipeline.sadd(name, *keywords_set)
        pipeline.expire(name, 90 * 60)
        pipeline.execute()

    def get_topic_keywords(self):
        name = TOPIC_SEARCH_KEYWORDS_SET
        keywords = self._connection.smembers(name)
        return {word.decode() for word in keywords}

    def del_topic_from_list(self, topic_id):
        name = TOTAL_TOPIC_IDS
        pipeline = self._connection.pipeline()
        pipeline.zrem(name, topic_id)
        pipeline.execute()

    def add_user_filter_author_ids(self, user_id, author_id):
        name = USER_UNINTERESTED_AUTHOR_IDS % user_id
        pipeline = self._connection.pipeline()
        pipeline.sadd(name, author_id)
        pipeline.expire(name, 3 * 24 * 60 * 60)
        pipeline.execute()

    def get_user_filter_author_ids(self, user_id):
        name = USER_UNINTERESTED_AUTHOR_IDS % user_id
        author_ids = self._connection.smembers(name)
        return {int(author_id) for author_id in author_ids}

    def add_to_reply_push_queue(self, comment_id, user_id_be_replied):
        now = datetime.datetime.utcnow()
        name = COMMENT_REPLIED_EVENTS_QUEUE % now.strftime('%Y%m%d')
        pipeline = self._connection.pipeline()
        message = json.dumps(
            {'comment_id': comment_id, 'user_id_be_replied': user_id_be_replied, 'created_time': int(time.time())})
        pipeline.lpush(name, message)
        pipeline.expire(name, 36 * 60 * 60)
        pipeline.execute()

    # 添加 新闻审核状态变更 推送队列
    def add_push_news_audit(self, news_id):
        now = datetime.datetime.utcnow()
        name = NEWS_AUDIT_EVENTS_QUEUE % now.strftime('%Y%m%d')
        pipeline = self._connection.pipeline()
        message = json.dumps({'news_id': news_id, 'created_time': int(time.time())})
        pipeline.lpush(name, message)
        pipeline.expire(name, 36 * 60 * 60)
        pipeline.execute()

    # 添加 新闻被评论 推送队列
    def add_push_news_be_commented(self, news_id, comment_id):
        now = datetime.datetime.utcnow()
        name = NEWS_BE_COMMENTED_QUEUE % now.strftime('%Y%m%d')
        pipeline = self._connection.pipeline()
        message = json.dumps(
            {'news_id': news_id, 'comment_id': comment_id, 'created_time': int(time.time())})
        pipeline.lpush(name, message)
        pipeline.expire(name, 36 * 60 * 60)
        pipeline.execute()

    # 添加 新闻被点赞 推送队列
    def add_push_news_be_liked(self, news_id, like_user_id):
        now = datetime.datetime.utcnow()
        name = NEWS_BE_LIKED_QUEUE % now.strftime('%Y%m%d')
        pipeline = self._connection.pipeline()
        message = json.dumps(
            {'news_id': news_id, 'like_user_id': like_user_id, 'created_time': int(time.time())})
        pipeline.lpush(name, message)
        pipeline.expire(name, 36 * 60 * 60)
        pipeline.execute()

    # 将media_id加入需要更新的队列
    def add_media_to_update_sequence(self, media_id: int):
        self._connection.sadd(NEED_UPDATE_AUTHOR_IDS, media_id)

    def get_update_real_media_ids_(self, date_str: str) -> Set[int]:
        """
        获取某一天有创建新内容的用户集合
        """
        name = UPDATE_MEDIA_IDS % date_str
        media_ids = self._connection.smembers(name)
        return {int(media_id) for media_id in media_ids}

    def cache_update_real_media_id(self, media_id: int) -> None:
        """
        缓存当天有创建过内容的用户media_id
        """
        date_str = datetime.datetime.now().strftime("%Y%m%d")
        name = UPDATE_MEDIA_IDS % date_str
        pipeline = self._connection.pipeline()
        pipeline.sadd(name, media_id)
        pipeline.expire(name, 48 * 60 * 60)
        pipeline.execute()

    def get_be_like_real_media_ids(self, date_str: str) -> Set[int]:
        """
        获取某一天被点赞的用户集合
        """
        name = BE_LIKE_MEDIA_IDS % date_str
        media_ids = self._connection.smembers(name)
        return {int(media_id) for media_id in media_ids}

    def cache_be_like_real_media_id(self, media_id: int) -> None:
        """
        缓存当天有被点赞过的用户media_id
        """
        date_str = datetime.datetime.now().strftime("%Y%m%d")
        name = BE_LIKE_MEDIA_IDS % date_str
        pipeline = self._connection.pipeline()
        pipeline.sadd(name, media_id)
        pipeline.expire(name, 48 * 60 * 60)
        pipeline.execute()

    def get_topic_topic_ids(self):
        """
        获取需要置顶的topic_id
        """
        return [int(topic_id) for topic_id in self._connection.lrange('TOP_TOPIC_IDS', 0, -1)]

    def get_last_browser_news_awards(self, user_id: str, default_time: int = None) -> int:
        """
        获取用户上一次浏览 优质内容收入明细 页面的时间戳
        """
        name = NEWS_AWARD_LAST_BROWSER % user_id
        browser_time = self._connection.get(name)
        if browser_time is None and default_time is not None:
            browser_time = default_time
        return None if browser_time is None else int(browser_time)

    def cache_last_browser_news_awards(self, user_id: str) -> None:
        """
        缓存用户上一次浏览 优质内容收入明细 页面的时间戳
        """
        name = NEWS_AWARD_LAST_BROWSER % user_id
        self._connection.set(name, int(time.time()), ex=24 * 60 * 60)

    def add_news_award_queue(self, news_id):
        """
        将参与激励任务的新闻加到消费者队列
        """
        name = NEWS_AWARD_QUEUE
        pipeline = self._connection.pipeline()
        pipeline.lpush(name, news_id)
        pipeline.execute()

    def pop_news_award_queue(self):
        """
        获取待消费的 优质内容队列
        :return:
        """
        is_empty = self._connection.llen(NEWS_AWARD_QUEUE) == 0
        if is_empty:
            return None
        else:
            return int(self._connection.rpop(NEWS_AWARD_QUEUE))

    def add_incentive_income_push(self, user_id) -> None:
        """
        添加user_id到 昨日有收入的用户 队列
        """
        name = INCENTIVE_INCOME_USER % datetime.datetime.utcnow().strftime("%Y%m%d")
        self._connection.sadd(name, user_id)
        self._connection.expire(name, 86400 * 7)

    def get_incentive_income_push(self, date_str) -> List[str]:
        """
        获取 昨日有收入的用户 队列
        """
        name = INCENTIVE_INCOME_USER % date_str
        return [user_id.decode() for user_id in self._connection.smembers(name)]

    def add_incentive_income_queue(self, user_id, total_award):
        name = INCENTIVE_INCOME_PUSH_QUEUE % datetime.datetime.utcnow().strftime('%Y%m%d')
        self._connection.lpush(name, json.dumps({
            'event_name': 'incentive_income',
            'user_id': user_id,
            'total_award': total_award,
            'created_time': int(time.time())
        }))

    def add_auto_audit_queue(self, news_id: int):
        """
        新闻创建成功, 处于待审核时, 加入机器自动审核队列
        """
        self._connection.sadd('UGC_Machine_Audit', news_id)

    def get_top_news_ids(self) -> List[int]:
        """
        获取需要在首页feed流置顶的帖子
        """
        news_ids = [int(news_id) for news_id in self._connection.lrange('Top_News_Ids', 0, -1)]
        unique_items = UniqueItemList()
        for news_id in news_ids:
            unique_items.append(news_id)
        return unique_items.to_list()

    def get_topic_follow_count(self, topic_id: int):
        """
        获取关注话题的用户人数
        """
        name = TOPIC_FOLLOW_COUNT % topic_id
        count = self._connection.get(name)
        return count if count is None else int(count)

    def cache_topic_follow_count(self, topic_id: int, count: int):
        """
        缓存关注话题的用户人数
        """
        name = TOPIC_FOLLOW_COUNT % topic_id
        self._connection.set(name, value=count, ex=20 * 60)
        return

    def change_topic_follow_count(self, topic_id, is_add, count):
        """
        变更redis中缓存的关注话题的用户人数
        """
        name = TOPIC_FOLLOW_COUNT % topic_id
        if is_add:
            self._connection.incrby(name=name, amount=count)
        else:
            self._connection.decrby(name=name, amount=count)

    def acquire_lock_with_timeout(self, unique_key, acquire_timeout=10, lock_timeout=10):
        import time

        identifier = str(uuid.uuid4())
        lock_name = USER_LOCK % unique_key
        lock_timeout = int(math.ceil(lock_timeout))
        acquired = False
        end = time.time() + acquire_timeout
        while time.time() < end and not acquired:
            acquired = acquire_lock_with_timeout_lua(self._connection, [lock_name], [lock_timeout, identifier])
            time.sleep(0.001 * (not acquired))
        return acquired and identifier

    def release_lock(self, unique_key, identifier):
        lock_name = USER_LOCK % unique_key
        return release_lock_lua(self._connection, [lock_name], [identifier])

    def lock_exists(self, unique_key):
        lock_name = USER_LOCK % unique_key
        return self._connection.exists(lock_name)


redis_client = RedisClient(**config.REDIS_CLIENT_CONFIG)


class LockException(Exception):
    pass


@contextmanager
def acquire_lock(client: RedisClient, unique_key, acquire_timeout=10, lock_timeout=10):
    lock = client.acquire_lock_with_timeout(unique_key, acquire_timeout, lock_timeout)
    if lock is None:
        raise LockException('cannot get lock %s' % unique_key)
    try:
        yield lock
    except:
        raise
    finally:
        client.release_lock(unique_key, lock)


class CacheFunction(object):
    def __init__(self, f, cleaner):
        self.f = f
        self.cleaner = cleaner

    def __call__(self, *args, **kwargs):
        return self.f(*args, **kwargs)

    def clear(self, *args, **kwargs):
        return self.cleaner(*args, **kwargs)


def cache(key, ex=60, cache_on_memory=None, prefix=None, allow_kwargs=True):
    def decorator(func):

        def get_name(args, kwargs):
            if allow_kwargs:
                return key(*args, **kwargs) if callable(key) else key
            else:
                if len(kwargs) > 0:
                    raise ValueError("do not support kwargs, please set allow_kwargs=True")
                return key(*args, *kwargs) if callable(key) else key

        def clear(*args, **kwargs):
            name = get_name(args, kwargs)
            redis_client.clear_object_cache(name, prefix=prefix)

        def inner(*args, **kwargs):
            name = get_name(args, kwargs)
            instance = redis_client.get_object(name, prefix=prefix)
            if instance is None:
                instance = func(*args, **kwargs)
                if instance is not None:
                    redis_client.cache_object(name, instance, ex=ex, cls=DjangoJSONEncoder,
                                              cache_on_memory=cache_on_memory, prefix=prefix)
                    instance = redis_client.get_object(name, prefix=prefix)
            return instance

        return CacheFunction(inner, clear)

    return decorator


def clear_function_cache(f, *args, **kwargs):
    return f.clear(*args, **kwargs)


def clear_cache(key):
    def decorator(func):
        def inner(*args, **kwargs):
            name = key(*args, *kwargs) if callable(key) else key
            instance = func(*args, **kwargs)
            redis_client.batch_delete_object([name])
            return instance

        return inner

    return decorator


def cache_page(page_name, page_id, count, user_id, func, *args, **kwargs):
    name = 'P_%s_%s_%s_%s' % (page_name, page_id, count, user_id)
    data = redis_client.get_object(name)
    if data is None:
        data = func(*args, **kwargs)
        # 一定时间内page不变，看到的内容不变
        if data is not None and len(data) == count:
            redis_client.cache_object(name, data, ex=10 * 60)
        return data
    else:
        return data
