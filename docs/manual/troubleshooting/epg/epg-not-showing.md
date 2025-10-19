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