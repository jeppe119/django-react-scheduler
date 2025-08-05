from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EventViewSet, login_view

router = DefaultRouter()
router.register(r'events', EventViewSet, basename='event')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/login/', login_view, name='login'),
]