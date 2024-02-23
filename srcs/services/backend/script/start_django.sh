#!/bin/bash

check_postgres_ready() {
    while ! pg_isready --dbname=trs --host=db --port=5432 --username=root; do
        echo "Waiting for PostgreSQL..."
        sleep 1
    done
    echo "PostgreSQL database is ready."
}

check_postgres_ready

# Apply database migrations
echo "Applying database migrations..."
python src/trs/manage.py makemigrations
python src/trs/manage.py migrate

# Start server
echo "Starting server..."
# runserver is asynchronous, any command after \
# that will be executed once the server is shutdown
python src/trs/manage.py runserver 0.0.0.0:8000
