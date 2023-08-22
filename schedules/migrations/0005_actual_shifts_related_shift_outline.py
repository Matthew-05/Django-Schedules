# Generated by Django 4.2.3 on 2023-07-24 04:00

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('schedules', '0004_actual_shifts_week_multiplier'),
    ]

    operations = [
        migrations.AddField(
            model_name='actual_shifts',
            name='related_shift_outline',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='schedules.shift_outline_individual'),
        ),
    ]