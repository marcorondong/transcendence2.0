FROM node:23-bullseye-slim

# No need for now
# RUN apt-get update -y && apt-get install -y openssl sqlite3

WORKDIR /tictactoe_api

COPY ./package.json ./
COPY ./package-lock.json ./
COPY ./tsconfig.json ./
COPY ./src ./src
# TODO remove below line in production
COPY ./public ./
RUN npm clean-install

# TODO uncomment below line in production
# CMD ["npm run start"]
# TODO remove below line in production
CMD ["npm", "run", "dev"]