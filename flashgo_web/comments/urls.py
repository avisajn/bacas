from django.urls import path

from . import views, admin_views

service_patterns = [
    path(r'my_comments', views.get_my_comments, name='get_my_comments'),
    path(r'news_comments', views.get_news_comments, name='get_news_comments'),
    path(r'add_comment', views.add_comment, name='add_comment'),
    path(r'likes/notifications', views.get_likes_notifications, name='get_likes_notifications'),
    path(r'like', views.add_comment_likes, name='add_comment_likes'),
    # path(r'cancel_like', views.cancel_comment_likes, name='add_comment_likes'),
    path(r'attention_status', views.get_attention_status, name='get_attention_status'),
    path(r'sub_comments/<int:root_id>', views.get_sub_comments, name='get_sub_comments'),
    path(r'get_my_comments', views.get_comments_notifications, name='get_my_comments'),
]

admin_patterns = [
    path(r'admin/modify_add_comment/<int:comment_id>', admin_views.modify_add_comment, name='modify_add_comment'),
    path(r'admin/modify_like_comment', admin_views.modify_like_comment, name='modify_like_comment'),
]

urlpatterns = service_patterns + admin_patterns
