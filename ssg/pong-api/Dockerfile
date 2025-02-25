FROM node:iron-slim 

COPY ./pong-api/nodemon.json /pong/pong-api/
COPY ./pong-api/package.json /pong/pong-api/
COPY ./pong-api/tsconfig.json /pong/pong-api/
COPY ./utils /pong/utils/

RUN npm --prefix  /pong/utils/ install
RUN npm --prefix /pong/pong-api/ install

#WORKDIR /pong/pong-api/

#TODO remove this 
#ENTRYPOINT [ "npm run dev" ]
#ENTRYPOINT ["tail", "-f", "/dev/null"]
