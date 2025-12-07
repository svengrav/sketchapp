# SketchApp Frontend - React + Vite
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .

# Build-time environment variables
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_USE_DEMO_MODE=false

RUN npm run build

# Production stage - nginx
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
