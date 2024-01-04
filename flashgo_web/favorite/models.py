from django.db import models
from django.utils import timezone
import datetime

from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base


class UserFavorite(models.Model):
    user_id = models.CharField("user_id", max_length=32)
    deal_id = models.IntegerField("deal_id")
    created_time = models.DateTimeField("created time", default=timezone.now)
    # class Meta:
    #     unique_together = ('user_id', 'deal_id',)


class Interests(models.Model):
    id_name = models.CharField("兴趣名称", max_length=200, blank=False)
    en_name = models.CharField("兴趣名称", max_length=200, blank=False)
    category_id = models.IntegerField("category id")
    createdtime = models.DateTimeField("created time", default=timezone.now)


class UserInterests(models.Model):
    user_id = models.CharField("user_id", max_length=32)
    interest_id = models.IntegerField("interest id")
    createdtime = models.DateTimeField("created time", default=timezone.now)


class UserReportDealErrors(models.Model):
    user_id = models.CharField("user_id", max_length=32)
    deal_id = models.IntegerField("deal id")
    error = models.CharField("error", max_length=200)
    createdtime = models.DateTimeField("created time", default=timezone.now)


class UserFlashRemind(models.Model):
    user_id = models.CharField("user_id", max_length=32)
    deal_id = models.IntegerField("deal_id")
    createdtime = models.DateTimeField("created time", default=timezone.now)

    class Meta:
        unique_together = ('user_id', 'deal_id',)
