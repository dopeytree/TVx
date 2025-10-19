---
layout: default
title: Performance Issues
parent: Troubleshooting
nav_order: 6
---

# Performance Issues

## Issue: Video stuttering or buffering

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

## Issue: Slow channel switching

**Solutions:**

1. **Check drive spin-up time:**
   - Loading video should play during spin-up
   - Verify loading video is working (see above)

2. **Optimize Tunarr:**
   - Pre-generate channel streams
   - Use faster storage for media
   - Enable stream caching