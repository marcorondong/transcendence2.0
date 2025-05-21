FROM node:20-alpine

WORKDIR /app

COPY ./ai/package*.json ./

RUN npm install

COPY ./ai .
COPY ../pong-api/src/game/elements/Point.ts ./src/Point.ts
COPY ../pong-api/src/game/elements/PongField.ts ./src/PongField.ts

CMD ["npx", "ts-node", "src/server.ts"]
