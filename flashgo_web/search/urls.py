from django.urls import path

from . import views

urlpatterns = [
    path('get_hot_query/', views.get_hot_query, name='get_hot_query'),
    path('get_search_result/', views.get_search_result, name='get_search_result'),
    path('suggest', views.get_suggestion),
    path('search_by_conditions', views.search_by_conditions),
    path('get_slogan', views.get_slogan),
    path('v2/search_by_conditions', views.search_by_conditions_v2)
]
