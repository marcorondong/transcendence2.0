# Base image with Node.js
FROM node:23-bullseye-slim

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (from context `users/`)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app code (from context `users/`)
COPY . .

# Generate Prisma client (after schema and node_modules are present)
RUN npx prisma generate

# Build TypeScript project (if applicable)
# RUN npx tsc

# Expose port (change if needed)
# EXPOSE 3000

# Reset working directory to root
# WORKDIR /

# Start the app
# CMD ["node", "/app/dist/app.js"]

# Run dev with auto-reset DB on container start
CMD npx prisma migrate reset --force --skip-seed && npm run dev
