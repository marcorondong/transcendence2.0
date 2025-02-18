FROM node:iron-slim

WORKDIR /fastify

COPY ./package.json ./
COPY ./nodemon.json ./
COPY ./tsconfig.json ./

RUN npm i

# ENTRYPOINT [ "npm run dev" ]

# CMD [ "run", "/dev/null" ]