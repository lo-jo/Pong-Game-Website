FROM node:21

RUN apt-get update && \
    apt-get install -y openssl

# RUN openssl genrsa -out /etc/ssl/private/selfsigned.key 2048

# RUN openssl req \
#     -x509 \
#     -nodes \
#     -days 365 \
#     -newkey rsa:2048 \
#     -key /etc/ssl/private/selfsigned.key \
#     -out /etc/ssl/private/selfsigned.crt \
#     -subj "/C=FR/ST=Ile-de-France/L=Paris/O=42/OU=42Paris/CN=ft_transcendence"

WORKDIR /app

COPY ./dependencies/* .

# COPY index.html index.html

RUN npm install --save

COPY ./src ./src

COPY selfsigned.crt /etc/ssl/private/selfsigned.crt
COPY selfsigned.key /etc/ssl/private/selfsigned.key

EXPOSE 5173

# Running entry point starting server
CMD ["npm", "run", "dev"]
