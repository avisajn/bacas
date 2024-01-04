from django.db import models
from django.utils import timezone


class Ecommerces(models.Model):
    name = models.CharField(max_length=100, default="")
    logo = models.TextField(default="", max_length=1000)
    domain = models.CharField(max_length=300, default="")
    description = models.TextField(default="", blank=True)
    created_time = models.DateTimeField("created time", default=timezone.now)
    updated_time = models.DateTimeField("updated time", default=timezone.now)


class Categories(models.Model):
    id_name = models.CharField("分类名称(ID)", max_length=100, default="")
    en_name = models.CharField("分类名称(EN)", max_length=100, default="")
    parent_id = models.IntegerField("父分类id", default=0)
    level = models.IntegerField("级别", default=0)


class EcomCategoryMapper(models.Model):
    category_id = models.IntegerField("category_id", default=0)
    id_name = models.CharField("分类名称(ID)", max_length=100, default="")
    en_name = models.CharField("分类名称(EN)", max_length=100, default="")
    level = models.IntegerField("级别", default=0)
    parentid = models.IntegerField("父分类id", default=0)


class Channels(models.Model):
    title = models.CharField("频道标题", max_length=200)
    image_logo = models.CharField("第一张图片地址", max_length=2000)
    image_one = models.CharField("第一张图片地址", max_length=2000)
    image_two = models.CharField("第二张图片地址", max_length=2000)
    status = models.IntegerField(default=1)
    createdtime = models.DateTimeField("created time", default=timezone.now)
