from django.conf.urls import url
from . import views
from . import admin_views

admin_patterns = [
    url(r'clear', admin_views.clear_user_cache, name='clear_user_cache'),
]

service_patterns = [
    url(r'login', views.users),
    url(r'(?P<user_id>.+)/', views.users),
    url(r'qas', views.qas),
    url(r'rights', views.get_user_rights, name='get_user_rights'),
    url(r'config', views.get_config, name='get_config'),
    url(r'follow', views.get_user_follow, name='get_user_follow'),
    url(r'relative-ids', views.get_user_relative_ids, name='get_user_relative_ids'),
]


urlpatterns = admin_patterns + service_patterns
