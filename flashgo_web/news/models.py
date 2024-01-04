import datetime

from sqlalchemy import Column, Integer, String, Float, DateTime, TEXT
from sqlalchemy import ForeignKey, PrimaryKeyConstraint
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class News(Base):
    __tablename__ = 'news'

    news_id = Column(Integer, primary_key=True)
    title = Column(String)
    created_time = Column(DateTime)
    publish_time = Column(DateTime)
    media_id = Column(Integer)
    media = Column(String)
    from_media = Column(String)
    abstract = Column(TEXT)
    referer = Column(String)
    channel_name = Column(String)
    hot = Column(Integer)
    updated_time = Column(DateTime)
    url = Column(String)
    author = Column(String)
    type = Column(Integer, name='news_type')
    valid = Column(Integer)
    rss_id = Column(Integer)
    publish_timestamp = Column(Integer, default=0)


class Tags(Base):
    __tablename__ = 'common_news_tags'

    id = Column(Integer, primary_key=True)
    name = Column(String)
    parent_id = Column(Integer)


class NewsTags(Base):
    __tablename__ = 'news_tags'

    id = Column(Integer, primary_key=True)
    news_id = Column(Integer, ForeignKey('news.news_id'))
    tag_id = Column(Integer, ForeignKey('tags.id'))
    score = Column(Float)


class NewsImages(Base):
    __tablename__ = 'news_images'

    image_id = Column(Integer, primary_key=True)
    news_id = Column(Integer, ForeignKey('news.news_id'), name='news_id')
    index = Column(Integer)
    image_guid = Column(String)
    origin_url = Column(String)
    width = Column(Integer)
    height = Column(Integer)
    description = Column(String)


class NewsVideo(Base):
    __tablename__ = 'news_videos'

    video_id = Column(Integer, primary_key=True)
    news_id = Column(Integer, ForeignKey('news.news_id'))
    video_url = Column(String)
    duration = Column(Integer)
    created_time = Column(DateTime)
    video_guid = Column(String)
    width = Column(Integer)
    height = Column(Integer)


class NewsCategories(Base):
    __tablename__ = 'news_categories'

    news_category_id = Column(Integer, primary_key=True)
    news_id = Column(Integer, ForeignKey('news.news_id'))
    category_id = Column(Integer)
    created_time = Column(DateTime)


class NewsDeals(Base):
    __tablename__ = 'news_deals'
    __table_args__ = (
        PrimaryKeyConstraint('news_id', 'deal_id'),
    )

    news_id = Column(Integer)
    deal_id = Column(Integer)


class NewsLikesCount(Base):
    __tablename__ = 'news_likes_count'

    news_id = Column(Integer, primary_key=True)
    likes_count = Column(Integer)
    fake_likes_count = Column(Integer, default=0)
    updated_time = Column(DateTime)


class UserNewsFeedback(Base):
    __tablename__ = 'user_news_feedback'

    id = Column(Integer, primary_key=True)
    user_id = Column(String)
    news_id = Column(Integer)
    reason_id = Column(Integer)


class UGCNewsReject(Base):
    __tablename__ = 'ugc_news_reject'

    id = Column(Integer, primary_key=True)
    news_id = Column(Integer)
    reject_id = Column(Integer)
    description = Column(String)
    created_time = Column(DateTime, default=datetime.datetime.now())
    updated_time = Column(DateTime, default=datetime.datetime.now())

    AUTO_REJECT_MESSAGE = {
        'reject_id': -27,
        'description': 'SERVER-AUTO-REJECT, too many sensitive words.'
    }


class UGCNewsTags(Base):
    __tablename__ = 'ugc_news_tags'

    id = Column(Integer, primary_key=True)
    news_id = Column(Integer)
    tag_id = Column(Integer, default=None)
    tag_name = Column(String)
    status = Column(Integer, default=0)


class CommonUGCTags(Base):
    __tablename__ = 'common_ugc_tags'

    id = Column(Integer, primary_key=True)
    name = Column(String)
    status = Column(Integer)


class UGCNewsDelete(Base):
    __tablename__ = 'ugc_news_delete'
    id = Column(Integer, primary_key=True)
    news_id = Column(Integer)
    before_status = Column(Integer)
    execute_time = Column(DateTime)
