# Generated by Django 4.2.2 on 2023-07-19 23:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('availability', '0006_alter_time_off_accepted'),
    ]

    operations = [
        migrations.AlterField(
            model_name='time_off',
            name='accepted',
            field=models.CharField(default='pending', max_length=8),
        ),
    ]
