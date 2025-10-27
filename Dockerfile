# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files and lockfile
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

# Install gettext for envsubst
RUN apk add --no-cache gettext

# Create non-root user for security (using nobody UID/GID for better compatibility)
RUN addgroup -g 99 -S appuser && \
    adduser -S appuser -u 99 -G appuser

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy server.js
COPY server.js /usr/share/nginx/html/server.js

# Copy env template
COPY env.js.template /usr/share/nginx/html/env.js.template

# Set ownership of application files
RUN chown -R appuser:appuser /usr/share/nginx/html

# Switch to non-root user
USER appuser

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start server
CMD ["sh", "-c", "envsubst < /usr/share/nginx/html/env.js.template > /usr/share/nginx/html/env.js && node /usr/share/nginx/html/server.js"]
