FROM node:iron-slim

RUN apt-get update -y && apt-get install -y openssl

WORKDIR /tictactoe_api

COPY ./package.json ./
COPY ./tsconfig.json ./
COPY ./prisma ./prisma/
COPY ./src ./
COPY ./public ./
RUN npm install

CMD ["sh", "-c", "npx prisma generate & npx prisma migrate deploy && npm run dev"]
# CMD ["sh", "-c", "npx prisma generate && npx prisma migrate reset --force --skip-seed && npm run dev"]