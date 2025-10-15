const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 80;
const STATIC_DIR = '/usr/share/nginx/html';

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

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

  // Serve static files
  let filePath = path.join(STATIC_DIR, pathname === '/' ? 'index.html' : pathname);

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
    const ext = path.extname(filePath);
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
    } else {
      // Normal file serving
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Not Found');
          return;
        }

        const headers = { 'Content-Type': contentType };
        
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

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
