---
layout: default
title: VHS Video Not Playing Fix
parent: Bug Fixes
nav_order: 2
---

# Bug Fix: Loading VHS Video Not Playing After Node.js Server Implementation

**Date:** October 15, 2025  
**Branch:** logging  
**Issue:** Loading-VHS.mp4 video not playing during channel changes after switching from nginx to Node.js server

---

## Problem Description

After implementing `server.js` to replace nginx (commit 7834b72), the loading-VHS.mp4 video stopped playing when:
- Channels were selected
- Up/down arrow keys were pressed to change channels
- Before the main stream was ready/buffering

The vintage TV effect (WebGL canvas) would show a black screen instead of the VHS loading animation that previously worked with nginx.

---

## Root Cause Analysis

### Step 1: Initial Investigation - Video Element Visibility

Initially suspected the video element rendering was the issue. The loading video element had been changed to use conditional visibility:

```tsx
// SUSPECTED ISSUE (but wasn't the actual problem):
{% raw %}
<video
  ref={loadingVideoRef}
  style={{ display: 'none' }}
  ...
/>
{% endraw %}
```

Changed to:
```tsx
{% raw %}
<video
  ref={loadingVideoRef}
  style={{ position: 'absolute', width: '1px', height: '1px', opacity: 0, pointerEvents: 'none' }}
  ...
/>
{% endraw %}
```

This change allowed the browser to technically "see" the video element, but **the video still didn't play**.

### Step 2: Log Analysis - The Real Culprit

Docker logs revealed the actual error:

```log
[2025-10-15T20:14:09.886Z] ERROR: Loading video play error: NotSupportedError: The operation is not supported.
[2025-10-15T20:14:09.887Z] ERROR: Loading video restart error: NotSupportedError: The operation is not supported.
[2025-10-15T20:14:09.888Z] ERROR: Loading video failed to load: [object Event]
```

The `NotSupportedError` indicated the browser was rejecting the video file entirely.

### Step 3: HTTP Range Request Testing

Tested the Node.js server's HTTP response for video files:

```bash
curl -I -H "Range: bytes=0-1023" http://localhost:8777/loading-VHS.mp4
```

**Result from Node.js server (BROKEN):**
```
HTTP/1.1 200 OK
Content-Type: video/mp4
```

**Result from nginx (WORKING):**
```
HTTP/1.1 206 Partial Content
Content-Range: bytes 0-1023/9518187
Accept-Ranges: bytes
Content-Length: 1024
Content-Type: video/mp4
```

### The Issue

**Video elements in browsers REQUIRE HTTP Range Request support (RFC 7233)** to:
- Load video metadata
- Seek within the video
- Play the video properly (especially for larger files)

Without range request support, browsers reject the video with `NotSupportedError`. Nginx supports range requests automatically, but the simple Node.js server implementation didn't.

---

## The Fix

### Modified `server.js` to Support HTTP Range Requests

Added range request handling for MP4 files:

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
```

---

## Testing Commands

### 1. Build Docker Image

```bash
cd /Users/ed/TVx
docker build -t tvx:latest .
```

### 2. Remove Old Container

```bash
docker rm -f tvx
```

### 3. Run Container with Environment Variables

```bash
docker run -d \
  --name tvx \
  -p 8777:80 \
  -e VITE_M3U_URL=http://192.168.22.2:8000/api/channels.m3u \
  -e VITE_XMLTV_URL=http://192.168.22.2:8000/api/xmltv.xml \
  tvx:latest
```

### 4. Test Range Request Support

```bash
curl -I -H "Range: bytes=0-1023" http://localhost:8777/loading-VHS.mp4
```

**Expected output (FIXED):**
```
HTTP/1.1 206 Partial Content
Content-Range: bytes 0-1023/9518187
Accept-Ranges: bytes
Content-Length: 1024
Content-Type: video/mp4
```

### 5. View Logs

```bash
docker logs -f tvx
```

### 6. Combined Build & Run Command

```bash
cd /Users/ed/TVx && \
docker build -t tvx:latest . && \
docker rm -f tvx && \
docker run -d \
  --name tvx \
  -p 8777:80 \
  -e VITE_M3U_URL=http://192.168.22.2:8000/api/channels.m3u \
  -e VITE_XMLTV_URL=http://192.168.22.2:8000/api/xmltv.xml \
  tvx:latest
```

---

## Verification

After the fix:

1. Open `http://localhost:8777` in browser
2. Wait for channels to load (check that URLs are correct in browser Network tab)
3. Select a channel or press up/down arrow keys
4. **The loading-VHS.mp4 video now plays** with vintage TV effects during the 2-second channel change buffer period
5. Docker logs show successful video loading:
   ```
   [2025-10-15T20:18:45.123Z] INFO: Loading video loaded successfully
   [2025-10-15T20:18:45.124Z] INFO: Loading video started playing
   ```

---

## Files Modified

- `/Users/ed/TVx/server.js` - Added HTTP Range Request support for MP4 files
- `/Users/ed/TVx/src/components/VideoPlayer.tsx` - Changed loading video element from `display: 'none'` to invisible but playable style

---

## Technical Notes

### HTTP Range Requests (RFC 7233)

Range requests allow clients to request specific byte ranges of a file. This is essential for:
- **Video/Audio streaming**: Browsers need to load metadata first, then stream chunks
- **Seeking**: Jumping to different parts of the video
- **Resuming downloads**: Continuing interrupted downloads
- **Bandwidth optimization**: Only loading what's needed

### Key Headers

- **Request**: `Range: bytes=0-1023` (client requests bytes 0-1023)
- **Response**: `206 Partial Content` (server returns partial content)
- **Response**: `Content-Range: bytes 0-1023/9518187` (what's being sent / total size)
- **Response**: `Accept-Ranges: bytes` (server supports range requests)

### Why Nginx Worked

Nginx has built-in support for range requests. It automatically:
- Parses `Range` headers
- Returns `206` responses with proper headers
- Streams file chunks efficiently

### Why Simple Node.js Didn't Work

The basic `fs.readFile()` implementation:
- Always reads the entire file
- Always returns `200 OK`
- Ignores `Range` headers
- Causes browsers to reject video files

---

## Related Commits

- **7834b72** - "include server.js persistent storage" (introduced the bug)
- **8fe4559** - "Revert 'include server.js persistent storage'" (nginx still worked)
- **Current** - Fixed by adding range request support to server.js

---

## Lessons Learned

1. **Video files require HTTP Range Request support** - This is not optional for modern browsers
2. **Test all media types when switching servers** - Different file types have different requirements
3. **Nginx provides many features "for free"** - When replacing it, all those features must be reimplemented
4. **Browser console errors can be misleading** - "NotSupportedError" didn't clearly indicate missing range support
5. **Use curl to test HTTP headers** - Essential for debugging server-level issues

---

## Future Improvements

Consider using a proper Node.js static file server library like:
- **express** with **express-static** middleware
- **serve-static** package
- **koa-static** for Koa framework

These libraries handle:
- Range requests
- ETag caching
- Compression
- MIME types
- Error handling

Or keep using nginx for production deployments (it's battle-tested for a reason).
