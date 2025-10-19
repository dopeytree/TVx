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