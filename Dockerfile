FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Remove dev dependencies to reduce size
RUN npm prune --production

# Railway dynamic port
EXPOSE 8080

# Start application using direct node command for stability
CMD ["node", "dist/server.js"]
