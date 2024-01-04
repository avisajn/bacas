import base64
import datetime
import json
import logging

import requests

import redis
from requests_aws4auth import AWS4Auth

from common import config
from common.config import ES_CLIENT_CONFIG
from common.proxy import LazyProxy

ES_ENDPOINT = 'https://vpc-flashgo-j6idpglsinzpa2hqjhstvm7tnm.ap-southeast-1.es.amazonaws.com'

CATEGORY_NAME_KEY = 'TABLE_CAT'
ECOMMERCE_KEY = 'TABLE_ECOM'
TABLE_ECOM_CAT = 'TABLE_ECOM_CAT'


class RedisClient(object):
    def __init__(self, host, port=6379, db=0, password=None):
        self.redis_client = redis.StrictRedis(host=host, port=port, db=db, password=password,
                                              socket_connect_timeout=3)
        self._cache = {}

    def get_category_map(self):
        return dict(
            [(int(item.decode('utf-8')), json.loads(value.decode('utf-8')).get('id_name', '')) for item, value in
             self.redis_client.hgetall(CATEGORY_NAME_KEY).items()])

    def get_ecommerce_map(self):
        return dict([(int(item.decode('utf-8')), json.loads(value.decode('utf-8')).get('name', '')) for item, value in
                     self.redis_client.hgetall(ECOMMERCE_KEY).items()])

    def get_native_cate_name(self, cate_id):
        if int(cate_id) in self._cache:
            return self._cache[cate_id]
        else:
            data = self.redis_client.hget(TABLE_ECOM_CAT, cate_id)
            if data is None:
                return None
            else:
                name = data.get('id_name', '')
                if name is None or len(name) == 0:
                    name = data.get('en_name', '')
                if name is None or len(name) == 0:
                    return None
                else:
                    if len(self._cache) > 1000:
                        self._cache = {}
                    self._cache[cate_id] = name
                    return name


class Deal(object):
    def __init__(self, *, ecommerce_id, type, title, off, sales, stock, valid, createdtime, current_price=None,
                 **kwargs):
        if 'id' in kwargs:
            self.id = kwargs['id']
        if 'deal_id' in kwargs:
            self.id = kwargs['deal_id']
        self.ecommerce_id = ecommerce_id
        self.type = type
        self.title = title
        self.off = off
        self.sales = sales
        self.stock = stock
        self.valid = valid
        self.current_price = current_price
        self.createdtime = createdtime
        self.start_time = kwargs.get("start_time", "") if "start_time" in kwargs else ""
        self.end_time = kwargs.get("start_time", "") if "start_time" in kwargs else ""
        self.category_one = kwargs.get("category_one", "") if "category_one" in kwargs else ""
        self.category_two = kwargs.get("category_two", "") if "category_two" in kwargs else ""
        self.category_three = kwargs.get("category_three", "") if "category_three" in kwargs else ""
        self.native_category_one = kwargs.get('native_category_one', '')
        self.native_category_two = kwargs.get('native_category_two', '')
        self.native_category_three = kwargs.get('native_category_three', '')
        self.native_category_four = kwargs.get('native_category_four', '')
        self.native_category_five = kwargs.get('native_category_five', '')
        self.ecommerce_name = ECOMMERCE_NAME.get(int(ecommerce_id), '')
        self.web_link = kwargs.get("web_link", "") if "web_link" in kwargs else ""

    def to_dict(self):
        return self.__dict__


class DealCategory(object):
    def __init__(self, id, deal_id, category_id, level, **kwargs):
        self.id = id
        self.deal_id = deal_id
        self.category_id = category_id
        self.level = level


class FlashDeal(object):
    def __init__(self, deal_id, starttime, endtime, **kwargs):
        self.deal_id = deal_id
        self.start_time = datetime.datetime.strptime(starttime[:19], '%Y-%m-%d %H:%M:%S').timestamp()
        self.end_time = datetime.datetime.strptime(endtime[:19], '%Y-%m-%d %H:%M:%S').timestamp()

    def valid(self):
        now = datetime.datetime.now().timestamp()
        return now - self.end_time <= 1 * 60 * 60


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
        return json.loads(data.decode('utf-8'))
    except:
        return None


class ESClient(object):
    def __init__(self, host, index_name):
        self.host = host
        self.index_name = index_name
        # credentials = boto3.Session().get_credentials()
        self.awsauth = AWS4Auth(ES_CLIENT_CONFIG['access_key_id'], ES_CLIENT_CONFIG['secret_access_key'],
                                ES_CLIENT_CONFIG['region_name'], 'es', session_token=None)

    def set_deal(self, deal: Deal):
        url = '%s/%s/%s/%s' % (self.host, self.index_name, 'deal', deal.id)
        requests.post(url, auth=self.awsauth, json=deal.to_dict(), headers={"Content-Type": "application/json"},
                      timeout=10)

    def del_deal(self, deal_id: int):
        url = '%s/%s/%s/%s' % (self.host, self.index_name, 'deal', deal_id)
        requests.delete(url, auth=self.awsauth, headers={"Content-Type": "application/json"}, timeout=10)

    def get_deal(self, deal_id: int):
        url = '%s/%s/%s/%s' % (self.host, self.index_name, 'deal', deal_id)
        response_json = requests.get(
            url, auth=self.awsauth, headers={"Content-Type": "application/json"}, timeout=10).json().get("_source",
                                                                                                         dict())
        if len(response_json) > 0:
            return Deal(**response_json)
        else:
            return None


class LambdaHandler(object):
    def __init__(self):
        pass

    def handle(self, event, context):
        es_client = ESClient(ES_ENDPOINT, 'deal')
        for record in event['Records']:
            payload = base64.b64decode(record['kinesis']['data'])
            for item in clean_and_split_data(payload):
                self.process_tables(safe_json(item), es_client)
        return 'ok'

    def process_tables(self, data, es_client: ESClient):
        if data is None:
            return
        table = data.get('table', '')
        handlers = {
            'deals_deals': self.process_table_deals,
            'deals_dealcategories': self.process_table_category,
            'deals_flashdeals': self.process_table_flash_deals,
            'deals_ecomcategories': self.process_table_native_category,
        }
        if table in handlers:
            try:
                handlers[table](data, es_client)
            except:
                logger.exception('process %s error, data is %s' % (table, data))

    @staticmethod
    def process_table_deals(data, es_client: ESClient):
        operators = data['type']
        deal = Deal(**data['data'])
        if operators == 'delete' or deal.valid != 1:
            es_client.del_deal(int(deal.id))
        else:
            es_client.set_deal(deal)

    @staticmethod
    def process_table_category(data, es_client: ESClient):
        operators = data['type']
        deal_category = DealCategory(**data['data'])
        deal = es_client.get_deal(int(deal_category.deal_id))
        if operators == 'delete':
            es_client.del_deal(int(deal_category.deal_id))
        else:
            if deal is not None:
                if deal_category.level == 1:
                    deal.category_one = CATEGORY_NAME.get(int(deal_category.category_id), "")
                elif deal_category.level == 2:
                    deal.category_two = CATEGORY_NAME.get(int(deal_category.category_id), "")
                elif deal_category.level == 3:
                    deal.category_three = CATEGORY_NAME.get(int(deal_category.category_id), "")
                es_client.set_deal(deal)

    @staticmethod
    def process_table_native_category(data, es_client: ESClient):
        operators = data['type']
        deal_category = DealCategory(**data['data'])
        deal = es_client.get_deal(int(deal_category.deal_id))
        if operators == 'delete':
            pass
        else:
            if deal is not None:
                level_map = {
                    1: 'native_category_one',
                    2: 'native_category_two',
                    3: 'native_category_three',
                    4: 'native_category_four',
                    5: 'native_category_five'
                }
                level = deal_category.level
                if level in level_map:
                    setattr(deal, level_map[level], redis_client.get_native_cate_name(deal_category.category_id))
                    es_client.set_deal(deal)

    @staticmethod
    def process_table_flash_deals(data, es_client: ESClient):
        operators = data['type']
        flash_deal = FlashDeal(**data['data'])
        deal = es_client.get_deal(int(flash_deal.deal_id))
        if operators == 'delete' or (deal is not None and not deal.valid):
            es_client.del_deal(int(flash_deal.deal_id))
        else:
            if deal is None or deal.type != 'F':
                return
            deal.start_time = flash_deal.start_time
            deal.end_time = flash_deal.end_time
            es_client.set_deal(deal)


handler = LambdaHandler()


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
redis_client = LazyProxy(RedisClient, **config.OFFLINE_REDIS_CLIENT_CONFIG)
CATEGORY_NAME = LazyProxy(lambda: redis_client.get_category_map())
ECOMMERCE_NAME = LazyProxy(lambda: redis_client.get_ecommerce_map())


def lambda_function(event, context):
    global logger
    if logger is None:
        logger = get_logger()
    try:
        return handler.handle(event, context)
    except Exception as e:
        logger.exception('handler function error')
        raise e
