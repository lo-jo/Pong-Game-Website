from django.db.models.signals import post_save
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Message
from django.contrib.auth import get_user_model

User = get_user_model()

@receiver(post_save, sender=Message)
def handle_message_save(sender, instance, created, **kwargs):
    if created:
        # Perform actions you want here
        print("A new message is saved:", instance.message)
        # You can add any additional logic here
        user_id = instance.sender_id
        group_name = f"user_{user_id}"
        channel_layer = get_channel_layer()
        message = {
            'type': 'chatNotif',  # Define the message type
            'content': instance.message,        # Use instance.message as the message content
        }
        async_to_sync(channel_layer.group_send)(group_name, message)