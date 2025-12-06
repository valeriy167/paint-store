from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Review
from .serializers import ReviewSerializer

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        if self.action == 'create':
            return [IsAuthenticated()]
        # approve, pending — только модераторы (проверка в экшенах)
        return [IsAuthenticated()]

    def get_queryset(self):
        # По умолчанию — только одобренные
        if self.action in ['list', 'retrieve']:
            return Review.objects.filter(is_approved=True).select_related('user', 'product')
        return Review.objects.all().select_related('user', 'product', 'moderator')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    # GET /api/reviews/pending/ → только модераторам
    @action(detail=False, methods=['get'], url_path='pending')
    def pending_reviews(self, request):
        if not request.user.profile.is_moderator:
            return Response({'detail': 'Недостаточно прав'}, status=status.HTTP_403_FORBIDDEN)
        reviews = Review.objects.filter(is_approved=False).select_related('user', 'product')
        serializer = self.get_serializer(reviews, many=True)
        return Response(serializer.data)

    # PATCH /api/reviews/{id}/approve/
    @action(detail=True, methods=['patch'])
    def approve(self, request, pk=None):
        if not request.user.profile.is_moderator:
            return Response({'detail': 'Недостаточно прав'}, status=status.HTTP_403_FORBIDDEN)
        review = self.get_object()
        review.is_approved = True
        review.moderator = request.user
        review.moderated_at = request.user.date_joined  # или timezone.now()
        review.save()
        serializer = self.get_serializer(review)
        return Response(serializer.data)