FROM node:iron-slim

RUN apt-get update -y && apt-get install -y openssl

WORKDIR /chat_api

COPY ./package.json ./
COPY ./tsconfig.json ./
# COPY ./src /chat_api/src
RUN npm install

CMD ["npm", "run", "dev"]