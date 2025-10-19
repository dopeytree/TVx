---
layout: default
title: Browser Console Errors
parent: Troubleshooting
nav_order: 7
---

# Browser Console Errors

## Common errors and solutions:

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