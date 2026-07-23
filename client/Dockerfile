# Stage 1: Build Vite Client React application
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies first for Docker layer caching efficiency
COPY package*.json ./
RUN npm install

# Copy source and build assets
COPY . .

# Declare VITE_API_BASE_URL build arg so Vite injects it during compilation
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# Stage 2: Serve using lightweight Nginx web server
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
