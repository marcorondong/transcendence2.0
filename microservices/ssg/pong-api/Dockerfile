FROM node:22.14.0-bullseye-slim as build-stage

WORKDIR /pong/pong-api/
# COPY ./nodemon.json /pong/pong-api/ #For nodemon
COPY ./package*.json ./
COPY ./tsconfig.json ./
COPY ./src ./src
RUN npm clean-install
RUN npm run build

#Production
FROM node:22.14.0-bullseye-slim
RUN useradd --user-group --create-home --shell /bin/false ponguser

WORKDIR /pong/pong-api/
COPY --from=build-stage /pong/pong-api/node_modules ./node_modules
COPY --from=build-stage /pong/pong-api/dist ./dist
COPY ./package.json ./

USER ponguser


# RUN npm --prefix /pong/pong-api/ install
