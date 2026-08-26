from django.db.models import Q
from apps.coupons.models import Coupon


class CouponSelector:

    @staticmethod
    def get_coupon(coupon_id):
        return Coupon.objects.filter(id=coupon_id).first()

    @staticmethod
    def get_all(search=None):
        queryset = Coupon.objects.all()

        if search:
            search = search.strip()
            queryset = queryset.filter(
                Q(code__icontains=search) |
                Q(description__icontains=search)
            )

        return queryset

    @staticmethod
    def apply_sort(queryset, sort):

        SORTING = {
            "newest": "-created_at",
            "oldest": "created_at",
            "code_a_z": "code",
            "code_z_a": "-code",
            "highest_discount": "-discount_value",
            "lowest_discount": "discount_value",
            "start_date": "start_date",
            "end_date": "end_date",
        }

        return queryset.order_by(
            SORTING.get(sort, "-created_at")
        )
    