FROM node:iron-slim

RUN apt-get update

COPY ./package.json /chat_api/
COPY ./tsconfig.json /chat_api/
# COPY ./src /chat_api/src
RUN npm --prefix /chat_api install

CMD ["npm", "--prefix", "/chat_api", "run", "dev"]