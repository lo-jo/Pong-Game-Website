from django.db.models.signals import post_save
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Notification
from django.contrib.auth import get_user_model

User = get_user_model()

@receiver(post_save, sender=Notification)
def notification_created(sender, instance, created, **kwargs):
    print("A NOTIFICATION HAS BEEN CREATED")
    if created:
        user_id = instance.sender
        group_name = str(instance.sender)
        print("####INSTANCE.MESSAGE", instance.message, group_name)
        channel_layer = get_channel_layer()

        message = {
            'type': 'send_notification',  # Define the message type
            'content': instance.message,        # Use instance.message as the message content
        }
        async_to_sync(channel_layer.group_send)(group_name, message)


# @receiver(post_save, sender=Notification)
# def notification_created(sender, instance, created, user=None, target=None, **kwargs):
#     print("A NOTIFICATION HAS BEEN CREATED")
#     if created:
#         print("####INSTANCE.MESSAGE", instance.message)
#         channel_layer = get_channel_layer()
#         print("********** CHANNEL LAYER", channel_layer)
#         if target:
#             async_to_sync(channel_layer.group_send)(
#                 f'user_{target.pk}',  # Assuming you have a channel group for each user
#                 {
#                     "type": "send_notification",
#                     "message": instance.message
#                 }
#             )
#         else:
#             async_to_sync(channel_layer.group_send)(
#                 'public_room',
#                 {
#                     "type": "send_notification",
#                     "message": instance.message
#                 }
#             )