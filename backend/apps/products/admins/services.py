from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from django.db.models import (Q, Count, Sum, Min, Max, Prefetch)
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.db.models.functions import Coalesce
from django.db.models import Value
from django.db import transaction
from ..models import *

class AdminCategoryService:

    @staticmethod
    def list_categories(
        page=1,
        page_size=10,
        search=None,
        sort="newest"
    ):
        categories = Category.objects.filter(
            is_active=True
        )

        if search:
            search = search.strip()
            categories = categories.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search)
            )

        categories = AdminCategoryService.apply_sort(
            categories,
            sort
        )

        paginator = Paginator(
            categories,
            page_size
        )
        try:
            paginated = paginator.page(
                page
            )
        except EmptyPage:
            paginated = []
        count = paginator.count
        total_pages = paginator.num_pages

        next_page = (
            paginated.has_next()
            if paginated
            else False
        )

        previous_page = (
            paginated.has_previous()
            if paginated
            else False
        )

        return {
            "results": list(
                paginated
            ),
            "count": count,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
            "next": next_page,
            "previous": previous_page
        }

    @staticmethod
    def create_category(name, description=None, image=None):
        name = name.strip()

        existing = Category.objects.filter(
            name__iexact=name
        ).first()

        if existing:
            if existing.is_active:
                raise ValidationError({
                    "name": "A category with this name already exists."
                })

            existing.is_active = True
            existing.name = name
            existing.description = description

            if image:
                existing.image = image

            existing.save()
            return existing

        return Category.objects.create(
            name=name,
            description=description,
            image=image
        )
    

    @staticmethod
    def update_category(category_uuid, name=None, description=None, image=None):
        try:
            category = Category.objects.get(id=category_uuid, is_active=True)
        except (Category.DoesNotExist, ValueError):
            raise ValidationError({"detail": "Category not found."})

        if name:
            name = name.strip()
            clash = Category.objects.filter(name__iexact=name, is_active=True).exclude(id=category.id).first()
            if clash:
                raise ValidationError({"name": "A category with this name already exists."})
            
            inactive_clash = Category.objects.filter(name__iexact=name, is_active=False).first()
            if inactive_clash:
                import uuid
                inactive_clash.name = f"{inactive_clash.name}_deleted_{uuid.uuid4().hex[:6]}"
                inactive_clash.save()

            category.name = name

        if description is not None:
            category.description = description

        if image is not None:
            category.image = image

        category.save()
        return category

    @staticmethod
    def delete_category(category_uuid):
        try:
            category = Category.objects.get(id=category_uuid, is_active=True)
        except (Category.DoesNotExist, ValueError):
            raise ValidationError({"detail": "Category not found."})

        category.is_active = False
        category.save()
        return True
    

    @staticmethod
    def apply_sort(
        queryset,
        sort
    ):
        SORTING = {
            "newest": "-created_at",
            "a_z": "name",
            "z_a": "-name",
        }

        return queryset.order_by(
            SORTING.get(
                sort,
                "-created_at"
            )
        )



class ProductService:

    @staticmethod
    def create(validated_data):

        return Product.objects.create(
            **validated_data
        )

    @staticmethod
    def list_products(
        search="",
        page=1,
        page_size=10
    ):

        # queryset = Product.objects.filter(is_active=True).select_related("category").order_by("-created_at")
        queryset = Product.objects.filter(
            is_active=True
        ).select_related(
            "category"
        ).annotate(

            variants_count=Count(
                "variants",
                filter=Q(variants__is_active=True)
            ),

            
            total_stock=Coalesce(Sum("variants__stock_quantity", 
                                     filter=Q(variants__is_active=True)),
                                     Value(0)

            ),

            lowest_price=Min(
                "variants__sale_price",
                filter=Q(
                    variants__is_active=True,
                    variants__blocked=False
                )
            ),

            highest_price=Max("variants__sale_price", filter=Q(variants__is_active=True, variants__blocked=False))
            ).order_by( "-created_at")

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(brand__icontains=search) |
                Q(category__name__icontains=search)
            )

        paginator = Paginator(queryset, page_size)

        page_obj = paginator.get_page(page)

        return {

            "results": page_obj.object_list,
            "count": paginator.count,
            "page": page_obj.number,
            "page_size": page_size,
            "total_pages": paginator.num_pages,

        }
    
    @staticmethod
    def get_product(product_id):

        return get_object_or_404(
            Product.objects.select_related("category"),
            id=product_id,
            is_active=True
        )

    @staticmethod
    def update(product, validated_data):

        for field, value in validated_data.items():
            setattr(product, field, value)

        product.save()

        return product

    @staticmethod
    def soft_delete(product):

        product.is_active = False

        product.save(
            update_fields=[
                "is_active",
                "updated_at",
            ]
        )

    @staticmethod
    def toggle_block(product):

        product.blocked = not product.blocked

        product.save(
            update_fields=[
                "blocked",
                "updated_at",
            ]
        )


class VariantService:

    @staticmethod
    def create_variant(product, validated_data):

        return ProductVariant.objects.create(
            product=product,
            **validated_data
        )
    
    @staticmethod
    def get_product(product_id):
        return get_object_or_404(Product, id=product_id, is_active=True)
    
    @staticmethod
    def list_variants(product):
        return ProductVariant.objects.filter(product=product, is_active=True).order_by("display_order", "created_at")
    
    @staticmethod
    def get_variant(variant_id):
        return get_object_or_404(ProductVariant, id=variant_id, is_active=True)
    
    @staticmethod
    def update_variant(

        variant,

        validated_data

    ):

        for field, value in validated_data.items():

            setattr(

                variant,

                field,

                value

            )

        variant.save()

        return variant
    
    @staticmethod
    def soft_delete(

        variant

    ):

        variant.is_active = False

        variant.save(
            update_fields=[
                "is_active",
                "updated_at"
            ]
        )


    @staticmethod
    def toggle_block(

        variant

    ):

        variant.blocked = not variant.blocked

        variant.save(
            update_fields=[
                "blocked",
                "updated_at"
            ]
        )

        return variant
    


class ImageService:

    ALLOWED_EXTENSIONS = [
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
    ]

    MAX_IMAGE_SIZE = 5 * 1024 * 1024
    MIN_IMAGES = 3
    MAX_IMAGES = 10

    @staticmethod
    @transaction.atomic
    def upload_images(
        variant_id,
        images,
        alt_text=""
    ):

        variant = get_object_or_404(
            ProductVariant,
            id=variant_id,
            is_active=True
        )

        existing_images = variant.images.count()
        total_images = existing_images + len(images)

        if total_images < ImageService.MIN_IMAGES:
            raise ValidationError({
                "images": f"At least {ImageService.MIN_IMAGES} images are required for every variant."
            })

        if total_images > ImageService.MAX_IMAGES:
            raise ValidationError({
                "images": f"A maximum of {ImageService.MAX_IMAGES} images are allowed per variant."
            })

        created_images = []
        display_order = existing_images + 1
        is_first_image = existing_images == 0

        for image in images:
            extension = os.path.splitext(
                image.name
            )[1].lower()

            if extension not in ImageService.ALLOWED_EXTENSIONS:
                raise ValidationError({
                    "images": f"{image.name} has an unsupported file format."
                })

            content_type = getattr(image, "content_type", None)
            if content_type and content_type not in ["image/jpeg", "image/png", "image/webp"]:
                raise ValidationError({
                    "images": f"{image.name} has an unsupported file format."
                })

            if image.size > ImageService.MAX_IMAGE_SIZE:
                raise ValidationError({
                    "images": f"{image.name} exceeds 5MB."
                })

            from PIL import Image as PILImage
            try:
                img = PILImage.open(image)
                img.verify()
                if hasattr(image, "seek"):
                    image.seek(0)
            except Exception:
                raise ValidationError({
                    "images": f"{image.name} is not a valid image file."
                })

            product_image = ProductImage.objects.create(
                variant=variant,
                image=image,
                alt_text=alt_text,
                is_primary=is_first_image,
                display_order=display_order,
            )

            created_images.append(product_image)
            display_order += 1
            is_first_image = False

        return created_images

    @staticmethod
    @transaction.atomic
    def delete_image(variant_id, image_id):
        variant = get_object_or_404(
            ProductVariant,
            id=variant_id,
            is_active=True
        )

        existing_count = variant.images.count()
        if existing_count - 1 < ImageService.MIN_IMAGES:
            raise ValidationError({
                "images": f"At least {ImageService.MIN_IMAGES} images are required for every variant."
            })

        image = get_object_or_404(
            ProductImage,
            id=image_id,
            variant=variant
        )
        was_primary = image.is_primary
        image.delete()

        if was_primary:
            first_rem = variant.images.order_by("display_order").first()
            if first_rem:
                first_rem.is_primary = True
                first_rem.save()

        return True


class AdminInventoryService:
    STOCK_LOW_THRESHOLD = 5

    SORT_MAPPING = {
        "newest": "-updated_at",
        "oldest": "created_at",
        "name_asc": "product__name",
        "name_desc": "-product__name",
        "highest_stock": "-stock_quantity",
        "lowest_stock": "stock_quantity",
        "highest_price": "-price",
        "lowest_price": "price",
    }

    @classmethod
    def get_inventory_items(
        cls,
        page=1,
        page_size=10,
        search="",
        sort="newest",
        category="",
        brand="",
        stock_status="",
        status_filter="",
    ):
        images_prefetch = Prefetch(
            "images",
            queryset=ProductImage.objects.order_by("display_order"),
            to_attr="active_images"
        )
        queryset = ProductVariant.objects.select_related("product", "product__category").prefetch_related(images_prefetch)

        # 1. Search Query (Product Name, Variant Name, SKU, Brand, Category Name)
        if search and str(search).strip():
            q = str(search).strip()
            queryset = queryset.filter(
                Q(product__name__icontains=q) |
                Q(variant_name__icontains=q) |
                Q(sku__icontains=q) |
                Q(product__brand__icontains=q) |
                Q(product__category__name__icontains=q)
            ).distinct()

        # 2. Category Filter
        if category and str(category).strip() and str(category).upper() != "ALL":
            q_cat = str(category).strip()
            queryset = queryset.filter(
                Q(product__category__id=q_cat) | Q(product__category__name__iexact=q_cat)
            )

        # 3. Brand Filter
        if brand and str(brand).strip() and str(brand).upper() != "ALL":
            queryset = queryset.filter(product__brand__iexact=str(brand).strip())

        # 4. Stock Status Filter
        if stock_status and str(stock_status).strip() and str(stock_status).upper() != "ALL":
            st = str(stock_status).upper().strip()
            if st == "OUT_OF_STOCK":
                queryset = queryset.filter(stock_quantity=0)
            elif st == "LOW_STOCK":
                queryset = queryset.filter(stock_quantity__gt=0, stock_quantity__lte=cls.STOCK_LOW_THRESHOLD)
            elif st == "IN_STOCK":
                queryset = queryset.filter(stock_quantity__gt=cls.STOCK_LOW_THRESHOLD)

        # 5. Product/Variant Status Filter
        if status_filter and str(status_filter).strip() and str(status_filter).upper() != "ALL":
            sf = str(status_filter).upper().strip()
            if sf == "ACTIVE":
                queryset = queryset.filter(is_active=True, blocked=False, product__is_active=True, product__blocked=False)
            elif sf == "INACTIVE":
                queryset = queryset.filter(Q(is_active=False) | Q(product__is_active=False))
            elif sf == "BLOCKED":
                queryset = queryset.filter(Q(blocked=True) | Q(product__blocked=True))

        # 6. Whitelisted Sorting
        sort_field = cls.SORT_MAPPING.get(str(sort).lower(), "-updated_at")
        queryset = queryset.order_by(sort_field)

        # 7. Pagination
        paginator = Paginator(queryset, page_size)
        try:
            paginated_page = paginator.page(page)
        except EmptyPage:
            paginated_page = paginator.page(paginator.num_pages if paginator.num_pages > 0 else 1)
        except PageNotAnInteger:
            paginated_page = paginator.page(1)

        return {
            "results": list(paginated_page.object_list),
            "count": paginator.count,
            "page": paginated_page.number,
            "page_size": page_size,
            "total_pages": paginator.num_pages,
            "next": paginated_page.next_page_number() if paginated_page.has_next() else None,
            "previous": paginated_page.previous_page_number() if paginated_page.has_previous() else None,
        }

    @classmethod
    def get_summary_stats(cls):
        total_products = Product.objects.count()
        total_variants = ProductVariant.objects.count()
        out_of_stock = ProductVariant.objects.filter(stock_quantity=0).count()
        low_stock = ProductVariant.objects.filter(stock_quantity__gt=0, stock_quantity__lte=cls.STOCK_LOW_THRESHOLD).count()
        in_stock = ProductVariant.objects.filter(stock_quantity__gt=cls.STOCK_LOW_THRESHOLD).count()

        return {
            "total_products": total_products,
            "total_variants": total_variants,
            "in_stock": in_stock,
            "low_stock": low_stock,
            "out_of_stock": out_of_stock,
        }

    @classmethod
    @transaction.atomic
    def update_stock(cls, variant_id, new_quantity, reason=""):
        try:
            variant = ProductVariant.objects.select_for_update().select_related("product").get(id=variant_id)
        except ProductVariant.DoesNotExist:
            raise ValidationError({"variant_id": "Product variant not found."})

        if new_quantity < 0:
            raise ValidationError({"stock_quantity": "Stock quantity cannot be negative."})

        variant.stock_quantity = new_quantity
        variant.save(update_fields=["stock_quantity", "updated_at"])
        return variant
   