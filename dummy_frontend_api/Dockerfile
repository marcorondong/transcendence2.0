FROM node:iron-slim

RUN apt-get update

COPY ./package.json /frontend_api/
COPY ./tsconfig.json /frontend_api/
COPY ./public /frontend_api/public
COPY ./run.sh /frontend_api/
RUN chmod +x /frontend_api/run.sh
RUN npm --prefix /frontend_api install

CMD ["./frontend_api/run.sh"]