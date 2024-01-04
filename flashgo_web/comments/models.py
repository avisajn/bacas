from sqlalchemy import Column, Integer, TIMESTAMP, String, PrimaryKeyConstraint
from sqlalchemy.ext.declarative import declarative_base

# Use SqlAlchemy instead of models of Django

Base = declarative_base()


class Comments(Base):
    __tablename__ = 'comments'

    id = Column(Integer, primary_key=True)
    user_id = Column(String)
    news_id = Column(Integer)
    thread_id = Column(Integer)
    like_count = Column(Integer, default=0)
    fake_like_count = Column(Integer, default=0)
    content = Column(String)
    created_time = Column(TIMESTAMP)
    valid = Column(Integer, default=1)
    root_id = Column(Integer)


class CommentLikes(Base):
    __tablename__ = 'comment_likes'
    __table_args__ = (
        PrimaryKeyConstraint('comment_id', 'user_id'),
    )
    comment_id = Column(Integer)
    user_id = Column(String)
    created_time = Column(TIMESTAMP)
    comment_owner = Column(String)
    login_status = Column(Integer)
