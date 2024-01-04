import inspect
import json
from enum import Enum
from typing import List

timestamp = int


class Base(object):
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
        return json.dumps(self.to_dict(), separators=(",", ":"))

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


class ItemProfile(Base):
    def __init__(self, item_id: int,
                 item_type: int,
                 author: int,
                 category: int,
                 category_gender: str,
                 keywords: List[str],
                 publish_date: timestamp,
                 image_count: int,
                 duration: int,
                 click_count: int,
                 impression_count: int):
        self.item_id = item_id
        self.item_type = item_type
        self.author = author
        self.category = category
        self.category_gender = category_gender
        self.keywords = keywords
        self.publish_date = publish_date
        self.image_count = image_count
        self.duration = duration
        self.click_count = click_count
        self.impression_count = impression_count


class UserProfile(Base):
    def __init__(self, user_id: str, gender: str, fav: list, reads: list, clicks: list):
        self.user_id = user_id
        self.gender = gender
        self.fav = fav
        self.reads = reads
        self.clicks = clicks


class FeedItem(Base):
    def __init__(self, item_id: int, recall: str, sort: str, exp: str, extra=None):
        self.item_id = item_id
        self.recall = recall
        self.sort = sort
        self.exp = exp
        self.extra = extra

    def __hash__(self):
        return hash(self.item_id)

    def __eq__(self, other):
        return self.item_id == other.item_id


class ImpressionItem(ItemProfile, FeedItem):
    INIT_KEYWORDS = list(set(ItemProfile.get_item_names() + FeedItem.get_item_names()))

    def __init__(self, **kwargs):
        ItemProfile.__init__(self, **{k: v for k, v in kwargs.items() if k in ItemProfile.get_item_names()})
        FeedItem.__init__(self, **{k: v for k, v in kwargs.items() if k in FeedItem.get_item_names()})


class FeedType(Enum):
    ONLINE = 'online'
    OFFLINE = 'offline'
    HOT_GENDER = 'hotgender'
    HOT_INTEREST = 'hotinterest'
    CTR_GENDER = 'ctrgender'
    CTR_INTEREST = 'ctrinterest'
    COMMON = 'common'
    MAB = 'mab'
    ALL = 'all'

    @staticmethod
    def get_default_feeds():
        return [FeedType.ONLINE, FeedType.OFFLINE]

    def get_pattern(self):
        if self == FeedType.HOT_GENDER or self == FeedType.HOT_INTEREST:
            return 'H_F_%s_%s'
        elif self == FeedType.CTR_GENDER or self == FeedType.CTR_INTEREST:
            return 'CTR_F_%s_%s_v2'
        elif self == FeedType.COMMON:
            return 'COMMON_F_%s_%s'
        else:
            return 'U_F_%s_%s'


def _test():
    data = dict(
        item_id='item_id',
        item_type='item_type',
        author='author',
        category='category',
        category_gender='category_gender',
        keywords='keywords',
        publish_date='publish_date',
        image_count='image_count',
        duration='duration',
        click_count='click_count',
        impression_count='impression_count',
        recall='recall',
        sort='sort',
        exp='exp')
    impression_item = ImpressionItem.parse(data)
    assert impression_item.to_dict() == data
