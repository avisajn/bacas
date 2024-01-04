# -*- coding: utf-8 -*-
from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'invite/(?P<invite_code>.+)/', views.invite),
    url(r'sha/(?P<timestamp>.+)/(?P<invite_code>.+)', views.share_app),
    url(r'share_app/(?P<timestamp>.+)/(?P<invite_code>.+)', views.share_app),
    url(r'news-awards', views.get_news_awards_history),
    url(r'', views.bonuses_resource)
]
