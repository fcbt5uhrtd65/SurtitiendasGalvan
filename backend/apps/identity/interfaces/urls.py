from django.urls import path

from apps.identity.interfaces.views import LoginView, MeView, RefreshView, RegisterView

urlpatterns = [
    path('login/', LoginView.as_view(), name='auth-login'),
    path('refresh/', RefreshView.as_view(), name='auth-refresh'),
    path('register/', RegisterView.as_view(), name='auth-register'),
    path('me/', MeView.as_view(), name='auth-me'),
]
