from django.db import models
from django.utils import timezone


class FlashDeals(models.Model):
    deal_id = models.IntegerField("deal_id")
    starttime = models.DateTimeField("created time", default=timezone.now)
    endtime = models.DateTimeField("updated time", default=timezone.now)
    off = models.FloatField(default=0)
    original_price = models.FloatField(default=0)
    current_price = models.CharField("当前价格", max_length=1000)
    sales = models.IntegerField("销售额", default=0)
    stock = models.IntegerField("存货量", default=0)
    createdtime = models.DateTimeField("created time", default=timezone.now)
    updatedtime = models.DateTimeField("created time", default=timezone.now)


class AdDeal(object):
    def __init__(self, image_url, trackinglink, title, price_title):
        self.image_url = image_url
        self.trackinglink = trackinglink
        self.title = title
        self.price_title = price_title

    def to_dict(self):
        return self.__dict__
