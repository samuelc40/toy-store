import uuid
from django.conf import settings
from django.db import models
from apps.products.models import Product


class WishlistItem(models.Model):
    id = models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name="wishlist_items")
    product = models.ForeignKey(Product,on_delete=models.CASCADE,related_name="wishlist_items")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "product"],
                name="unique_user_wishlist_product"
            )
        ]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user} - {self.product.name}"