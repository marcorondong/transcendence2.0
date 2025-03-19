FROM node:iron-slim

RUN apt-get update

COPY ./package.json /tictactoe_api/
COPY ./tsconfig.json /tictactoe_api/
# COPY ./src /tictactoe_api/src
RUN npm --prefix /tictactoe_api install

CMD ["npm", "--prefix", "/tictactoe_api", "run", "dev"]