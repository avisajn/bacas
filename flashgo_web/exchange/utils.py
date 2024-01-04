import datetime
import random
import string
import time
from typing import List, Optional

import requests
from sqlalchemy import desc, asc

from common import utils, loggers
from common.constants import RedisKeyPrefix
from common.mysqlclient import mysql_client
from common.redisclient import cache
from deals.utils import get_deal_detail_by_deal_id, filter_deals_negative
from exchange.db import exchange_db_client
from exchange.models import CouponSku, CouponDeal, Coupon, CouponType, BacaWithdrawStatus, WithdrawRecord, \
    BacaWithdrawRecord, WithdrawStatus, CouponStore, CouponSkuHistory

logger = loggers.get_logger(__name__)


def get_sku_detail_by_deal_id(deal_id, store_id=''):
    detail = get_deal_detail_by_deal_id(deal_id)
    details = filter_deals_negative([detail])
    if len(details) == 0:
        return None
    else:
        images = [image_detail.get('image', None) for image_detail in detail.get('dealarticleimages', [])]
        return {
            'deal_id': deal_id,
            'price': int(detail['deal']['current_price']),
            'title': detail['deal']['title'],
            'thumb_url': detail['dealarticleimage_thumb']['image'],
            'left_stock': detail['deal']['stock'],
            'jump_url': detail['deal']['weblink'],
            'jump_type': 2,
            'store_id': store_id,
            'deal_valid': detail['deal']['valid'],
            'images': [url for url in images if not utils.is_empty(url)],
        }


@cache(key="stores", prefix=RedisKeyPrefix.COUPON, ex=2 * 60, cache_on_memory=10)
def get_stores():
    coupon_stores = mysql_client.retrieve_all_objects(CouponStore)  # type: List[CouponStore]
    return {str(store.id): store.store_name for store in coupon_stores}


def format_sku(sku: dict, jump_type=1):
    sku = {k: v for k, v in sku.items()}
    store_id = sku.get('store_id', 0)
    if store_id is not None and int(store_id) > 0:
        sku['store_name'] = get_stores().get(str(store_id), '')
    if 'id' in sku:
        sku['sku_id'] = sku['id']
    if jump_type == 1:
        sku['jump_type'] = 1
        sku['jump_url'] = sku['description_url']
    else:
        sku['jump_type'] = 2
    return {k: v for k, v in sku.items() if
            k not in {'stock', 'description_url', 'status', 'validity_duration_seconds', 'sales', 'store_id',
                      'priority'}}


@cache(key=lambda sku_id: 'sku_detail_%s' % sku_id, prefix=RedisKeyPrefix.COUPON)
def get_sku_detail_by_sku_id(sku_id):
    detail = mysql_client.retrieve_object_by_unique_key(CouponSku, id=sku_id)
    if detail is not None:
        return detail.to_json()
    else:
        return detail


def _get_sku_list_detail(sku_ids):
    ids = parse_ids(sku_ids)
    sku_list = []
    for sku_id in ids:
        detail = get_sku_detail_by_sku_id(sku_id)
        if detail is not None:
            sku_list.append(detail)
    if len(ids) == 1:
        if len(sku_list) <= 0:
            return None, False
        else:
            return sku_list, False
    else:
        return sku_list, True


def parse_ids(ids: str):
    return [int(id_) for id_ in str(ids).strip().split(',') if not utils.is_empty(id)]


@cache(key='coupon_sku_ids_v3', prefix=RedisKeyPrefix.COUPON, ex=2 * 60)
def get_valid_coupon_sku_ids():
    sku_list = mysql_client.retrieve_sortable_objects_by_conditions(CouponSku,
                                                                    CouponSku.status == CouponSku.STATUS_VALID,
                                                                    order_conditions=asc(CouponSku.priority))
    return [sku.id for sku in sku_list if sku.sales < sku.stock]


@cache(key=lambda user_id: 'user_coupon_sku_%s' % user_id, prefix=RedisKeyPrefix.COUPON, ex=2 * 60)
def get_user_coupon_sku(user_id):
    sku_list = mysql_client.retrieve_objects_by_conditions(CouponSkuHistory,
                                                           CouponSkuHistory.user_id == user_id)
    return {str(sku.sku_id): sku.sales for sku in sku_list}


@cache(key='coupon_deals', prefix=RedisKeyPrefix.COUPON, ex=2 * 60)
def get_valid_store_deals():
    deals = mysql_client.retrieve_objects_by_conditions(CouponDeal,
                                                        CouponDeal.status == CouponDeal.STATUS_VALID)  # type: List[CouponDeal]
    return [deal.to_dict() for deal in deals]


CODE_LENGTH = 10


def generate_code():
    alphabet = string.ascii_uppercase
    alphabet_digits = alphabet + string.digits
    codes = []
    sum_ = 0
    for i in range(CODE_LENGTH - 1):
        if i == 0:
            ch = random.choice(alphabet)
        else:
            ch = random.choice(alphabet_digits)
        sum_ += ord(ch)
        codes.append(ch)
    codes.append(alphabet_digits[sum_ % len(alphabet_digits)])
    return ''.join(codes)


def get_max_size(sku: CouponSku):
    if isinstance(sku, CouponSku):
        sku_type = sku.sku_type
    elif isinstance(sku, dict):
        sku_type = sku['sku_type']
    else:
        raise ValueError('do not supported type')
    if sku_type in {CouponType.AUTO_DEAL, CouponType.DEAL}:
        return 1
    else:
        return 20000


def add_coupon_and_add_sales(coupon: Coupon, sku: CouponSku):
    sku_id = sku.id
    max_size = get_max_size(sku)
    history = CouponSkuHistory(user_id=coupon.user_id, sku_id=coupon.sku_id, sales=0)
    history = mysql_client.create_if_not_exists(CouponSkuHistory, history, user_id=coupon.user_id, sku_id=coupon.sku_id)
    for i in range(0, 5):
        try:
            if exchange_db_client.add_coupon_and_add_sales(coupon, sku_id, sku.sales, sku.stock, history.sales,
                                                           max_size):
                logger.info(f"{sku_id} generate code {coupon}")
                return True
            else:
                new_coupon = mysql_client.retrieve_object_by_unique_key(Coupon, unique_id=coupon.unique_id)
                history = mysql_client.retrieve_objects_by_conditions(CouponSkuHistory,
                                                                      CouponSkuHistory.user_id == coupon.user_id,
                                                                      CouponSkuHistory.sku_id == coupon.sku_id)[0]
                if new_coupon is not None:
                    return new_coupon.status == Coupon.STATUS_ONLINE
                else:
                    sku = mysql_client.retrieve_object_by_unique_key(CouponSku, id=sku_id)
                    if sku.sales >= sku.stock or sku.status != CouponSku.STATUS_VALID or history.sales == max_size:
                        if history.sales == max_size:
                            reason = f'sku exceed max_size:{max_size}'
                        elif sku.status != CouponSku.STATUS_VALID:
                            reason = 'sku is invalid'
                        else:
                            reason = 'sku stock not enough'
                        coupon = Coupon.parse(dict(
                            sku_id=coupon.sku_id, user_id=coupon.user_id, unique_id=coupon.unique_id,
                            status=Coupon.STATUS_FAILED, failed_reason=reason,
                            created_time=datetime.datetime.now(), updated_time=datetime.datetime.now()))
                        mysql_client.create_if_not_exists(Coupon, coupon, unique_id=coupon.unique_id)
                        logger.info(f'not enough for {coupon} and {sku_id}')
                        return False
        except:
            logger.exception("add_coupon error")
    return False


withdraw_list_url = 'https://flashgo.baca.co.id/api/v1/action/withdraw/list'


def _get_withdraw_history(headers) -> Optional[List[BacaWithdrawRecord]]:
    res = requests.get(withdraw_list_url, headers=headers)
    if res.ok:
        withdraw_list = []
        for data in res.json():
            withdraw_list.append({
                'user_id': data['UserId'],
                'date': data['Date'],
                'status': data['Status'],
                'sku_type': data['SkuType'],
                'sku_id': data['SkuId'],
                'value': data['Value'],
                'money_modified': data['MoneyModified'],
                'phone': data['Phone'],
                'updated_time': data['UpdateTime'],
            })
        return [BacaWithdrawRecord.parse(record) for record in withdraw_list]
    else:
        return None


@cache(key=lambda unique_code: 'promo_code_%s' % unique_code, ex=2 * 60, prefix=RedisKeyPrefix.COUPON)
def get_promo_code_by_unique_code(unique_code):
    coupon = mysql_client.retrieve_object_by_unique_key(Coupon, unique_id=unique_code)  # type: Coupon
    if coupon is None:
        return None
    else:
        return coupon.to_dict()


def _get_withdraw_record(withdraw_history: BacaWithdrawRecord) -> Optional[WithdrawRecord]:
    coupon_sku = get_sku_detail_by_sku_id(withdraw_history.sku_id)
    money = coupon_sku['price']
    if withdraw_history.money_modified != 0:
        money = withdraw_history.money_modified

    no_jump_types = {CouponType.TELEPHONE_RECHARGE} | CouponType.get_games_types()
    if withdraw_history.sku_type in no_jump_types:
        status_mappings = {
            BacaWithdrawStatus.APPLY: WithdrawStatus.PROCESSING,
            BacaWithdrawStatus.SUCCESS: WithdrawStatus.RECHARGE_SUCCESS,
            BacaWithdrawStatus.FAILED: WithdrawStatus.FAILED,
            BacaWithdrawStatus.PROCESSING: WithdrawStatus.PROCESSING,
            BacaWithdrawStatus.FRAUD: WithdrawStatus.FRAUD,
        }
        return WithdrawRecord(title=coupon_sku['title'], price=money, description=None,
                              code=None, validity_timestamp=None, exchange_date=withdraw_history.get_exchange_date(),
                              jump_url=None, status=status_mappings[withdraw_history.status],
                              sku_id=withdraw_history.sku_id, sku_type=withdraw_history.sku_type)
    else:
        status_mappings = {
            BacaWithdrawStatus.APPLY: WithdrawStatus.PROCESSING,
            BacaWithdrawStatus.FAILED: WithdrawStatus.FAILED,
            BacaWithdrawStatus.PROCESSING: WithdrawStatus.PROCESSING,
            BacaWithdrawStatus.FRAUD: WithdrawStatus.FRAUD,
            BacaWithdrawStatus.SUCCESS: WithdrawStatus.RECHARGE_SUCCESS,
        }
        status = status_mappings[withdraw_history.status]
        if status == WithdrawStatus.RECHARGE_SUCCESS:
            promo_code = get_promo_code_by_unique_code(withdraw_history.get_unique_code())
            if promo_code is not None:
                coupon = Coupon.parse(promo_code)  # type: Coupon
                # 多给10分钟的过期
                if coupon.status == Coupon.STATUS_OFFLINE or coupon.status == Coupon.STATUS_ONLINE and int(
                        time.time()) > coupon.expiry_timestamp + 10 * 60:
                    status = WithdrawStatus.EXPIRED
                    code = coupon.code
                    expiry_timestamp = coupon.expiry_timestamp
                elif coupon.status == Coupon.STATUS_FAILED:
                    status = WithdrawStatus.FAILED
                    code = None
                    expiry_timestamp = None
                elif coupon.status == Coupon.STATUS_USED:
                    status = WithdrawStatus.USED
                    code = coupon.code
                    expiry_timestamp = coupon.expiry_timestamp
                else:
                    status = WithdrawStatus.AVAILABLE
                    code = coupon.code
                    expiry_timestamp = coupon.expiry_timestamp
            else:
                status = WithdrawStatus.PROCESSING
                code = None
                expiry_timestamp = None
        else:
            code = None
            expiry_timestamp = None
        if status == WithdrawStatus.PROCESSING:
            code = "Tampilkan setelah diperiksa"
            expiry_timestamp = None
        return WithdrawRecord(title=coupon_sku['title'], price=money,
                              description=coupon_sku['description'], code=code, validity_timestamp=expiry_timestamp,
                              exchange_date=withdraw_history.get_exchange_date(), jump_url=coupon_sku['jump_url'],
                              status=status, sku_id=withdraw_history.sku_id, sku_type=withdraw_history.sku_type)


def _test():
    headers = {
        "X-User-Id": 'Facebook_533242040476625',
        "X-User-Token": 'AbxCzyxmVuxDx1Fk',
        "X-Invite-Code": 'F2RQ1Yh9nd',
        "X-App-Package-Id": "com.cari.promo.diskon",
        "X-APP-VERSION": str(3080),
    }
    records = _get_withdraw_history(headers)
    for record in records:
        print(record)
        print(_get_withdraw_record(record))


if __name__ == '__main__':
    # _test()
    pass
