FROM node:iron-slim 

RUN mkdir -p /home/node/ai && cd /home/node/ai

COPY package*.json ./

RUN npm i && npm install fastify

COPY . .

RUN ["npx", "ts-node", "server.ts"]