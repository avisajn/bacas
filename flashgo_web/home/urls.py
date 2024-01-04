from django.urls import path

from . import views


urlpatterns = [
    path('get_online_banners/', views.get_online_banners, name='get_online_banners'),
    path('get_top_channels/', views.get_online_top_channels, name='get_top_channels'),
    path('get_hottest_categories/', views.get_hottest_categories, name='get_hottest_categories'),
    path('get_hottest_categories', views.get_hottest_categories, name='get_hottest_categories_'),
    path('get_bottom_notification/', views.get_bottom_notification, name='get_bottom_notificationoy'),
    path('get_webapp_banners/', views.get_webapp_banners, name='get_webapp_banners'),
    path('get_webapp_top_channels/', views.get_webapp_top_channels, name='get_webapp_top_channels'),
    path('get_webapp_trending_channels/', views.get_webapp_trending_channels, name='get_webapp_trending_channels'),
    path('news_homepage', views.get_news_homepage, name='get_news_homepage'),
    path('jump/<str:target>', views.get_update_page, name='get_update_page'),
    path('mall_homepage', views.get_mall_homepage, name='get_mall_homepage'),
]
