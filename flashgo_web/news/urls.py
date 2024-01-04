from django.urls import path

from . import views, admin_views

service_urlpatterns = [
    path('get_news_detail/', views.get_news_detail, name='get_news_detail'),
    path('get_relative_deals/', views.get_relative_deals, name='get_relative_deals'),
    path('get_relative_deals', views.get_relative_deals, name='get_relative_deals_'),  # to deal with 3XX
    path('get_relative_news/', views.get_news_relative_news, name='get_relative_news'),
    path('get_relative_news', views.get_news_relative_news, name='get_relative_news_'),  # to deal with 3XX
    path('get_news_recommend_feeds/', views.get_news_recommend_feeds, name='get_news_recommend_feeds'),
    path('detail', views.news_detail, name='news_detail'),
    path('relative_news', views.get_relative_news_feed, name='get_relative_news_feed'),  # to deal with 3XX
    path('recommend', views.get_recommendation_feed, name='get_recommendation_feed'),
    path('web_news_info', views.web_news_info, name='web_news_info'),
    path('cache_web_feeds', views.cache_web_feeds, name='cache_web_feeds'),
    path('topic_feed/<int:topic_id>', views.get_topic_news, name='get_topic_news'),
    path('feedback', views.user_news_feedback, name='user_news_feedback'),
    path('relative_video/<int:news_id>', views.relative_video, name='relative_video'),
    path('set_single_click_impression', views.set_single_click_impression, name='set_single_impression'),
    path('create', views.create_news, name='create_news'),
    path('get_my_news', views.get_my_news, name='get_my_news'),
    path('delete/<int:news_id>', views.delete_news, name='delete_news'),
    path('tags', views.search_suggest_tags, name='search_suggest_tags'),
]

admin_urlpatterns = [
    path('admin/audit_change/<int:news_id>', admin_views.news_audit_change, name='news_audit_change'),
]

urlpatterns = service_urlpatterns + admin_urlpatterns
