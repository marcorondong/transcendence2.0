# Use an official Node.js image as base
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

RUN npm run build
# Expose the Fastify server port
EXPOSE 6969
# CMD ["tail", "-f", "/dev/null"]
CMD ["node", "src/server.js"]
