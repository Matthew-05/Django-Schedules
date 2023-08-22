# Generated by Django 4.1.7 on 2023-06-13 03:30

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('businesses', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='business',
            name='employees',
            field=models.ManyToManyField(related_name='employee_set', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='business',
            name='owner',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='owner_set', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddConstraint(
            model_name='invited_employees',
            constraint=models.UniqueConstraint(fields=('business', 'invited_email'), name='already invited', violation_error_message='Already invited this user'),
        ),
    ]