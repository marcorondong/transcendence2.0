FROM node:iron-slim

WORKDIR /rps/rps-api/

COPY ./rps-api/package.json ./
COPY ./rps-api/nodemon.json ./
COPY ./rps-api/tsconfig.json ./

COPY ./utils /rps/utils/

RUN npm i

#TODO remove this 
#ENTRYPOINT [ "npm run dev" ]
#ENTRYPOINT ["tail", "-f", "/dev/null"]
