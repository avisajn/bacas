import datetime
import time

# Create your views here.
from django.views.decorators.gzip import gzip_page
from django.views.decorators.http import require_GET

from common import utils as common_utils, requestutils, loggers
from common.mysqlclient import mysql_client
from common.requestutils import Resource, unpack, get_ip, ERROR_NO_BUSINESS, parse_headers
from exchange.forms import generate_promo_code_schema, get_sku_list_schema
from exchange.models import CouponSku, Coupon, CouponType
from exchange.utils import get_sku_detail_by_deal_id, format_sku, get_sku_detail_by_sku_id, _get_sku_list_detail, \
    get_valid_coupon_sku_ids, get_valid_store_deals, generate_code, add_coupon_and_add_sales, _get_withdraw_record, \
    _get_withdraw_history, get_stores, get_user_coupon_sku, get_max_size

logger = loggers.get_logger(__name__)


class SkuHandler(Resource):
    # noinspection PyMethodOverriding
    def get(self, request, sku_ids, format_=False):
        sku_list = None
        _sku_list, need_list = _get_sku_list_detail(sku_ids)
        if _sku_list is not None:
            sku_list = []
            for coupon_sku in _sku_list:
                detail = get_sku_detail_by_deal_id(coupon_sku['deal_id'], None) \
                    if coupon_sku is not None and coupon_sku['deal_id'] != 0 else None
                if detail is None:
                    detail = {}
                    if coupon_sku['sku_type'] in {CouponType.DEAL, CouponType.AUTO_DEAL}:
                        raise Exception('cannot load deal detail')
                if format_:
                    sku_list.append(format_sku({**detail, **coupon_sku}, jump_type=2))
                else:
                    sku_list.append({**detail, **coupon_sku})
        if sku_list is None:
            return None
        elif need_list:
            return sku_list
        else:
            return sku_list[0]


@require_GET
def get_sku_list_detail(request, sku_ids):
    sku_list = sku_handler.get(request, sku_ids)
    if sku_list is None:
        return sku_handler.resource_not_found
    elif isinstance(sku_list, list):
        return requestutils.get_success_response(
            [CouponSku.from_json(item).to_json(upper_case=True, store_names=get_stores()) for item in sku_list])
    else:
        return requestutils.get_success_response(
            CouponSku.from_json(sku_list).to_json(upper_case=True, store_names=get_stores()))


@gzip_page
def get_withdraw_history(request):
    header_data = parse_headers(request)
    header_names = ["X-User-Id", "X-User-Token", "X-App-Package-Id", "X-APP-VERSION", "X-Invite-Code"]
    headers = {}
    for name in header_names:
        value = request.META.get('HTTP_%s' % name.upper().replace('-', '_'), '')
        if not common_utils.is_empty(value):
            headers[name] = value
    if len(headers) < len(header_names):
        return requestutils.get_error_response(ERROR_NO_BUSINESS, "Please carry with all headers")
    headers['X-FlashGo-Ip'] = get_ip(request)
    result = []

    app_version = header_data.get_app_version()
    # 因默认UI兼容问题, version < 3057的请求, 不返回游戏类型的兑换记录
    if app_version < 3057:
        games_types = CouponType.get_games_types()
        record_list = [record for record in _get_withdraw_history(headers) if
                       record.sku_type not in games_types]
    else:
        record_list = _get_withdraw_history(headers)

    for record in record_list:
        try:
            result.append(_get_withdraw_record(record).to_dict())
        except:
            logger.exception("get withdraw history error")
    return requestutils.get_success_response(result)


@unpack(form=get_sku_list_schema)
def get_sku_list(request, exchange_type, user_id=None):
    headers = requestutils.parse_headers(request)
    if user_id is None or len(user_id) <= 0:
        user_id = headers.get_user_id()
    if user_id is not None and len(user_id) > 0:
        sku_sale_mappers = get_user_coupon_sku(user_id)
    else:
        sku_sale_mappers = {}
    if exchange_type == 1:
        deal_list = []
        for sku_id in get_valid_coupon_sku_ids():
            try:
                coupon_sku = get_sku_detail_by_sku_id(sku_id)
                detail = get_sku_detail_by_deal_id(coupon_sku['deal_id'], None) \
                    if coupon_sku is not None and coupon_sku['deal_id'] != 0 else None
                if detail is not None and coupon_sku is not None \
                        and coupon_sku['sku_type'] in {CouponType.DEAL, CouponType.AUTO_DEAL} \
                        and coupon_sku['left_stock'] > 0 \
                        and sku_sale_mappers.get(str(sku_id), 0) < get_max_size(coupon_sku):
                    if detail['deal_valid'] == 1:
                        deal_list.append(format_sku({**detail, **coupon_sku}, jump_type=1))
            except:
                pass
        return requestutils.get_success_response(deal_list)
    elif exchange_type == 2:
        sku_list = []
        for sku_id in get_valid_coupon_sku_ids():
            try:
                coupon_sku = get_sku_detail_by_sku_id(sku_id)
                if coupon_sku is not None \
                        and coupon_sku['sku_type'] in {CouponType.FREE_SHIP, CouponType.AUTO_FREE_SHIP,
                                                       CouponType.REDUCTION, CouponType.AUTO_REDUCTION} \
                        and coupon_sku['left_stock'] > 0 \
                        and sku_sale_mappers.get(str(sku_id), 0) < get_max_size(coupon_sku):
                    sku_list.append(format_sku(coupon_sku, jump_type=1))
            except:
                pass
        deal_list = []
        if len(sku_list) > 0:
            for store_deal in get_valid_store_deals():
                try:
                    deal_detail = get_sku_detail_by_deal_id(store_deal['deal_id'], store_deal['store_id'])
                    if deal_detail['deal_valid'] == 1:
                        deal_list.append(format_sku(deal_detail, jump_type=2))
                except:
                    pass
        return requestutils.get_success_response({
            'coupon_sku_list': sku_list,
            'deal_list': deal_list,
        })


promo_logger = loggers.get_logger(__name__ + 'promo', "promo_code.log")

allow_remote_ips = {'106.37.218.58', '20.188.98.74', '20.188.101.35', '20.188.102.180', '20.188.102.74',
                    '20.188.103.151', '20.188.96.183', '20.188.97.142', '52.148.93.101',
                    '52.187.1.9', '52.187.0.160', '52.187.17.126', '52.187.2.194', '52.187.1.23', '52.187.1.87',
                    '52.187.4.20', '52.187.1.9', '52.187.0.160'}


# 给审核的接口，需要符合他们的要求
# noinspection PyPep8Naming
@unpack(form=generate_promo_code_schema)
def generate_promo_code(request, SkuId, UserId, Date):
    ip = get_ip(request)
    if ip not in allow_remote_ips:
        promo_logger.info(f"banned request for {SkuId}-{UserId}-{Date} from ip {ip}")
        return requestutils.get_internal_error_response("ip not allow")
    else:
        promo_logger.info(f"receive request for {SkuId}-{UserId}-{Date} from ip {ip}")
    unique_id = f"{UserId}-{Date}"
    coupon = mysql_client.retrieve_object_by_unique_key(Coupon, unique_id=unique_id)
    if coupon is None:
        sku = mysql_client.retrieve_object_by_unique_key(CouponSku, id=SkuId)  # type: CouponSku
        if sku is None or sku.status != CouponSku.STATUS_VALID or sku.sales >= sku.stock:
            coupon = Coupon.parse(dict(sku_id=SkuId, user_id=UserId, unique_id=unique_id,
                                       status=Coupon.STATUS_FAILED, failed_reason="sku not found or not enough stock",
                                       created_time=datetime.datetime.now(), updated_time=datetime.datetime.now()))
            mysql_client.create_if_not_exists(Coupon, coupon, unique_id=unique_id)
        else:
            code = generate_code()
            now_timestamp = int(time.time())
            coupon = Coupon.parse(dict(sku_id=SkuId, user_id=UserId, unique_id=unique_id,
                                       status=Coupon.STATUS_ONLINE, code=code, exchange_timestamp=now_timestamp,
                                       expiry_timestamp=now_timestamp + sku.validity_duration_seconds,
                                       created_time=datetime.datetime.now(), updated_time=datetime.datetime.now()))
            add_coupon_and_add_sales(coupon, sku)
        coupon = mysql_client.retrieve_object_by_unique_key(Coupon, unique_id=unique_id)
    get_sku_detail_by_sku_id.clear(SkuId)
    get_user_coupon_sku.clear(UserId)
    if coupon is None:
        return requestutils.get_internal_error_response()
    elif coupon.has_code():
        promo_logger.info(f"receive request for {SkuId}-{UserId}-{Date} from ip {ip} , code={coupon.code}")
        return requestutils.get_success_response_without_wrapper({'errno': 0, 'errmsg': ''})
    elif coupon.status == Coupon.STATUS_FAILED:
        promo_logger.info(f"receive request for {SkuId}-{UserId}-{Date} from ip {ip} , failed")
        return requestutils.get_success_response_without_wrapper({'errno': 1, 'errmsg': coupon.failed_reason})
    else:
        return requestutils.get_internal_error_response()


sku_handler = SkuHandler()
