import base64
import datetime
import json
import functools
import logging

import redis

DEAL_CATEGORY_SET = 'D_CATEGORY_SET'
DEAL_SELL_SET = 'D_SELL_SET'

DEAL_SET = 'D_LIST_C_SELL_%s_%s'
DEAL_SET_PREFIX = DEAL_SET[:-len('_%s_%s')]
DEAL_SET_FLASH = 'D_LIST_C_FLASH_ECOM_%s_%s'
DEAL_SET_FLASH_PREFIX = DEAL_SET_FLASH[:-len('_%s_%s')]

DEAL_CACHE = 'D_TMP_CACHE_%s'
MAX_DEAL_SIZE_LEVEL_1 = 50000
MAX_DEAL_SIZE_LEVEL_2 = 200000

FLASH_DEAL_CATEGORY = 10000
CHEAPEST_CATEGORY = 10001

FLASH_DEAL_SIZE = 200000
CHEAPEST_DEAL_SIZE = 20000

# category的hash
TABLE_CATEGORY_CACHE = 'TABLE_CAT'
# ecommerces hash
TABLE_ECOMMERCE = 'TABLE_ECOM'
# common_ecom_categories
TABLE_ECOM_CAT = 'TABLE_ECOM_CAT'
O_CACHE = 'O_C_%s'

RECENT_DEL_DEAL_ARRAY = 'RECENT_DEL_D_ARRAY'


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


def parse_int(number):
    try:
        return int(number)
    except:
        return 0


add_deal_with_max_size_lua = script_load("""
redis.call('zadd', KEYS[1], ARGV[1], ARGV[2])
if ARGV[4] then
    redis.call('sadd', "{categores}", ARGV[4])
end
if ARGV[5] then
    redis.call('sadd', "{sells}", ARGV[5])
end
if redis.call('zcount', KEYS[1], '-inf', '+inf') > tonumber(ARGV[3]) then
    local value = redis.call('zrange', KEYS[1], 0, 0)[1]
    if value then
        redis.call('zrem', KEYS[1], tostring(value))
        return value
    else
        return nil
    end
end
""".format(categores=DEAL_CATEGORY_SET, sells=DEAL_SELL_SET))

del_deal_lua = script_load("""
local categorise = redis.call('smembers', "{categores}")
local sells = redis.call('smembers', "{sells}")
for _,key_prefix in ipairs(KEYS) do
    for _,category in ipairs(categorise) do
        for _,sell in ipairs(sells) do
            local key = key_prefix .. '_' .. category .. '_' .. sell
            redis.call('zrem', key, ARGV[1])
        end
    end
end
""".format(categores=DEAL_CATEGORY_SET, sells=DEAL_SELL_SET))

del_deal_with_category_lua = script_load("""
local sells = redis.call('smembers', "{sells}")
local category = ARGV[2]
for _,key_prefix in ipairs(KEYS) do
   for _,sell in ipairs(sells) do
       local key = key_prefix .. '_' .. category .. '_' .. sell
       redis.call('zrem', key, ARGV[1])
   end
end
""".format(categores=DEAL_CATEGORY_SET, sells=DEAL_SELL_SET))


class RedisSortedList(object):
    """
    redis-base sorted list with limit length
    """

    def __init__(self, redis_client: redis.StrictRedis, prefix, max_length):
        self.redis_client = redis_client
        self.prefix = prefix
        self.max_length = max_length
        self.category_set_name = self.prefix + '_CAT_S'

    def _get_name(self, category_id):
        return '%s_%s' % (self.prefix, category_id)

    def add_deal(self, deal_id, category_id, score):
        name = self._get_name(category_id)
        pipeline = self.redis_client.pipeline()
        length = self.redis_client.zcount(name, '-inf', '+inf')
        pipeline.zadd(name, {int(deal_id): score})
        pipeline.sadd(self.category_set_name, category_id)
        if length + 1 > self.max_length:
            self.redis_client.zpopmin(name, count=1)

    def del_deal(self, deal_id):
        pass

    def get_deal_list(self, category):
        pass


class Deal(object):
    def __init__(self, id=None, ecommerce_id=None, type=None, off=None, sales=None, stock=None, valid=None,
                 createdtime=None, current_price=None, deal_id=None, **kwargs):
        self.id = id if id is not None else deal_id
        self.deal_id = deal_id
        self.ecommerce_id = ecommerce_id
        self.type = type
        self.off = off
        self.sales = sales
        self.stock = stock
        self.valid = valid
        self.current_price = current_price
        self.createdtime = createdtime
        self.comments = kwargs.get('comments', 0)
        if self.comments is None:
            self.comments = 0
        self.stars = kwargs.get('stars', 0)
        if self.stars is None:
            self.stars = 0
        self.view_count = kwargs.get('view_count', 0)
        if self.view_count is None:
            self.view_count = 0

    def to_dict(self):
        return self.__dict__

    def get_score(self):
        score1 = ((self.comments / 5) / 3 + self.stars / 3 + self.view_count / 900) * 50 / 4
        if score1 >= 1 * 50:
            score1 = 50
        score2 = (self.sales / 30) * 50
        return score1 + score2


class DealCategory(object):
    def __init__(self, deal_id=None, category_id=None, level=None, **kwargs):
        self.deal_id = deal_id
        self.category_id = category_id
        self.level = level


class FlashDeal(object):
    def __init__(self, deal_id, starttime, endtime, **kwargs):
        self.deal_id = deal_id
        self.start_time = int(datetime.datetime.strptime(starttime[:19], '%Y-%m-%d %H:%M:%S').timestamp())
        self.end_time = int(datetime.datetime.strptime(endtime[:19], '%Y-%m-%d %H:%M:%S').timestamp())

    def valid(self):
        now = datetime.datetime.now().timestamp()
        # TODO 把时间修改回来
        return now - self.end_time <= 24 * 60 * 60


def clean_and_split_data(data: bytes):
    def _index(data, sub):
        try:
            return data.index(sub)
        except:
            return -1

    def _rindex(data, sub):
        try:
            return data.rindex(sub)
        except:
            return -1

    items = data.split(b'{"database":')
    tables = []
    for _item in items:
        item = b'{"database":' + _item
        start_index = _index(item, b'{')
        end_index = _rindex(item, b'}')
        if 0 <= start_index < end_index:
            tables.append(item[start_index:end_index + 1])
    return tables


def safe_json(data: bytes):
    try:
        if data is not None:
            return json.loads(data.decode('utf-8'))
        else:
            return None
    except:
        logger.exception('parse data %s error' % data)
        return None


class RedisClient(object):
    def __init__(self, host, port=6379, db=0, password=None):
        self.redis_client = redis.StrictRedis(host=host, port=port, db=db, password=password,
                                              socket_connect_timeout=3)

    def get_categories(self):
        return set([int(item.decode('utf-8')) for item in self.redis_client.smembers(DEAL_CATEGORY_SET)])

    def get_sells(self):
        return set([item.decode('utf-8') for item in self.redis_client.smembers(DEAL_SELL_SET)])

    def get_deals(self, category_id, sell_id, flash_deal=False):
        key_prefix = DEAL_SET if not flash_deal else DEAL_SET_FLASH
        name = key_prefix % (category_id, sell_id)
        return list(reversed(
            [int(item) for item in
             self.redis_client.zrange(name, 0, max(MAX_DEAL_SIZE_LEVEL_1, MAX_DEAL_SIZE_LEVEL_2))]))

    def batch_cache_deals(self, deals: list):
        chunks = [deals[x:x + 500] for x in range(0, len(deals), 500)]
        for chunk in chunks:
            pipeline = self.redis_client.pipeline()
            for item in chunk:
                pipeline.set(DEAL_CACHE % item.id, json.dumps(item.to_dict()), ex=10 * 60)
            pipeline.execute()

    def set_deal(self, deal: Deal):
        self.redis_client.set(DEAL_CACHE % deal.id, json.dumps(deal.to_dict()), ex=10 * 60)

    def get_deal(self, deal_id) -> Deal:
        data = self.redis_client.get(DEAL_CACHE % deal_id)
        deal = safe_json(data)
        if deal is not None:
            return Deal(**deal)
        else:
            return None

    def add_deal(self, category_id, deal: Deal, max_size=MAX_DEAL_SIZE_LEVEL_2, score=None):
        deal_set_name = DEAL_SET if deal.type == 'N' else DEAL_SET_FLASH
        if score is None:
            score = deal.sales
        if deal.type == 'F' or deal.current_price > 30000:
            add_deal_with_max_size_lua(self.redis_client, keys=[deal_set_name % (category_id, deal.ecommerce_id)],
                                       args=[score, deal.id, max_size, category_id, deal.ecommerce_id])
        # 低价的
        if 5000 < deal.current_price <= 30000:
            add_deal_with_max_size_lua(self.redis_client, keys=[deal_set_name % (CHEAPEST_CATEGORY, deal.ecommerce_id)],
                                       args=[score, deal.id, CHEAPEST_DEAL_SIZE, CHEAPEST_CATEGORY, deal.ecommerce_id])

    def del_deal(self, deal_id, category_id=None):
        self.redis_client.lpush(RECENT_DEL_DEAL_ARRAY, deal_id)
        if self.redis_client.llen(RECENT_DEL_DEAL_ARRAY) > 1000:
            self.redis_client.ltrim(RECENT_DEL_DEAL_ARRAY, 0, 1000)
        if category_id is None:
            self.redis_client.delete(DEAL_CACHE % deal_id)
            del_deal_lua(self.redis_client, keys=[DEAL_SET_PREFIX, DEAL_SET_FLASH_PREFIX], args=[deal_id])
        else:
            del_deal_with_category_lua(self.redis_client, keys=[DEAL_SET_PREFIX, DEAL_SET_FLASH_PREFIX],
                                       args=[deal_id, category_id])

    def push(self, key, value, max_length=-1):
        if max_length > 0:
            self.redis_client.ltrim(key, -max_length, -1)
        self.redis_client.rpush(key, value)

    def update_hash(self, key_name, key, value):
        self.redis_client.hset(key_name, key, value)

    def del_hash_key(self, key_name, key):
        self.redis_client.hdel(key_name, key)

    def del_object(self, name):
        self.redis_client.delete(O_CACHE % name)


class LambdaHandler(object):
    def __init__(self, redis_host, redis_port, redis_db, redis_password):
        self.redis_args = {
            'host': redis_host,
            'port': redis_port,
            'db': redis_db,
            'password': redis_password
        }

    def handle(self, event, context):
        redis_client = RedisClient(**self.redis_args)
        for record in event['Records']:
            payload = base64.b64decode(record['kinesis']['data'])  # type: bytes
            items = clean_and_split_data(payload)
            for item in items:
                self.process_tables(redis_client, safe_json(item))
            if len(items) == 0:
                logger.info('%s cannot split' % payload)
        return 'ok'

    def process_tables(self, redis_client: RedisClient, data):
        if data is None:
            return
        redis_client.push('CXS_NEW_TEST', json.dumps(data), max_length=10)
        table = data.get('table', '')
        handlers = {
            'deals_deals': self.process_table_deals,
            'deals_dealcategories': self.process_table_deal_category,
            'deals_flashdeals': self.process_table_flash_deals,
            'common_categories': functools.partial(self.process_common_table, 'common_categories'),
            'common_ecommerces': functools.partial(self.process_common_table, 'common_ecommerces'),
            'common_ecom_categories': functools.partial(self.process_common_table, 'common_ecom_categories'),
            'favorite_userflashremind': self.process_flash_reminder,
        }
        if table in handlers:
            try:
                handlers[table](redis_client, data)
                if table.startswith('deals_'):
                    self.delete_deal_cache(redis_client, data)
            except:
                logger.exception('process %s error, data is %s' % (table, data))

    def process_table_deals(self, redis_client: RedisClient, data):
        # 需要保证先存deals，再存category
        operators = data['type']
        deal = Deal(**data['data'])
        if operators == 'delete' or deal.valid != 1:
            redis_client.del_deal(deal.id)
        else:
            redis_client.set_deal(deal)
        # 删除缓存
        self.delete_deal_cache(redis_client, data={}, deal_id=deal.id)

    @staticmethod
    def process_table_deal_category(redis_client: RedisClient, data):
        operators = data['type']
        deal_category = DealCategory(**data['data'])
        deal = redis_client.get_deal(deal_category.deal_id)
        if operators == 'delete':
            redis_client.del_deal(deal_category.deal_id, category_id=deal_category.category_id)
        else:
            if deal is None or deal.type != 'N':
                return
            max_size = MAX_DEAL_SIZE_LEVEL_1 if deal_category.level == 1 else MAX_DEAL_SIZE_LEVEL_2
            redis_client.add_deal(deal_category.category_id, deal, max_size=max_size, score=deal.get_score())

    @staticmethod
    def process_table_flash_deals(redis_client: RedisClient, data):
        operators = data['type']
        flash_deal = FlashDeal(**data['data'])
        deal = redis_client.get_deal(flash_deal.deal_id)
        if operators == 'delete' or not flash_deal.valid() or (deal is not None and deal.valid != 1):
            redis_client.del_deal(flash_deal.deal_id)
        else:
            if deal is None or deal.type != 'F':
                return
            max_size = FLASH_DEAL_SIZE
            redis_client.add_deal(FLASH_DEAL_CATEGORY, deal, max_size=max_size, score=flash_deal.end_time)

    @staticmethod
    def process_common_table(table_name, redis_client: RedisClient, data):
        tables = {
            'common_categories': TABLE_CATEGORY_CACHE,
            'common_ecommerces': TABLE_ECOMMERCE,
            'common_ecom_categories': TABLE_ECOM_CAT,
        }
        operators = data['type']
        table_item = data['data']
        id = str(table_item.get('id', ''))
        if id is not None and len(id) > 0 and table_name in tables:
            key_name = tables[table_name]
            if operators == 'delete':
                redis_client.del_hash_key(key_name, id)
            else:
                redis_client.update_hash(key_name, id, json.dumps(table_item))

    @staticmethod
    def process_flash_reminder(redis_client: RedisClient, data):
        table_item = data['data']
        user_id = table_item.get('user_id', None)
        if user_id is not None:
            redis_client.del_object('REMINDER_%s' % user_id)

    @staticmethod
    def delete_deal_cache(redis_client: RedisClient, data, deal_id=None):
        if deal_id is None:
            table_item = data.get('data', {})
            deal_id = table_item.get('deal_id', None)
        if deal_id is not None:
            redis_client.del_object('deal_%s_%s' % (deal_id, 0))
            redis_client.del_object('deal_%s_%s' % (deal_id, 1))


handler = LambdaHandler('flashgo-cache.kub6uf.0001.apse1.cache.amazonaws.com', 6379, redis_db=0,
                        redis_password='8888@swdcggz')


def get_logger():
    # This is a tricky method which I do not know why it work
    # answer from https://stackoverflow.com/questions/37703609/using-python-logging-with-aws-lambda
    logger = logging.getLogger()
    if logger.handlers:
        for handler in logger.handlers:
            logger.removeHandler(handler)
    logging.basicConfig(format='%(asctime)s %(message)s', level=logging.INFO)
    return logger


logger = None


def lambda_function(event, context):
    global logger
    if logger is None:
        logger = get_logger()
    try:
        return handler.handle(event, context)
    except Exception as e:
        logger.exception('handler function error')
        raise e


def _test():
    handler = LambdaHandler('flashgo-cache.kub6uf.0001.apse1.cache.amazonaws.com', 6379, redis_db=0,
                            redis_password='8888@swdcggz')
    event = {
        "Records": [
            {
                "kinesis": {
                    "partitionKey": "partitionKey-03",
                    "kinesisSchemaVersion": "1.0",
                    "data": "IvOJmsIKB2ZsYXNoZ28akQYIABqMBnsiZGF0YWJhc2UiOiJmbGFzaGdvIiwidGFibGUiOiJkZWFsc19kZWFscyIsInR5cGUiOiJpbnNlcnQiLCJ0cyI6MTU0NDY5MTQzNiwieGlkIjozMDAyNDMsInhvZmZzZXQiOjAsImRhdGEiOnsiaWQiOjU5OTUsImVjb21tZXJjZV9pZCI6MywidGl0bGUiOiJjbiA2NTIxMiBqdW1ibyBhZGlkYXMganVtYm8gdHJhaW5pbmcgc2V0IHNldGVsYW4gYXRhc2FuIGJhd2FoYW4gd2FuaXRhIG11cmFoIG9sYWhyYWdhIHNlbmFtIGpvZ2dpbmcgZ3ltIFhYWEwgYmlnIHNpemUgYmVzYXIgbWFydW4gbmF2eSBwaW5rIGJpcnUgc2FrdSIsImRlc2NyaXB0aW9uIjoiIiwidHlwZSI6IkYiLCJvZmYiOjAuOTksIm9yaWdpbmFsX3ByaWNlIjowLjAsImN1cnJlbnRfcHJpY2UiOjAuMCwic2FsZXMiOjAsInN0b2NrIjo2MCwiY29tbWVudHMiOjYsInN0YXJzIjo0LjIsInZhbGlkIjoxLCJ0cmFja2luZ2xpbmsiOiIiLCJkZWVwbGluayI6ImJ1a2FsYXBhazovL3d3dy5idWthbGFwYWsuY29tL3AvZmFzaGlvbi13YW5pdGEvc3dlYXRlci9menNkZG8tanVhbC1jbi02NTIxMi1qdW1iby1hZGlkYXMtanVtYm8tdHJhaW5pbmctc2V0LXNldGVsYW4tYXRhc2FuLWJhd2FoYW4td2FuaXRhLW11cmFoLW9sYWhyYWdhLXNlbmFtLWpvZ2dpbmctZ3ltLXh4eGwtYmlnLXNpemUtYmVzYXItbWFydW4tbmF2eS1waW5rLWJpcnUtc2FrdSIsIndlYmxpbmsiOiIiLCJjcmVhdGVkdGltZSI6IjIwMTgtMTItMTMgMDg6NTc6MTAuOTYyOTI0IiwiY3Jhd2xlZHRpbWUiOiIyMDE4LTEyLTEzIDA4OjU2OjMxLjEwMzEyNCJ9fRq2AggAGrECeyJkYXRhYmFzZSI6ImZsYXNoZ28iLCJ0YWJsZSI6ImRlYWxzX2ZsYXNoZGVhbHMiLCJ0eXBlIjoiaW5zZXJ0IiwidHMiOjE1NDQ2OTE0MzYsInhpZCI6MzAwMjQzLCJ4b2Zmc2V0IjoxLCJkYXRhIjp7ImlkIjo1MzksImRlYWxfaWQiOjU5OTUsInN0YXJ0dGltZSI6IjIwMTgtMTItMTMgMDk6MDA6MDAuMDAwMDAwIiwiZW5kdGltZSI6IjIwMTgtMTItMTMgMTI6NTk6MDAuMDAwMDAwIiwiY3JlYXRlZHRpbWUiOiIyMDE4LTEyLTEzIDA4OjU3OjExLjA1MzU2NCIsInVwZGF0ZWR0aW1lIjoiMjAxOC0xMi0xMyAwODo1NzoxMS4wNTM2MDEifX0a9gEIABrxAXsiZGF0YWJhc2UiOiJmbGFzaGdvIiwidGFibGUiOiJkZWFsc19kZWFsYXJ0aWNsZXMiLCJ0eXBlIjoiaW5zZXJ0IiwidHMiOjE1NDQ2OTE0MzYsInhpZCI6MzAwMjQzLCJ4b2Zmc2V0IjoyLCJkYXRhIjp7ImlkIjo1OTk0LCJkZWFsX2lkIjo1OTk1LCJhcnRpY2xlIjoiIiwiY3JlYXRlZHRpbWUiOiIyMDE4LTEyLTEzIDA4OjU3OjExLjE0MzgwOSIsInVwZGF0ZWR0aW1lIjoiMjAxOC0xMi0xMyAwODo1NzoxMS4xNDM4NjcifX0ahwIIABqCAnsiZGF0YWJhc2UiOiJmbGFzaGdvIiwidGFibGUiOiJkZWFsc19kZWFsY2F0ZWdvcmllcyIsInR5cGUiOiJpbnNlcnQiLCJ0cyI6MTU0NDY5MTQzNywieGlkIjozMDAyNDMsInhvZmZzZXQiOjMsImRhdGEiOnsiaWQiOjExOTg1LCJkZWFsX2lkIjo1OTk1LCJjYXRlZ29yeV9pZCI6NDAsImxldmVsIjoxLCJjcmVhdGVkdGltZSI6IjIwMTgtMTItMTMgMDg6NTc6MTEuMjMzODg1IiwidXBkYXRlZHRpbWUiOiIyMDE4LTEyLTEzIDA4OjU3OjExLjIzMzk0NCJ9fRqHAggAGoICeyJkYXRhYmFzZSI6ImZsYXNoZ28iLCJ0YWJsZSI6ImRlYWxzX2RlYWxjYXRlZ29yaWVzIiwidHlwZSI6Imluc2VydCIsInRzIjoxNTQ0NjkxNDM3LCJ4aWQiOjMwMDI0MywieG9mZnNldCI6NCwiZGF0YSI6eyJpZCI6MTE5ODcsImRlYWxfaWQiOjU5OTUsImNhdGVnb3J5X2lkIjo0NiwibGV2ZWwiOjIsImNyZWF0ZWR0aW1lIjoiMjAxOC0xMi0xMyAwODo1NzoxMS4zMjM4NjYiLCJ1cGRhdGVkdGltZSI6IjIwMTgtMTItMTMgMDg6NTc6MTEuMzIzOTM0In19GscCCAAawgJ7ImRhdGFiYXNlIjoiZmxhc2hnbyIsInRhYmxlIjoiZGVhbHNfZGVhbGFydGljbGVpbWFnZXMiLCJ0eXBlIjoiaW5zZXJ0IiwidHMiOjE1NDQ2OTE0MzcsInhpZCI6MzAwMjQzLCJ4b2Zmc2V0Ijo1LCJkYXRhIjp7ImlkIjo2OTAxLCJkZWFsX2lkIjo1OTk1LCJvcmRlciI6MCwiaW1hZ2UiOiJodHRwczovL3MzLmJ1a2FsYXBhay5jb20vaW1nLzMyOTYyMjIwNzQvbWVkaXVtL2NuXzY1MjEyX2p1bWJvX2FkaWRhc19qdW1ib190cmFpbmluZ19zZXRfc2V0ZWxhbl9hdGFzYW5fYmF3YS5qcGciLCJjcmVhdGVkdGltZSI6IjIwMTgtMTItMTMgMDg6NTc6MTEuNDEzNDY1In19GscCCAAawgJ7ImRhdGFiYXNlIjoiZmxhc2hnbyIsInRhYmxlIjoiZGVhbHNfZGVhbGFydGljbGVpbWFnZXMiLCJ0eXBlIjoiaW5zZXJ0IiwidHMiOjE1NDQ2OTE0MzcsInhpZCI6MzAwMjQzLCJ4b2Zmc2V0Ijo2LCJkYXRhIjp7ImlkIjo2OTAyLCJkZWFsX2lkIjo1OTk1LCJvcmRlciI6MSwiaW1hZ2UiOiJodHRwczovL3MzLmJ1a2FsYXBhay5jb20vaW1nLzg1ODA2ODAwNzQvbWVkaXVtL2NuXzY1MjEyX2p1bWJvX2FkaWRhc19qdW1ib190cmFpbmluZ19zZXRfc2V0ZWxhbl9hdGFzYW5fYmF3YS5qcGciLCJjcmVhdGVkdGltZSI6IjIwMTgtMTItMTMgMDg6NTc6MTEuNDEzNTA5In19GscCCAAawgJ7ImRhdGFiYXNlIjoiZmxhc2hnbyIsInRhYmxlIjoiZGVhbHNfZGVhbGFydGljbGVpbWFnZXMiLCJ0eXBlIjoiaW5zZXJ0IiwidHMiOjE1NDQ2OTE0MzcsInhpZCI6MzAwMjQzLCJ4b2Zmc2V0Ijo3LCJkYXRhIjp7ImlkIjo2OTAzLCJkZWFsX2lkIjo1OTk1LCJvcmRlciI6MiwiaW1hZ2UiOiJodHRwczovL3MzLmJ1a2FsYXBhay5jb20vaW1nLzg2ODA2ODAwNzQvbWVkaXVtL2NuXzY1MjEyX2p1bWJvX2FkaWRhc19qdW1ib190cmFpbmluZ19zZXRfc2V0ZWxhbl9hdGFzYW5fYmF3YS5qcGciLCJjcmVhdGVkdGltZSI6IjIwMTgtMTItMTMgMDg6NTc6MTEuNDEzNTMwIn19GscCCAAawgJ7ImRhdGFiYXNlIjoiZmxhc2hnbyIsInRhYmxlIjoiZGVhbHNfZGVhbGFydGljbGVpbWFnZXMiLCJ0eXBlIjoiaW5zZXJ0IiwidHMiOjE1NDQ2OTE0MzcsInhpZCI6MzAwMjQzLCJ4b2Zmc2V0Ijo4LCJkYXRhIjp7ImlkIjo2OTA0LCJkZWFsX2lkIjo1OTk1LCJvcmRlciI6MywiaW1hZ2UiOiJodHRwczovL3MzLmJ1a2FsYXBhay5jb20vaW1nLzM1MzE2ODAwNzQvbWVkaXVtL2NuXzY1MjEyX2p1bWJvX2FkaWRhc19qdW1ib190cmFpbmluZ19zZXRfc2V0ZWxhbl9hdGFzYW5fYmF3YS5qcGciLCJjcmVhdGVkdGltZSI6IjIwMTgtMTItMTMgMDg6NTc6MTEuNDEzNTQ1In19GskCCAAaxAJ7ImRhdGFiYXNlIjoiZmxhc2hnbyIsInRhYmxlIjoiZGVhbHNfZGVhbGFydGljbGVpbWFnZXMiLCJ0eXBlIjoiaW5zZXJ0IiwidHMiOjE1NDQ2OTE0MzcsInhpZCI6MzAwMjQzLCJjb21taXQiOnRydWUsImRhdGEiOnsiaWQiOjY5MDUsImRlYWxfaWQiOjU5OTUsIm9yZGVyIjo0LCJpbWFnZSI6Imh0dHBzOi8vczMuYnVrYWxhcGFrLmNvbS9pbWcvMzk2MjIyMjA3NC9tZWRpdW0vY25fNjUyMTJfanVtYm9fYWRpZGFzX2p1bWJvX3RyYWluaW5nX3NldF9zZXRlbGFuX2F0YXNhbl9iYXdhLmpwZyIsImNyZWF0ZWR0aW1lIjoiMjAxOC0xMi0xMyAwODo1NzoxMS40MTM1NjAifX0a6wQIABrmBHsiZGF0YWJhc2UiOiJmbGFzaGdvIiwidGFibGUiOiJkZWFsc19kZWFscyIsInR5cGUiOiJpbnNlcnQiLCJ0cyI6MTU0NDY5MTQzNiwieGlkIjozMDAyNDQsInhvZmZzZXQiOjAsImRhdGEiOnsiaWQiOjU5OTYsImVjb21tZXJjZV9pZCI6MywidGl0bGUiOiJNMTA5IE1haW5hbiBBbmFrIFJvYm9jYXIgUG9saSAxIHNldCAtIDQgcGNzIC0gRmlndXJlIFRyYW5zZm9ybSAiLCJkZXNjcmlwdGlvbiI6IiIsInR5cGUiOiJGIiwib2ZmIjowLjk5LCJvcmlnaW5hbF9wcmljZSI6MC4wLCJjdXJyZW50X3ByaWNlIjowLjAsInNhbGVzIjowLCJzdG9jayI6NjAsImNvbW1lbnRzIjowLCJzdGFycyI6MC4wLCJ2YWxpZCI6MSwidHJhY2tpbmdsaW5rIjoiIiwiZGVlcGxpbmsiOiJidWthbGFwYWs6Ly93d3cuYnVrYWxhcGFrLmNvbS9wL2hvYmkta29sZWtzaS9tYWluYW4vYWN0aW9uLWZpZ3VyZS9oNTE0eW4tanVhbC1tMTA5LW1haW5hbi1hbmFrLXJvYm9jYXItcG9saS0xLXNldC00LXBjcy1maWd1cmUtdHJhbnNmb3JtIiwid2VibGluayI6IiIsImNyZWF0ZWR0aW1lIjoiMjAxOC0xMi0xMyAwODo1NzoxMC45ODYwNDIiLCJjcmF3bGVkdGltZSI6IjIwMTgtMTItMTMgMDg6NTY6MzEuMTAyMDE4In19GrYCCAAasQJ7ImRhdGFiYXNlIjoiZmxhc2hnbyIsInRhYmxlIjoiZGVhbHNfZmxhc2hkZWFscyIsInR5cGUiOiJpbnNlcnQiLCJ0cyI6MTU0NDY5MTQzNiwieGlkIjozMDAyNDQsInhvZmZzZXQiOjEsImRhdGEiOnsiaWQiOjU0MCwiZGVhbF9pZCI6NTk5Niwic3RhcnR0aW1lIjoiMjAxOC0xMi0xMyAwOTowMDowMC4wMDAwMDAiLCJlbmR0aW1lIjoiMjAxOC0xMi0xMyAxMjo1OTowMC4wMDAwMDAiLCJjcmVhdGVkdGltZSI6IjIwMTgtMTItMTMgMDg6NTc6MTEuMDc3OTU0IiwidXBkYXRlZHRpbWUiOiIyMDE4LTEyLTEzIDA4OjU3OjExLjA3ODAxMCJ9fRr2AQgAGvEBeyJkYXRhYmFzZSI6ImZsYXNoZ28iLCJ0YWJsZSI6ImRlYWxzX2RlYWxhcnRpY2xlcyIsInR5cGUiOiJpbnNlcnQiLCJ0cyI6MTU0NDY5MTQzNiwieGlkIjozMDAyNDQsInhvZmZzZXQiOjIsImRhdGEiOnsiaWQiOjU5OTUsImRlYWxfaWQiOjU5OTYsImFydGljbGUiOiIiLCJjcmVhdGVkdGltZSI6IjIwMTgtMTItMTMgMDg6NTc6MTEuMTY2NjcwIiwidXBkYXRlZHRpbWUiOiIyMDE4LTEyLTEzIDA4OjU3OjExLjE2NjcyNyJ9fRqIAggAGoMCeyJkYXRhYmFzZSI6ImZsYXNoZ28iLCJ0YWJsZSI6ImRlYWxzX2RlYWxjYXRlZ29yaWVzIiwidHlwZSI6Imluc2VydCIsInRzIjoxNTQ0NjkxNDM3LCJ4aWQiOjMwMDI0NCwieG9mZnNldCI6MywiZGF0YSI6eyJpZCI6MTE5ODYsImRlYWxfaWQiOjU5OTYsImNhdGVnb3J5X2lkIjoxMDQsImxldmVsIjoxLCJjcmVhdGVkdGltZSI6IjIwMTgtMTItMTMgMDg6NTc6MTEuMjU0MjM3IiwidXBkYXRlZHRpbWUiOiIyMDE4LTEyLTEzIDA4OjU3OjExLjI1NDMxNiJ9fRqIAggAGoMCeyJkYXRhYmFzZSI6ImZsYXNoZ28iLCJ0YWJsZSI6ImRlYWxzX2RlYWxjYXRlZ29yaWVzIiwidHlwZSI6Imluc2VydCIsInRzIjoxNTQ0NjkxNDM3LCJ4aWQiOjMwMDI0NCwieG9mZnNldCI6NCwiZGF0YSI6eyJpZCI6MTE5ODgsImRlYWxfaWQiOjU5OTYsImNhdGVnb3J5X2lkIjoxMDYsImxldmVsIjoyLCJjcmVhdGVkdGltZSI6IjIwMTgtMTItMTMgMDg6NTc6MTEuMzQzMDAwIiwidXBkYXRlZHRpbWUiOiIyMDE4LTEyLTEzIDA4OjU3OjExLjM0MzA1MyJ9fRrHAggAGsICeyJkYXRhYmFzZSI6ImZsYXNoZ28iLCJ0YWJsZSI6ImRlYWxzX2RlYWxhcnRpY2xlaW1hZ2VzIiwidHlwZSI6Imluc2VydCIsInRzIjoxNTQ0NjkxNDM3LCJ4aWQiOjMwMDI0NCwieG9mZnNldCI6NSwiZGF0YSI6eyJpZCI6NjkwNiwiZGVhbF9pZCI6NTk5Niwib3JkZXIiOjAsImltYWdlIjoiaHR0cHM6Ly9zMi5idWthbGFwYWsuY29tL2ltZy8yODI0ODMzMTUyL21lZGl1bS9NMTA5X01haW5hbl9BbmFrX1JvYm9jYXJfUG9saV8xX3NldF9fXzRfcGNzX19fRmlndXJlX1RyYW5zZm8uanBnIiwiY3JlYXRlZHRpbWUiOiIyMDE4LTEyLTEzIDA4OjU3OjExLjQzMDc0OSJ9fRrHAggAGsICeyJkYXRhYmFzZSI6ImZsYXNoZ28iLCJ0YWJsZSI6ImRlYWxzX2RlYWxhcnRpY2xlaW1hZ2VzIiwidHlwZSI6Imluc2VydCIsInRzIjoxNTQ0NjkxNDM3LCJ4aWQiOjMwMDI0NCwieG9mZnNldCI6NiwiZGF0YSI6eyJpZCI6NjkwNywiZGVhbF9pZCI6NTk5Niwib3JkZXIiOjEsImltYWdlIjoiaHR0cHM6Ly9zMS5idWthbGFwYWsuY29tL2ltZy8xNjI0ODMzMTUyL21lZGl1bS9NMTA5X01haW5hbl9BbmFrX1JvYm9jYXJfUG9saV8xX3NldF9fXzRfcGNzX19fRmlndXJlX1RyYW5zZm8uanBnIiwiY3JlYXRlZHRpbWUiOiIyMDE4LTEyLTEzIDA4OjU3OjExLjQzMDc5MCJ9fRrHAggAGsICeyJkYXRhYmFzZSI6ImZsYXNoZ28iLCJ0YWJsZSI6ImRlYWxzX2RlYWxhcnRpY2xlaW1hZ2VzIiwidHlwZSI6Imluc2VydCIsInRzIjoxNTQ0NjkxNDM3LCJ4aWQiOjMwMDI0NCwieG9mZnNldCI6NywiZGF0YSI6eyJpZCI6NjkwOCwiZGVhbF9pZCI6NTk5Niwib3JkZXIiOjIsImltYWdlIjoiaHR0cHM6Ly9zMC5idWthbGFwYWsuY29tL2ltZy8wNzI0ODMzMTUyL21lZGl1bS9NMTA5X01haW5hbl9BbmFrX1JvYm9jYXJfUG9saV8xX3NldF9fXzRfcGNzX19fRmlndXJlX1RyYW5zZm8uanBnIiwiY3JlYXRlZHRpbWUiOiIyMDE4LTEyLTEzIDA4OjU3OjExLjQzMDgwNyJ9fRrJAggAGsQCeyJkYXRhYmFzZSI6ImZsYXNoZ28iLCJ0YWJsZSI6ImRlYWxzX2RlYWxhcnRpY2xlaW1hZ2VzIiwidHlwZSI6Imluc2VydCIsInRzIjoxNTQ0NjkxNDM3LCJ4aWQiOjMwMDI0NCwiY29tbWl0Ijp0cnVlLCJkYXRhIjp7ImlkIjo2OTA5LCJkZWFsX2lkIjo1OTk2LCJvcmRlciI6MywiaW1hZ2UiOiJodHRwczovL3MzLmJ1a2FsYXBhay5jb20vaW1nLzMwMzQ4MzMxNTIvbWVkaXVtL00xMDlfTWFpbmFuX0FuYWtfUm9ib2Nhcl9Qb2xpXzFfc2V0X19fNF9wY3NfX19GaWd1cmVfVHJhbnNmby5qcGciLCJjcmVhdGVkdGltZSI6IjIwMTgtMTItMTMgMDg6NTc6MTEuNDMwODE5In19f1rOW9BPWMpcgiRifv3vYCI=",
                    "sequenceNumber": "49545115243490985018280067714973144582180062593244200961",
                    "approximateArrivalTimestamp": 1428537600
                },
                "eventSource": "aws:kinesis",
                "eventID": "shardId-000000000000:49545115243490985018280067714973144582180062593244200961",
                "invokeIdentityArn": "arn:aws:iam::EXAMPLE",
                "eventVersion": "1.0",
                "eventName": "aws:kinesis:record",
                "eventSourceARN": "arn:aws:kinesis:EXAMPLE",
                "awsRegion": "ap-southeast-1"
            }
        ]
    }
    handler.handle(event, None)


def test_common_table():
    try:
        data = {'database': 'flashgo',
                'table': 'common_ecommerces',
                'type': 'update',
                'ts': 1545201254,
                'xid': 2294536,
                'xoffset': 0,
                'data': {'id': 1,
                         'name': 'jd',
                         'logo': 'http://kasbon.cash/ads/aggregator/images/partner/detail/jd.id.png',
                         'domain': 'https://www.jd.id',
                         'description': 'jd',
                         'created_time': '2018-11-26 08:00:23.048000',
                         'updated_time': '2018-12-19 06:34:14.000000'},
                'old': {'updated_time': '2018-12-19 06:33:18.000000'}}
        redis_client = RedisClient('flashgo-cache.kub6uf.0001.apse1.cache.amazonaws.com', 6379, db=0,
                                   password='8888@swdcggz')
        handler.process_common_table(data['table'], redis_client, data)
    except:
        import traceback

        traceback.print_exc()
