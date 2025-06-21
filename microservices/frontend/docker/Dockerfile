FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

RUN npm run build



# Use an entrypoint script to decide what to run
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
