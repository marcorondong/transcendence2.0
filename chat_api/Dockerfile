FROM node:iron-slim

RUN apt-get update -y && apt-get install -y openssl

WORKDIR /chat_api

COPY ./package.json ./
COPY ./tsconfig.json ./
COPY ./prisma ./prisma/
RUN npm install
RUN npx prisma generate
RUN npx prisma migrate deploy

CMD ["npm", "run", "dev"]