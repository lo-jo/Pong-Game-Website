
import os
import django


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trs.settings')
django.setup()

from users.models import User

# Get the custom user model
def create_regular_user():
    """Function to create a regular user."""
    username = os.getenv("ADMIN")
    email = os.getenv("EMAILADMIN")
    password = os.getenv("PASSADMIN")
    user = User.objects.create_user(username=username, email=email, password=password)
    user.save()

if __name__ == "__main__":
    create_regular_user()