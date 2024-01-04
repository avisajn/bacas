"""
主要用于加载native的品类的deal
"""
import json
from typing import List
from common import loggers
from common.utils import pick_from_array
from common.sql_models import NativeCategory
from offline.loader.mysqlclient import mysql_client
from offline.loader.redisclient import redis_client


logger = loggers.get_offline_logger(__name__, 'native_cats.log')


class CategoryNode(object):
    def __init__(self, id, parent_id=None, children=None):
        self.id = id
        self.parent_id = parent_id
        self.children = [] if children is None else children  # type: List[CategoryNode]

    def get_node(self, id):
        if self.id == id:
            return self
        else:
            for child in self.children:
                node = child.get_node(id)
                if node is not None:
                    return node
            else:
                return None

    def get_ids(self):
        ids = [self.id]
        for child in self.children:
            ids += child.get_ids()
        return ids

    def get_leaves_ids(self):
        if len(self.children) == 0:
            ids = [self.id]
        else:
            ids = []
        for child in self.children:
            ids += child.get_leaves_ids()
        return ids

    def to_dict(self):
        if len(self.children) == 0:
            return {
                'id': self.id,
                'parent_id': self.parent_id,
                'children': []
            }
        else:
            return {
                'id': self.id,
                'parent_id': self.parent_id,
                'children': [child.to_dict() for child in self.children]
            }

    @classmethod
    def from_json(cls, base_json):
        id = base_json['id']
        parent_id = base_json['parent_id']
        root = cls(id, parent_id)
        for child in base_json['children']:
            root.children.append(cls.from_json(child))
        return root


def generate_category_tree() -> CategoryNode:
    count = mysql_client.retrieve_all_object_count(NativeCategory)
    categories = []
    for start_index in range(0, count, 500):
        categories.extend(mysql_client.retrieve_all_objects(NativeCategory, start_index=start_index, page_size=500))
    redis_client.batch_cache_category_sell_mapping(categories)
    root = CategoryNode(0, parent_id=None)
    for level in range(1, 10):
        count = 0
        for cat in categories:
            if cat.level == level:
                current_node = root.get_node(cat.id)
                parent = root.get_node(cat.parent_id)
                if current_node is None and parent is not None:
                    node = CategoryNode(cat.id, cat.parent_id)
                    parent.children.append(node)
                    count += 1
                elif current_node is None and parent is None:
                    logger.info('do not find cat %s' % cat)
        logger.info('level {} categories size {}'.format(level, count))
    return root


def get_category_deals(category: CategoryNode, sell_id=None):
    category_ids = category.get_ids()
    deals_array = []
    for category_id in category_ids:
        if sell_id is None:
            sell_id = redis_client.get_category_sell_id(category_id)
        deals = redis_client.get_native_category_deals(category_id, sell_id)
        if len(deals) > 0:
            deals_array.append(deals)
    if len(deals_array) == 0:
        return []
    else:
        return pick_from_array(deals_array)


def load_native_category_tree():
    cate_tree = generate_category_tree()
    logger.info('generate native tree over.')

    leaves_cate = cate_tree.get_leaves_ids()
    redis_client.cache_leaf_categories(leaves_cate)
    logger.info('cache {} leaves categories'.format(len(leaves_cate)))

    redis_client.cache_category_tree_json(json.dumps(cate_tree.to_dict()))
    logger.info('load tree in redis over.')


def test():
    from common.utils import list_to_chunk
    category_ids = list(redis_client.get_leaves_categories())
    print(len(category_ids))
    for item in list_to_chunk(category_ids):
        categories = mysql_client.retrieve_objects_by_conditions(NativeCategory, NativeCategory.id.in_(item))
        print(len(categories))
        redis_client.batch_cache_category_sell_mapping(categories)
    sell_categories = redis_client.batch_get_category_sell_mapping(category_ids, divide_by_sell=True)
    print(sell_categories)
    for sell, category_ids in sell_categories.items():
        print(sell, len(category_ids))


def main():
    try:
        load_native_category_tree()
    except:
        logger.exception('load native categories tree error.')


if __name__ == '__main__':
    main()
    # test()
