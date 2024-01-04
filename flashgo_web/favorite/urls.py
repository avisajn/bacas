from django.urls import path

from . import views

urlpatterns = [
    path('get_interests/', views.get_interests, name='get_interests'),
    path('get_my_favorite/', views.get_my_favorite, name='get_my_favorite'),
    path('add_user_interests/', views.add_user_interests, name='add_user_interests'),
    path('add_user_reportdealerrors/', views.add_user_reportdealerrors, name='add_user_reportdealerrors'),
    path('add_user_flashremind/', views.add_user_flashremind, name='add_user_flashremind'),
    path('add_user_flashremind', views.add_user_flashremind, name='add_user_flashremind_'),
    path('add_user_flash_reminder', views.add_user_flashremind, name='add_user_flash_reminder'),
    path('remove_user_flashremind/', views.remove_user_flashremind, name='remove_user_flashremind'),
    path('remove_user_flashremind', views.remove_user_flashremind, name='remove_user_flashremind_'),
    path('remove_user_flash_reminder', views.remove_user_flashremind, name='remove_user_flash_reminder'),
    path('add_favorite/', views.add_favorite, name='add_favorite'),
    path('batch_cancel_favorite/', views.batch_cancel_favorite, name='batch_cancel_favorite'),
    path('cancel_favorite/', views.cancel_favorite, name='cancel_favorite'),
    path('cancel_not_valid_favorite/', views.cancel_invalid_favorite, name='cancel_not_valid_favorite'),
    path('get_user_like/', views.get_user_like, name='get_user_fav_content'),
    path('add_user_like/', views.add_user_like, name='add_user_fav_content'),
    path('add_user_like', views.add_user_like, name='add_user_fav_content_'),
    path('remove_user_like/', views.remove_user_like, name='remove_user_fav_content'),
    path('remove_user_like', views.remove_user_like, name='remove_user_fav_content_'),
    path('get_selected_interests/', views.get_selected_interests, name='get_user_selected_interests'),
    path('get_selected_interests', views.get_selected_interests, name='get_user_selected_interests_'),
    path('add_user_selected_interests/', views.add_user_selected_interests, name='add_user_selected_interests'),
    path('get_my_like', views.get_my_like, name='get_my_like'),
    path('received_like', views.get_received_like, name='get_receive_like'),
    path('v2/deals', views.get_favorite_deals, name='get_favorite_deals')
]
