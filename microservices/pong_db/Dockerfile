FROM node:23-bullseye-slim

RUN apt-get update -y && apt-get install -y sqlite3 openssl

WORKDIR /pong_db

COPY ./package.json ./
COPY ./tsconfig.json ./
COPY ./prisma ./prisma/
COPY ./src ./
RUN npm install

# TODO uncomment below line in production
# CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && npm run start"]

# TODO remove below line in production
CMD ["sh", "-c", "npx prisma generate && npx prisma migrate reset --force --skip-seed && npm run dev"] 