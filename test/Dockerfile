FROM node:iron-slim

RUN apt-get update

COPY ./package.json /test_api/
COPY ./tsconfig.json /test_api/
# COPY ./src /test_api/src
RUN npm --prefix /test_api install

CMD ["npm", "--prefix", "/test_api", "run", "dev"]