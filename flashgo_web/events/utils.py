from typing import List

from common import loggers
from favorite.utils import get_selected_categories
from news.utils import get_item_impression
from recsys.events import sender
from recsys.models import FeedItem, ItemProfile, ImpressionItem
from users.views import get_user_gender

logger = loggers.get_logger(__name__)


def wrapper_news_ids(news_ids: List[int], example: FeedItem) -> List[FeedItem]:
    news_items = []
    for news_id in news_ids:
        example.item_id = news_id
        news_items.append(FeedItem.parse(example))
    return news_items


def send_news_impression(user_id, impression_id, page_id, news_items: List[FeedItem], from_page='content_recommend',
                         package_id='com.cari.promo.diskon'):
    try:
        if user_id not in {'web', 'test', '', None}:
            item_list = []
            news_ids = [item.item_id for item in news_items]
            item_profiles = {item.item_id: item for item in
                             get_item_impression(news_ids)}  # type: Dict[int, ItemProfile]
            for feed_item in news_items:
                item = {k: v for k, v in feed_item.to_dict().items()}
                if feed_item.item_id in item_profiles:
                    profile = item_profiles[feed_item.item_id]
                else:
                    profile = ItemProfile(feed_item.item_id, -1, -1, -1, "Unknown", [], 0, 0, 0, 0, 0)
                for k, v in profile.to_dict().items():
                    item[k] = v
                item_list.append(ImpressionItem.parse(item))
            if package_id is None or len(package_id) == 0:
                package_id = 'com.cari.promo.diskon'
            sender.send_impression_event(user_id=user_id, impression_id=impression_id, from_page=from_page,
                                         page_id=page_id, gender=get_user_gender(user_id),
                                         select_interests=get_selected_categories(user_id),
                                         item_list=item_list, package_id=package_id)
    except Exception as e:
        logger.exception("send news impression error" + str(e))
