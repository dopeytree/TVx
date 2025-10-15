---
layout: default
title: Troubleshooting
---

# Troubleshooting

Common issues and solutions for TVx.

## Channels Not Loading

### Issue: No channels appear after starting TVx

**Symptoms:**
- Empty channel list
- No error messages
- Blank screen

**Solutions:**

1. **Check environment variables:**
   ```bash
   # Verify URLs are set correctly
   docker exec tvx env | grep VITE
   ```
   
   Should show:
   ```
   VITE_M3U_URL=http://your-server:8000/api/channels.m3u
   VITE_XMLTV_URL=http://your-server:8000/api/xmltv.xml
   ```

2. **Verify Tunarr is accessible:**
   ```bash
   curl -I http://your-tunarr-ip:8000/api/channels.m3u
   ```
   
   Should return `200 OK`

3. **Check browser console (F12):**
   - Look for CORS errors
   - Check network tab for failed requests
   - Verify env.js is loaded

4. **Hard refresh browser:**
   - Chrome/Edge: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Firefox: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)

## Video Not Playing

### Issue: Video player shows black screen

**Symptoms:**
- Channel list loads fine
- Video area is black
- No playback controls

**Solutions:**

1. **Check HLS stream URL:**
   ```bash
   # View Docker logs
   docker logs tvx | grep "stream URL"
   ```

2. **Verify stream is accessible:**
   ```bash
   curl -I http://your-tunarr-ip:8000/stream/channels/CHANNEL_ID?streamMode=hls
   ```

3. **Check browser compatibility:**
   - Chrome/Edge: Full support
   - Firefox: May need native HLS
   - Safari: Native HLS support

4. **Test with different channel:**
   - Try selecting another channel
   - Check if specific channels fail

## Loading VHS Video Not Playing

### Issue: Black screen during channel changes instead of VHS loading animation

**Symptoms:**
- No loading animation when switching channels
- Black screen during buffering
- Docker logs show video errors

**Root Cause:**
Server doesn't support HTTP Range Requests (required for video elements)

**Solution:**
See bug fix documentation: `docs/bugfix/2025-10/vhs-video-not-playing.md`

**Quick Check:**
```bash
# Test range request support
curl -I -H "Range: bytes=0-1023" http://localhost:8777/loading-VHS.mp4
```

Should return `206 Partial Content`, not `200 OK`

## EPG Not Showing

### Issue: Electronic Program Guide is empty

**Symptoms:**
- Channels load but no program information
- Timeline is blank
- No show titles or descriptions

**Solutions:**

1. **Verify XMLTV URL:**
   ```bash
   curl http://your-tunarr-ip:8000/api/xmltv.xml | head -20
   ```
   
   Should show XML data

2. **Check XMLTV parsing:**
   - Open browser console (F12)
   - Look for parsing errors
   - Check network tab for XMLTV request

3. **Verify channel IDs match:**
   - XMLTV channel IDs must match M3U tvg-id values
   - Check Tunarr channel configuration

## Docker Issues

### Issue: Container won't start

**Symptoms:**
- `docker ps` doesn't show tvx
- Container exits immediately
- Port already in use

**Solutions:**

1. **Check port availability:**
   ```bash
   lsof -i :8777
   ```
   
   If occupied, stop the process or use different port

2. **Check container logs:**
   ```bash
   docker logs tvx
   ```

3. **Remove and recreate:**
   ```bash
   docker rm -f tvx
   docker run -d --name tvx -p 8777:80 \
     -e VITE_M3U_URL=http://your-server:8000/api/channels.m3u \
     -e VITE_XMLTV_URL=http://your-server:8000/api/xmltv.xml \
     tvx:latest
   ```

### Issue: Changes not reflected after rebuild

**Symptoms:**
- Code changes don't appear
- Old version still running
- Build shows cached layers

**Solutions:**

1. **Force rebuild without cache:**
   ```bash
   docker build --no-cache -t tvx:latest .
   ```

2. **Remove old container and images:**
   ```bash
   docker rm -f tvx
   docker rmi tvx:latest
   docker build -t tvx:latest .
   ```

## Performance Issues

### Issue: Video stuttering or buffering

**Solutions:**

1. **Check network connection:**
   - Ping Tunarr server
   - Check bandwidth usage
   - Verify network stability

2. **Reduce video quality:**
   - Open Settings (gear icon)
   - Lower video quality setting
   - Restart playback

3. **Check Tunarr server load:**
   - Monitor Tunarr CPU/memory usage
   - Check if transcoding is required
   - Verify disk I/O isn't bottlenecked

### Issue: Slow channel switching

**Solutions:**

1. **Check drive spin-up time:**
   - Loading video should play during spin-up
   - Verify loading video is working (see above)

2. **Optimize Tunarr:**
   - Pre-generate channel streams
   - Use faster storage for media
   - Enable stream caching

## Browser Console Errors

### Common errors and solutions:

**"CORS policy: No 'Access-Control-Allow-Origin' header"**
- Tunarr needs CORS enabled
- Check Tunarr settings/configuration
- May need reverse proxy configuration

**"NotSupportedError: The operation is not supported"**
- Usually video-related
- Check HTTP Range Request support
- See `docs/bugfix/2025-10/vhs-video-not-playing.md`

**"Failed to fetch"**
- Network connectivity issue
- Check Tunarr URL is correct
- Verify Tunarr is running

## Vintage TV Effects Issues

### Issue: CRT effects not working

**Symptoms:**
- Video plays but looks modern/flat
- No scanlines or curvature
- No chromatic aberration

**Solutions:**

1. **Check vintage TV setting:**
   - Open Settings (gear icon)
   - Verify "Vintage TV" is enabled

2. **Check WebGL support:**
   - Open browser console
   - Type: `!!document.createElement('canvas').getContext('webgl')`
   - Should return `true`

3. **Try different browser:**
   - Chrome/Edge: Best WebGL support
   - Firefox: Good support
   - Safari: May have limitations

## Logging Issues

### Issue: No logs in Docker container

**Solutions:**

1. **Check if logger is working:**
   ```bash
   docker logs tvx | tail -20
   ```

2. **Verify server.js logging endpoint:**
   ```bash
   curl -X POST http://localhost:8777/log \
     -H "Content-Type: application/json" \
     -d '{"level":"info","message":"test"}'
   ```

3. **Check browser console:**
   - Logs should appear in both browser and Docker
   - If only in browser, server.js may have issues

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
   - [Installation Guide](installation.md)
   - [Usage Guide](usage.md)
   - [Development Guide](development.md)
   - [Bug Fix Documentation](bugfix/README.md)

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
