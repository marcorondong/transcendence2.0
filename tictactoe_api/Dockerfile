FROM node:iron-slim

RUN apt-get update -y && apt-get install -y openssl

WORKDIR /tictactoe_api

COPY ./package.json ./
COPY ./tsconfig.json ./
COPY ./prisma ./prisma/
COPY ./src ./
COPY ./public ./
RUN npm install
RUN npx prisma generate

CMD ["sh", "-c", "npx prisma migrate deploy && npm run dev"]