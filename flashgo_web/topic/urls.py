from django.urls import path

from . import views, admin_views

service_urlpatterns = [
    path('detail/<int:topic_id>', views.topic_detail, name='topic_detail'),
    path('total', views.get_total_topics, name='get_total_topics'),
    path('ugc-all', views.get_all_topics, name='get_total_topics'),
    path('follow/list', views.get_follow_topics, name='get_follow_topics'),
    path('recommend', views.get_recommend_topics, name='get_recommend_topics'),
    path('follow/<int:topic_id>', views.topic_follow_handler, name='topic_follow_handler'),
]

admin_urlpatterns = [
    path('admin/update/<int:topic_id>', admin_views.admin_update_topic, name='admin_update_topic')
]

urlpatterns = service_urlpatterns + admin_urlpatterns
