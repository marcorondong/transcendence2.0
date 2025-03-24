FROM node:iron-slim

RUN apt-get update && apt-get install -y openssl

COPY ./package.json /frontend_api/
COPY ./tsconfig.json /frontend_api/
COPY ./public /frontend_api/public
COPY ./run.sh /frontend_api/
RUN chmod +x /frontend_api/run.sh
RUN npm --prefix /frontend_api install

# RUN mkdir -p /frontend_api/ssl && \
# 	openssl req -x509 -nodes -days 3650 -newkey rsa:2048 -keyout /frontend_api/ssl/key.pem -out /frontend_api/ssl/cert.pem -subj "/C=AT/ST=Vienna/L=Vienna/O=42/OU=Transcedence2.0/CN=CommonNameOrHostname"

CMD ["./frontend_api/run.sh"]