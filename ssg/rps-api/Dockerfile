FROM node:iron-slim

RUN apt-get update && apt-get install -y openssl
COPY ./rps-api/scripts/https-keys.sh /rps/rps-api/scripts/https-keys.sh
RUN bash /rps/rps-api/scripts/https-keys.sh

WORKDIR /rps/utils/
COPY ./utils ./
RUN npm i

WORKDIR /rps/rps-api/
COPY ./rps-api/package.json ./
COPY ./rps-api/nodemon.json ./
COPY ./rps-api/tsconfig.json ./
RUN npm i

#TODO remove this 
#ENTRYPOINT [ "npm run dev" ]
#ENTRYPOINT ["tail", "-f", "/dev/null"]
