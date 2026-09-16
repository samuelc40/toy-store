from rest_framework import serializers

from apps.reviews.models import ProductReview


class ReviewCreateSerializer(serializers.Serializer):

    rating = serializers.IntegerField(
        min_value=1,
        max_value=5,
        required=True,
        error_messages={
            "required": "Rating is required.",
            "min_value": "Rating must be at least 1.",
            "max_value": "Rating must be at most 5.",
            "invalid": "Rating must be a valid integer.",
        },
    )

    comment = serializers.CharField(
        max_length=2000,
        required=False,
        allow_blank=True,
        default="",
        trim_whitespace=False,
        error_messages={
            "max_length": "Comment cannot exceed 2000 characters.",
        },
    )

    def validate_comment(self, value):
        if value is None:
            return ""
        trimmed = value.strip()
        if value and not trimmed:
            raise serializers.ValidationError(
                "Comment cannot consist of only whitespace."
            )
        return trimmed


class ReviewUpdateSerializer(serializers.Serializer):

    rating = serializers.IntegerField(
        min_value=1,
        max_value=5,
        required=False,
        error_messages={
            "min_value": "Rating must be at least 1.",
            "max_value": "Rating must be at most 5.",
            "invalid": "Rating must be a valid integer.",
        },
    )

    comment = serializers.CharField(
        max_length=2000,
        required=False,
        allow_blank=True,
        trim_whitespace=False,
        error_messages={
            "max_length": "Comment cannot exceed 2000 characters.",
        },
    )

    def validate_comment(self, value):
        if value is None:
            return None
        trimmed = value.strip()
        if value and not trimmed:
            raise serializers.ValidationError(
                "Comment cannot consist of only whitespace."
            )
        return trimmed

    def validate(self, attrs):
        if not attrs or (attrs.get("rating") is None and attrs.get("comment") is None):
            raise serializers.ValidationError(
                "At least one field (rating or comment) must be provided for update."
            )
        return attrs


class ReviewSerializer(serializers.ModelSerializer):

    user_name = serializers.SerializerMethodField()

    class Meta:
        model = ProductReview
        fields = [
            "id",
            "user_name",
            "rating",
            "comment",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "user_name",
            "created_at",
            "updated_at",
        ]

    def get_user_name(self, obj):
        if not obj or not obj.user:
            return "Verified Customer"

        full_name = (
            obj.user.get_full_name().strip()
            if hasattr(obj.user, "get_full_name")
            else ""
        )
        if full_name:
            return full_name

        first_name = getattr(obj.user, "first_name", "")
        if first_name and first_name.strip():
            return first_name.strip()

        return "Verified Customer"


class VariantReviewStatisticsSerializer(serializers.Serializer):

    average_rating = serializers.DecimalField(
        max_digits=3,
        decimal_places=2,
        read_only=True,
    )
    total_reviews = serializers.IntegerField(read_only=True)
    rating_distribution = serializers.DictField(read_only=True)


class ReviewEligibilitySerializer(serializers.Serializer):

    can_review = serializers.BooleanField(read_only=True)
    has_reviewed = serializers.BooleanField(read_only=True)
    already_reviewed = serializers.BooleanField(read_only=True, required=False)
    has_eligible_purchase = serializers.BooleanField(read_only=True)
    existing_review_id = serializers.CharField(
        read_only=True,
        allow_null=True,
        required=False,
    )
    existing_review = ReviewSerializer(read_only=True, allow_null=True, required=False)


class AdminReviewSerializer(serializers.ModelSerializer):

    user_name = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()
    product_name = serializers.SerializerMethodField()
    variant_name = serializers.SerializerMethodField()

    class Meta:
        model = ProductReview
        fields = [
            "id",
            "user_name",
            "user_email",
            "product_name",
            "variant_name",
            "rating",
            "comment",
            "is_visible",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_user_name(self, obj):
        if not obj.user:
            return "Unknown User"
        return obj.user.get_full_name() or obj.user.email

    def get_user_email(self, obj):
        return obj.user.email if obj.user else ""

    def get_product_name(self, obj):
        if obj.variant and obj.variant.product:
            return obj.variant.product.name
        return ""

    def get_variant_name(self, obj):
        if obj.variant:
            return getattr(obj.variant, "variant_name", str(obj.variant))
        return ""
