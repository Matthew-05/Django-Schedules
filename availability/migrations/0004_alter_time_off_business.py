# Generated by Django 4.2.2 on 2023-07-19 05:47

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('businesses', '0003_alter_invited_employees_invite_code'),
        ('availability', '0003_time_off_business'),
    ]

    operations = [
        migrations.AlterField(
            model_name='time_off',
            name='business',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='businesses.business'),
        ),
    ]
