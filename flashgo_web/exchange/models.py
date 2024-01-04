import datetime
import json
import time

import pytz
from django.db import models

# Create your models here.
from sqlalchemy import Column, String, Integer, TIMESTAMP

from common import utils
from common.pojoutils import Bean, DBBean
from common.sql_models import Base


class CouponType(object):
    # 3, 4, 5 -> 审核
    # 6, 7, 8 -> 不用审核
    # 3是商品，4是满减，5是运费
    # 6是商品，7是满减，8是运费
    TELEPHONE_RECHARGE = 1
    DEAL = 3
    REDUCTION = 4
    FREE_SHIP = 5
    MOBILE_LEGENDS = 11
    MOBILE_PUBG = 12
    MOBILE_FREEFIRE = 13

    AUTO_DEAL = 6
    AUTO_REDUCTION = 7
    AUTO_FREE_SHIP = 8

    @classmethod
    def get_auto_approval_types(cls):
        return {cls.AUTO_DEAL, cls.AUTO_REDUCTION, cls.AUTO_FREE_SHIP}

    @classmethod
    def get_games_types(cls):
        return {cls.MOBILE_PUBG, cls.MOBILE_LEGENDS, cls.MOBILE_FREEFIRE}


class CouponSku(Base, DBBean):
    __tablename__ = 'coupon_sku'

    id = Column(Integer, primary_key=True)
    sku_type = Column(Integer)
    deal_id = Column(Integer)
    # 要扣用户多少钱
    price = Column(Integer)
    title = Column(String)
    description = Column(String)
    rule = Column(String)
    deal_description = Column(String)
    # 拥有的量
    stock = Column(Integer)
    # 兑换的量
    sales = Column(Integer)
    status = Column(Integer)
    # 持续时间
    validity_duration_seconds = Column(Integer)
    # 跳转链接
    jump_url = Column(String)
    store_id = Column(Integer)
    audit_days = Column(Integer)
    value = Column(Integer)
    priority = Column(Integer)

    created_time = Column(TIMESTAMP)
    updated_time = Column(TIMESTAMP)

    STATUS_VALID = 1
    STATUS_INVALID = 2

    @property
    def auto_approval(self):
        return self.sku_type in CouponType.get_auto_approval_types()

    @property
    def description_url(self):
        return f'http://flashgo.online/webapp/coupon/{self.id}'

    def to_json(self, upper_case=False, store_names=None):
        if upper_case:
            store_name = store_names.get(str(self.store_id), '') if store_names is not None else ''
            if not utils.is_empty(store_name):
                store_name = f"[{store_name}]"
            return {
                'SkuId': self.id,
                'SkuType': self.sku_type,
                'Price': self.price,
                'Value': self.price,
                'Title': f"{store_name}{self.title}",
                'SubTitle': self.description,
                'ImageUrl': '',
                'Online': self.status == self.STATUS_VALID,
                'AutoApproval': self.auto_approval,
                'DescriptionUrl': self.description_url,
            }
        else:
            data = super().to_dict()
            for name in ['updated_time', 'created_time']:
                if name in data:
                    del data[name]
            data['left_stock'] = self.stock - self.sales
            data['auto_approval'] = self.auto_approval
            data['description_url'] = self.description_url
            data['audit_type'] = 2 if self.auto_approval and self.sku_type in {CouponType.AUTO_FREE_SHIP,
                                                                               CouponType.AUTO_REDUCTION} else 1
            return data

    @classmethod
    def from_json(cls, json_data):
        json_data = {k: v for k, v in json_data.items()}
        if 'sku_id' in json_data:
            sku_id = json_data['sku_id']
            del json_data['sku_id']
            json_data['id'] = sku_id
        return cls.parse(json_data)


class Coupon(Base, DBBean):
    __tablename__ = 'coupons'

    id = Column(Integer, primary_key=True)
    sku_id = Column(Integer)
    user_id = Column(String)
    # 用于和兑换记录进行关联
    unique_id = Column(String)
    code = Column(String)

    expiry_timestamp = Column(Integer)
    exchange_timestamp = Column(Integer)

    created_time = Column(TIMESTAMP)
    updated_time = Column(TIMESTAMP)

    status = Column(Integer)
    # 失败的原因
    failed_reason = Column(String)

    # 在线，可以使用
    STATUS_ONLINE = 1
    # 过了有效期，下线了
    STATUS_OFFLINE = 2
    # 兑换失败
    STATUS_FAILED = 3
    # 已经使用了
    STATUS_USED = 4

    def valid(self):
        # 是否可以使用
        return self.status == Coupon.STATUS_ONLINE and time.time() < self.exchange_timestamp

    def has_code(self):
        return self.status != Coupon.STATUS_FAILED and self.code is not None and len(self.code) > 0

    def to_dict(self):
        data = super().to_dict()
        return {k: v for k, v in data.items() if k not in {"created_time", "updated_time"}}


class CouponDeal(Base, DBBean):
    __tablename__ = 'coupon_deals'

    id = Column(Integer, primary_key=True)
    deal_id = Column(Integer)
    store_name = Column(String)
    store_id = Column(Integer)
    status = Column(Integer)

    STATUS_VALID = 1


class CouponStore(Base, DBBean):
    __tablename__ = 'coupon_stores'

    id = Column(Integer, primary_key=True)
    store_name = Column(String)


class WithdrawStatus(object):
    PROCESSING = 1
    FRAUD = 2
    FAILED = 3
    RECHARGE_SUCCESS = 4
    AVAILABLE = 5
    EXPIRED = 6
    USED = 7


class BacaWithdrawStatus(object):
    APPLY = 1
    SUCCESS = 2
    FAILED = 3
    PROCESSING = 4
    FRAUD = 5


AUDIT_MESSAGE = {
    'en': {
        WithdrawStatus.PROCESSING: 'Processing',
        WithdrawStatus.FRAUD: 'Fraud',
        WithdrawStatus.FAILED: 'Failed',
        WithdrawStatus.RECHARGE_SUCCESS: 'Success',
        WithdrawStatus.AVAILABLE: 'Available',
        WithdrawStatus.EXPIRED: 'Expired',
        WithdrawStatus.USED: 'Used',
    },
    'id': {
        WithdrawStatus.PROCESSING: 'Sedang diproses',
        WithdrawStatus.FRAUD: 'Ditemukan kecurangan',
        WithdrawStatus.FAILED: 'Gagal',
        WithdrawStatus.RECHARGE_SUCCESS: 'Isi ulang berhasil',
        WithdrawStatus.AVAILABLE: 'Tersedia',
        WithdrawStatus.EXPIRED: 'Sudah kedaluwarsa',
        WithdrawStatus.USED: 'Sudah digunakan',
    },
    'zh': {
        WithdrawStatus.PROCESSING: '审核中',
        WithdrawStatus.FRAUD: '审核不通过',
        WithdrawStatus.FAILED: '失败',
        WithdrawStatus.RECHARGE_SUCCESS: '充值成功',
        WithdrawStatus.AVAILABLE: '可使用',
        WithdrawStatus.EXPIRED: '已过期',
        WithdrawStatus.USED: '已使用',
    }
}


class WithdrawRecord(Bean):
    def __init__(self, title, price, description, code, validity_timestamp, exchange_date, jump_url, status, sku_type,
                 sku_id):
        self.title = title
        self.price = price
        self.description = description
        self.code = code
        self.validity_timestamp = validity_timestamp
        self.exchange_date = exchange_date
        self.jump_url = jump_url
        self.status = status
        self.sku_type = sku_type
        self.sku_id = sku_id

    def to_dict(self, language='id'):
        data = super().to_dict()
        if self.validity_timestamp is not None:
            data['validity_date'] = datetime.datetime \
                .fromtimestamp(self.validity_timestamp, tz=pytz.timezone("Asia/Jakarta")).strftime("%Y-%m-%d")
        else:
            data['validity_date'] = None
        data['status_message'] = AUDIT_MESSAGE[language][self.status]
        data['jump_type'] = 2
        return data


class BacaWithdrawRecord(Bean):
    def __init__(self, user_id, date, status, sku_type, sku_id, value, money_modified, phone, updated_time):
        self.user_id = user_id
        self.date = date
        self.sku_type = sku_type
        self.sku_id = sku_id
        self.value = value
        self.money_modified = money_modified
        self.status = status
        self.phone = phone
        self.updated_time = updated_time

    def get_exchange_date(self):
        year = self.date[:4]
        month = self.date[len(year):len(year) + 2]
        day = self.date[len(year + month):len(year + month) + 2]
        return f"{year}-{month}-{day}"

    def get_unique_code(self):
        return f"{self.user_id}-{self.date}"


class CouponSkuHistory(Base):
    __tablename__ = 'coupon_sku_histories'

    id = Column(Integer, primary_key=True)
    user_id = Column(String)
    sku_id = Column(Integer)
    sales = Column(Integer)
