# Generated by Django 4.1.7 on 2023-06-13 22:37

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('businesses', '0003_alter_invited_employees_invite_code'),
        ('main', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='account',
            name='business_invite_code',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='businesses.invited_employees'),
        ),
    ]
