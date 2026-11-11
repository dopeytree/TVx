---
layout: default
title: Browser Console Errors
parent: Troubleshooting
nav_order: 7
---

# Browser Console Errors

## Common errors and solutions:

**"CORS policy: No 'Access-Control-Allow-Origin' header"**
- Tunarr is refusing requests from TVx's origin. Recent Tunarr versions send no CORS headers by default
- Set `TUNARR_CORS_ORIGINS` on your **Tunarr** container to the address you open TVx at, then restart Tunarr:
  ```
  TUNARR_CORS_ORIGINS=http://your-tvx-ip:8777
  ```
- The value must match your browser's address bar exactly, with no trailing slash. Separate several addresses with commas
- Behind a reverse proxy, use the public address you browse to, not the container's internal one
- See [Channels Not Loading](../channels/channels-not-loading.md)

**"NotSupportedError: The operation is not supported"**
- Usually video-related
- Check HTTP Range Request support
- See `docs/bugfix/2025-10/vhs-video-not-playing.md`

**"Failed to fetch"**
- Network connectivity issue
- Check Tunarr URL is correct
- Verify Tunarr is running