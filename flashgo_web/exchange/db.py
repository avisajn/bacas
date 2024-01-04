import datetime

from common import loggers
from common.mysqlclient import BaseDbClient, mysql_client
from exchange.models import CouponSku, CouponSkuHistory, Coupon

logger = loggers.get_logger(__name__)


class ExchangeDbClient(object):
    def __init__(self, db_client: BaseDbClient):
        self.db_client = db_client

    def add_coupon_and_add_sales(self, coupon: Coupon, sku_id, sales, stock, history_sale, max_size):
        if sales >= stock or history_sale >= max_size:
            return False
        else:
            try:
                with self.db_client.get_session() as session:
                    sku = session.query(CouponSku).filter(CouponSku.id == sku_id,
                                                          CouponSku.sales == sales,
                                                          CouponSku.stock == stock) \
                        .with_for_update() \
                        .one_or_none()
                    history = session.query(CouponSkuHistory).filter(CouponSkuHistory.user_id == coupon.user_id,
                                                                     CouponSkuHistory.sku_id == coupon.sku_id,
                                                                     CouponSkuHistory.sales == history_sale) \
                        .with_for_update() \
                        .one_or_none()
                    if sku is not None and history is not None:
                        session.query(CouponSku).filter(CouponSku.id == sku_id,
                                                        CouponSku.sales == sales,
                                                        CouponSku.stock == stock) \
                            .with_for_update() \
                            .update({'sales': sales + 1})
                        session.query(CouponSkuHistory).filter(CouponSkuHistory.user_id == coupon.user_id,
                                                               CouponSkuHistory.sku_id == coupon.sku_id,
                                                               CouponSkuHistory.sales == history_sale) \
                            .with_for_update() \
                            .update({'sales': history_sale + 1})
                        session.add(coupon)
                        session.commit()
                    else:
                        return False
                return True
            except:
                logger.exception(f"generate promo code for {sku_id} error")
            return False


exchange_db_client = ExchangeDbClient(mysql_client)
