from rest_framework.permissions import BasePermission
from django.contrib.auth.models import User

class IsModerator(BasePermission):
    """
    Разрешает доступ только пользователям с profile.is_moderator=True
    """
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated 
            and hasattr(request.user, 'profile') 
            and request.user.profile.is_moderator
        )