from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class TopicFollows(Base):
    __tablename__ = 'topic_follows'

    id = Column(Integer, primary_key=True)
    topic_id = Column(String)
    user_id = Column(String)
    created_timestamp = Column(Integer)
