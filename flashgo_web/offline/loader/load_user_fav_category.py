"""
用于获取用户喜欢的品类以及热门的品类
"""
import datetime

from common import loggers
from common.sql_models import AdAction
from common.utils import list_to_chunk
from offline.loader.mysqlclient import mysql_client
from offline.loader.redisclient import redis_client

logger = loggers.get_offline_logger(__name__, 'user_native_fav.log')


def get_hot_categories():
    deals = redis_client.get_clicked_deals()
    categories = mysql_client.batch_get_deals_categories(list(deals), native=True)
    deal_cat = {}
    for cat in categories:
        if cat.deal_id in deal_cat:
            level = deal_cat[cat.deal_id].level
            # 最高级的品类
            if cat.level < level:
                deal_cat[cat.deal_id] = cat
        else:
            deal_cat[cat.deal_id] = cat
    # 覆盖率
    print('cover %s' % (len(deal_cat) * 100.0 / len(deals)))
    # 最大值
    cat_count = {}
    for cat in deal_cat.values():
        cat_count.setdefault(cat.category_id, 0)
        cat_count[cat.category_id] += 1
    print(sorted(cat_count.keys(), key=lambda k: cat_count[k], reverse=True)[:20])
    # 按权重
    cat_count = {}
    clicked = redis_client.batch_get_clicked_count(deals)
    for cat in deal_cat.values():
        cat_count.setdefault(cat.category_id, 0)
        cat_count[cat.category_id] += clicked.get(cat.deal_id, 0)
    sum_w = sum(cat_count.values())
    print(sum_w)
    for k in list(cat_count.keys()):
        cat_count[k] = cat_count[k] * 100 / sum_w
    print(sorted(cat_count.items(), key=lambda o: o[1], reverse=True)[:20])


_cache = {}


def _batch_get_deal_categories(deal_ids):
    global _cache
    res = []
    ids = []
    for deal_id in deal_ids:
        if deal_id in _cache:
            res += _cache[deal_id]
        else:
            ids.append(deal_id)
    cats = mysql_client.batch_get_deals_categories(deal_ids, native=True)
    res += cats
    for cat in cats:
        _cache.setdefault(cat.deal_id, [])
        _cache[cat.deal_id] += [cat]
        if len(_cache) > 100000:
            _cache = {}
    return res


def get_fav_categories(user_ids: list, actions=None):
    if actions is None:
        actions = []
    user_cats = {}
    for user_id in user_ids:
        clicked_actions = [action for action in actions if action.user_id == user_id]
        user_recent_click_deals = redis_client.get_user_recent_click_deals(user_id)
        deals = user_recent_click_deals + [action.deal_id for action in clicked_actions]
        if user_id == 'all_users':
            deals = redis_client.get_clicked_deals()
        deals = [int(deal) for deal in deals]
        categories = _batch_get_deal_categories(deals)
        deal_cat = {}
        for cat in categories:
            if cat.deal_id in deal_cat:
                level = deal_cat[cat.deal_id].level
                if cat.level > level:
                    deal_cat[cat.deal_id] = cat
            else:
                deal_cat[cat.deal_id] = cat
        cat_count = {}
        clicked = {}
        # 点击购买的算8分
        # 前20点的算4分
        # 前100点的算2分
        # 以后的算1分
        for index, deal_id in enumerate(user_recent_click_deals):
            if index < 20:
                clicked[deal_id] = 4
            elif index < 100:
                clicked[deal_id] = 2
            else:
                clicked[deal_id] = 1
        for action in clicked_actions:
            if action.deal_id in clicked:
                clicked[action.deal_id] += 8
            else:
                clicked[action.deal_id] = 8
        for cat in deal_cat.values():
            cat_count.setdefault(cat.category_id, 0)
            cat_count[cat.category_id] += clicked.get(cat.deal_id, 1)
        if user_id == 'all_users':
            cats = sorted(cat_count.keys(), key=lambda k: cat_count[k], reverse=True)[:50]
        else:
            cats = sorted(cat_count.keys(), key=lambda k: cat_count[k], reverse=True)[:20]
        scores = {cat: cat_count[cat] for cat in cats}
        sum_scores = sum(scores.values()) / 100.0
        if len(deals) > 5:
            user_cats[user_id] = {
                cat: scores[cat] / sum_scores for cat in cats
            }
        else:
            user_cats[user_id] = {}
    return user_cats


def parse_float(value):
    try:
        return float(value)
    except:
        return 0


def main():
    active_users = list(redis_client.get_active_users())[::-1]
    logger.info('active users size %s' % len(active_users))
    yesterday = datetime.datetime.utcnow() - datetime.timedelta(days=1)
    ad_actions = mysql_client.retrieve_objects_by_conditions(AdAction, AdAction.created_time >= yesterday,
                                                             AdAction.updated_time <= datetime.datetime.utcnow())
    logger.info('ad_actions length %s' % len(ad_actions))
    count = 0
    for user_ids in list_to_chunk(active_users, 100):
        recent_cats = redis_client.batch_get_user_recent_fav_cats(user_ids)
        cats = get_fav_categories(user_ids, actions=ad_actions)
        current_cats = {}
        for user_id in user_ids:
            if user_id not in cats:
                continue
            user_cat = cats.get(user_id, {})
            for cat, value in recent_cats.items():
                value = parse_float(value)
                if cat in user_cat:
                    user_cat[cat] += 0.4 * value
                else:
                    user_cat[cat] = 0.4 * value
            sum_scores = sum(user_cat.values())
            if sum_scores / 100.0 > 0:
                current_cats[user_id] = {
                    cat: user_cat[cat] / (sum_scores / 100.0) for cat in user_cat
                }
        redis_client.batch_cache_user_fav_cats(current_cats)
        count += len(user_ids)
        logger.info('cache %s, left %s' % (count, len(active_users) - count))
        logger.info('cache 200 users, first is %s' % list(current_cats.keys())[0])


if __name__ == '__main__':
    main()
