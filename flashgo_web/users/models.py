import datetime

from sqlalchemy import Column, Integer, String, TIMESTAMP
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class User(Base):  # type: ignore
    __tablename__ = "users"
    id = Column(Integer, name="id", primary_key=True)
    user_id = Column(String, name='user_id')
    name = Column(String, name='name')
    firebase_user_id = Column(String, name='firebase_user_id')
    gender = Column(String(8), name="gender", nullable=True)
    fcm_token = Column(String(512), name="fcm_token", nullable=True)
    created_time = Column(TIMESTAMP, name="created_time")
    updated_time = Column(TIMESTAMP, name="updated_time")
    source_channel = Column(String(512), name='source_channel', nullable=True)
    valid = Column(Integer, default=1)
    user_type = Column(Integer, default=0)
    package_id = Column(String)
    description = Column(String)
    show_on_feed = Column(Integer, default=1, nullable=True)

    def to_json(self):
        return {
            'id': self.id,
            'name': self.name,
            'user_id': self.user_id,
            'gender': self.gender,
            'fcm_token': self.fcm_token,
            'firebase_user_id': self.firebase_user_id,
            'facebook_login': str(self.user_id).startswith('Facebook_'),
            'source_channel': self.source_channel,
            'valid': self.valid,
            'user_type': self.user_type,
            'package_id': self.package_id,
            'description': self.description,
            'show_on_feed': self.show_on_feed
        }

    def get_info(self):
        return {
            'id': self.id,
            'name': self.name,
            'user_id': self.user_id,
            'gender': self.gender,
            'facebook_login': str(self.user_id).startswith('Facebook_'),
            'valid': self.valid,
            'user_type': self.user_type,
            'description': self.description,
            'show_on_feed': self.show_on_feed
        }


class CoinUser(Base):  # type: ignore
    __tablename__ = "coin_users"
    id = Column(Integer, name="id", primary_key=True)
    user_id = Column(String, name='user_id')
    invite_code = Column(String, name='invite_code')
    facebook_token = Column(String, name='facebook_token')
    created_time = Column(TIMESTAMP, name="created_time")
    updated_time = Column(TIMESTAMP, name="updated_time")

    @classmethod
    def from_json(cls, data):
        return cls(user_id=data.get('UserId'), invite_code=data.get('InviteCode', ''),
                   facebook_token=data.get('Token'),
                   created_time=datetime.datetime.now(), updated_time=datetime.datetime.now())


class UserExtraInfo(Base):
    __tablename__ = "users_extra_info"
    id = Column(Integer, primary_key=True)
    user_id = Column(String)
    be_follows_count = Column(Integer)
    be_likes_count = Column(Integer)
    created_time = Column(TIMESTAMP, default=datetime.datetime.now())
    updated_time = Column(TIMESTAMP, default=datetime.datetime.now())

    def to_json(self):
        return {"id": self.id,
                "user_id": self.user_id,
                "be_follows_count": self.be_follows_count,
                "be_likes_count": self.be_likes_count}
