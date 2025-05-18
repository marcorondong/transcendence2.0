FROM node:23-bullseye-slim

# No need for now
# RUN apt-get update -y && apt-get install -y

WORKDIR /auth_api

COPY ./package.json ./
COPY ./package-lock.json ./
COPY ./tsconfig.json ./
COPY ./src ./
RUN npm clean-install

# TODO uncomment below line in production
# CMD ["npm run start"]
# TODO remove below line in production
CMD ["npm", "run", "dev"]