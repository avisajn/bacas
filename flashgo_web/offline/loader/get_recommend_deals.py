from offline.loader.redisclient import redis_client
from offline.loader.mysqlclient import mysql_client
from common.utils import pick_from_array, random_pick
from offline.filters import filter_by_rules
from common.sql_models import FavoriteUserInterest, FavoriteCategories

SELLS_WEIGHTS = {
    1: 1,  # JD
    2: 1,  # lazada
    3: 1,  # bukalapak
    4: 1,  # tokopedia
    5: 1,  # shopee
    6: 1,  # bilibili
}
SELLS = redis_client.get_sells(without_black_sells=True)
DEALS_SIZE = 1000


def get_top_comments_deals(flash_deal=False):
    result = []
    for sell_id in SELLS:
        sell_id = int(sell_id)
        if sell_id == 6:
            result.append([])
            continue
        deals = mysql_client.get_deals_objects_order_by_comments(sell_id, size=DEALS_SIZE, flash_deal=flash_deal)
        result.append(deals)
    deals = random_pick(result, SELLS_WEIGHTS, DEALS_SIZE)
    return filter_by_rules(deals)


def get_user_favorite_category_deals(user_id=None, flash_deal=False):
    with mysql_client.get_session() as session:
        if user_id:
            favorite_interests = [o.interest_id for o in session.query(FavoriteUserInterest.interest_id).filter(
                FavoriteUserInterest.user_id == user_id).all()]
            favorite_categories = [o.category_id for o in session.query(FavoriteCategories.category_id).filter(
                FavoriteCategories.id.in_(favorite_interests)).all()]
        else:
            favorite_categories = mysql_client.get_favorites_categories()
        result = []
        for sell_id in SELLS:
            res = []
            for category_id in favorite_categories:
                sell_id = int(sell_id)
                deals = redis_client.get_deals(category_id, sell_id, flash_deal=flash_deal)[:DEALS_SIZE]
                res.append(deals)
            result.append(pick_from_array(res))
        return filter_by_rules(random_pick(result, SELLS_WEIGHTS, DEALS_SIZE))


def get_random_deals(flash_deal=False):
    result = []
    for sell_id in SELLS:
        sell_id = int(sell_id)
        deals = mysql_client.get_deals_randomly(sell_id, size=DEALS_SIZE, flash_deal=flash_deal)
        result.append(deals)
    return filter_by_rules(random_pick(result, SELLS_WEIGHTS, DEALS_SIZE))


def main():
    deals_order_by_comments = get_top_comments_deals(flash_deal=False)
    redis_client.cache_top_comments_deals(deals_order_by_comments)

    deals_by_favorite = get_user_favorite_category_deals(user_id='9dZy5wyUNAdbbqV78pckap25iI23', flash_deal=False)
    redis_client.cache_user_favorite_deals(deals_by_favorite)

    deals_random = get_random_deals(flash_deal=False)
    redis_client.cache_random_deals(deals_random)


if __name__ == '__main__':
    try:
        main()
    except:
        import traceback

        traceback.print_exc()
