# Latest version of Python
FROM python:3.10

# Not critical data
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install Pipenv; done in Docker to encapsulate dependencies for better portability
RUN pip install pipenv 
# django psycopg2-binary

WORKDIR /code

# Install dependencies
COPY services/django/dependencies/Pipfile services/django/dependencies/Pipfile.lock* /code/
RUN pipenv install --deploy --system

# Copy project
COPY src/ /code/src/

# Copy start script
COPY services/django/scripts/start_django.sh /code/

# Give execution permission to the script
RUN chmod +x /code/start_django.sh