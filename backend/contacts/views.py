from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import ContactInfo
from .serializers import ContactInfoSerializer

@api_view(['GET', 'PUT'])
def contact_info_view(request):
    """
    GET — получить контакты
    PUT — обновить (только админ, но проверку добавим позже)
    """
    obj = ContactInfo.load()  # гарантирует pk=1
    if request.method == 'GET':
        serializer = ContactInfoSerializer(obj)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = ContactInfoSerializer(obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)