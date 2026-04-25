from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DiscoverView, ClaimViewSet, QuotaView

router = DefaultRouter()
router.register(r'discover', DiscoverView, basename='discover')
router.register(r'claims',   ClaimViewSet, basename='claims')
router.register(r'quota',    QuotaView,    basename='quota')

urlpatterns = [
    path('', include(router.urls)),
]
