FROM node:22.14.0-bullseye-slim

WORKDIR /pong/pong-api/
# COPY ./nodemon.json /pong/pong-api/ #For nodemon
COPY ./package.json ./
COPY ./tsconfig.json ./


RUN npm install

COPY ./src ./src

RUN npm run build


# RUN npm --prefix /pong/pong-api/ install
