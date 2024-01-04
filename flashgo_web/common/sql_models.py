import datetime
import uuid
from typing import List

import pytz
from sqlalchemy import Column, Integer, TIMESTAMP, String, Float, DateTime, TEXT, DATE, PrimaryKeyConstraint
from sqlalchemy.ext.declarative import declarative_base


def generate_model(template, base, name_prefix, suffix):
    tablename = '%s_0%s' % (name_prefix, suffix)
    type_name = str(uuid.uuid4()).replace('-', '')[:5].upper() + tablename
    return type(type_name, (template, base), {'__tablename__': tablename})


all_suffixes = ['{}{}'.format(i, j) for i in range(10) for j in range(10)]


def generate_models(template, base, name_prefix):
    classes = {}
    for suffix in all_suffixes:
        cls = generate_model(template, base, name_prefix, suffix)
        classes[str(suffix)] = cls
    return classes


def get_suffix(deal_id):
    return str(deal_id)[-2:]


Base = declarative_base()


class ModelBase(object):

    @staticmethod
    def _parse_to_timestamp(value):
        return int(value.timestamp()) if isinstance(value, datetime.datetime) else value

    def get_info(self, prefix: str = '', keys: List[str] = None) -> dict:
        if keys:
            return {prefix + k: self._parse_to_timestamp(getattr(self, name=k)) for k in keys}
        else:
            return {prefix + k: self._parse_to_timestamp(v) for k, v in self.__dict__.items() if not k.startswith('_')}


class ShareDeals(Base):
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


class CommonChannels(Base):
    __tablename__ = 'common_channels'

    id = Column(Integer, primary_key=True)
    title = Column(String(300))
    image_one = Column(String(2000))
    image_two = Column(String(2000))
    status = Column(Integer)
    createdtime = Column(TIMESTAMP)
    image_logo = Column(String(2000))

    def to_dict(self):
        return {k: v for k, v in self.__dict__.items() if not (k.startswith('_') or k == 'createdtime')}


class FlashDeal(Base, ModelBase):
    __tablename__ = 'deals_flashdeals'

    id = Column(Integer, name='id', primary_key=True)
    deal_id = Column(Integer, name='deal_id')
    stock = Column(Integer)
    sales = Column(Integer)
    current_price = Column(String(100))
    original_price = Column(Float)
    off = Column(Float)

    start_time = Column(TIMESTAMP, name='starttime')
    end_time = Column(TIMESTAMP, name='endtime')
    created_time = Column(TIMESTAMP, name='createdtime')
    updated_time = Column(TIMESTAMP, name='updatedtime')

    def to_json(self):
        return {
            'deal_id': self.deal_id,
            'start_time': int(self.start_time.timestamp()),
            'end_time': int(self.end_time.timestamp())
        }


class UserFlashRemind(Base):
    __tablename__ = 'favorite_userflashremind'

    id = Column(Integer, name='id', primary_key=True)
    user_id = Column(Integer, name='user_id')
    deal_id = Column(Integer, name='deal_id')
    created_time = Column(TIMESTAMP, name='createdtime')

    def to_json(self):
        return {
            'id': self.id,
            'deal_id': self.deal_id,
            'user_id': self.user_id
        }


class FavoriteCategories(Base):
    __tablename__ = 'favorite_interests'

    id = Column(Integer, primary_key=True)
    en_name = Column(String(200))
    category_id = Column(Integer)
    createdtime = Column(DateTime)
    id_name = Column(String(200))


class FavoriteUserInterest(Base):
    __tablename__ = 'favorite_userinterests'

    id = Column(Integer, primary_key=True)
    user_id = Column(String(100))
    interest_id = Column(Integer)


class NativeCategory(Base):
    __tablename__ = 'common_ecom_categories'

    id = Column(Integer, primary_key=True)
    ecommerce_id = Column(Integer, name='ecommerce_id')
    parent_id = Column(Integer)
    level = Column(Integer)


class AdAction(Base):
    __tablename__ = 'actions'

    id = Column(Integer, primary_key=True)
    user_id = Column(String, name='user_id')
    deal_id = Column(Integer, name='deal_id')

    created_time = Column(TIMESTAMP, name='created_time')
    updated_time = Column(TIMESTAMP, name='updated_time')


class UserFavoriteDeals(Base):
    __tablename__ = 'favorite_userfavorite'

    id = Column(Integer, primary_key=True)
    user_id = Column(String)
    deal_id = Column(Integer)
    created_time = Column(DateTime)


class UserFavoriteVideos(Base):
    __tablename__ = 'favorite_userfavoritevideos'

    id = Column(Integer, primary_key=True)
    user_id = Column(String)
    video_id = Column(Integer)
    created_time = Column(DateTime)

    def to_dict(self):
        return {k: v for k, v in self.__dict__.items() if not k.startswith('_')}


class DealTemplate(object):
    id = Column(Integer, name='id', primary_key=True)
    ecommerce_id = Column(Integer, name='ecommerce_id')
    sales = Column(Integer, name='sales')
    stock = Column(Integer, name='stock')
    type = Column(String, name='type')
    off = Column(Float, name='off')
    valid = Column(Integer, name='valid')
    comments = Column(Integer, name='comments')
    stars = Column(Integer, name='stars')
    view_count = Column(Integer, name='view_count')
    title = Column(String)
    original_price = Column(Float)
    web_link = Column(String, name='weblink')

    current_price = Column(Integer, name='current_price')
    created_time = Column(TIMESTAMP, name='createdtime')
    updated_time = Column(TIMESTAMP, name='updatedtime')
    crawled_time = Column(TIMESTAMP, name='crawledtime')

    @property
    def deal_id(self):
        return self.id

    def to_dict(self):
        data = {k: v for k, v in self.__dict__.items() if not k.startswith('_')}
        data['deal_id'] = self.deal_id
        return data

    def get_score(self):
        score1 = ((self.comments / 5) / 3 + self.stars / 3 + self.view_count / 900) * 50 / 4
        if score1 >= 1 * 50:
            score1 = 50
        score2 = (self.sales / 30) * 50
        return score1 + score2


class DealCategoryTemplate(object):
    id = Column(Integer, primary_key=True)
    deal_id = Column(Integer, name='deal_id')
    category_id = Column(Integer, name='category_id')
    level = Column(Integer, name='level')
    created_time = Column(TIMESTAMP, name='createdtime')

    def to_json(self):
        return {
            'category_id': self.category_id,
            'deal_id': self.deal_id,
            'level': self.level
        }


class NativeDealCategoryTemplate(object):
    id = Column(Integer, primary_key=True)
    deal_id = Column(Integer)
    level = Column(Integer, name='level')
    category_id = Column(Integer, name='category_id')


class DealArticlesTemplate(object):
    id = Column(Integer, primary_key=True)
    deal_id = Column(Integer)
    order = Column(Integer)
    image = Column(String(200))
    type = Column(Integer)

    created_time = Column(TIMESTAMP, name='createdtime')
    updated_time = Column(TIMESTAMP, name='updatedtime')


class DealArticlesImageTemplate(object):
    id = Column(Integer, primary_key=True)
    deal_id = Column(Integer)
    order = Column(Integer)
    image = Column(String(200))
    type = Column(Integer)

    created_time = Column(TIMESTAMP, name='createdtime')
    updated_time = Column(TIMESTAMP, name='updatedtime')


DEALS_MAP = generate_models(DealTemplate, Base, 'deals_deals')
DEALS_CATEGORIES_MAP = generate_models(DealCategoryTemplate, Base, 'deals_dealcategories')
NATIVE_DEALS_CATEGORIES_MAP = generate_models(NativeDealCategoryTemplate, Base, 'deals_ecomcategories')


class PushHistory(Base):
    __tablename__ = "push_history"

    id = Column(Integer, name='id', primary_key=True)
    batch_id = Column(String, name='batch_id')
    deal_id = Column(Integer, name='deal_id')
    push_type = Column(String, name='push_type')
    schedule_type = Column(String, name='schedule_type')
    title = Column(String, name='title')
    body = Column(String, name='body')
    target = Column(String, name='target')
    status = Column(Integer, name='status')
    created_time = Column(TIMESTAMP, name='created_time')
    updated_time = Column(TIMESTAMP, name='updated_time')
    schedule_time = Column(TIMESTAMP, name='schedule_time')
    execute_time = Column(TIMESTAMP, name='execute_time')
    image = Column(String, name='image')
    fcm_token = Column(String, name='fcm_token')

    def to_json(self):
        return {
            'id': self.id,
            'batch_id': self.batch_id,
            'deal_id': self.deal_id,
            'push_type': self.push_type,
            'title': self.title,
            'body': self.body,
            'target': self.target,
            'schedule_type': self.schedule_type,
            'status': self.status,
            'created_time': self.created_time.astimezone(pytz.timezone('Asia/Jakarta')).strftime(
                '%Y-%m-%d %H:%M:%S %z'),
            'updated_time': self.updated_time.astimezone(pytz.timezone('Asia/Jakarta')).strftime(
                '%Y-%m-%d %H:%M:%S %z') if self.updated_time is not None else '',
            'execute_time':
                self.execute_time.astimezone(pytz.timezone('Asia/Jakarta')).strftime('%Y-%m-%d %H:%M:%S %z')
                if self.execute_time is not None else '',
            'schedule_time':
                self.schedule_time.astimezone(pytz.timezone('Asia/Jakarta')).strftime('%Y-%m-%d %H:%M:%S %z')
                if self.schedule_time is not None else '',
            'image': self.image,
            'fcm_token': self.fcm_token
        }


class CategoryMapping(Base):
    __tablename__ = 'common_category_mapping'

    id = Column(Integer, primary_key=True)
    fg_cate_id = Column(Integer)
    ecommerce_id = Column(Integer)
    ecom_cate_id = Column(Integer)


class FlashGoCategory(Base):
    __tablename__ = 'common_flashgo_categories'

    id = Column(Integer, primary_key=True)
    parent_id = Column(Integer)
    level = Column(Integer)
    valid = Column(Integer)


class UserFavoriteSelectedInterest(Base):
    __tablename__ = 'favorite_userselectedinterests'

    id = Column(Integer, primary_key=True)
    user_id = Column(String)
    selected_interest_id = Column(Integer)
    created_time = Column(DateTime)


class SearchHistory(Base):
    __tablename__ = 'search_history'

    id = Column(Integer, primary_key=True)
    date_time = Column(DATE)
    query_json_data = Column(TEXT)


class UserVersion(Base):
    __tablename__ = 'user_version'

    user_id = Column(String, primary_key=True)
    app_version = Column(Integer)
    updated_time = Column(DateTime)


class InterestCategoryMapping(Base):
    __tablename__ = 'selected_interests_mapping'

    interest_id = Column(Integer, primary_key=True)
    fg_cate_id = Column(Integer, primary_key=True)


class InterestNewsCategoryMapping(Base):
    __tablename__ = 'interest_news_categories_mapping'

    id = Column(Integer, primary_key=True)
    interest_id = Column(Integer)
    news_category_id = Column(Integer)


class CommonNewsCategories(Base):
    __tablename__ = 'common_flashgo_news_categories'

    id = Column(Integer, primary_key=True)
    parent_id = Column(Integer)
    en_name = Column(String)
    id_name = Column(String)
    gender = Column(Integer)
    level = Column(Integer)
    valid = Column(Integer)


class NewsCategoryMapping(Base):
    __tablename__ = 'news_categories'

    news_category_id = Column(Integer, primary_key=True)
    news_id = Column(Integer)
    category_id = Column(Integer)


class RssMedia(Base):
    __tablename__ = 'rss_media'

    id = Column(Integer, primary_key=True)
    rss_id = Column(Integer)
    media_id = Column(Integer)


class UserFollowing(Base):
    __tablename__ = 'favorite_userfollowing'

    id = Column(Integer, primary_key=True)
    user_id = Column(String)
    author_id = Column(Integer, name='media_id')
    created_time = Column(DateTime)
    from_page = Column(Integer, name='from', default=0)


class Rss(Base):
    __tablename__ = 'rss'

    id = Column(Integer, primary_key=True)
    fg_cate_id = Column(Integer)


class InterestsRecommendAuthor(Base):
    __tablename__ = 'interests_rec_authors'

    id = Column(Integer, primary_key=True)
    interest_id = Column(Integer)
    author_id = Column(Integer)
    position = Column(Integer)
    status = Column(Integer)
    updated_time = Column(DateTime)
    created_time = Column(DateTime)


class Topics(Base):
    __tablename__ = 'topics'

    id = Column(Integer, primary_key=True)
    name = Column(String)
    description = Column(String)
    keywords = Column(String)
    age_limit = Column(Integer)
    image_url = Column(String)
    status = Column(Integer)
    views_count = Column(Integer)
    updated_time = Column(DateTime)
    created_time = Column(DateTime)
    fake_follow = Column(Integer)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'keywords': self.keywords,
            'age_limit': self.age_limit,
            'image_url': self.image_url,
            'status': self.status,
            'views_count': self.views_count,
            'updated_time': None if self.updated_time is None else self.updated_time.timestamp() * 1000,
            'created_time': None if self.created_time is None else self.created_time.timestamp() * 1000,
            'fake_follow': self.fake_follow
        }


class TopicDeals(Base):
    __tablename__ = 'deals_topics'

    id = Column(Integer, primary_key=True)
    deal_id = Column(Integer)
    topic_id = Column(Integer)


class TopicNews(Base):
    __tablename__ = 'news_topics'

    id = Column(Integer, primary_key=True)
    news_id = Column(Integer)
    topic_id = Column(Integer)
    status = Column(Integer)
