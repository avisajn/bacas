from django.urls import path

from . import views

urlpatterns = [
    path('detail/<int:video_id>', views.get_video_detail),
    path('detail/<int:video_id>/', views.get_video_detail),
    path('feeds', views.get_video_feeds),
    path('<int:video_id>/videos/', views.get_relative_video_feeds),
    path('<int:video_id>/deals', views.get_video_relative_deals),
    path('webapp_detail/<int:video_id>/', views.webapp_detail),
]
