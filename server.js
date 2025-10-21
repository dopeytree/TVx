const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 80;
const STATIC_DIR = '/usr/share/nginx/html';
const LOG_DIR = '/config';
const LOG_FILE = path.join(LOG_DIR, 'tvx.log');

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
}, 300000);

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
function writeLog(message) {
  const logEntry = `${message}\n`;
  console.log(message);
  
  // Append to log file
  fs.appendFile(LOG_FILE, logEntry, (err) => {
    if (err) {
      console.error('Failed to write to log file:', err);
    }
  });
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
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Powered-By', ''); // Remove server fingerprinting

  // Rate limit for logging endpoint (prevent log spam)
  if (req.method === 'POST' && pathname === '/log') {
    // Validate Content-Type header
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
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
      
      body += chunk.toString('utf8', 0, Math.min(chunk.length, MAX_BODY_SIZE - bodySize + chunk.length));
    });
    req.on('end', () => {
      try {
        const logData = JSON.parse(body);
        const timestamp = new Date().toISOString();
        
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
      } catch (e) {
        // Don't log full body if JSON parse fails (could be malicious)
        writeLog(`[${new Date().toISOString()}] ERROR: Invalid JSON in log request from ${clientIp}`);
      }
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('OK');
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
      '.ico', '.mp4', '.webmanifest', '.txt', '.svg', '.woff', 
      '.woff2', '.ttf', '.eot'
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
      '.mp4': 'video/mp4',
      '.webmanifest': 'application/manifest+json; charset=utf-8',
      '.txt': 'text/plain; charset=utf-8',
      '.svg': 'image/svg+xml',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.ttf': 'font/ttf',
      '.eot': 'application/vnd.ms-fontobject'
    }[ext] || 'application/octet-stream';
    
    // Cache control headers for performance
    const cacheControl = {
      '.html': 'no-cache',                           // Always revalidate HTML
      '.css': 'public, max-age=31536000, immutable', // Cache CSS for 1 year
      '.js': 'public, max-age=31536000, immutable',  // Cache JS for 1 year
      '.png': 'public, max-age=86400',               // Cache images for 1 day
      '.jpg': 'public, max-age=86400',
      '.ico': 'public, max-age=86400',
      '.mp4': 'public, max-age=3600',                // Cache videos for 1 hour
      '.webmanifest': 'public, max-age=86400'
    }[ext] || 'no-cache';

    // Handle range requests for video files
    if (ext === '.mp4' && req.headers.range) {
      const range = req.headers.range;
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
      
      // Validate range values
      if (isNaN(start) || isNaN(end) || start < 0 || end >= stats.size || start > end) {
        res.writeHead(416, { 'Content-Type': 'text/plain' });
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
          return;
        }

        const headers = { 
          'Content-Type': contentType,
          'Cache-Control': cacheControl
        };
        
        // Add Accept-Ranges header for video files
        if (ext === '.mp4') {
          headers['Accept-Ranges'] = 'bytes';
        }

        res.writeHead(200, headers);
        res.end(data);
      });
    }
  }
});

// Graceful shutdown handling
function gracefulShutdown(signal) {
  writeLog(`\n${signal} received. Starting graceful shutdown...`);
  
  server.close(() => {
    writeLog('HTTP server closed. Exiting process.');
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    writeLog('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  writeLog(`[${new Date().toISOString()}] ERROR: Uncaught Exception - ${err.message}`);
  writeLog(err.stack);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  writeLog(`[${new Date().toISOString()}] ERROR: Unhandled Rejection at ${promise} - ${reason}`);
  gracefulShutdown('unhandledRejection');
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
});
