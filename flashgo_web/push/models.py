import inspect
import json
from typing import List


class Jsonable(object):
    def to_json_string(self):
        raise NotImplementedError

    @classmethod
    def parse(cls, data):
        raise NotImplementedError


class Base(Jsonable):
    @classmethod
    def parse(cls, data):
        if isinstance(data, str) or isinstance(data, bytes):
            data = json.loads(data)
        return cls(**{k: v for k, v in data.items() if k in cls.get_item_names()})

    def __str__(self):
        return self.to_json_string()

    def __repr__(self):
        return self.to_json_string()

    def to_dict(self):
        return {k: v for k, v in self.__dict__.items() if not k.startswith('_')}

    def to_json_string(self):
        return json.dumps(self.to_dict())

    def get(self, keyword, default=None):
        return self.__dict__[keyword] if keyword in self.__dict__ else default

    def items(self):
        return self.to_dict().items()

    @classmethod
    def get_item_names(cls):
        if hasattr(cls, 'INIT_KEYWORDS'):
            return getattr(cls, 'INIT_KEYWORDS')
        else:
            keywords = [arg for arg in inspect.getfullargspec(cls.__init__).args if arg != 'self']
            setattr(cls, 'INIT_KEYWORDS', keywords)
            return keywords


class PushUser(Base):
    def __init__(self, user_id, fcm_token: str):
        self.user_id = user_id
        self.fcm_token = fcm_token

    @property
    def fcm_tokens(self):
        return [self.fcm_token]


class PushItem(Base):
    def __init__(self, users: List[PushUser], push_type, data_message, queue=None, pass_through=False):
        self.users = users
        self.queue = queue
        self.push_type = push_type
        self.pass_through = pass_through
        self.data_message = data_message

    @classmethod
    def parse(cls, data):
        if isinstance(data, str) or isinstance(data, bytes):
            data = json.loads(data)
        return cls([PushUser.parse(user) for user in data['users']], data['push_type'],
                   data_message=data['data_message'], pass_through=data.get('pass_through', False))

    def to_dict(self):
        return {
            'users': [user.to_dict() for user in self.users],
            'pass_through': self.pass_through,
            'push_type': self.push_type,
            'data_message': self.data_message
        }
