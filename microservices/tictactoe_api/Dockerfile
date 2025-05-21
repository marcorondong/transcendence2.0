FROM node:iron-slim

RUN apt-get update -y && apt-get install -y openssl sqlite3

WORKDIR /tictactoe_api

COPY ./package.json ./
COPY ./tsconfig.json ./
COPY ./src ./
# TODO remove below line in production
COPY ./public ./
RUN npm install

# TODO uncomment below line in production
# CMD ["npm run start"]
# TODO remove below line in production
CMD ["npm", "run", "dev"]