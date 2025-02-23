FROM node:iron-slim 

WORKDIR /pong/pong-api/

COPY ./pong-api/nodemon.json ./
COPY ./pong-api/package.json ./
COPY ./pong-api/tsconfig.json ./

COPY ./utils /pong/utils/
WORKDIR /pong/utils/
RUN npm i 

WORKDIR /pong/pong-api/
RUN npm i



#TODO remove this 
#ENTRYPOINT [ "npm run dev" ]
#ENTRYPOINT ["tail", "-f", "/dev/null"]
