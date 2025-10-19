---
layout: default
title: Loading VHS Video Not Playing
parent: Troubleshooting
nav_order: 3
---

# Loading VHS Video Not Playing

## Issue: Black screen during channel changes instead of VHS loading animation

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