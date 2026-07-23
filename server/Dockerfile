# Use Node.js Alpine base image
FROM node:20-alpine
WORKDIR /app

# Configure Node environment
ENV NODE_ENV=production

# Install production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy source code
COPY . .

# Expose port 5000
EXPOSE 5000

# Start Express server
CMD ["node", "src/server.js"]
