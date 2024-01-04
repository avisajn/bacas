import datetime
import random
import time
from typing import List

from common import loggers
from common import recommend
from common.constants import OLD_APP_SELL_IDS_SET, ShareUrlMapping, RedisKeyPrefix, NEGATIVE_WORDS_SET, \
    INVALID_CATEGORY_IDS
from common.es_client import es_client
from common.mysqlclient import mysql_client
from common.recommend import _filter_invalid_deals, filter_by_users, _get_or_cache_custom_channel_feeds
from common.redisclient import cache, redis_client, DEAL_CACHE_PATTERN, TOPIC_DEALS_FEED, TOPIC_DEAL_IDS_USER, \
    CASHBACK_RECOMMEND_FEEDS
from common.sql_models import NATIVE_DEALS_CATEGORIES_MAP, FlashDeal
from common.sql_models import TopicDeals
from cps_providers.jd import jd_provider
from common.utils import parse_int, filter_by_user_impression, check_negative_words_valid, OfferUtils
from cps_providers.models import CPSOrder
from deals import sql_models
from deals.sql_models import Offer, Ecommerces
from favorite.utils import check_user_favorite_status, check_user_flashremind_status
from home.models import TopSeller
from users.views import get_user_gender

logger = loggers.get_logger(__name__)
DEAL_CACHE_PATTERN_TEST = 'test_sql_model_deal_%s_%s'


def _get_default_deal_image(deal_id):
    return {
        "id": 0,
        "deal_id": deal_id,
        "order": 0,
        "type": 1,
        "image": "https://cdn.flashgo.online/admin/default_image.png",
        "createdtime": "2018-12-21T09:52:08.302Z"
    }


@cache(key=lambda deal_id, deal_article=False: DEAL_CACHE_PATTERN % (int(deal_id), 1 if deal_article else 0),
       ex=10 * 60,
       cache_on_memory=20)
def _get_deal_detail_by_deal_id(deal_id, deal_article=False):
    try:
        deal_id = int(deal_id)
        deal = mysql_client.retrieve_object_by_deal_id(sql_models.Deals, deal_id=deal_id)
        deal_type = deal.type
        ecommerce_id = deal.ecommerce_id
        native_categories = [_.category_id for _ in
                             mysql_client.retrieve_objects_by_deal_id(NATIVE_DEALS_CATEGORIES_MAP, deal_id)]
        deal = deal.to_dict()
        try:
            deal['original_price'] = float(int(deal['original_price']))
            deal['current_price'] = float(int(deal['current_price']))
            deal['price_min'] = float(int(deal['price_min']))
            deal['price_max'] = float(int(deal['price_max']))
        except:
            logger.exception("parse price error")
        deal['share_url'] = ShareUrlMapping.DEAL.format(deal['id'])
        ecommerce = mysql_client.retrieve_object_by_id(sql_models.Ecommerces, ecommerce_id).to_dict()
        images = mysql_client.retrieve_objects_by_deal_id(sql_models.DealArticleImages, deal_id=deal_id)
        dealarticleimages = []
        dealarticleimage_thumb = None
        for image in images:
            if image.type == 0:
                dealarticleimage_thumb = image.to_dict()
            else:
                dealarticleimages.append(image.to_dict())
        if dealarticleimage_thumb is None and dealarticleimages:
            dealarticleimage_thumb = dealarticleimages[0]
        if dealarticleimage_thumb is None:
            dealarticleimage_thumb = _get_default_deal_image(deal_id)
        if len(dealarticleimages) == 0 and dealarticleimage_thumb is not None:
            dealarticleimages.append(dealarticleimage_thumb)
        res = dict(
            deal=deal,
            dealarticleimages=dealarticleimages,
            dealarticleimage_thumb=dealarticleimage_thumb,
            ecommerce=ecommerce,
            native_categories=native_categories,
        )
        if deal_article is True:
            dealarticle = [article.to_dict() for article in
                           mysql_client.retrieve_objects_by_deal_id(sql_models.DealArticles, deal_id)]
            res.setdefault("dealarticle", dealarticle)

        if deal_type != 'N':
            flash = mysql_client.retrieve_object_by_deal_id(sql_models.FlashDeals, deal_id=deal_id)
            if flash is not None:
                flash_deal_data = flash.to_dict()
                # to ensure type of current_price is str
                if not isinstance(flash_deal_data['current_price'], str):
                    flash_deal_data['current_price'] = str(flash_deal_data['current_price'])
                # to ensure type of current_price is int
                flash_deal_data['original_price'] = float(parse_int(flash_deal_data['original_price'], 0))
                res.setdefault("flash", flash_deal_data)
            share = mysql_client.retrieve_object_by_deal_id(sql_models.ShareDeals, deal_id=deal_id)
            if share is not None:
                res.setdefault("share", share.to_dict())
        return res
    except Exception as e:
        logger.info('deal_id(%s) not find' % deal_id)
        raise e


@cache(key=lambda user_id: 'clicks_%s' % user_id, ex=3, cache_on_memory=3)
def get_user_clicks(user_id):
    return list(redis_client.get_click_deals(user_id))


def get_deal_detail_by_deal_id(deal_id, deal_article=False, user_id=None, force_skip_out=False):
    """
    :param deal_id:
    :param deal_article:
    :param user_id:
    :return:
    """
    res = _get_deal_detail_by_deal_id(deal_id, deal_article)
    if "flash" in res:
        now = datetime.datetime.utcnow().isoformat()
        now = now[:-3] + 'Z'
        res["flash"]["now"] = now
    clicks = get_user_clicks(user_id) if user_id is not None else []
    res.get('deal', {})['read'] = int(deal_id) in clicks
    res.setdefault("favorite_status", check_user_favorite_status(user_id, deal_id))
    flash_status = check_user_flashremind_status(user_id, deal_id)
    res.setdefault("falshremind_status", flash_status)
    res.setdefault("flash_remind_status", flash_status)
    res['thumb_image_width'] = 1
    res['thumb_image_height'] = 1
    if force_skip_out or res['deal']['ecommerce_id'] in redis_client.get_skip_out():
        res.setdefault("skip", True)
        res.setdefault("skip_out", True)
    else:
        res.setdefault("skip", False)
        res.setdefault("skip_out", False)
    return res


def to_datetime(date) -> datetime.datetime:
    if isinstance(date, str):
        for date_format in ['%Y-%m-%dT%H:%M:%S.%fZ', '%Y-%m-%dT%H:%M:%SZ']:
            try:
                return datetime.datetime.strptime(date, date_format).astimezone(datetime.timezone.utc)
            except ValueError:
                pass
        raise ValueError('unsupported date format %s' % date)
    elif isinstance(date, datetime.datetime):
        return date.astimezone(datetime.timezone.utc)
    else:
        return date


@cache(lambda target, gender: 'H_TOP_SELLERS_{}-{}'.format(target, gender), ex=10 * 60, cache_on_memory=5)
def _get_top_sellers(target, gender):
    if gender not in {'Male', 'Female'}:
        gender = 'male'
    else:
        gender = gender.lower()
    sellers = mysql_client.retrieve_objects_by_conditions(TopSeller, TopSeller.status == 1,
                                                          TopSeller.target == f'{target}-{gender}')
    if len(sellers) > 3:
        sellers = list(sorted(sellers, key=lambda deal: deal.position))[:3]
    return [sell.deal_id for sell in sellers]


def _share_deal_top_feeds(user_id=None, count=None, page_id=None):
    try:
        res = []
        deals = recommend.get_share_feeds(user_id, page_id, count)
        if deals is None:
            deals = []
        for data in deals:
            deal_dict = get_deal_detail_by_deal_id(data, user_id=user_id)
            res.append(deal_dict)
        return res
    except:
        logger.exception('error')


def filter_deals_negative(res):
    ret = []
    for deal_data in res:
        valid = check_negative_words_valid(deal_data['deal']['title'].lower(), NEGATIVE_WORDS_SET)

        if len(set(deal_data.get('native_categories', [])) & INVALID_CATEGORY_IDS) > 0:
            valid = False

        if valid:
            ret.append(deal_data)
        else:
            continue
    return ret


def filter_deals_by_app_version(feeds_data, app_version: int = 0):
    ret = []
    if app_version <= 2050:
        for deal in feeds_data:
            if int(deal['deal']['ecommerce_id']) in OLD_APP_SELL_IDS_SET:
                ret.append(deal)
    else:
        ret = feeds_data
    return ret


def filter_by_blacklist(feeds_data):
    ret = []
    black_sells = redis_client.get_black_sells()
    if len(black_sells) > 0:
        for deal in feeds_data:
            if int(deal['deal']['ecommerce_id']) not in black_sells:
                ret.append(deal)
    else:
        ret = feeds_data
    return ret


@cache(key=lambda topic_id: TOPIC_DEALS_FEED % topic_id, ex=2 * 60 * 60, prefix=RedisKeyPrefix.DEAL)
def _get_topic_deal_ids(topic_id: int) -> List[int]:
    topic_deals = mysql_client.retrieve_objects_by_conditions(TopicDeals, TopicDeals.topic_id == topic_id)
    deal_ids = [deal.deal_id for deal in topic_deals]
    return deal_ids


def get_topic_deal_ids(topic_id: int, user_id: str, page_id: int, count: int) -> List[int]:
    deal_ids = redis_client.get_object(TOPIC_DEAL_IDS_USER % (topic_id, user_id), prefix=RedisKeyPrefix.DEAL)

    if deal_ids is None or len(deal_ids) == 0:
        user_impression = redis_client.get_impressed_feeds(user_id)
        default_deal_ids = _get_topic_deal_ids(topic_id)

        if len(set(default_deal_ids) - set(user_impression)) == 0:
            random_deal_ids = []
            for i in range(0, len(default_deal_ids), 20):
                item = default_deal_ids[i: i + 20]
                random.shuffle(item)
                random_deal_ids = random_deal_ids + item
            deal_ids = random_deal_ids
        else:
            deal_ids = filter_by_user_impression(default_deal_ids, user_impression, with_impression=True)

        redis_client.cache_object(TOPIC_DEAL_IDS_USER % (topic_id, user_id), deal_ids, ex=20 * 60,
                                  prefix=RedisKeyPrefix.DEAL)

    return deal_ids[page_id * count: (page_id + 1) * count]


@cache(lambda ecommerce_id: "ecommerce_cache_%s" % ecommerce_id, ex=10 * 60, cache_on_memory=15,
       prefix=RedisKeyPrefix.DEAL)
def get_ecommerce_info(ecommerce_id: int) -> dict:
    ecommerce = mysql_client.retrieve_object_by_unique_key(Ecommerces, id=ecommerce_id)
    return ecommerce.get_info(prefix='ecommerce_')


@cache(lambda deal_id: "deal_cache_%s" % deal_id, ex=10 * 60, cache_on_memory=15, prefix=RedisKeyPrefix.DEAL)
def _get_deal_info(deal_id):
    deal_info = {}
    deal: sql_models.Deals = mysql_client.retrieve_object_by_deal_id(sql_models.Deals, deal_id=deal_id)
    deal_info.update(deal.get_info(prefix='deal_'))
    images = sorted(mysql_client.retrieve_objects_by_deal_id(sql_models.DealArticleImages, deal_id=deal_id),
                    key=lambda image: int(image.order))
    deal_images = []
    for index, image in enumerate(images):
        if index == 0:
            deal_info['thumb_image_url'] = image.image
            deal_info["thumb_image_width"] = 1
            deal_info["thumb_image_height"] = 1
        else:
            deal_images.append({
                "url": image.image,
                "width": 1,
                "height": 1
            })
    deal_info["images"] = deal_images
    offer: Offer = mysql_client.retrieve_object_by_unique_key(Offer, deal_id=deal_id, status=1)
    if offer is not None:
        offer_info = offer.get_info(prefix='offer_')
        offer_info["offer_base_bonus"] = OfferUtils.get_offer_bonus(offer_info["offer_base_bonus"],
                                                                    offer_info["offer_extra_bonus"],
                                                                    cut_rate=0.8)
        if offer_info["offer_base_bonus"] > 0:
            deal_info.update(offer_info)
            deal_info["deal_is_offer"] = True
        else:
            deal_info["deal_is_offer"] = False
    else:
        deal_info['deal_is_offer'] = False
    if deal.type == "F":
        flash_deal = mysql_client.retrieve_object_by_unique_key(FlashDeal, deal_id=deal_id)
        deal_info.update(flash_deal.get_info(prefix='flash_'))
    deal_info["native_category_ids"] = [_.category_id for _ in
                                        mysql_client.retrieve_objects_by_deal_id(NATIVE_DEALS_CATEGORIES_MAP, deal_id)]
    return deal_info


def get_deal_info(deal_id: int, force_skip_out=False) -> dict:
    deal_info = _get_deal_info(deal_id)
    ecommerce_info = get_ecommerce_info(deal_info['deal_ecommerce_id'])
    return_data = {
        "deal_id": deal_info["deal_id"],
        "deal_current_price": int(deal_info["deal_current_price"]),
        "deal_original_price": int(deal_info["deal_original_price"]),
        "deal_title": deal_info["deal_title"],
        "deal_stars": deal_info["deal_stars"],
        "deal_type": deal_info["deal_type"],
        "deal_comments": deal_info["deal_comments"],
        "deal_valid": deal_info["deal_valid"],
        "deal_share_url": f"http://flashgo.online/webapp/deals/{deal_id}",
        "deal_force_skip_out": force_skip_out,
        "deal_off": deal_info["deal_off"],
        "deal_is_offer": deal_info["deal_is_offer"],
        "ecommerce": {
            "ecommerce_id": ecommerce_info["ecommerce_id"],
            "ecommerce_logo": ecommerce_info["ecommerce_logo"],
            "ecommerce_name": ecommerce_info["ecommerce_name"]
        },
        "images": deal_info["images"],
        "thumb_image": {
            "url": deal_info["thumb_image_url"],
            "weight": deal_info["thumb_image_width"],
            "height": deal_info["thumb_image_height"]
        }
    }
    if deal_info["deal_type"] == "F":
        return_data["flash"] = {
            "flash_start_time": deal_info["flash_start_time"] * 1000,
            "flash_end_time": deal_info["flash_end_time"] * 1000,
            "flash_now": int(time.time() * 1000)}

        if "?" in deal_info["flash_current_price"]:
            return_data["flash_extra_current_price"] = deal_info["flash_current_price"]
        else:
            return_data["flash_extra_current_price"] = ""
    if deal_info["deal_is_offer"]:
        return_data["offer"] = {
            "offer_base_bonus": deal_info["offer_base_bonus"]
        }
    return_data["deal_show_on_feed"] = ecommerce_info["ecommerce_id"] not in redis_client.get_black_sells() and not set(
        deal_info["native_category_ids"]) & INVALID_CATEGORY_IDS and check_negative_words_valid(
        deal_info["deal_title"].lower(), NEGATIVE_WORDS_SET) and deal_info["deal_valid"] == 1
    return return_data


def get_tiny_deal_info(deal_id):
    deal_info = _get_deal_info(deal_id)
    ecommerce_info = get_ecommerce_info(deal_info['deal_ecommerce_id'])
    return {
        "deal_id": deal_info["deal_id"],
        "deal_current_price": deal_info["deal_current_price"],
        "deal_title": deal_info["deal_title"],
        "deal_valid": deal_info["deal_valid"],
        "ecommerce": {
            "ecommerce_id": ecommerce_info["ecommerce_id"],
            "ecommerce_logo": ecommerce_info["ecommerce_logo"],
            "ecommerce_name": ecommerce_info["ecommerce_name"]
        },
        "thumb_image": {
            "url": deal_info["thumb_image_url"],
            "weight": deal_info["thumb_image_width"],
            "height": deal_info["thumb_image_height"]
        }
    }


def _get_channel_feeds(channel_id, user_id, page_id):
    key = f"Channel_{channel_id}_{user_id}"
    deal_ids = redis_client.get_object(key)
    if page_id == 0 or len(deal_ids) == 0:
        feeds = redis_client.get_deal_ids_by_channel(channel_id)
        if feeds is None:
            feeds = []
        deal_ids = filter_by_users(user_id, feeds, with_impression=True)
        redis_client.cache_object(key, deal_ids, ex=10 * 60)
    return deal_ids


def get_pageable_channel_feeds(channel_id, page_id, count, user_id):
    if channel_id > 4:
        channel_deal_ids = _get_or_cache_custom_channel_feeds(user_id, channel_id, force_flush=(page_id == 0))
    else:
        channel_deal_ids = _get_channel_feeds(channel_id, user_id, page_id)
    channel_deal_ids = channel_deal_ids[page_id * count: (page_id + 1) * count]
    if len(channel_deal_ids) > 0:
        redis_client.set_impressed_feeds(user_id, channel_deal_ids)
    return channel_deal_ids


def _get_user_cashback_recommend(user_id, page_id):
    key = 'Cashback_rec_%s' % user_id
    deal_ids = redis_client.get_object(key)
    if deal_ids is None or page_id == 0:
        feeds = redis_client.get_object(CASHBACK_RECOMMEND_FEEDS)
        if feeds is None:
            feeds = []
        deal_ids = filter_by_users(user_id, feeds, with_impression=True)
        redis_client.cache_object(key, deal_ids, ex=10 * 60)
    return _filter_invalid_deals(deal_ids)


def get_pageable_recommend_feeds(user_id, page_id, count):
    pageable_deal_ids = _get_user_cashback_recommend(user_id, page_id)[page_id * count: (page_id + 1) * count]
    gender = get_user_gender(user_id)
    if len(pageable_deal_ids) > 0:
        redis_client.set_impressed_feeds(user_id, pageable_deal_ids, gender=gender)
    return pageable_deal_ids


def _get_flash_deal_feeds(user_id, page_id):
    key = 'P_FEED_C_%s' % user_id
    deal_ids = redis_client.get_object(key)
    if deal_ids is None or page_id == 0:
        deal_ids = filter_by_users(user_id, redis_client.get_flash_deal(), with_impression=True)
        redis_client.cache_object(key, deal_ids, ex=3 * 60)
    deal_times = redis_client.batch_get_start_and_end_time(deal_ids)
    on_going_deals = []
    coming_deals = []
    invalid_deals = []
    now = int(time.time())
    for v in deal_times.values():
        if now > v['end_time']:
            invalid_deals.append(v['deal_id'])
        elif now >= v['start_time']:
            on_going_deals.append(v['deal_id'])
        else:
            coming_deals.append(v['deal_id'])
    deal_caches = redis_client.batch_get_deal_cache(on_going_deals)
    new_on_going_deals = []
    for deal_id in on_going_deals:
        if deal_id in deal_caches and deal_caches[int(deal_id)].get('current_price', 0) > 0:
            new_on_going_deals.append(deal_id)
    return list(new_on_going_deals), list(coming_deals), list(invalid_deals)


def get_flash_deal_feeds(user_id, page_id, count, feed_type="ongoing"):
    if feed_type == "ongoing":
        flash_deal_ids, _, _ = _get_flash_deal_feeds(user_id, page_id)
    elif feed_type == "coming":
        _, flash_deal_ids, _ = _get_flash_deal_feeds(user_id, page_id)
    else:
        raise ValueError(f"feed_type {feed_type} not support.")
    deal_ids = flash_deal_ids[page_id * count: (page_id + 1) * count]
    if len(deal_ids) >= count:
        redis_client.set_impressed_feeds(user_id, deal_ids)
    return deal_ids


@cache(key=lambda deal_id, only_cashback: "relative_deals_%s_%s" % (deal_id, 1 if only_cashback else 2), ex=10 * 60)
def _get_relative_deals(deal_id, only_cashback):
    deal_ids = es_client.get_relative_deal_ids(deal_id, only_cashback)
    return deal_ids


def get_pageable_relative_deals(deal_id, page_id, count, only_cashback=True):
    total_deal_ids = _get_relative_deals(deal_id, only_cashback)
    feeds = redis_client.get_object(CASHBACK_RECOMMEND_FEEDS)
    if feeds is None:
        feeds = []
    total_deal_ids += feeds
    return total_deal_ids[page_id * count: (page_id + 1) * count]


@cache(key=lambda user_id: f"offer_income_{user_id}", ex=20 * 60)
def get_offer_income(user_id):
    cps_orders = mysql_client.retrieve_objects_by_conditions(CPSOrder,
                                                             CPSOrder.user_id == user_id)
    pending = 0
    successful = 0
    for order in cps_orders:
        if order.status in CPSOrder.get_pending_status():
            pending += order.estimate_fee // order.sku_num
        elif order.status == CPSOrder.STATUS_SUCCESS_PAY_TO_USER:
            successful += order.estimate_fee // order.sku_num
    return {
        "pending": pending,
        "successful": successful
    }


@cache(key=lambda user_id, order_type: f"cps_order_{user_id}_{order_type}", ex=30 * 60)
def _get_cps_order_ids(user_id, order_type):
    if order_type == "pending":
        orders = mysql_client.retrieve_objects_by_conditions(CPSOrder,
                                                             CPSOrder.user_id == user_id,
                                                             CPSOrder.status.in_(CPSOrder.get_pending_status()))
    elif order_type == "successful":
        orders = mysql_client.retrieve_objects_by_conditions(CPSOrder,
                                                             CPSOrder.user_id == user_id,
                                                             CPSOrder.status == CPSOrder.STATUS_SUCCESS_PAY_TO_USER)
    elif order_type == "failed":
        orders = mysql_client.retrieve_objects_by_conditions(CPSOrder,
                                                             CPSOrder.user_id == user_id,
                                                             CPSOrder.status == CPSOrder.STATUS_FAILED)
    elif order_type == "all":
        orders = mysql_client.retrieve_objects_by_conditions(CPSOrder,
                                                             CPSOrder.user_id == user_id)
    else:
        raise ValueError(f"order_type {order_type} not support")

    orders = sorted(orders, key=lambda instance: instance.created_order_time)
    return [order.id for order in orders]


def get_pageable_cps_order_ids(user_id, order_type, page_id, count):
    order_ids = _get_cps_order_ids(user_id, order_type)
    return order_ids[page_id * count: (page_id + 1) * count]


@cache(key=lambda order_id: f"order_cache_{order_id}", ex=10 * 60)
def _get_cps_order_info(order_id):
    order: CPSOrder = mysql_client.retrieve_object_by_unique_key(CPSOrder, id=order_id)
    return order.get_info(prefix="cps_order_")


def get_cps_order_info(order_id):
    order_info = _get_cps_order_info(order_id)
    tiny_deal_info = get_tiny_deal_info(order_info["cps_order_deal_id"])
    recharge_coin_time = order_info["cps_order_recharge_coin_time"]
    return {
        "tiny_deal_info": tiny_deal_info,
        "cps_order_unique_order_id": order_info["cps_order_unique_order_id"],
        "cps_order_status": order_info["cps_order_status"],
        "cps_order_created_order_time": int(order_info["cps_order_created_order_time"] * 1000),
        "cps_order_per_estimate_fee": order_info["cps_order_estimate_fee"] // order_info["cps_order_sku_num"],
        "cps_order_recharge_coin_time": int(recharge_coin_time * 1000) if recharge_coin_time else 0,
        "cps_order_predicted_timestr": "Dalam 14 hari setelah kedatangan"
    }


@cache(key=lambda user_id, deal_id: f"Offer_url_{user_id}_{deal_id}", ex=20 * 60)
def generate_offer_share_link(user_id, deal_id):
    basic_deal_info = _get_deal_info(deal_id)
    deal_info = get_deal_info(deal_id)
    if basic_deal_info['deal_is_offer'] and deal_info["ecommerce"]["ecommerce_id"] == 1:
        return jd_provider.generate_url(basic_deal_info["deal_weblink"], sub_id=f"{user_id}-{deal_id}")
    else:
        raise ValueError(f"get offer share link error, user_id {user_id}, deal_id {deal_id}")
