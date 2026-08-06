import os
import sys
import django

sys.path.append(r'c:\Users\samue\Desktop\Toy store\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.conf import settings
settings.ALLOWED_HOSTS = ['*']

from apps.products.customers.services import CustomerProductService
from apps.products.customers.serializers import CustomerProductSerializer
from rest_framework.test import APIRequestFactory
from rest_framework.request import Request

def test():
    factory = APIRequestFactory()
    request = factory.get('/')
    serializer_context = {'request': Request(request)}
    
    active_qs = CustomerProductService.get_products()
    product = active_qs.first()
    if product:
        serializer = CustomerProductSerializer(product, context=serializer_context)
        print("KEYS AND DATA:")
        for k, v in serializer.data.items():
            print(f"{k}: {v}")
    else:
        print("No active products in DB.")

if __name__ == '__main__':
    test()
