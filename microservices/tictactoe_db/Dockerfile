FROM node:23-bullseye-slim

# No need for now
# RUN apt-get update -y && apt-get install -y openssl sqlite3

WORKDIR /tictactoe_db

COPY ./package.json ./
COPY ./package-lock.json ./
COPY ./tsconfig.json ./
COPY ./prisma ./prisma/
COPY ./src ./src
RUN npm clean-install

# TODO uncomment below line in production
# CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && npm run start"]

# TODO remove below line in production
CMD ["sh", "-c", "npx prisma generate && npx prisma migrate reset --force --skip-seed && npm run dev"] 