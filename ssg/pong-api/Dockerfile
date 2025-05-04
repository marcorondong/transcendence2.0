FROM node:22.14.0-bullseye-slim

RUN apt-get update && apt-get install -y openssl
COPY ./scripts/https-keys.sh /pong/pong-api/scripts/https-keys.sh
RUN bash /pong/pong-api/scripts/https-keys.sh

COPY ./nodemon.json /pong/pong-api/
COPY ./package.json /pong/pong-api/
COPY ./tsconfig.json /pong/pong-api/
COPY ./.env /pong/pong-api/
COPY ./config.ts  /pong/pong-api/

RUN npm --prefix /pong/pong-api/ install

#TODO remove this
#ENTRYPOINT [ "npm run dev" ]
#ENTRYPOINT ["tail", "-f", "/dev/null"]
