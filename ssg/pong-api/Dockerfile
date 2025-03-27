FROM node:iron-slim 

RUN apt-get update && apt-get install -y openssl
COPY ./pong-api/scripts/https-keys.sh /pong/pong-api/scripts/https-keys.sh
#RUN bash /pong/pong-api/scripts/https-keys.sh
COPY ./pong-api/server-keys /pong/pong-api/server-keys

COPY ./pong-api/nodemon.json /pong/pong-api/
COPY ./pong-api/package.json /pong/pong-api/
COPY ./pong-api/tsconfig.json /pong/pong-api/
COPY ./utils /pong/utils/

RUN npm --prefix  /pong/utils/ install
RUN npm --prefix /pong/pong-api/ install

#TODO remove this 
#ENTRYPOINT [ "npm run dev" ]
#ENTRYPOINT ["tail", "-f", "/dev/null"]
