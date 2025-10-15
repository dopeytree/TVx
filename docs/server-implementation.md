---
layout: default
title: Server Implementation
---

# Server Implementation

## Overview

TVx uses a custom Node.js server (`server.js`) instead of nginx to serve the application and handle logging. This document explains the implementation details, rationale, and key features.

## Architecture

```
Docker Container
├── Node.js (Alpine)
├── /usr/share/nginx/html/  (static files)
│   ├── index.html
│   ├── assets/
│   ├── loading-VHS.mp4
│   ├── env.js (generated at runtime)
│   └── server.js
└── Port 80
```

## Why Node.js Instead of Nginx?

The switch from nginx to Node.js was made to support:

1. **Server-side logging**: Capture client-side logs in Docker container logs
2. **Dynamic configuration**: Generate `env.js` at runtime using environment variables
3. **Custom endpoints**: Add `/log` endpoint for centralized logging
4. **Simpler deployment**: Single runtime (Node.js) instead of nginx + separate tools

### Trade-offs

**Advantages:**
- ✅ Custom logging endpoint
- ✅ Dynamic environment configuration
- ✅ Simpler Docker image (single runtime)
- ✅ Easy to extend with custom routes

**Disadvantages:**
- ⚠️ Less battle-tested than nginx for static file serving
- ⚠️ Requires implementing features nginx provides for free (range requests, compression, caching)
- ⚠️ Potentially lower performance under high load

## Server.js Implementation

### Core Functionality

The server handles three main responsibilities:

1. **Static file serving** - Serves React build artifacts
2. **Logging endpoint** - Receives logs from browser
3. **SPA routing** - Falls back to `index.html` for React Router

### Code Structure

```javascript
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 80;
const STATIC_DIR = '/usr/share/nginx/html';
```

### Key Features

#### 1. Logging Endpoint

**Route:** `POST /log`

Receives logs from the browser and outputs them to Docker logs:

```javascript
if (req.method === 'POST' && pathname === '/log') {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    try {
      const logData = JSON.parse(body);
      const timestamp = new Date().toISOString();
      const level = logData.level || 'info';
      const message = logData.message || body;
      console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`);
    } catch (e) {
      console.log(`[${new Date().toISOString()}] LOG: ${body}`);
    }
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
  });
  return;
}
```

**Usage from client:**
```typescript
// src/utils/logger.ts
const sendLog = async (level: string, message: string) => {
  await fetch('/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ level, message }),
  });
};
```

#### 2. HTTP Range Request Support

**Critical for video playback!** Browsers require range request support for video elements.

```javascript
// Handle range requests for video files
if (ext === '.mp4' && req.headers.range) {
  const range = req.headers.range;
  const parts = range.replace(/bytes=/, '').split('-');
  const start = parseInt(parts[0], 10);
  const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
  const chunksize = (end - start) + 1;

  const head = {
    'Content-Range': `bytes ${start}-${end}/${stats.size}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': chunksize,
    'Content-Type': contentType,
  };

  res.writeHead(206, head);
  fs.createReadStream(filePath, { start, end }).pipe(res);
}
```

**Why this is essential:**
- Browsers use range requests to seek in videos
- Without this, video elements fail with `NotSupportedError`
- Nginx supports this automatically
- See bug fix: `docs/bugfix/2025-10/vhs-video-not-playing.md`

#### 3. MIME Type Handling

```javascript
const contentType = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webmanifest': 'application/manifest+json'
}[ext] || 'text/plain';
```

#### 4. SPA Fallback

Falls back to `index.html` for React Router routes:

```javascript
fs.stat(filePath, (err, stats) => {
  if (err || !stats.isFile()) {
    filePath = path.join(STATIC_DIR, 'index.html');
  }
  // ... serve file
});
```

## Environment Configuration

### Runtime Generation

Environment variables are injected at container startup:

```dockerfile
CMD sh -c "envsubst < /usr/share/nginx/html/env.js.template > /usr/share/nginx/html/env.js && node /usr/share/nginx/html/server.js"
```

### Template (`env.js.template`)

```javascript
window.ENV = {
  VITE_M3U_URL: "$VITE_M3U_URL",
  VITE_XMLTV_URL: "$VITE_XMLTV_URL"
};
```

### Generated (`env.js`)

```javascript
window.ENV = {
  VITE_M3U_URL: "http://192.168.22.2:8000/api/channels.m3u",
  VITE_XMLTV_URL: "http://192.168.22.2:8000/api/xmltv.xml"
};
```

### Loading in Browser

`index.html` includes:
```html
<script src="/env.js"></script>
```

Client code accesses via:
```typescript
const m3uUrl = (window as any).ENV?.VITE_M3U_URL || 'default-url';
```

## Logging System

### Architecture

```
Browser (React App)
    ↓ fetch('/log', ...)
Node.js Server (/log endpoint)
    ↓ console.log(...)
Docker Container Logs
    ↓ docker logs tvx
User/Admin
```

### Client-Side Logger

**Location:** `src/utils/logger.ts`

```typescript
export const logger = {
  log: (message: string) => {
    console.log(message);
    sendLog('info', message);
  },
  error: (message: string) => {
    console.error(message);
    sendLog('error', message);
  },
  warn: (message: string) => {
    console.warn(message);
    sendLog('warn', message);
  },
  info: (message: string) => {
    console.info(message);
    sendLog('info', message);
  },
};
```

### Usage Examples

```typescript
// Channel loading
logger.log(`Loaded ${channels.length} channels`);

// Channel switching
logger.info(`Channel changed to: ${channel.name}`);

// Errors
logger.error(`Failed to parse XMLTV: ${error}`);

// Stream URLs
logger.log(`Loaded stream URL for ${channel.name}: ${channel.url}`);
```

### Log Format

```
[ISO-8601-TIMESTAMP] LEVEL: MESSAGE
```

Example:
```
[2025-10-15T20:18:28.467Z] INFO: Loaded 20 channels
[2025-10-15T20:18:28.481Z] INFO: Channel changed to: Favourite TV Shows
[2025-10-15T20:18:28.529Z] INFO: Loaded EPG data for 467 programmes
```

## Performance Considerations

### Current Implementation

- ✅ Simple and easy to understand
- ✅ Sufficient for typical TVx usage (personal/family use)
- ⚠️ Not optimized for high traffic

### Missing Features (vs Nginx)

1. **No gzip compression** - Nginx compresses responses automatically
2. **No caching headers** - Nginx sets cache headers for static assets
3. **No connection pooling** - Nginx handles this efficiently
4. **No rate limiting** - Nginx can limit request rates
5. **No HTTPS** - Typically handled by reverse proxy

### Recommended Production Setup

For production deployments, consider:

1. **Use nginx as reverse proxy:**
   ```nginx
   server {
     listen 443 ssl;
     location / {
       proxy_pass http://localhost:8777;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
     }
   }
   ```

2. **Or add compression to server.js:**
   ```javascript
   const zlib = require('zlib');
   // Compress responses
   ```

3. **Or switch back to nginx + separate logging service**

## Testing

### Test Static File Serving

```bash
curl http://localhost:8777/
```

Should return the React app HTML.

### Test Logging Endpoint

```bash
curl -X POST http://localhost:8777/log \
  -H "Content-Type: application/json" \
  -d '{"level":"info","message":"Test log"}'
```

Should return `OK` and appear in Docker logs.

### Test Range Requests

```bash
curl -I -H "Range: bytes=0-1023" http://localhost:8777/loading-VHS.mp4
```

Should return:
```
HTTP/1.1 206 Partial Content
Content-Range: bytes 0-1023/9518187
Accept-Ranges: bytes
```

### View Logs

```bash
docker logs -f tvx
```

## Troubleshooting

### Video Not Playing

**Symptom:** Video elements show `NotSupportedError`

**Solution:** Ensure range request support is implemented (see above)

**Debug:**
```bash
curl -I -H "Range: bytes=0-1023" http://localhost:8777/loading-VHS.mp4
```

Should return `206 Partial Content`, not `200 OK`.

### Logs Not Appearing

**Symptom:** Browser logs don't appear in Docker logs

**Debug:**
```bash
# Test logging endpoint
curl -X POST http://localhost:8777/log -d '{"level":"test","message":"test"}'

# Check if it appears
docker logs tvx | tail -1
```

### Environment Variables Not Loading

**Symptom:** App uses default URLs instead of environment variables

**Debug:**
```bash
# Check if env.js was generated
docker exec tvx cat /usr/share/nginx/html/env.js

# Should show your URLs, not $VITE_M3U_URL
```

## Future Improvements

### Potential Enhancements

1. **Add gzip compression** for better performance
2. **Implement caching headers** for static assets
3. **Add health check endpoint** (`/health`)
4. **Add metrics endpoint** for monitoring
5. **Implement log levels** (debug, info, warn, error)
6. **Add log rotation** to prevent disk fill
7. **WebSocket support** for real-time updates
8. **API endpoints** for settings management

### Alternative Approaches

1. **Keep nginx, add logging service:**
   - Use nginx for static files (faster, more features)
   - Add separate Node.js service for logging
   - More complex architecture but better performance

2. **Use Express.js:**
   - More mature server framework
   - Built-in middleware for compression, caching, etc.
   - Easier to extend

3. **Use existing static server packages:**
   - `serve-static`
   - `http-server`
   - Battle-tested, includes range requests, etc.

## References

- Bug Fix: Range Request Support - `docs/bugfix/2025-10/vhs-video-not-playing.md`
- HTTP Range Requests (RFC 7233): https://tools.ietf.org/html/rfc7233
- Node.js HTTP Server: https://nodejs.org/api/http.html
- Docker Environment Variables: https://docs.docker.com/engine/reference/run/#env-environment-variables

## Related Files

- `server.js` - The server implementation
- `env.js.template` - Environment variable template
- `Dockerfile` - Container build configuration
- `src/utils/logger.ts` - Client-side logger
- `docs/bugfix/2025-10/vhs-video-not-playing.md` - Range request bug fix
