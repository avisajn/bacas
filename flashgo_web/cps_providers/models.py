from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from common.sql_models import ModelBase

Base = declarative_base()


class CPSOrder(Base, ModelBase):
    __tablename__ = 'cps_orders'

    id = Column(Integer, primary_key=True)
    unique_order_id = Column(String)
    price = Column(Integer)
    estimate_fee = Column(Integer)
    sku_num = Column(Integer)
    status = Column(Integer)
    user_id = Column(String)
    finish_order_time = Column(Integer)
    created_order_time = Column(Integer)
    recharge_coin_time = Column(Integer)
    updated_time = Column(Integer)
    deal_id = Column(Integer)

    # 没有用，只是为了让create_object能正常运行
    created_time = None

    STATUS_CREATED = 0
    STATUS_PENDING = 1
    STATUS_PREPARE_PAY_TO_USER = 2
    STATUS_PAYING_TO_USER = 3
    STATUS_SUCCESS_PAY_TO_USER = 4
    STATUS_FAILED = 5

    @classmethod
    def get_pending_status(cls):
        return {cls.STATUS_CREATED, cls.STATUS_PENDING, cls.STATUS_PREPARE_PAY_TO_USER, cls.STATUS_PAYING_TO_USER}


class CoinUniqueTime(Base):
    __tablename__ = 'coin_unique_times'

    id = Column(Integer, primary_key=True)
    unique_order_id = Column(String)
    recharge_time_str = Column(String)
