from sqlalchemy import Column, Integer, String

from common.viewmodelutils import ORMBase, ORMModelBase


class Banner(ORMBase, ORMModelBase):
    __tablename__ = 'banners'

    id = Column(Integer, primary_key=True)
    position = Column(Integer)
    status = Column(Integer, name='status')
    image = Column(String)
    type = Column(String)
    route_name = Column(String, name='route_name')
    param = Column(String)
    target = Column(String)
    title = Column(String)


class TopChannel(ORMBase, ORMModelBase):
    __tablename__ = 'top_channels'

    id = Column(Integer, primary_key=True)
    title = Column(String)
    position = Column(Integer)
    status = Column(Integer)
    image = Column(String)
    type = Column(String)
    route_name = Column(String, name='route_name')
    param = Column(String)
    target = Column(String)


class TopSeller(ORMBase, ORMModelBase):
    __tablename__ = 'top_sellers'

    id = Column(Integer, primary_key=True)
    deal_id = Column(Integer)
    position = Column(Integer)
    status = Column(Integer)
    target = Column(String)


class TrendingChannel(ORMBase, ORMModelBase):
    __tablename__ = 'trending_channels'

    id = Column(Integer, primary_key=True)
    position = Column(Integer)
    channel_id = Column(Integer)
    target = Column(String)
    status = Column(Integer)


class DealChannel(ORMBase, ORMModelBase):
    __tablename__ = 'deal_channels'

    id = Column(Integer, primary_key=True)
    title = Column(String)
    image = Column(String)


class ChannelDealItem(ORMBase, ORMModelBase):
    __tablename__ = 'channel_deal_items'

    id = Column(Integer, primary_key=True)
    channel_id = Column(Integer)
    deal_id = Column(Integer)


class NewsBanner(ORMBase, ORMModelBase):
    __tablename__ = 'news_banners'

    id = Column(Integer, primary_key=True)
    position = Column(Integer)
    status = Column(Integer, name='status')
    image = Column(String)
    type = Column(String)
    route_name = Column(String, name='route_name')
    param = Column(String)
    target = Column(String)
    title = Column(String)


class NewsTopChannel(ORMBase, ORMModelBase):
    __tablename__ = 'news_top_channels'

    id = Column(Integer, primary_key=True)
    title = Column(String)
    position = Column(Integer)
    status = Column(Integer)
    image = Column(String)
    type = Column(String)
    route_name = Column(String, name='route_name')
    param = Column(String)
    target = Column(String)
