FROM node:22.14.0-bullseye-slim



COPY ./nodemon.json /pong/pong-api/
COPY ./package.json /pong/pong-api/
COPY ./tsconfig.json /pong/pong-api/
COPY ./.env /pong/pong-api/

RUN npm --prefix /pong/pong-api/ install

#TODO remove this
#ENTRYPOINT [ "npm run dev" ]
#ENTRYPOINT ["tail", "-f", "/dev/null"]
