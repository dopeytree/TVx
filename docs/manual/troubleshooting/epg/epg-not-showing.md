---
layout: default
title: EPG Not Showing
parent: Troubleshooting
nav_order: 4
---

# EPG Not Showing

## Issue: Electronic Program Guide is empty

**Symptoms:**
- Channels load but no program information
- Timeline is blank
- No show titles or descriptions

**Solutions:**

1. **Check that Tunarr allows TVx's origin:**

   If the browser console (`F12`) reports `No 'Access-Control-Allow-Origin' header` for `xmltv.xml`, Tunarr is refusing the request. Set `TUNARR_CORS_ORIGINS` on your **Tunarr** container to the address you open TVx at, then restart Tunarr:

   ```
   TUNARR_CORS_ORIGINS=http://your-tvx-ip:8777
   ```

   See [Channels Not Loading](../channels/channels-not-loading.md) for details.

2. **Verify XMLTV URL:**
   ```bash
   curl http://your-tunarr-ip:8000/api/xmltv.xml | head -20
   ```

   Should show XML data

3. **Check XMLTV parsing:**
   - Open browser console (F12)
   - Look for parsing errors
   - Check network tab for XMLTV request

4. **Verify channel IDs match:**
   - XMLTV channel IDs must match M3U tvg-id values
   - Check Tunarr channel configuration