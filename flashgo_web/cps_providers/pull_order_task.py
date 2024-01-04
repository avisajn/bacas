import random
import sys
import time
from datetime import datetime, timedelta

import pytz
import requests

from common import loggers
from common.mysqlclient import mysql_client
from common.redisclient import acquire_lock, redis_client
from cps_providers.jd import JDProvider
from cps_providers.models import CPSOrder, CoinUniqueTime
from user_center_utils.config import MONEY_COIN_BASE_URL_FORMAT
from users.models import User, CoinUser

logger = loggers.get_logger(__name__, 'cps_orders.log')

PAY_DEAL_ACTION_ID = 29004


class TimeStr(object):
    UTC_TZ = pytz.utc
    # 印尼时间和标准时间相差约7小时
    ID_OFFSET = 7 * 60 * 60
    TIME_STR_FORMAT = '%Y%m%d%H%M%S'

    @classmethod
    def from_timestamp(cls, timestamp):
        return (datetime.fromtimestamp(timestamp, tz=cls.UTC_TZ) + timedelta(seconds=cls.ID_OFFSET)).strftime(
            cls.TIME_STR_FORMAT)

    @classmethod
    def to_timestamp(cls, time_str):
        return int(cls.to_datetime(time_str).timestamp()) - cls.ID_OFFSET

    @classmethod
    def to_datetime(cls, time_str):
        current = datetime.strptime(time_str, cls.TIME_STR_FORMAT)
        return datetime(year=current.year, month=current.month, day=current.day,
                        hour=current.hour, minute=current.minute, second=current.second,
                        tzinfo=cls.UTC_TZ)


def _test_time_str():
    current = int(time.time())
    assert TimeStr.to_timestamp(TimeStr.from_timestamp(current)) == current


def get_fee(origin_fee, sku_num):
    return int(int(origin_fee * 0.8) // sku_num) * sku_num


def parse_int(s: str):
    try:
        return int(s)
    except:
        return 0


def process_jd_order(order):
    order_time = order['orderTime'] // 1000
    finish_time = order['finishTime'] // 1000
    order_id = order['orderId']
    for sku_order in order['skuList']:
        sku_id = sku_order['skuId']
        valid_code = sku_order['validCode']
        sub_id = sku_order['subUnionId']  # type: str
        if '-' in sub_id:
            user_id = sub_id[:sub_id.rindex("-")]
            deal_id = parse_int(sub_id[sub_id.rindex("-") + 1:])
        else:
            user_id = sub_id
            deal_id = 0
        unique_order_id = JDProvider.get_unique_order_id(order_id, sku_id)
        cps_instance = CPSOrder(unique_order_id=unique_order_id,
                                price=int(sku_order['price']),
                                sku_num=sku_order['skuNum'],
                                estimate_fee=get_fee(sku_order['estimateFee'], sku_num=sku_order['skuNum']),
                                status=CPSOrder.STATUS_PENDING,
                                user_id=user_id,
                                finish_order_time=finish_time,
                                created_order_time=order_time,
                                recharge_coin_time=0,
                                updated_time=int(time.time()),
                                deal_id=deal_id)
        with acquire_lock(redis_client, f'ORDER-{unique_order_id}', acquire_timeout=20, lock_timeout=30):
            cps_orders = mysql_client.retrieve_objects_by_conditions(CPSOrder,
                                                                     CPSOrder.unique_order_id == unique_order_id)
            cps_order = cps_orders[0] if len(cps_orders) > 0 else None
            if cps_order is not None and cps_order.status not in {CPSOrder.STATUS_PENDING, CPSOrder.STATUS_CREATED}:
                logger.info(
                    f"sku_order status {valid_code}, sku_order {sku_order}, order {order_id}, do not need to process")
            else:
                if valid_code == JDProvider.PAY_CODE:
                    if cps_order.estimate_fee > 0:
                        mysql_client.create_if_not_exists(CPSOrder, cps_instance,
                                                          unique_order_id=cps_instance.unique_order_id)
                elif valid_code == JDProvider.COMPLETED:
                    return_number = sku_order['skuReturnNum']
                    if return_number != 0 or cps_instance.estimate_fee <= 0:
                        if cps_order is not None:
                            mysql_client.update_object(CPSOrder, cps_order.id, status=CPSOrder.STATUS_FAILED,
                                                       contain_updated_time=False)
                            logger.info(
                                f"sku update to failed {valid_code}, "
                                f"sku_order {sku_order}, "
                                f"order {order_id}, "
                                f"return_number({return_number}) > 0 or estimate_fee({cps_instance.estimate_fee}) <= 0")
                    else:
                        cps_order = mysql_client.create_if_not_exists(CPSOrder, cps_instance,
                                                                      unique_order_id=cps_instance.unique_order_id)
                        # 更新finish_time, 准备打钱
                        mysql_client.update_object(CPSOrder, cps_order.id,
                                                   sku_num=sku_order['skuNum'],
                                                   estimate_fee=get_fee(sku_order['estimateFee'],
                                                                        sku_num=sku_order['skuNum']),
                                                   status=CPSOrder.STATUS_PREPARE_PAY_TO_USER,
                                                   user_id=user_id,
                                                   finish_order_time=finish_time,
                                                   created_order_time=order_time,
                                                   recharge_coin_time=0,
                                                   updated_time=int(time.time()),
                                                   contain_updated_time=False)
                else:
                    if valid_code != JDProvider.PENDING_PAYMENT \
                            and cps_order is not None:
                        mysql_client.update_object(CPSOrder, cps_order.id, status=CPSOrder.STATUS_FAILED,
                                                   contain_updated_time=False)
                        logger.info(f"sku update to failed {valid_code}, sku_order {sku_order}, order {order_id}")
                    logger.info(f"sku_order status {valid_code}, sku_order {sku_order}, order {order_id}")


def update_jd_orders(query_date: datetime):
    provider = JDProvider("https://open.jd.id/api", app_key='8065defc489914e16deb3109a1fc11db',
                          app_secret='4a4525b5323b001ebd3937eb01f1bf5c',
                          access_token='e5911a8392aa382a0401083f322ba8e1')
    orders = provider.get_orders(query_date)
    logger.info(f"get JD orders len({len(orders)}), first 10th {orders[:10]}, date {query_date}")
    for order in orders:
        try:
            process_jd_order(order)
        except:
            logger.exception(f"process order error, {order}")


def _get_user_headers(user_id):
    user: User = mysql_client.retrieve_object_by_unique_key(User, user_id=user_id)
    coin_user: CoinUser = mysql_client.retrieve_object_by_unique_key(CoinUser, user_id=user_id)
    headers = {
        'Content-Type': 'application/json',
        'X-User-Id': user.user_id,
        'X-Invite-Code': coin_user.invite_code,
        'X-App-Package-Id': user.package_id,
        'X-APP_VERSION': '3057',
        'X-User-Token': coin_user.facebook_token,
        'X-App-Secret': '784ebd80-4d78-4d42-9abb-7edc2c1a4466'
    }
    return headers


def _send_action(user_id: str, action_id: int, coin: int, timestamp: int, money: int):
    headers = _get_user_headers(user_id)
    time_str = TimeStr.from_timestamp(timestamp)
    resp = requests.post(
        MONEY_COIN_BASE_URL_FORMAT.format(action_id=action_id, coin=coin, time_str=time_str, money=money),
        headers=headers,
        timeout=10)
    logger.info(f'action_id {action_id}:'
                f'send request,'
                f'url <{resp.url}>, '
                f'headers <{headers}>')

    if resp.ok and resp.status_code == 200:
        return True
    else:
        return False


def get_unique_recharge_time(unique_order_id):
    current = int(time.time())
    for i in range(0, 60):
        try:
            rand_time = current - random.randint(0, 60 * 5)
            coin_unique_time = CoinUniqueTime(unique_order_id=unique_order_id,
                                              recharge_time_str=TimeStr.from_timestamp(rand_time))
            instance = mysql_client.create_if_not_exists(CoinUniqueTime, coin_unique_time,
                                                         unique_order_id=unique_order_id)  # type: CoinUniqueTime
            if instance is not None:
                return TimeStr.to_timestamp(instance.recharge_time_str)
        except:
            pass
    raise Exception(f'cannot get unique time for {unique_order_id}')


def pay_to_user(order: CPSOrder):
    current = int(time.time())
    # 金币服务要求时间唯一，通过数据库的唯一键保证下
    recharge_coin_time = get_unique_recharge_time(order.unique_order_id)
    with acquire_lock(redis_client, f'ORDER-{order.unique_order_id}', acquire_timeout=20, lock_timeout=30):
        # 获取锁之后，必须重新拿数据，因为只有获取锁的中间，数据可能会发生变化
        cps_order = mysql_client.retrieve_object_by_unique_key(CPSOrder, id=order.id)  # type: CPSOrder
        if cps_order.status == CPSOrder.STATUS_PREPARE_PAY_TO_USER \
                and cps_order.finish_order_time > 0 \
                and current - cps_order.finish_order_time > 86400 * 14:
            mysql_client.update_object(CPSOrder, cps_order.id,
                                       status=CPSOrder.STATUS_PAYING_TO_USER,
                                       recharge_coin_time=recharge_coin_time,
                                       updated_time=int(time.time()),
                                       contain_updated_time=False)
            cps_order = mysql_client.retrieve_object_by_unique_key(CPSOrder, id=order.id)  # type: CPSOrder
            logger.info(f"prepare to recharge to {cps_order.user_id}, money {cps_order.estimate_fee}")
            if cps_order.user_id.startswith("Facebook"):
                if _send_action(user_id=cps_order.user_id, action_id=PAY_DEAL_ACTION_ID, coin=0,
                                timestamp=cps_order.recharge_coin_time,
                                money=cps_order.estimate_fee):
                    logger.info(f"recharge to {cps_order.user_id}, money {cps_order.estimate_fee}, success")
                    mysql_client.update_object(CPSOrder, cps_order.id,
                                               status=CPSOrder.STATUS_SUCCESS_PAY_TO_USER,
                                               updated_time=int(time.time()),
                                               contain_updated_time=False)
                else:
                    logger.info(f"recharge to {cps_order.user_id}, money {cps_order.estimate_fee}, failed")
            else:
                mysql_client.update_object(CPSOrder, cps_order.id,
                                           status=CPSOrder.STATUS_SUCCESS_PAY_TO_USER,
                                           updated_time=int(time.time()),
                                           contain_updated_time=False)
                logger.info(f"do not send because {cps_order.user_id} not facebook user")


def payment_money_to_user():
    # 打钱给用户
    orders = mysql_client.retrieve_objects_by_conditions(CPSOrder,
                                                         CPSOrder.status == CPSOrder.STATUS_PREPARE_PAY_TO_USER,
                                                         CPSOrder.finish_order_time > 0)
    for order in orders:
        try:
            pay_to_user(order)
        except:
            logger.exception(f"pay money to user error, {order}")


def main():
    command = sys.argv[1]
    if command == 'payment_money_to_user':
        payment_money_to_user()
    elif command == 'update_jd_orders':
        query_date = datetime.now() - timedelta(hours=24)
        if len(sys.argv) > 2:
            query_date = datetime.strptime(sys.argv[2], '%Y%m%d')
        update_jd_orders(query_date)


if __name__ == '__main__':
    main()
