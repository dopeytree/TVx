---
layout: default
title: Vintage TV Effects Issues
parent: Troubleshooting
nav_order: 8
---

# Vintage TV Effects Issues

## Issue: CRT effects not working

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