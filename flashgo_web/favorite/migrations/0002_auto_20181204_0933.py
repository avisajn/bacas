# Generated by Django 2.1.3 on 2018-12-04 09:33

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('favorite', '0001_initial'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='favorite',
            unique_together={('user_id', 'deal_id')},
        ),
    ]
