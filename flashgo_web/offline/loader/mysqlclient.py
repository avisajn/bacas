from datetime import datetime

from sqlalchemy import func, or_

from common.config import OFFLINE_MYSQL_CLIENT_CONFIG
from common.mysqlclient import BaseDbClient
from common.sql_models import FavoriteCategories, CategoryMapping, ShareDeals, DEALS_MAP, DEALS_CATEGORIES_MAP, \
    NATIVE_DEALS_CATEGORIES_MAP
from common.utils import list_to_chunk
from news.models import NewsLikesCount


def divide_deal_ids_by_suffix(deal_ids):
    deal_ids_map = {}
    for deal_id in deal_ids:
        suffix = str(deal_id)[-2:]
        deal_ids = deal_ids_map.get(suffix, set())
        deal_ids.add(deal_id)
        deal_ids_map[suffix] = deal_ids
    return deal_ids_map


class MySQLClient(BaseDbClient):

    def __init__(self, connection_string, echo=False):
        BaseDbClient.__init__(self, connection_string, echo)

    def get_favorites_categories(self):
        with self.get_session() as session:
            return {category.category_id for category in session.query(FavoriteCategories).all()}

    def get_deal_by_deal_id(self, deal_id):
        Deal = DEALS_MAP[str(deal_id)[-2:]]
        with self.get_session() as session:
            return session.query(Deal).filter(Deal.id == deal_id).first()

    def retrieve_deals_by_deal_id_list(self, deal_ids, to_dict=False):
        ret = []
        with self.get_session() as session:
            for item in list_to_chunk(deal_ids, 2000):
                deal_ids_map = divide_deal_ids_by_suffix(item)
                for suffix, deal_ids in deal_ids_map.items():
                    Deal = DEALS_MAP[suffix]
                    deal_objects = session.query(Deal).filter(Deal.id.in_(deal_ids)).all()
                    ret.extend(deal_objects)
            if to_dict:
                return {deal.deal_id: deal.to_dict() for deal in ret}
            else:
                return ret

    def get_deals(self, urls):
        deals = {}
        for url_list in list_to_chunk(urls, 100):
            for deal in self.retrieve_deals_by_conditions(lambda clazz: [clazz.web_link.in_(url_list)]):
                deals[deal.web_link] = deal
        return deals

    def get_one_deal_categories(self, deal_id, native=False):
        suffix = str(deal_id)[-2:]
        category_cls = NATIVE_DEALS_CATEGORIES_MAP[suffix] if native else DEALS_CATEGORIES_MAP[suffix]
        with self.get_session() as session:
            deal_categories = session.query(category_cls).filter(category_cls.deal_id == deal_id).all()
        if deal_categories:
            return {deal.level: deal.category_id for deal in deal_categories}
        else:
            return {}

    def batch_get_deals_categories(self, deal_ids, native=False, to_dict=False):
        ret = []
        deal_ids_map = divide_deal_ids_by_suffix(deal_ids)
        category_cls_map = NATIVE_DEALS_CATEGORIES_MAP if native else DEALS_CATEGORIES_MAP
        with self.get_session() as session:
            for suffix, deal_ids in deal_ids_map.items():
                for items in list_to_chunk(list(deal_ids), 200):
                    category_cls = category_cls_map[suffix]
                    deal_categories = session.query(category_cls).filter(category_cls.deal_id.in_(items)).all()
                    ret += deal_categories
        if to_dict:
            categories_list = []
            for deal_cate in ret:
                categories_list.append({
                    'deal_id': deal_cate.deal_id,
                    'category_id': deal_cate.category_id,
                    'level': deal_cate.level
                })
            deals_with_categories = {}
            for deal in categories_list:
                categories = deals_with_categories.get(deal['deal_id'], {})
                categories.update({deal['level']: deal['category_id']})
                deals_with_categories[deal['deal_id']] = categories
            return deals_with_categories
        else:
            return ret

    def get_id_range(self, deal_model):
        with self.get_session() as session:
            return session.query(func.min(deal_model.id), func.max(deal_model.id)).first()

    def retrieve_all_deals(self):
        with self.get_session() as session:
            for k, Deal in DEALS_MAP:
                if isinstance(k, int):
                    continue
                min_deal_id, max_deal_id = self.get_id_range(Deal)
                deal_ids = list(range(min_deal_id, max_deal_id, 10))
                for deal_ids in list_to_chunk(deal_ids, 200):
                    deals = session.query(Deal).filter(Deal.id.in_(deal_ids))
                    yield deals

    def retrieve_deals_by_conditions(self, conditions):
        with self.get_session() as session:
            deals = []
            for table in DEALS_MAP.values():
                query = session.query(table)
                for cond in conditions(table):
                    query.filter(cond)
                deals += query.all()
        return deals

    def get_recent_deals(self, min_date_time):
        return self.retrieve_deals_by_conditions(
            lambda clazz: [or_(clazz.created_time >= min_date_time, clazz.updated_time >= min_date_time)])

    def get_category_ids_by_deal_id(self, deal_id, native=False):
        suffix = self.get_suffix(deal_id)
        cls = self.get_category_cls(suffix, native)
        with self.get_session() as session:
            categories = session.query(cls).filter(cls.deal_id == deal_id).all()
            return {category_object.level: category_object.category_id for category_object in categories}

    @staticmethod
    def get_suffix(deal_id):
        return str(deal_id)[-2:]

    @staticmethod
    def get_category_cls(suffix, native):
        if not native:
            return DEALS_CATEGORIES_MAP[suffix]
        else:
            return NATIVE_DEALS_CATEGORIES_MAP[suffix]

    def get_mapping_native_category_ids(self, category_id):
        with self.get_session() as session:
            categories = session.query(CategoryMapping).filter(CategoryMapping.fg_cate_id == category_id).all()
        return [category.ecom_cate_id for category in categories]

    def get_share_deals(self):
        now = datetime.now()
        with self.get_session() as session:
            deals = session.query(ShareDeals).filter(ShareDeals.start_time < now,
                                                     ShareDeals.end_time > now).all()
            return deals

    def create_or_update_likes_count(self, news_id, likes_count):
        with self.get_session() as session:
            news_likes = session.query(NewsLikesCount).filter(NewsLikesCount.news_id == news_id).first()
            if news_likes is None:
                news_likes = NewsLikesCount(news_id=news_id, likes_count=likes_count, updated_time=datetime.now())
                session.add(news_likes)
            else:
                session.query(NewsLikesCount).filter(NewsLikesCount.news_id == news_id).update({
                    'likes_count': likes_count,
                    'updated_time': datetime.now()
                })
            session.commit()


mysql_client = MySQLClient(OFFLINE_MYSQL_CLIENT_CONFIG)
