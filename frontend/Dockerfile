# ==========================================
# Stage 1: Build React + Vite SPA
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./
RUN npm ci

# Copy source code and dissertation PDF
COPY . .

# Build production assets into /app/dist
RUN npm run build

# ==========================================
# Stage 2: Production Nginx Runtime
# ==========================================
FROM nginx:alpine

# Remove default configuration
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled SPA static assets
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
