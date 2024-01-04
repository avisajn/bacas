import datetime
from typing import List

from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base

from common.sql_models import generate_models

ModelBase = declarative_base()


class Base:
    @staticmethod
    def __parse_datetime(d):
        if isinstance(d, datetime.datetime):
            return d.strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z'
        else:
            return d

    @classmethod
    def get_deal_id_attr(cls):
        return cls.deal_id

    def to_dict(self):
        return {k: self.__parse_datetime(v) for k, v in self.__dict__.items() if not k.startswith('_')}

    def get_info(self, prefix: str = '', keys: List[str] = None) -> dict:
        if keys:
            return {prefix + k: getattr(self, name=k) for k in keys}
        else:
            return {prefix + k: v for k, v in self.__dict__.items() if not k.startswith('_')}


class _Deal(Base):
    DEAL_TYPES = (
        ('N', 'Normal'),
        ('F', 'Flash')
    )
    id = Column(Integer, name='id', primary_key=True)
    ecommerce_id = Column(Integer)
    ori_unique_id = Column(String)
    title = Column(String)
    description = Column(String)
    type = Column(String)
    off = Column(Float)
    original_price = Column(Float)
    current_price = Column(Float)
    price_min = Column(Float)
    price_max = Column(Float)
    sales_percentage = Column(Float)
    sales = Column(Integer)
    stock = Column(Integer)
    view_count = Column(Integer)
    interest_count = Column(Integer)
    comments = Column(Integer)
    stars = Column(Float)
    rating_user_count = Column(Integer)
    valid = Column(Integer)
    trackinglink = Column(String)
    deeplink = Column(String)
    weblink = Column(String)
    createdtime = Column(DateTime)
    crawledtime = Column(DateTime)
    updatedtime = Column(DateTime)

    @classmethod
    def get_deal_id_attr(cls):
        return cls.id

    @property
    def deal_id(self):
        return self.id

    def to_dict(self):
        data = super().to_dict()
        data['deal_id'] = self.deal_id
        trackinglink = data.get('trackinglink', '')
        if trackinglink is None or len(trackinglink) == 0:
            trackinglink = 'http://flashgo.online/cps/click?ecommerce_id=%s&deal_id=%s' % (
                self.ecommerce_id, self.deal_id)
            data['trackinglink'] = trackinglink
        return data


Deals = generate_models(_Deal, ModelBase, 'deals_deals')


class _DealArticle(Base):
    id = Column(Integer, primary_key=True)
    deal_id = Column(Integer)
    article = Column(String)
    createdtime = Column(DateTime)
    updatedtime = Column(DateTime)


DealArticles = generate_models(_DealArticle, ModelBase, 'deals_dealarticles')


class _DealCategory(Base):
    id = Column(Integer, primary_key=True)
    deal_id = Column(Integer)
    category_id = Column(Integer)
    level = Column(Integer)
    createdtime = Column(DateTime)
    updatedtime = Column(DateTime)


DealCategories = generate_models(_DealCategory, ModelBase, 'deals_dealcategories')


class _DealArticleImage(Base):
    id = Column(Integer, primary_key=True)
    deal_id = Column(Integer)
    order = Column(Integer)
    type = Column(Integer)
    image = Column(String)
    createdtime = Column(DateTime)


DealArticleImages = generate_models(_DealArticleImage, ModelBase, 'deals_dealarticleimages')


class FlashDeals(Base, ModelBase):
    __tablename__ = 'deals_flashdeals'

    id = Column(Integer, primary_key=True)
    deal_id = Column(Integer)
    starttime = Column(DateTime)
    endtime = Column(DateTime)
    off = Column(Float)
    original_price = Column(Float)
    current_price = Column(String)
    sales = Column(Integer)
    stock = Column(Integer)
    createdtime = Column(DateTime)
    updatedtime = Column(DateTime)


class Ecommerces(Base, ModelBase):
    __tablename__ = 'common_ecommerces'

    id = Column(Integer, primary_key=True)
    name = Column(String)
    logo = Column(String)
    domain = Column(String)
    description = Column(String)
    created_time = Column(DateTime)
    updated_time = Column(DateTime)


class ShareDeals(Base, ModelBase):
    __tablename__ = 'deals_sharedeals'

    id = Column(Integer, primary_key=True)
    deal_id = Column(Integer)
    start_time = Column(DateTime, name='starttime')
    end_time = Column(DateTime, name='endtime')
    created_time = Column(DateTime, name='createdtime')
    updated_time = Column(DateTime, name='updatedtime')
    stock = Column(Integer)
    sales = Column(Integer)
    current_price = Column(String)
    original_price = Column(Float)
    off = Column(Float)
    share_count = Column(Integer)

    def to_json(self):
        return {
            'deal_id': self.deal_id,
            'start_time': int(self.start_time.timestamp()),
            'end_time': int(self.end_time.timestamp())
        }


class Offer(Base, ModelBase):
    __tablename__ = 'offers'

    id = Column(Integer, primary_key=True)
    deal_id = Column(Integer)
    start_timestamp = Column(Integer)
    end_timestamp = Column(Integer)
    status = Column(Integer)
    base_bonus = Column(Integer)
    extra_bonus = Column(Integer)
    bonus_rate = Column(Float)
    ecommerce_id = Column(Integer)
    native_offer_id = Column(String)
