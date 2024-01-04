from datetime import datetime
from contextlib import contextmanager

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, subqueryload

from users.models import User


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

    def create_object(self, object):
        with self.get_session() as session:
            object.created_time = datetime.now()
            session.add(object)
            session.commit()

    def create_objects(self, objects: list):
        with self.get_session() as session:
            for object in objects:
                object.created_time = datetime.now()
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

    def update_object(self, clazz, object_id, **kwargs):
        with self.get_session() as session:
            parameters = dict(kwargs)
            parameters["updated_time"] = datetime.now()
            session.query(clazz).filter(clazz.id == object_id).update(parameters)
            session.commit()

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

    def retrieve_objects_by_conditions(self, cls, *conditions):
        with self.get_session() as session:
            query = session.query(cls)
            for condition in conditions:
                query = query.filter(condition)
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

    def retrieve_users_by_user_id_list(self, user_id_list):
        with self.get_session() as session:
            query = session.query(User)
            query = query.filter(User.user_id.in_(user_id_list))
            return query.all()

    def raw_sql(self, sql):
        with self.get_session() as session:
            return session.connection().execute(sql)


class PaydayLoanDbClient(BaseDbClient):
    pass
