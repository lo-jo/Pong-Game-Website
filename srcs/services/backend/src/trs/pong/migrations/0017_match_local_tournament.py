# Generated by Django 5.0.3 on 2024-04-22 10:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pong', '0016_alter_match_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='match',
            name='local_tournament',
            field=models.BooleanField(default=False),
        ),
    ]