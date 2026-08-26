from django.core.paginator import EmptyPage, Paginator
from django.db import transaction
from rest_framework.exceptions import ValidationError

from apps.coupons.models import Coupon
from .selectors import CouponSelector

class CouponAdminService:

    @staticmethod
    def paginate(queryset, page=1, page_size=10):

        paginator = Paginator(
            queryset,
            page_size
        )

        try:
            paginated = paginator.page(page)
        except EmptyPage:
            paginated = []

        return {
            "results": list(paginated),
            "count": paginator.count,
            "page": page,
            "page_size": page_size,
            "total_pages": paginator.num_pages,
            "next": paginated.has_next() if paginated else False,
            "previous": paginated.has_previous() if paginated else False,
        }

    @staticmethod
    def list_coupons(
        search="",
        sort="newest",
        page=1,
        page_size=10
    ):

        queryset = CouponSelector.get_all(
            search=search
        )

        queryset = CouponSelector.apply_sort(
            queryset=queryset,
            sort=sort
        )

        return CouponAdminService.paginate(
            queryset=queryset,
            page=page,
            page_size=page_size
        )


    @staticmethod
    @transaction.atomic
    def create_coupon(validated_data):

        code = validated_data["code"].strip().upper()
        existing = Coupon.objects.filter(code__iexact=code).first()

        if existing:
            if existing.is_active:
                raise ValidationError({"code": "A coupon with this code already exists."})

            for key, value in validated_data.items():
                setattr(existing, key, value)

            existing.code = code
            existing.is_active = True
            existing.save()

            return existing

        validated_data["code"] = code

        return Coupon.objects.create(
            **validated_data
        )


    @staticmethod
    @transaction.atomic
    def update_coupon(
        coupon_id,
        validated_data
    ):
        coupon = CouponSelector.get_coupon(coupon_id)
        if not coupon:
            raise ValidationError({"detail": "Coupon not found."})

        if "code" in validated_data:
            new_code = validated_data["code"].strip().upper()
            duplicate = Coupon.objects.filter(code__iexact=new_code).exclude(id=coupon.id).exists()
            if duplicate:
                raise ValidationError({"code": "Coupon code already exists."})

            validated_data["code"] = new_code

        for key, value in validated_data.items():

            setattr(
                coupon,
                key,
                value
            )

        coupon.save()

        return coupon


    @staticmethod
    @transaction.atomic
    def delete_coupon(coupon_id):

        coupon = CouponSelector.get_coupon(
            coupon_id
        )

        if not coupon:
            raise ValidationError({"detail": "Coupon not found."})

        coupon.is_active = False
        coupon.save()

        return True