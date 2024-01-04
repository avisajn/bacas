from django.urls import path

from . import views

urlpatterns = [
    path('available/', views.available, name='available'),
    path('available', views.available, name='available_'),
    path('newestversion/', views.newest_version, name='newest_version'),
    path('get_banners/', views.get_banners, name='get_banner'),
    path('get_app_packages/', views.get_app_package, name='get_app_packages'),
    path('get_test_html/', views.get_test_html, name='get_test_html'),
    path('get_options', views.get_options, name='get_options'),
    path('upload_choices', views.upload_choices, name='upload_choices'),
    path('upload_file', views.upload_file),
    path('update_info', views.get_update_info),
    path('acquire-secret', views.get_s3_secret_key),
]
