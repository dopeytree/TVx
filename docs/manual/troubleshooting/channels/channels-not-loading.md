---
layout: default
title: Channels Not Loading
parent: Troubleshooting
nav_order: 1
---

# Channels Not Loading

## Issue: No channels appear after starting TVx

**Symptoms:**
- Empty channel list
- No error messages
- Blank screen

**Solutions:**

1. **Check that Tunarr allows TVx's origin (most common cause):**

   Open the browser console with `F12`. A message like this means Tunarr is refusing the request:

   ```
   Access to fetch at 'http://your-tunarr-ip:8000/api/channels.m3u' from origin
   'http://your-tvx-ip:8777' has been blocked by CORS policy: No
   'Access-Control-Allow-Origin' header is present on the requested resource.
   ```

   Set this environment variable on your **Tunarr** container (not TVx), then restart Tunarr and hard-refresh TVx:

   ```
   TUNARR_CORS_ORIGINS=http://your-tvx-ip:8777
   ```

   The value must match the address in your browser's address bar exactly, with no trailing slash. Separate several addresses with commas.

   Recent Tunarr versions send no CORS headers by default, so this affects every TVx install on a separate port — including ones that worked before a Tunarr update.

2. **Check environment variables:**
   ```bash
   # Verify URLs are set correctly
   docker exec tvx env | grep VITE
   ```

   Should show:
   ```
   VITE_M3U_URL=http://your-server:8000/api/channels.m3u
   VITE_XMLTV_URL=http://your-server:8000/api/xmltv.xml
   ```

3. **Verify Tunarr is accessible:**
   ```bash
   curl -I http://your-tunarr-ip:8000/api/channels.m3u
   ```

   Should return `200 OK`

4. **Check browser console (F12):**
   - Look for CORS errors
   - Check network tab for failed requests
   - Verify env.js is loaded

5. **Hard refresh browser:**
   - Chrome/Edge: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Firefox: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)