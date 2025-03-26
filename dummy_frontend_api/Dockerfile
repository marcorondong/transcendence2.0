FROM node:iron-slim

RUN apt-get update && apt-get install -y openssl

COPY ./package.json /dummy_frontend_api/
COPY ./tsconfig.json /dummy_frontend_api/
COPY ./public /dummy_frontend_api/public
COPY ./src /dummy_frontend_api/src
RUN npm --prefix /dummy_frontend_api install
RUN npm --prefix /dummy_frontend_api run build

# RUN mkdir -p /dummy_frontend_api/ssl && \
# 	openssl req -x509 -nodes -days 3650 -newkey rsa:2048 -keyout /dummy_frontend_api/ssl/key.pem -out /dummy_frontend_api/ssl/cert.pem -subj "/C=AT/ST=Vienna/L=Vienna/O=42/OU=Transcedence2.0/CN=CommonNameOrHostname"
CMD ["npm", "--prefix", "/dummy_frontend_api", "run", "dev"]