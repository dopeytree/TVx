---
layout: default
title: Video Not Playing
parent: Troubleshooting
nav_order: 2
---

# Video Not Playing

## Issue: Video player shows black screen

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