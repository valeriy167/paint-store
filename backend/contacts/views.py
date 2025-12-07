from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import ContactInfo
from .serializers import ContactInfoSerializer
from django.http import Http404
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsModerator
from rest_framework.permissions import AllowAny

@api_view(['GET'])
@permission_classes([AllowAny])
def contact_info_view(request):
    obj = ContactInfo.load()
    serializer = ContactInfoSerializer(obj)
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsModerator])  # ← только модераторы могут редактировать
def contact_info_update(request):
    obj = ContactInfo.load()
    serializer = ContactInfoSerializer(obj, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)