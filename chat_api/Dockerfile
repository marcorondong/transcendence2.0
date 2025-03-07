
FROM node:iron-slim

RUN apt-get update

# Create app directory
RUN mkdir -p chat_api
RUN mkdir -p chat_api/src
RUN mkdir -p chat_api/dist
RUN mkdir -p chat_api/public
WORKDIR chat_api

# Install app dependencies
COPY package.json .
COPY tsconfig.json .
# COPY src ./src
RUN npm install
RUN npm run build

# CMD ["npm", "run", "dev"]