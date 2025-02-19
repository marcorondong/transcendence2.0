FROM node:iron-slim

WORKDIR /rps/rock-paper-scissors-api/

COPY ./rock-paper-scissors-api/package.json ./
COPY ./rock-paper-scissors-api/nodemon.json ./
COPY ./rock-paper-scissors-api/tsconfig.json ./

COPY ./utils /rps/utils/

RUN npm i

#TODO remove this 
#ENTRYPOINT [ "npm run dev" ]
#ENTRYPOINT ["tail", "-f", "/dev/null"]
