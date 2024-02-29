#!/bin/bash

# openssl genrsa -out ./srcs/services/selfsigned.key 2048

# openssl req -x509 -nodes -days 365 -newkey rsa:2048 -key ./srcs/services/selfsigned.key -out  ./srcs/services/selfsigned.crt -subj "/C=FR/ST=Ile-de-France/L=Paris/O=42/OU=42Paris/CN=ft_transcendence"

# cp ./srcs/services/selfsigned.key ./srcs/services/backend/selfsigned.key
# cp ./srcs/services/selfsigned.key ./srcs/services/frontend/selfsigned.key
# cp ./srcs/services/selfsigned.crt ./srcs/services/backend/selfsigned.crt
# cp ./srcs/services/selfsigned.crt ./srcs/services/frontend/selfsigned.crt

openssl genrsa -out ./srcs/services/backend/selfsigned.key 2048

openssl req -x509 -nodes -days 365 -newkey rsa:2048 -key ./srcs/services/backend/selfsigned.key -out  ./srcs/services/backend/selfsigned.crt -subj "/C=FR/ST=Ile-de-France/L=Paris/O=42/OU=42Paris/CN=ft_transcendence"

cp ./srcs/services/backend/selfsigned.key ./srcs/services/frontend/selfsigned.key
cp ./srcs/services/backend/selfsigned.crt ./srcs/services/frontend/selfsigned.crt