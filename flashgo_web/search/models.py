import base64
from typing import List

from common.utils import UniqueItemList, parse_int


class Suggest(object):
    def __init__(self, suggest: str, search_type: str, extra, font_bold: bool = False, num_red: bool = False,
                 item_id: int = None):
        self.suggest = suggest
        self.search_type = search_type
        self.extra = extra
        self.font_bold = font_bold
        self.num_red = num_red
        self.item_id = item_id

    def to_json(self):
        return {
            'suggest': self.suggest,
            'search_type': self.search_type,
            'extra': self.extra,
            'font_bold': self.font_bold,
            'num_red': self.num_red,
            'item_id': self.item_id
        }


class FilterItem(object):
    def __init__(self, id: str, content: str):
        self.id = id
        self.content = content

    def to_dict(self):
        return {
            'id': self.id,
            'content': self.content
        }


E_IDS = [
    FilterItem("e_1", "JD.id"),
    FilterItem("e_2", "Lazada"),
    FilterItem("e_3", "Bukalapak"),
    FilterItem("e_4", "Tokopedia"),
    FilterItem("e_5", "Shopee"),
    FilterItem("e_6", "Blibli"),
    FilterItem("e_7", "Zalora"),
    FilterItem("e_8", "Aliexpress")
]

DISCOUNT_IDS = [
    FilterItem('d_F', 'Flash sale'),
    FilterItem('d_discount', 'Sedang diskon')
]

NEWS_TYPE_IDS = [
    FilterItem('t_2', 'Post'),
    FilterItem('t_3', 'Video'),
    FilterItem('t_0', 'Artikel'),
]


class FilterCondition(object):
    @staticmethod
    def create(search_type, tags=None) -> list:
        # TODO 增加对黑名单的支持
        if tags != None:
            tag_list = UniqueItemList()
            for tag in tags:
                tag_list.append(tag)
            tags = tag_list.to_list()
        if search_type == 'product':
            items = []
            # 商家
            if len(E_IDS) > 0:
                items.append(FilterCondition('Ecommerce', multi=True, items=E_IDS))
            # 折扣
            if len(DISCOUNT_IDS) > 0:
                items.append(FilterCondition('Diskon', multi=True, items=DISCOUNT_IDS))
            # 关键词
            if tags is not None and len(tags) > 0:
                items.append(FilterCondition('Kata kunci', multi=False, is_tag=True, items=[
                    FilterItem('tags_%s' % base64.b64encode(tag.encode('utf-8')).decode('utf-8'), tag) for tag in tags
                ]))
            return items
        elif search_type == 'review':
            items = []
            # 形式
            if len(NEWS_TYPE_IDS) > 0:
                items.append(FilterCondition('Type', multi=True, items=NEWS_TYPE_IDS))
            # 关键词
            if tags is not None and len(tags) > 0:
                items.append(FilterCondition('Kata kunci', multi=False, is_tag=True, items=[
                    FilterItem('tags_%s' % base64.b64encode(tag.encode('utf-8')).decode('utf-8'), tag) for tag in tags
                ]))
            return items
        else:
            return []

    def __init__(self, title: str, multi: bool, items: List[FilterItem], is_tag: bool = False):
        self.title = title
        self.multi = multi
        self.items = items
        self.is_tag = is_tag

    @staticmethod
    def to_conditions(ids) -> dict:
        # 商家
        conditions = {
            'e_ids': [],
            'discount_ids': [],
            'tags': [],
            'news_type_ids': []
        }
        condition_mapping = {
            # 前缀，名称，是否是数字
            ('e_', 'e_ids', True),
            ('d_', 'discount_ids', False),
            ('t_', 'news_type_ids', True),
            ('tags_', 'tags', False),
        }
        for id in ids:
            for prefix, key, is_int in condition_mapping:
                if id.startswith(prefix):
                    if key == 'tags':
                        value = base64.b64decode(id[len(prefix):]).decode('utf-8')
                        if len(value) > 0:
                            conditions[key].append(value)
                    else:
                        if is_int:
                            value = parse_int(id[len(prefix):], -1)
                            if value >= 0:
                                conditions[key].append(value)
                        else:
                            conditions[key].append(id[len(prefix):])
        return {k: v for k, v in conditions.items() if len(v) > 0}

    def to_dict(self):
        return {
            'title': self.title,
            'multi': self.multi,
            'items': [item.to_dict() for item in self.items],
            'is_tag': self.is_tag
        }


class SortMode(object):
    DEFAULT = 'default'
    PRICE_ASCENDING = 'price_asc'
    PRICE_DESCENDING = 'price_desc'
    BEST_SELLING = 'best_selling'
    BEST_RATING = 'best_rating'
    HOTTEST = 'hottest'
    LATEST = 'latest'

    def __init__(self, mode):
        self.mode = mode


SORT_MODES = [SortMode.DEFAULT,
              SortMode.PRICE_ASCENDING,
              SortMode.PRICE_DESCENDING,
              SortMode.BEST_SELLING,
              SortMode.BEST_RATING,
              SortMode.HOTTEST,
              SortMode.LATEST]
