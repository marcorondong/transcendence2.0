FROM node:20-alpine

WORKDIR /app

COPY ./AI/package*.json ./

RUN npm install

COPY ./AI .
COPY ./pong-api/src/game/elements/Point.ts ./imports/Point.ts
COPY ./pong-api/src/game/elements/PongField.ts ./imports/PongField.ts

CMD ["npx", "nodemon", "src/server.ts"]