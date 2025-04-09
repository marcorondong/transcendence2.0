FROM node:iron-slim

RUN apt-get update -y && apt-get install -y openssl

WORKDIR /chat_api

COPY ./package.json ./
COPY ./tsconfig.json ./
COPY ./prisma ./prisma/
# COPY ./src /chat_api/src
RUN npm install
ENV DATABASE_URL="file:/chat_api/prisma/DB/user.db"
RUN npx prisma generate

CMD ["npm", "run", "dev"]