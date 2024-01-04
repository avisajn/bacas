from django.urls import path

from common.requestutils import catch_exception
from . import views

_urlpatterns = [
    ('promo/generate_promo_code', views.generate_promo_code),  # 给审核的
    ('sku/<str:sku_ids>/detail', views.get_sku_list_detail),  # 给审核的
    ('sku/feed', views.get_sku_list),
    ('sku/<str:sku_ids>', views.sku_handler),
    ('withdraw/list', views.get_withdraw_history),
]

urlpatterns = [path(where, catch_exception(func, __name__)) for where, func in _urlpatterns]
