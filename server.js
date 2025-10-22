const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 80;
const STATIC_DIR = '/usr/share/nginx/html';
const LOG_DIR = '/config';
const LOG_FILE = path.join(LOG_DIR, 'tvx.log');

// Logging configuration
const LOG_LEVEL = process.env.LOG_LEVEL || 'info'; // 'silent', 'error', 'warn', 'info', 'verbose'
const LOG_ACCESS = process.env.LOG_ACCESS === 'true'; // Access logging disabled by default

// Request timeout configuration (prevent slowloris attacks)
const REQUEST_TIMEOUT = 30000; // 30 seconds
const MAX_BODY_SIZE = 1048576; // 1MB max for POST bodies
const MAX_URL_LENGTH = 2048; // Prevent excessively long URLs
const MAX_HEADER_SIZE = 8192; // 8KB max for headers

// Allowed HTTP methods
const ALLOWED_METHODS = new Set(['GET', 'HEAD', 'POST', 'OPTIONS']);

// Suspicious patterns in URLs (basic path traversal attempts)
const SUSPICIOUS_PATTERNS = [
  /\.\.\//i,           // Directory traversal
  /\.\.\\/i,           // Windows path traversal
  /%2e%2e%2f/i,        // URL encoded traversal
  /%252e%252e%252f/i,  // Double URL encoded
];

// Rate limiting configuration for home use
// Limits are generous for typical family usage (2-5 devices)
const RATE_LIMITS = {
  log: { maxRequests: 120, windowMs: 60000 },      // 120 logs per minute (2/sec avg)
  general: { maxRequests: 300, windowMs: 60000 }   // 300 requests per minute (5/sec avg)
};

// In-memory rate limit store
const rateLimitStore = new Map();

// Clean up old entries every 5 minutes to prevent memory bloat
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now - data.resetTime > 300000) { // 5 minutes
      rateLimitStore.delete(key);
    }
  }
}, 300000).unref();

// Rate limiter function
function checkRateLimit(identifier, limitType) {
  const limit = RATE_LIMITS[limitType];
  const now = Date.now();
  const key = `${identifier}:${limitType}`;
  
  let limitData = rateLimitStore.get(key);
  
  // Initialize or reset if window expired
  if (!limitData || now > limitData.resetTime) {
    limitData = {
      count: 0,
      resetTime: now + limit.windowMs
    };
    rateLimitStore.set(key, limitData);
  }
  
  // Check if limit exceeded
  if (limitData.count >= limit.maxRequests) {
    const resetIn = Math.ceil((limitData.resetTime - now) / 1000);
    return { allowed: false, resetIn };
  }
  
  // Increment counter
  limitData.count++;
  return { allowed: true, remaining: limit.maxRequests - limitData.count };
}

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Helper function to sanitize user-controlled log input
function sanitizeForLog(input) {
  if (typeof input !== 'string') return '';
  // Remove line breaks and non-printable ASCII (except tab, optionally)
  return input.replace(/[\r\n\x00-\x09\x0B-\x1F\x7F]/g, ' ');
}

// Helper function to write logs to both console and file
function writeLog(message, level = 'info') {
  const logEntry = `${message}\n`;
  console.log(message);
  
  // Append to log file
  fs.appendFile(LOG_FILE, logEntry, (err) => {
    if (err) {
      console.error('Failed to write to log file:', err);
    }
  });
}

// Helper function for access logging
function logAccess(req, res, statusCode, filePath = '') {
  if (!LOG_ACCESS) return;
  
  const clientIp = req.socket.remoteAddress || 'unknown';
  const method = req.method;
  const url = req.url;
  const userAgent = req.headers['user-agent'] || 'unknown';
  const timestamp = new Date().toISOString();
  
  // Format: [timestamp] IP METHOD URL STATUS "User-Agent" [file]
  let logMessage = `[${timestamp}] ${clientIp} ${method} ${url} ${statusCode}`;
  
  // Add file path for static files (helps track streaming activity)
  if (filePath) {
    const fileName = path.basename(filePath);
    const ext = path.extname(filePath);
    
    // Identify streaming types
    if (ext === '.m3u8') {
      logMessage += ` -> HLS_PLAYLIST: ${fileName}`;
    } else if (ext === '.ts') {
      logMessage += ` -> HLS_SEGMENT: ${fileName}`;
      if (req.headers.range) {
        logMessage += ` [Range: ${req.headers.range}]`;
      }
    } else if (ext === '.mp4' || ext === '.webm') {
      logMessage += ` -> VIDEO: ${fileName}`;
      if (req.headers.range) {
        logMessage += ` [Range: ${req.headers.range}]`;
      }
    } else if (ext === '.m3u') {
      logMessage += ` -> M3U_PLAYLIST: ${fileName}`;
    } else {
      logMessage += ` -> ${fileName}`;
    }
  }
  
  // Log verbose user agent for debugging if LOG_LEVEL is verbose
  if (LOG_LEVEL === 'verbose') {
    logMessage += ` "${userAgent}"`;
  }
  
  writeLog(logMessage, 'access');
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  // Get client identifier (IP address)
  const clientIp = req.socket.remoteAddress || 'unknown';
  
  // Validate HTTP method
  if (!ALLOWED_METHODS.has(req.method)) {
    res.writeHead(405, { 
      'Content-Type': 'text/plain',
      'Allow': Array.from(ALLOWED_METHODS).join(', ')
    });
    res.end('Method Not Allowed');
    writeLog(`[${new Date().toISOString()}] WARN: Method ${req.method} not allowed from ${clientIp}`);
    return;
  }

  // Fast path for OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Allow': Array.from(ALLOWED_METHODS).join(', '),
      // Narrow as needed; adjust if you expose /log cross-origin
      'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'content-type',
      'Access-Control-Max-Age': '600'
    });
    res.end();
    return;
  }

  // Enforce max header size (protect against oversized header attacks)
  const headerSize = Buffer.byteLength((req.rawHeaders || []).join(''), 'utf8');
  if (headerSize > MAX_HEADER_SIZE) {
    res.writeHead(431, { 'Content-Type': 'text/plain' });
    res.end('Request Header Fields Too Large');
    writeLog(`[${new Date().toISOString()}] WARN: Headers too large from ${clientIp} (${headerSize} bytes)`);
    return;
  }

  // Validate URL length
  if (req.url.length > MAX_URL_LENGTH) {
    res.writeHead(414, { 'Content-Type': 'text/plain' });
    res.end('URI Too Long');
    writeLog(`[${new Date().toISOString()}] WARN: Excessively long URL from ${clientIp}`);
    return;
  }
  
  // Check for suspicious patterns in URL
  const urlLower = pathname.toLowerCase();
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(urlLower)) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Bad Request');
      writeLog(`[${new Date().toISOString()}] SECURITY: Suspicious URL pattern detected from ${clientIp}: ${req.url}`);
      return;
    }
  }
  
  // Set timeout for request
  req.setTimeout(REQUEST_TIMEOUT, () => {
    res.writeHead(408, { 'Content-Type': 'text/plain' });
    res.end('Request Timeout');
  });
  
  // Add security headers for all responses
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'; connect-src 'self' http: https:; img-src 'self' data: blob: http: https:; media-src 'self' blob: http: https:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'");

  // Rate limit for logging endpoint (prevent log spam)
  if (req.method === 'POST' && pathname === '/log') {
    // Validate Content-Type header (support sendBeacon string payloads)
    const contentType = req.headers['content-type'] || '';
    const isJson = contentType.includes('application/json');
    const isBeaconText = contentType.startsWith('text/plain'); // sendBeacon default for strings
    if (!isJson && !isBeaconText) {
      res.writeHead(415, { 'Content-Type': 'text/plain' });
      res.end('Unsupported Media Type - Expected application/json');
      return;
    }
    
    const rateCheck = checkRateLimit(clientIp, 'log');
    if (!rateCheck.allowed) {
      res.writeHead(429, { 
        'Content-Type': 'text/plain',
        'Retry-After': rateCheck.resetIn.toString()
      });
      res.end(`Rate limit exceeded. Try again in ${rateCheck.resetIn} seconds.`);
      writeLog(`[${new Date().toISOString()}] WARN: Rate limit exceeded for ${clientIp} on /log endpoint`);
      return;
    }
    
    // Continue with log handling
    let body = '';
    let bodySize = 0;
    
    req.on('data', chunk => {
      bodySize += chunk.length;
      
      // Prevent large payload attacks
      if (bodySize > MAX_BODY_SIZE) {
        res.writeHead(413, { 'Content-Type': 'text/plain' });
        res.end('Payload Too Large');
        req.destroy();
        return;
      }
      
      body += chunk;
    });
    req.on('end', () => {
      const timestamp = new Date().toISOString();
      try {
        let logData;
        if (isJson) {
          logData = JSON.parse(body);
        } else {
          // text/plain beacon: treat as a single log line
          logData = { level: 'info', message: body };
        }
        
        // Handle batched logs from client
        if (Array.isArray(logData.logs)) {
          // Limit number of logs in a batch
          const maxBatchSize = 100;
          const logsToProcess = logData.logs.slice(0, maxBatchSize);
          
          logsToProcess.forEach(log => {
            const level = log.level || 'info';
            const message = sanitizeForLog(log.message || '');
            const logTime = log.timestamp ? new Date(log.timestamp).toISOString() : timestamp;
            writeLog(`[${logTime}] ${level.toUpperCase()}: ${message}`);
          });
          
          if (logData.logs.length > maxBatchSize) {
            writeLog(`[${timestamp}] WARN: Batch truncated from ${logData.logs.length} to ${maxBatchSize} logs`);
          }
        } else {
          // Handle single log (backward compatible)
          const level = logData.level || 'info';
          const message = sanitizeForLog(logData.message || body);
          writeLog(`[${timestamp}] ${level.toUpperCase()}: ${message}`);
        }
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('OK');
        logAccess(req, res, 200, '[Client Log Received]');
      } catch (e) {
        // Don't log full body if JSON parse fails (could be malicious)
        writeLog(`[${new Date().toISOString()}] ERROR: Invalid JSON in log request from ${clientIp}`);
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Bad Request - Invalid JSON');
        logAccess(req, res, 400);
      }
    });
    
    req.on('error', (err) => {
      writeLog(`[${new Date().toISOString()}] ERROR: Request error on /log - ${err.message}`);
    });
    return;
  }

  // General rate limiting for all other requests
  const rateCheck = checkRateLimit(clientIp, 'general');
  if (!rateCheck.allowed) {
    res.writeHead(429, { 
      'Content-Type': 'text/plain',
      'Retry-After': rateCheck.resetIn.toString()
    });
    res.end(`Too many requests. Please wait ${rateCheck.resetIn} seconds.`);
    return;
  }

  // Serve static files
  // Safely resolve requested file within static directory
  let requestedPath = pathname === '/' ? 'index.html' : pathname;
  // Prevent null bytes (extra precaution)
  if (requestedPath.includes('\0')) {
    res.writeHead(400);
    res.end('Bad Request');
    return;
  }
  // Remove leading slash to prevent absolute path issues with resolve
  if (requestedPath.startsWith('/')) requestedPath = requestedPath.slice(1);
  // Resolve the final file path and ensure it's inside STATIC_DIR
  let filePath = path.resolve(STATIC_DIR, requestedPath);
  if (!filePath.startsWith(STATIC_DIR + path.sep)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      filePath = path.join(STATIC_DIR, 'index.html');
      stats = null;
    }

    // Re-stat the file if we switched to index.html
    if (!stats) {
      fs.stat(filePath, (err, stats) => {
        if (err) {
          res.writeHead(404);
          res.end('Not Found');
          return;
        }
        serveFile(filePath, stats);
      });
    } else {
      serveFile(filePath, stats);
    }
  });

  function serveFile(filePath, stats) {
    const ext = path.extname(filePath).toLowerCase();
    
    // Whitelist allowed file extensions
    const allowedExtensions = new Set([
      '.html', '.css', '.js', '.json', '.png', '.jpg', '.jpeg', 
      '.ico', '.webmanifest', '.txt', '.svg', '.woff', 
      '.woff2', '.ttf', '.eot',
      // HLS streaming formats
      '.m3u8', '.ts', '.m3u',
      // Video formats (for loading screen or fallback)
      '.mp4', '.webm'
    ]);
    
    if (!allowedExtensions.has(ext)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Forbidden - File type not allowed');
      writeLog(`[${new Date().toISOString()}] SECURITY: Attempted access to disallowed file type ${ext} from ${clientIp}`);
      return;
    }
    
    const contentType = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.ico': 'image/x-icon',
      '.webmanifest': 'application/manifest+json; charset=utf-8',
      '.txt': 'text/plain; charset=utf-8',
      '.svg': 'image/svg+xml',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.ttf': 'font/ttf',
      '.eot': 'application/vnd.ms-fontobject',
      // HLS streaming
      '.m3u8': 'application/vnd.apple.mpegurl',
      '.ts': 'video/mp2t',
      '.m3u': 'audio/x-mpegurl',
      // Video formats
      '.mp4': 'video/mp4',
      '.webm': 'video/webm'
    }[ext] || 'application/octet-stream';
    
    // Cache control headers for performance
    const cacheControl = {
      '.html': 'no-cache',                           // Always revalidate HTML
      '.css': 'public, max-age=31536000, immutable', // Cache CSS for 1 year
      '.js': 'public, max-age=31536000, immutable',  // Cache JS for 1 year
      '.png': 'public, max-age=86400',               // Cache images for 1 day
      '.jpg': 'public, max-age=86400',
      '.ico': 'public, max-age=86400',
      '.webmanifest': 'public, max-age=86400',
      '.svg': 'public, max-age=31536000, immutable',
      '.woff': 'public, max-age=31536000, immutable',
      '.woff2': 'public, max-age=31536000, immutable',
      '.ttf': 'public, max-age=31536000, immutable',
      '.eot': 'public, max-age=31536000, immutable',
      // HLS streaming - don't cache playlists, short cache for segments
      '.m3u8': 'no-cache',                           // Playlist changes frequently
      '.ts': 'public, max-age=3600',                 // Cache segments for 1 hour
      '.m3u': 'no-cache',
      // Video files
      '.mp4': 'public, max-age=3600',                // Cache videos for 1 hour
      '.webm': 'public, max-age=3600'
    }[ext] || 'no-cache';

    // Handle range requests for video/streaming files
    const supportsRangeRequests = ['.mp4', '.webm', '.ts'].includes(ext);
    if (supportsRangeRequests && req.headers.range) {
      const range = req.headers.range;
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
      
      // Validate range values
      if (isNaN(start) || isNaN(end) || start < 0 || end >= stats.size || start > end) {
        res.writeHead(416, { 'Content-Type': 'text/plain', 'Content-Range': `bytes */${stats.size}` });
        res.end('Range Not Satisfiable');
        return;
      }
      
      const chunksize = (end - start) + 1;

      const head = {
        'Content-Range': `bytes ${start}-${end}/${stats.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType,
        'Cache-Control': cacheControl
      };

      res.writeHead(206, head);
      const stream = fs.createReadStream(filePath, { start, end });
      
      // Log video streaming
      logAccess(req, res, 206, filePath);
      
      // Handle stream errors
      stream.on('error', (err) => {
        writeLog(`[${new Date().toISOString()}] ERROR: Stream error for ${filePath} - ${err.message}`);
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
        }
      });
      
      stream.pipe(res);
    } else {
      // Normal file serving
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Not Found');
          logAccess(req, res, 404);
          return;
        }

        const headers = { 
          'Content-Type': contentType,
          'Cache-Control': cacheControl
        };
        
        // Add Accept-Ranges header for video/streaming files that support range requests
        if (supportsRangeRequests) {
          headers['Accept-Ranges'] = 'bytes';
        }

        if (req.method === 'HEAD') {
          res.writeHead(200, headers);
          res.end();
          logAccess(req, res, 200, filePath);
          return;
        }
        res.writeHead(200, headers);
        res.end(data);
        logAccess(req, res, 200, filePath);
      });
    }
  }
});

// Graceful shutdown handling
function gracefulShutdown(signal, exitCode = 0) {
  writeLog(`\n${signal} received. Starting graceful shutdown...`);
  
  server.close(() => {
    writeLog('HTTP server closed. Exiting process.');
    process.exit(exitCode);
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    writeLog('Forced shutdown after timeout');
    process.exit(exitCode || 1);
  }, 10000);
}

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM', 0));
process.on('SIGINT', () => gracefulShutdown('SIGINT', 0));

// Handle uncaught errors - log and exit immediately with non-zero code
process.on('uncaughtException', (err) => {
  writeLog(`[${new Date().toISOString()}] FATAL: Uncaught Exception - ${err.message}`);
  writeLog(`[${new Date().toISOString()}] Stack: ${err.stack}`);
  writeLog(`[${new Date().toISOString()}] Process terminating with exit code 1`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  writeLog(`[${new Date().toISOString()}] FATAL: Unhandled Rejection at ${promise}`);
  writeLog(`[${new Date().toISOString()}] Reason: ${reason}`);
  if (reason && reason.stack) {
    writeLog(`[${new Date().toISOString()}] Stack: ${reason.stack}`);
  }
  writeLog(`[${new Date().toISOString()}] Process terminating with exit code 1`);
  process.exit(1);
});

// Set maximum connections to prevent resource exhaustion
server.maxConnections = 100; // Reasonable for home use

// Set keep-alive timeout (default is 5 seconds, we'll set to 65 for nginx compatibility)
server.keepAliveTimeout = 65000;

// Set headers timeout (should be greater than keepAliveTimeout)
server.headersTimeout = 66000;

server.listen(PORT, () => {
  writeLog(`Server running on port ${PORT}`);
  writeLog(`Process ID: ${process.pid}`);
  writeLog(`Node version: ${process.version}`);
  writeLog(`Max connections: ${server.maxConnections}`);
  writeLog(`Static directory: ${STATIC_DIR}`);
  writeLog(`Log level: ${LOG_LEVEL}`);
  writeLog(`Access logging: ${LOG_ACCESS ? 'enabled' : 'disabled'}`);
});
