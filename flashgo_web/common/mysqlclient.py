from contextlib import contextmanager
from datetime import datetime
from typing import List

from sqlalchemy import create_engine, func, Column
from sqlalchemy.orm import sessionmaker, subqueryload

from comments.models import Comments
from common.config import MYSQL_CLIENT_CONFIG
from common.sql_models import CommonChannels, get_suffix, DEALS_MAP, UserFavoriteDeals, UserFavoriteSelectedInterest, \
    UserVersion, UserFollowing, InterestNewsCategoryMapping, TopicNews
from common.utils import divide_deal_ids_by_suffix
from news.models import News, UGCNewsTags


class BaseDbClient(object):
    def __init__(self, connection_string, echo=False):
        self.engine = create_engine(connection_string, echo=echo, pool_recycle=600)
        self.Session = sessionmaker(bind=self.engine)

    @contextmanager
    def get_session(self):
        session = self.Session()
        try:
            yield session
        except:
            session.rollback()
            raise
        finally:
            session.close()

    """
    Basic db functions applicable to all models
    """

    def create_object(self, obj, return_id=True, has_created_time=True):
        with self.get_session() as session:
            if has_created_time:
                obj.created_time = datetime.now()
            session.add(obj)
            session.commit()
            session.refresh(obj)
        if return_id and hasattr(obj, 'id'):
            return obj.id
        else:
            return obj

    def create_objects(self, objects):
        with self.get_session() as session:
            for obj in objects:
                obj.created_time = datetime.now()
            session.add_all(objects)
            session.commit()

    def retrieve_object_by_id(self, clazz, object_id, with_all_relations=False):
        with self.get_session() as session:
            query = session.query(clazz)
            if with_all_relations:
                return query.options(subqueryload("*")).filter(clazz.id == object_id).first()
            else:
                return query.filter(clazz.id == object_id).first()

    def retrieve_objects_by_id_list(self, clazz, object_id_list):
        with self.get_session() as session:
            return session.query(clazz).filter(clazz.id.in_(object_id_list)).all()

    def retrieve_objects_by_user_id(self, clazz, user_id):
        with self.get_session() as session:
            query = session.query(clazz)
            return query.filter(clazz.user_id == user_id).all()

    def update_object(self, clazz, object_id, contain_updated_time=True, **kwargs):
        with self.get_session() as session:
            parameters = dict(kwargs)
            if contain_updated_time:
                parameters["updated_time"] = datetime.now()
            session.query(clazz).filter(clazz.id == object_id).update(parameters)
            session.commit()

    def delete_objects_by_conditions(self, cls, *conditions, max_count=1000):
        with self.get_session() as session:
            query = session.query(cls)
            for condition in conditions:
                query = query.filter(condition)

            query = query.limit(max_count)
            instances = query.all()
            if len(instances) > 0:
                for instance in instances:
                    session.delete(instance)
                else:
                    session.commit()

    def delete_object_by_unique_key(self, cls, **kwargs):
        with self.get_session() as session:
            query = session.query(cls)
            for k, v in kwargs.items():
                query = query.filter(getattr(cls, k) == v)
            instance = query.one_or_none()
            if instance is not None:
                session.delete(instance)
                session.commit()
                return True
            else:
                return False

    def retrieve_all_objects(self, clazz, with_all_relations=False, start_index=None, page_size=None):
        with self.get_session() as session:
            query = session.query(clazz)
            if with_all_relations:
                query = query.options(subqueryload("*"))
            if start_index is not None and page_size is not None:
                return query.offset(start_index).limit(page_size).all()
            else:
                return query.all()

    def retrieve_all_object_count(self, clazz):
        with self.get_session() as session:
            return session.query(clazz).count()

    def retrieve_object_by_unique_order_id(self, cls, unique_order_id):
        with self.get_session() as session:
            query = session.query(cls).filter(cls.unique_order_id == unique_order_id)
            return query.one_or_none()

    def retrieve_objects_by_conditions(self, cls, *conditions, limit=None):
        with self.get_session() as session:
            query = session.query(cls)
            for condition in conditions:
                query = query.filter(condition)
            if limit is not None:
                query = query.limit(limit)
            return query.all()

    def retrieve_sortable_objects_by_conditions(self, cls, *conditions, order_conditions=None, limit=None):
        with self.get_session() as session:
            query = session.query(cls)
            for condition in conditions:
                query = query.filter(condition)
            if order_conditions is not None:
                query = query.order_by(order_conditions)
            if limit is not None:
                query = query.limit(limit)
            return query.all()

    def retrieve_object_by_unique_key(self, cls, **kwargs):
        with self.get_session() as session:
            query = session.query(cls)
            for k, v in kwargs.items():
                query = query.filter(getattr(cls, k) == v)
            return query.one_or_none()

    def create_if_not_exists(self, cls, instance, **kwargs):
        db_instance = self.retrieve_object_by_unique_key(cls, **kwargs)
        if db_instance is None:
            self.create_object(instance)
            return self.retrieve_object_by_unique_key(cls, **kwargs)
        else:
            return db_instance

    def retrieve_objects_by_user_id_and_status(self, clazz, user_id, status_in=None, status=None):
        with self.get_session() as session:
            query = session.query(clazz).filter(clazz.user_id == user_id)
            if status_in is not None:
                query = query.filter(clazz.status.in_(status_in))
            if status is not None:
                query = query.filter(clazz.status == status)
            return query.all()

    def retrieve_channels(self):
        with self.get_session() as session:
            channels = session.query(CommonChannels).filter(CommonChannels.status == 1).all()
        return [channel for channel in channels]

    @staticmethod
    def __get_deal_id_attr(cls):
        if hasattr(cls, 'get_deal_id_attr'):
            return cls.get_deal_id_attr()
        else:
            return cls.deal_id

    def retrieve_object_by_deal_id(self, clazz, deal_id):
        deal_id = int(deal_id)
        if isinstance(clazz, dict):
            clazz = clazz[get_suffix(deal_id)]
        with self.get_session() as session:
            query = session.query(clazz).filter(self.__get_deal_id_attr(clazz) == deal_id)
            return query.one_or_none()

    def retrieve_objects_by_deal_id(self, clazz, deal_id):
        deal_id = int(deal_id)
        if isinstance(clazz, dict):
            clazz = clazz[get_suffix(deal_id)]
        with self.get_session() as session:
            query = session.query(clazz).filter(self.__get_deal_id_attr(clazz) == deal_id)
            return query.all()

    def get_deal_by_deal_id(self, deal_id):
        deal_model = DEALS_MAP[str(deal_id)[-2:]]
        with self.get_session() as session:
            return session.query(deal_model).filter(deal_model.id == deal_id).first()

    def get_user_fav_deals(self, user_id):
        with self.get_session() as session:
            return session.query(UserFavoriteDeals).filter(UserFavoriteDeals.user_id == user_id).all()

    def check_and_del_fav_invalid_deals(self, user_id, deal_ids):
        deals_map = divide_deal_ids_by_suffix(deal_ids)
        total_invalid_deals = []
        for suffix, deal_ids in deals_map.items():
            deal_model = DEALS_MAP[suffix]
            with self.get_session() as session:
                deals = session.query(deal_model).filter(deal_model.id.in_(deal_ids)).all()
                valid_deals = [deal.id for deal in deals if deal.valid == 1]
                invalid_deals = list(set(deal_ids) - set(valid_deals))
                total_invalid_deals.extend(invalid_deals)
        total_invalid_deals = [int(deal) for deal in total_invalid_deals]
        with self.get_session() as session:
            fav_deals = session.query(UserFavoriteDeals).filter(UserFavoriteDeals.user_id == user_id,
                                                                UserFavoriteDeals.deal_id.in_(
                                                                    total_invalid_deals)).all()
            [session.delete(fav_deal) for fav_deal in fav_deals]
            session.commit()

    def execute_sql(self, sql_str):
        with self.get_session() as session:
            return session.execute(sql_str).fetchall()

    def set_favorite_deal(self, user_id, deal_id):
        with self.get_session() as session:
            user_deal = session.query(UserFavoriteDeals).filter(UserFavoriteDeals.user_id == user_id,
                                                                UserFavoriteDeals.deal_id == deal_id).first()
            if user_deal is None:
                record = UserFavoriteDeals(user_id=user_id, deal_id=deal_id, created_time=datetime.now())
                session.add(record)
            else:
                self.update_object(UserFavoriteDeals, user_deal.id, contain_updated_time=False,
                                   created_time=datetime.now())
            session.commit()

    def delete_favorite_deal(self, user_id, deal_id):
        with self.get_session() as session:
            user_deal = session.query(UserFavoriteDeals).filter(UserFavoriteDeals.user_id == user_id,
                                                                UserFavoriteDeals.deal_id == deal_id).first()
            if user_deal is not None:
                session.delete(user_deal)
            session.commit()

    def batch_del_fav_deal(self, user_id, deal_ids):
        with self.get_session() as session:
            user_deals = session.query(UserFavoriteDeals).filter(UserFavoriteDeals.user_id == user_id,
                                                                 UserFavoriteDeals.deal_id.in_(deal_ids)).all()
            for user_video in user_deals:
                session.delete(user_video)
            session.commit()

    def clear_user_selected_interests(self, user_id):
        with self.get_session() as session:
            interests = session.query(UserFavoriteSelectedInterest).filter(
                UserFavoriteSelectedInterest.user_id == user_id).all()
            for interest in interests:
                session.delete(interest)
            session.commit()

    def get_user_version(self, user_id):
        with self.get_session() as session:
            user_version = session.query(UserVersion).filter(UserVersion.user_id == user_id).first()
            if user_version is None:
                return None
            else:
                return user_version

    def updated_or_created_user_version(self, user_id, app_version):
        with self.get_session() as session:
            query = session.query(UserVersion).filter(UserVersion.user_id == user_id)
            if query.first() is None:
                user_version = UserVersion(user_id=user_id, app_version=app_version, updated_time=datetime.now())
                session.add(user_version)
            else:
                if query.first().app_version == app_version:
                    pass
                else:
                    query.update({'app_version': app_version, 'updated_time': datetime.now()})
            session.commit()

    def get_interests_category_ids(self, interest_ids):
        with self.get_session() as session:
            data = session.query(InterestNewsCategoryMapping).filter(
                InterestNewsCategoryMapping.interest_id.in_(interest_ids)
            ).all()
            return list({interest_cate.news_category_id for interest_cate in data})

    def update_raw_interest_to_facebook(self, raw_interest_objects, facebook_id):
        with self.get_session() as session:
            for interest in raw_interest_objects:
                session.query(UserFavoriteSelectedInterest).filter(
                    UserFavoriteSelectedInterest.id == interest.id).update(
                    {'user_id': facebook_id, 'created_time': datetime.now()})
            session.commit()

    def batch_add_following(self, user_id: str, author_ids: List[int], from_page: int = 0):
        now = datetime.now()
        author_ids = set(author_ids)
        with self.get_session() as session:
            user_following = session.query(UserFollowing).filter(UserFollowing.user_id == user_id,
                                                                 UserFollowing.author_id.in_(author_ids)).all()
            exist_following = {obj.author_id for obj in user_following}

            for author_id in author_ids:
                if author_id in exist_following:
                    session.query(UserFollowing).filter(UserFollowing.user_id == user_id,
                                                        UserFollowing.author_id == author_id).update(
                        {'created_time': now})
                else:
                    record = UserFollowing(user_id=user_id, author_id=author_id, created_time=now, from_page=from_page)
                    session.add(record)
            session.commit()

    def cancel_following(self, user_id: str, author_id: int):
        with self.get_session() as session:
            session.query(UserFollowing).filter(UserFollowing.user_id == user_id,
                                                UserFollowing.author_id == author_id).delete()
            session.commit()

    def get_instances_count(self, cls_field: Column, *conditions) -> int:
        with self.get_session() as session:
            query = session.query(func.count(cls_field))
            for condition in conditions:
                query = query.filter(condition)
            return query.scalar()

    def get_pageable_instances_by_conditions(self, cls, *conditions, page_id, count, order_conditions):
        with self.get_session() as session:
            query = session.query(cls)
            for condition in conditions:
                query = query.filter(condition)
            query = query.order_by(order_conditions)
            query = query.limit(count).offset(page_id * count)
            return query.all()

    def get_max_by_conditions(self, column, *conditions):
        with self.get_session() as session:
            query = session.query(func.max(column))
            for condition in conditions:
                query = query.filter(condition)
            return query.one_or_none()[0]

    def del_news(self, news_id):
        with self.get_session() as session:
            query_result = session.query(News).filter(News.news_id == news_id)
            if len(query_result.all()) > 0:
                query_result.update({'updated_time': datetime.now(), 'valid': -3})
                session.commit()
                return True
            else:
                return False

    def del_comments_be_news_id(self, news_id):
        with self.get_session() as session:
            session.query(Comments).filter(Comments.news_id == news_id).update({'valid': 0})
            session.commit()

    def update_topic_status_by_news_id(self, news_id, status):
        with self.get_session() as session:
            session.query(TopicNews).filter(TopicNews.news_id == news_id).update({'status': status})
            session.commit()

    def update_tags_status_by_news_id(self, news_id, status):
        with self.get_session() as session:
            session.query(UGCNewsTags).filter(UGCNewsTags.news_id == news_id).update({'status': status})
            session.commit()


mysql_client = BaseDbClient(MYSQL_CLIENT_CONFIG)
