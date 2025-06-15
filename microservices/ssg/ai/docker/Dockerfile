FROM node:20-alpine

WORKDIR /app

COPY ./ai/package*.json ./

RUN npm install

COPY ./ai .
COPY ./pong-api/src/game/modes/singles/PongGameSingles.ts ./imports/PongGameSingles.ts
COPY ./pong-api/src/game/elements/Point.ts ./imports/Point.ts
COPY ./pong-api/src/game/elements/PongField.ts ./imports/PongField.ts

CMD ["npx", "ts-node", "src/server.ts"]