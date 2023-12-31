# Generated by Django 4.2.2 on 2023-07-20 23:15

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('businesses', '0005_alter_invited_employees_primary_role_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='invited_employees',
            name='primary_role',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='businesses.business_job_roles'),
        ),
        migrations.AlterField(
            model_name='invited_employees',
            name='secondary_roles',
            field=models.ManyToManyField(blank=True, related_name='secondary_roles', to='businesses.business_job_roles'),
        ),
    ]
