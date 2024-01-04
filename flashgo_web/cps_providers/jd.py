import json
from datetime import datetime

import requests
import hashlib
import time

from requests import PreparedRequest


class JDProvider(object):
    PENDING_PAYMENT = 15
    PAY_CODE = 16
    COMPLETED = 17

    def __init__(self, base_url, app_key, app_secret, access_token):
        self.__base_url = base_url
        self.__app_key = app_key
        self.__app_secret = app_secret
        self.__access_token = access_token

    def __generate_sign(self, params: dict):
        data = self.__app_secret
        for k in sorted(params.keys()):
            data += k + str(params[k])
        data += self.__app_secret
        m = hashlib.md5(bytes(data, encoding="utf-8"))
        return m.hexdigest().upper()

    @staticmethod
    def __get_server_time():
        return time.strftime("%Y-%m-%d %H:%M:%S.000%z", time.localtime())

    def __http_get(self, data, timeout=5):
        sys_data = {
            "app_key": self.__app_key,
            "access_token": self.__access_token,
            "v": '1.0',
            "format": 'json',
            "sign_method": 'md5',
            "timestamp": self.__get_server_time(),
        }
        data = {**data, **sys_data}
        data['sign'] = self.__generate_sign(data)
        response = requests.get(self.__base_url, params=data, timeout=timeout)
        if response.ok:
            return response.json()
        else:
            return None

    def get_offer(self, category_id=None, page_index=1, page_size=10):
        data = {
            'method': "epi.jd.union.open.goods.query",
            'param_json': json.dumps({
                'req': {
                    'skuIds': [100457740],
                    # 'cid1': category_id,
                    # 'commissionShareEnd': (int(time.time()) + 3600) * 1000,
                    # 'keyword': 'Mobile',
                    'pageIndex': page_index,
                    'pageSize': page_size,
                }
            }, separators=(',', ':'))
        }
        return self.__http_get(data)

    def __query_order(self, page_index, page_size, query_time: str):
        data = {
            'method': "epi.jd.union.open.order.query",
            'param_json': json.dumps({
                'req': {
                    'pageIndex': page_index,
                    'pageSize': page_size,
                    # Order time query type (1: order time, 2: completion time, 3: update time)
                    'type': 3,
                    'time': query_time
                }
            }, separators=(',', ':'))
        }
        return self.__http_get(data)

    def __query_orders(self, query_time):
        orders = []
        for page_index in range(1, 100):
            response = self.__query_order(page_index, page_size=128, query_time=query_time)
            if response is not None:
                data = json.loads(response['openapi_data'])
                current_order = data.get('data', [])
                orders += current_order
                if not data['hasMore']:
                    break
            else:
                break
        return orders

    def get_orders(self, query_date: datetime):
        orders = []
        for i in range(0, 24):
            current = datetime(year=query_date.year, month=query_date.month, day=query_date.day, hour=i)
            orders += self.__query_orders(current.strftime("%Y%m%d%H"))
        return orders

    def generate_url_by_request(self, original_url, sub_id, short_link=False):

        # '''
        # 实际起作用的示例
        # https://www.jd.id/product/baseus-qc-3-0-car-charger-5v-3a-dual-usb-port-quick-charging-black_10269249/100584133.html?cu=true&utm_source=kong&utm_medium=tuiguang&utm_campaign=t_4000000040_cxs_test&utm_term=df5c57b591a74ef5af91a266fdf334be
        # '''
        chain_type = 2 if short_link else 1
        data = {
            'method': "epi.jd.union.open.promotion.common.get",
            'param_json': json.dumps({
                'req': {
                    'materialId': original_url,
                    'subUnionId': sub_id,
                    # 1是长链接，2是短链接，3是长短都有
                    'chainType': chain_type,
                }
            }, separators=(',', ':'))
        }
        response = self.__http_get(data)
        if response is not None:
            if short_link:
                return json.loads(response['openapi_data'])['data']['shortUrl']
            else:
                return json.loads(response['openapi_data'])['data']['clickUrl']
        else:
            return None

    @staticmethod
    def manual_generate_url(original_url, sub_id):
        """
        测试后转化没有成功，暂时不要使用
        """
        url = original_url
        params = {'utm_campaign': f't_4000000040_{sub_id}', 'cu': 'true', 'utm_source': 'kong',
                  'utm_medium': 'tuiguang'}
        req = PreparedRequest()
        req.prepare_url(url, params)
        return req.url

    def generate_url(self, original_url, sub_id):
        return self.generate_url_by_request(original_url, sub_id, short_link=False)

    @staticmethod
    def get_unique_order_id(order_id, sku_id):
        return f'JD_{order_id}_{sku_id}'


jd_provider = JDProvider("https://open.jd.id/api", app_key='8065defc489914e16deb3109a1fc11db',
                         app_secret='4a4525b5323b001ebd3937eb01f1bf5c',
                         access_token='e5911a8392aa382a0401083f322ba8e1')
