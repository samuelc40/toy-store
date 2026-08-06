# Migration for Order Management updates

import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='cancellation_reason',
            field=models.CharField(blank=True, max_length=500, null=True),
        ),
        migrations.AddField(
            model_name='order',
            name='cancelled_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='order',
            name='order_status',
            field=models.CharField(
                choices=[
                    ('PENDING', 'Pending'),
                    ('CONFIRMED', 'Confirmed'),
                    ('PACKED', 'Packed'),
                    ('SHIPPED', 'Shipped'),
                    ('DELIVERED', 'Delivered'),
                    ('CANCELLED', 'Cancelled'),
                    ('RETURN_REQUESTED', 'Return Requested'),
                    ('RETURNED', 'Returned')
                ],
                default='PENDING',
                max_length=20
            ),
        ),
        migrations.AddField(
            model_name='orderitem',
            name='cancellation_reason',
            field=models.CharField(blank=True, max_length=500, null=True),
        ),
        migrations.AddField(
            model_name='orderitem',
            name='cancelled_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='orderitem',
            name='status',
            field=models.CharField(
                choices=[('ACTIVE', 'Active'), ('CANCELLED', 'Cancelled')],
                default='ACTIVE',
                max_length=20
            ),
        ),
        migrations.CreateModel(
            name='OrderReturnRequest',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('reason', models.CharField(max_length=100)),
                ('description', models.TextField(blank=True, null=True)),
                ('status', models.CharField(
                    choices=[
                        ('PENDING', 'Pending'),
                        ('APPROVED', 'Approved'),
                        ('REJECTED', 'Rejected'),
                        ('COMPLETED', 'Completed')
                    ],
                    default='PENDING',
                    max_length=20
                )),
                ('requested_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('order', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='return_requests', to='orders.order')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='order_returns', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'order_return_requests',
                'ordering': ['-requested_at'],
            },
        ),
    ]
