from django.urls import path

from . import views

urlpatterns = [
    path('feeds', views.get_author_feed, name='get_author_feed'),
    path('get_following', views.get_user_following, name='get_user_following'),
    path('add_following', views.add_following, name='following_author'),
    path('cancel_following', views.cancel_following, name='cancel_following'),
    path('recommend', views.get_recommended_authors, name='get_recommended_authors'),
    path('detail', views.get_author_detail, name='get_author_detail')
]
