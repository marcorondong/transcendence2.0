FROM node:iron-slim 

WORKDIR /pong/

COPY ./nodemon.json /pong/
COPY ./package.json /pong/
COPY ./tsconfig.json /pong/

RUN npm i

#TODO remove this 
#ENTRYPOINT [ "npm run dev" ]
#ENTRYPOINT ["tail", "-f", "/dev/null"]
