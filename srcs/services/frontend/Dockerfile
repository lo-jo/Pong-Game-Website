FROM node:21

WORKDIR /app

COPY ./dependencies/* .

COPY index.html index.html

RUN npm install --save

COPY ./src ./src

EXPOSE 5173

# Running entry point starting server
CMD ["npm", "run", "dev"]
