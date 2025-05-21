FROM node:23-bullseye-slim

# TODO No need for now
# RUN apt-get update -y && apt-get install -y sqlite3

WORKDIR /chat_db

COPY ./package.json ./
COPY ./package-lock.json ./
COPY ./tsconfig.json ./
COPY ./prisma ./prisma/
COPY ./src ./
RUN npm clean-install

# TODO uncomment below line in production
# CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && npm run start"]

# TODO remove below line in production
CMD ["sh", "-c", "npx prisma generate && npx prisma migrate reset --force --skip-seed && npm run dev"] 