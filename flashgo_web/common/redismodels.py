import json
from collections import namedtuple

"""
 redis中存储的用户相关的信息, 主要包括用户偏好的分类，频道，关键词
"""
UserCategory = namedtuple('UserCategory', ['user_id', 'category_id', 'level', 'weight'])
# UserChannel = namedtuple('UserChannel', ['user_id', 'channel_id', 'weight'])
# UserKeyword = namedtuple('UserKeyword', ['user_id', 'keyword', 'weight'])
"""
从数据库导出得到的商品全信息
"""
DealItem = namedtuple('DealItem',
                      ['id', 'sales', 'title', 'thumbnail', 'price', 'original_price', 'discount', 'ecommerce_id',
                       'category_id_one', 'category_id_two', 'category_id_three', 'keyword_list', 'channel_id',
                       'img_list', 'start_time', 'end_time', 'sale_type', 'location', 'detail'])

"""
 redis中存储的商品相关的信息, 主要包括 倒排item，列表页item，详情item
 """
RIDealItem = namedtuple('RIDealItem', ['id', 'sales'])
ListDealItem = namedtuple('DealItem',
                          ['id', 'sales', 'title', 'thumbnail', 'price', 'original_price', 'discount', 'ecommerce_id',
                           'start_time', 'end_time', 'sale_type'])
DetailDealItem = namedtuple('DealItem', ['id', 'img_list', 'location', 'detail'])


def format_redis_json(from_obj: DealItem, to_cls: namedtuple):
    """将来源的商品from_obj 转化成目标类型to_cls的json字符串，方便存储到redis"""
    to_dict = {k: v for k, v in from_obj._asdict().items() if k in to_cls._fields}
    return json.dumps(to_dict, separators=(',', ':'))


def parse_redis_json(from_byte_array: bytes, to_cls: namedtuple):
    """将从redis中返回的数据解析为to_cls类型的对象"""
    return to_cls(**json.loads(from_byte_array.decode("utf-8")))
