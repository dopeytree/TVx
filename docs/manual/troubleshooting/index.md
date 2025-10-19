---
layout: default
title: Troubleshooting
parent: Manual
nav_order: 7
has_children: true
---

# Troubleshooting

Find solutions to common TVx issues quickly. Click on a category below to view detailed troubleshooting steps.

## Quick Issue Categories

| Category | Description |
|----------|-------------|
| [**Channels Not Loading**](channels/channels-not-loading.md) | Empty channel list, no channels appear |
| [**Video Not Playing**](video/video-not-playing.md) | Black screen, video playback issues |
| [**Loading VHS Not Playing**](video/loading-vhs-not-playing.md) | No loading animation during channel changes |
| [**EPG Not Showing**](epg/epg-not-showing.md) | Electronic Program Guide is empty |
| [**Docker Issues**](docker/docker-issues.md) | Container startup, rebuild problems |
| [**Performance Issues**](performance/performance-issues.md) | Video stuttering, slow channel switching |
| [**Browser Console Errors**](browser/browser-console-errors.md) | CORS, WebGL, network errors |
| [**Vintage TV Effects**](effects/vintage-tv-effects-issues.md) | CRT effects not working |
| [**Logging Issues**](logging/logging-issues.md) | No logs in Docker/browser |

## Getting Help

If none of these solutions work:

1. **Check Docker logs:**
   ```bash
   docker logs -f tvx
   ```

2. **Check browser console:**
   - Press F12
   - Look at Console and Network tabs
   - Screenshot any errors

3. **Check documentation:**
   - [Installation Guide](../install/installation.md)
   - [Usage Guide](usage-overview.md)
   - [Development Guide](../../development/index.md)
   - [Bug Fix Documentation](../../development/bugfix/README.md)

4. **Report an issue:**
   - Include Docker logs
   - Include browser console errors
   - Include steps to reproduce
   - Include environment details (OS, browser, Docker version)

## Debug Mode

Enable verbose logging:

```bash
# Run container with debug output
docker run -d --name tvx -p 8777:80 \
  -e VITE_M3U_URL=http://your-server:8000/api/channels.m3u \
  -e VITE_XMLTV_URL=http://your-server:8000/api/xmltv.xml \
  -e DEBUG=true \
  tvx:latest

# Follow logs
docker logs -f tvx
```

## Quick Diagnostic Checklist

Run these commands to gather diagnostic information:

```bash
# 1. Check container status
docker ps | grep tvx

# 2. Check environment variables
docker exec tvx env | grep VITE

# 3. Check if env.js is generated
docker exec tvx cat /usr/share/nginx/html/env.js

# 4. Check if video file exists
docker exec tvx ls -lh /usr/share/nginx/html/loading-VHS.mp4

# 5. Test video range requests
curl -I -H "Range: bytes=0-1023" http://localhost:8777/loading-VHS.mp4

# 6. Test Tunarr connectivity
curl -I http://your-tunarr-ip:8000/api/channels.m3u

# 7. View recent logs
docker logs tvx --tail 50
```

Save output from these commands when reporting issues.