# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Install gettext for envsubst
RUN apk add --no-cache gettext

# Set default environment variables
ENV VITE_M3U_URL=http://your-tunarr-ip-address:8000/api/channels.m3u
ENV VITE_XMLTV_URL=http://your-tunarr-ip-address:8000/api/xmltv.xml

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy env template
COPY env.js.template /usr/share/nginx/html/env.js.template

# Create config directory
RUN mkdir -p /config

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx with env substitution
CMD sh -c "envsubst < /usr/share/nginx/html/env.js.template > /usr/share/nginx/html/env.js && nginx -g 'daemon off;'"
