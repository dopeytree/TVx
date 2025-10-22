# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Set Node options for better cross-platform compatibility
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Copy package files
COPY package*.json ./

# Install dependencies with increased timeout and network concurrency settings for better cross-platform builds
RUN npm ci --prefer-offline --no-audit --maxsockets 1

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

# Install gettext for envsubst
RUN apk add --no-cache gettext

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy server.js
COPY server.js /usr/share/nginx/html/server.js

# Copy env template
COPY env.js.template /usr/share/nginx/html/env.js.template

# Create config directory and set ownership
RUN mkdir -p /config && \
    chown -R nodejs:nodejs /usr/share/nginx/html /config

# Switch to non-root user
USER nodejs

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start server
CMD ["sh", "-c", "envsubst < /usr/share/nginx/html/env.js.template > /usr/share/nginx/html/env.js && node /usr/share/nginx/html/server.js"]
