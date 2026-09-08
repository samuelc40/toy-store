from django.urls import path

from .views import AdminReviewDetailAPIView, AdminReviewListAPIView

urlpatterns = [
    path(
        "",
        AdminReviewListAPIView.as_view(),
        name="admin-review-list",
    ),
    path(
        "<uuid:review_id>/",
        AdminReviewDetailAPIView.as_view(),
        name="admin-review-detail",
    ),
]
