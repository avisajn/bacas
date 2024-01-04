import datetime
from sqlalchemy import Column, Integer, String, DateTime, TEXT
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class Interests(Base):
    __tablename__ = 'favorite_interests'

    id = Column(Integer, primary_key=True)
    id_name = Column(String)
    en_name = Column(String)
    category_id = Column(Integer)
    createdtime = Column(DateTime, default=datetime.datetime.now())


class UserInterests(Base):
    __tablename__ = 'favorite_userinterests'

    id = Column(Integer, primary_key=True)
    user_id = Column(String)
    interest_id = Column(Integer)
    createdtime = Column(DateTime, default=datetime.datetime.now())


class UserReportDealErrors(Base):
    __tablename__ = 'favorite_userreportdealerrors'

    id = Column(Integer, primary_key=True)
    user_id = Column(String)
    deal_id = Column(Integer)
    error = Column(String)
    createdtime = Column(DateTime)


class UserFlashRemind(Base):
    __tablename__ = 'favorite_userflashremind'

    id = Column(Integer, primary_key=True)
    user_id = Column(String)
    deal_id = Column(Integer)
    createdtime = Column(DateTime)


class SelectedInterests(Base):
    __tablename__ = 'favorite_selected_interests'

    id = Column(Integer, primary_key=True)
    en_name = Column(String)
    created_time = Column(DateTime)
    id_name = Column(String)
    image = Column(String)
    status = Column(Integer)
    gender = Column(String)
    order = Column(Integer)
    image_base64 = Column(TEXT)


class UserLike(Base):
    __tablename__ = 'favorite_userlike'

    id = Column(Integer, primary_key=True)
    user_id = Column(String)
    news_id = Column(Integer)
    created_time = Column(DateTime)
    type = Column(Integer)
