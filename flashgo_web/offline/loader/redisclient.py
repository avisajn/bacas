import base64
import datetime
import json

from common import config
from common.constants import RedisKeyPrefix
from common.loggers import get_offline_logger
from common.redisclient import RedisClient as CommonRedisClient, O_CACHE_DEAL, U_P_FAV_CATS_RECENT, U_P_FAV_CATS, \
    DEAL_CATEGORY_SET, D_HOT_WORD_DEAL, D_HOT_WORD_DEAL_URL, NEWS_of_SELL_CATEGORY, AUTHOR_HOT_FEED, \
    AUTHOR_NORMAL_FEED, AUTHOR_INTEREST_FEED, NEED_UPDATE_COMMENT_IDS
from common.utils import list_to_chunk

logger = get_offline_logger(__name__, 'update_redis_deals.log')

DEAL_SELL_SET = 'D_SELL_SET'
DEAL_SET = 'D_LIST_C_SELL_%s_%s'
DEAL_SET_FLASH = 'D_LIST_C_FLASH_ECOM_%s_%s'
TOP_COMMENTS_DEALS = 'T_C_D_LIST'
USER_FAVORITE_DEALS_LIST = 'U_F_D_%s'
FAVORITE_DEALS_LIST = 'F_D_LIST'
RANDOM_DEALS_LIST = 'R_D_LIST'

N_NEW_CATEGORY_DEALS = 'N_C_D_SET_%s_%s'

# recent update deals
RECENT_UPDATE_DEALS = 'D_MODIFIED_LIST_%s'
TEMP_RECNET_DEAL = 'TEMP_RECENT_DEAL_%s'
# the mapping of category and sell
CATE_SELL_MAP = 'CATE_SELL_M_%s'
hot_size = 1000

CATE_GENDER_BETA = 'CATE_G_BETA_%s'
CATE_GENDER_SHOW_COUNT = 'CATE_G_SHOW_COUNT_%s_%s'
CATE_GENDER_CLick_COUNT = 'CATE_G_CLICK_COUNT_%s_%s'
CATE_GENDER_CATES = "CATE_G_CATES"
NATIVE_CATEGORY_TREE_JSON = 'N_CATE_T_JSON'
LEAF_CATEGORIES = 'N_LEAF_CATE'
FAKE_USER_FEED = 'Fake_user_feed'
REAL_USER_FEED = 'Real_user_feed'


class RedisClient(CommonRedisClient):
    def __init__(self, host, port=6379, db=0, password=None):
        CommonRedisClient.__init__(self, host, port, db, password)

    def get_categories(self):
        return set([int(item.decode('utf-8')) for item in self._connection.smembers(DEAL_CATEGORY_SET)])

    def get_deals(self, category_id, sell_id, *, flash_deal=False):
        key_prefix = DEAL_SET if not flash_deal else DEAL_SET_FLASH
        name = key_prefix % (category_id, sell_id)
        return list(reversed(
            [int(item) for item in
             self._connection.zrange(name, 0, -1)]))

    def batch_get_deals_attributes(self, deals):
        items = list_to_chunk(deals)
        pipeline = self._connection.pipeline()
        ret = {}
        for item in items:
            for deal_id in item:
                pipeline.get(O_CACHE_DEAL % deal_id)
            for value in pipeline.execute():
                if value is not None:
                    deal = json.loads(value, encoding='utf8')['deal']
                    ret[int(deal['id'])] = deal
        return ret

    def cache_top_comments_deals(self, feeds):
        pipeline = self._connection.pipeline()
        pipeline.set(TOP_COMMENTS_DEALS, json.dumps(feeds))
        pipeline.execute()

    def cache_user_favorite_deals(self, feeds, user_id=None):
        pipeline = self._connection.pipline()
        if user_id is None:
            pipeline.set(FAVORITE_DEALS_LIST, json.dumps(feeds))
        else:
            name = USER_FAVORITE_DEALS_LIST % user_id
            pipeline.set(name, json.dumps(feeds))
        pipeline.execute()

    def cache_random_deals(self, feeds):
        pipeline = self._connection.pipeline()
        pipeline.set(json.dumps(feeds))
        pipeline.execute()

    def batch_get_user_recent_fav_cats(self, user_ids):
        pipeline = self._connection.pipeline()
        now = (datetime.datetime.now() - datetime.timedelta(days=1)).strftime('%Y%m%d')
        for user_id in user_ids:
            pipeline.get(U_P_FAV_CATS_RECENT % (now, user_id))
        cats = {}
        for index, value in enumerate(pipeline.execute()):
            user_id = user_ids[index]
            if value is not None:
                cats[user_id] = json.loads(value.decode('utf-8'))
        return cats

    def batch_cache_user_fav_cats(self, user_categories):
        pipeline = self._connection.pipeline()
        now = datetime.datetime.now().strftime('%Y%m%d')
        for user_id, cats in user_categories.items():
            pipeline.set(U_P_FAV_CATS % user_id, json.dumps(cats), ex=30 * 86400)
            pipeline.set(U_P_FAV_CATS_RECENT % (now, user_id), json.dumps(cats), ex=3 * 86400)
        pipeline.execute()

    def _check_and_trim_length(self, name):
        length = self._connection.zcard(name)
        if length > hot_size:
            logger.info('trim {}'.format(name))
            self._connection.zremrangebyrank(name, 0, length - hot_size - 1)

    def add_deal_to_temp(self, deal_id):
        self._connection.lpush(TEMP_RECNET_DEAL % 'redis-normal', int(deal_id))
        self._connection.lpush(TEMP_RECNET_DEAL % 'es-normal', int(deal_id))

    def pop_recent_load_deals(self):
        pipeline = self._connection.pipeline()
        name = TEMP_RECNET_DEAL % 'es-normal'
        if self._connection.llen(name) > 2000:
            pipeline.lrange(name, -2000, -1)
            pipeline.ltrim(name, 0, -2001)
            deal_ids = pipeline.execute()[0]
            return [int(deal_id) for deal_id in deal_ids]
        else:
            return []

    def batch_set_native_category_deals(self, deals: list):
        pipeline = self._connection.pipeline()
        names = set()
        for deal_data in deals:
            name = N_NEW_CATEGORY_DEALS % (deal_data['native_category_id'], deal_data['ecommerce_id'])
            names.add(name)
            pipeline.zadd(name, {deal_data['deal_id']: deal_data['score']})
        pipeline.execute()
        # 检查这波deal添加之后, 长度是否超过了hot_size, 超过就trim成hot_size
        for name in names:
            self._check_and_trim_length(name)

    def get_recent_update_deals(self, date: datetime.datetime):
        date_str = date.strftime('%Y%m%d')
        name = RECENT_UPDATE_DEALS % date_str
        return [int(deal_id) for deal_id in self._connection.lrange(name, 0, -1)]

    def cache_hot_keyword_url(self, keyword, urls):
        keyword = base64.b64encode(keyword.encode('utf-8')).decode('utf-8')
        self._connection.set(D_HOT_WORD_DEAL_URL % keyword, json.dumps(urls), ex=2 * 7 * 86400)

    def get_hot_keyword_urls(self, keyword):
        keyword = base64.b64encode(keyword.encode('utf-8')).decode('utf-8')
        data = self._connection.get(D_HOT_WORD_DEAL_URL % keyword)
        if data is None:
            return []
        else:
            return json.loads(data.decode('utf-8'))

    def cache_hot_keyword_deals(self, keyword, deal_ids):
        keyword = base64.b64encode(keyword.encode('utf-8')).decode('utf-8')
        self._connection.set(D_HOT_WORD_DEAL % keyword, json.dumps(deal_ids), ex=2 * 7 * 86400)

    def cache_deals(self, deals_data, flash_deal=False):
        prefix = DEAL_SET if not flash_deal else DEAL_SET_FLASH
        pipeline = self._connection.pipeline()
        for deal in deals_data:
            name = prefix % (deal['category_id'], deal['ecommerce_id'])
            pipeline.zadd(name, {deal['deal_id']: deal['score']})
        pipeline.execute()

    def add_deals_to_temp(self, deal_ids):
        pipeline = self._connection.pipeline()
        pipeline.lpush(TEMP_RECNET_DEAL % 'es-normal', *deal_ids)
        pipeline.execute()

    def get_deals_updated_recent(self, date):
        pipeline = self._connection.pipeline()
        name = RECENT_UPDATE_DEALS % date.strftime('%Y-%m-%d')
        if self._connection.llen(name) > 2000:
            pipeline.lrange(name, -2000, -1)
            pipeline.ltrim(name, 0, -2001)
            deal_ids = pipeline.execute()[0]
            return [int(deal_id) for deal_id in deal_ids]
        else:
            return []

    def get_yesterday_updated_deals(self):
        pipeline = self._connection.pipeline()
        name = RECENT_UPDATE_DEALS % (datetime.datetime.utcnow() - datetime.timedelta(days=1)).strftime('%Y-%m-%d')
        pipeline.lrange(name, 0, -1)
        pipeline.delete(name)
        deal_ids = pipeline.execute()[0]
        return [int(deal_id) for deal_id in deal_ids]

    def get_info(self):
        return self._connection.info()

    def batch_cache_category_sell_mapping(self, data):
        pipeline = self._connection.pipeline()
        for category in data:
            name = CATE_SELL_MAP % category.id
            pipeline.set(name, category.ecommerce_id)
            pipeline.expire(name, 3 * 60 * 60)
        pipeline.execute()

    def get_category_sell_id(self, category_id):
        sell_id = self._connection.get(CATE_SELL_MAP % category_id)
        if sell_id is None:
            return None
        else:
            return int(sell_id)

    def batch_get_category_sell_mapping(self, category_ids, divide_by_sell=False):
        pipeline = self._connection.pipeline()
        for category_id in category_ids:
            name = CATE_SELL_MAP % category_id
            pipeline.get(name)
        ret = {}
        for index, sell_id in enumerate(pipeline.execute()):
            if divide_by_sell:
                if sell_id is not None:
                    sell_id = int(sell_id)
                    cate_list = ret.get(sell_id, [])
                    cate_list.append(category_ids[index])
                    ret[sell_id] = cate_list
            else:
                ret[category_ids[index]] = sell_id
        return ret

    def get_gender_click_beta(self, gender):
        name = CATE_GENDER_BETA % gender
        data = self._connection.zrange(name, 0, -1, withscores=True)
        if data is not None:
            return {int(cate): float(beta) for cate, beta in data}
        else:
            return None

    def cache_gender_click_count(self, gender, category, count):
        name = CATE_GENDER_CLick_COUNT % (gender, category)
        ttl = self._connection.ttl(name)
        if ttl <= 0:
            new_ttl = 86400 * 7
        else:
            new_ttl = None
        self._connection.sadd(CATE_GENDER_CATES, category)
        self._connection.incr(name, count)
        if new_ttl is not None:
            self._connection.expire(name, new_ttl)

    def get_all_gender_category_list(self):
        return [cate.decode('utf-8') for cate in self._connection.smembers(CATE_GENDER_CATES)]

    def cache_gender_show_count(self, gender, category, count):
        name = CATE_GENDER_SHOW_COUNT % (gender, category)
        ttl = self._connection.ttl(name)
        if ttl <= 0:
            new_ttl = 86400 * 7
        else:
            new_ttl = None
        self._connection.incr(name, count)
        if new_ttl is not None:
            self._connection.expire(name, new_ttl)

    def batch_get_clicks_and_shows(self, gender, categories):
        click = {}
        show = {}
        for cate in list_to_chunk(categories, 100):
            pipeline = self._connection.pipeline()
            for cate_id in cate:
                name = CATE_GENDER_CLick_COUNT % (gender, cate_id)
                pipeline.get(name)
            res = pipeline.execute()
            for index, value in enumerate(res):
                click[cate[index]] = 0 if value is None else int(value)
            pipeline = self._connection.pipeline()
            for cate_id in cate:
                name = CATE_GENDER_SHOW_COUNT % (gender, cate_id)
                pipeline.get(name)
            res = pipeline.execute()
            for index, value in enumerate(res):
                show[cate[index]] = 0 if value is None else int(value)
        return click, show

    def cache_gender_click_beta(self, gender, data):
        name = CATE_GENDER_BETA % gender
        pipeline = self._connection.pipeline()
        for cate, beta in data.items():
            pipeline.zadd(name, {cate: beta})
        pipeline.execute()

    def cache_category_tree_json(self, json_data):
        pipeline = self._connection.pipeline()
        pipeline.set(NATIVE_CATEGORY_TREE_JSON, json_data)
        pipeline.expire(NATIVE_CATEGORY_TREE_JSON, 60 * 60 * 3)
        pipeline.execute()

    def get_category_tree(self):
        data = self._connection.get(NATIVE_CATEGORY_TREE_JSON)
        if data is not None:
            return json.loads(data.decode())
        else:
            return None

    def cache_leaf_categories(self, category_ids):
        pipeline = self._connection.pipeline()
        if len(category_ids) > 0:
            pipeline.delete(LEAF_CATEGORIES)
            pipeline.sadd(LEAF_CATEGORIES, *category_ids)
            pipeline.execute()

    def get_leaf_categories(self):
        category_ids = self._connection.smembers(LEAF_CATEGORIES)
        if category_ids is None:
            return []
        else:
            return [int(category_id) for category_id in category_ids]

    def del_invalid_news_ids(self, category_id, news_type, invalid_news_ids):
        name = NEWS_of_SELL_CATEGORY % (category_id, news_type)
        pipeline = self._connection.pipeline()
        for new_id in invalid_news_ids:
            pipeline.lrem(name, 1, new_id)
        pipeline.execute()

    def cache_author_feed(self, media_id, news_ids, is_hot=False):
        name = AUTHOR_HOT_FEED % media_id if is_hot else AUTHOR_NORMAL_FEED % media_id
        pipeline = self._connection.pipeline()
        if len(news_ids) > 0:
            pipeline.delete(name)
            pipeline.rpush(name, *news_ids)
        pipeline.execute()

    def cache_interest_authors(self, interest_id, author_ids):
        name = AUTHOR_INTEREST_FEED % interest_id
        if len(author_ids) > 0:
            pipeline = self._connection.pipeline()
            pipeline.delete(name)
            pipeline.rpush(name, *author_ids)
            pipeline.execute()

    def get_recent_like_comment(self, del_old_data=False):
        name = RedisKeyPrefix.COMMENT + NEED_UPDATE_COMMENT_IDS
        pipeline = self._connection.pipeline()
        pipeline.smembers(name)
        if del_old_data:
            pipeline.delete(name)
        return [int(comment_id) for comment_id in pipeline.execute()[0]]


redis_client = RedisClient(**config.OFFLINE_REDIS_CLIENT_CONFIG)
