# Latest version of Python
FROM python:3.10

RUN apt-get update && \
    apt-get install -y postgresql-client
# Main directory in docker container
WORKDIR /code

#  Prevents Python from buffering stdout and stderr
ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

# Install Pipenv: django psycopg2-binary
RUN pip install pipenv

# Creating directory for dependencies file
RUN mkdir dependencies

# Copy Pipfile and Pipfile.lock
COPY ./dependencies/Pipfile ./dependencies/Pipfile
COPY ./dependencies/Pipfile.lock ./dependencies/Pipfile.lock

# Changing directory for install python dependencies
WORKDIR /code/dependencies

# Installing dependencies from Pipfiles
RUN pipenv install --deploy --system

# Main directory in docker container
WORKDIR /code

# Copy source code of project
COPY src/ /code/src/

# Copy script
COPY ./script/start_django.sh ./script/start_django.sh

# Changing permissions
RUN chmod +x ./script/start_django.sh

# Running entry point starting server
ENTRYPOINT ["./script/start_django.sh"]