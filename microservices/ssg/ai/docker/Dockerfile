FROM node:20-alpine

WORKDIR /app

COPY ./package*.json ./

RUN npm install

COPY . .

CMD ["npx", "ts-node", "src/server.ts"]