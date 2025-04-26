FROM node:iron-slim

RUN apt-get update -y && apt-get install -y openssl

WORKDIR /chat_api

COPY ./package.json ./
COPY ./tsconfig.json ./
COPY ./src ./
RUN npm install

# TODO uncomment below line in production
# CMD ["npm run start"]
# TODO remove below line in production
CMD ["npm", "run", "dev"]