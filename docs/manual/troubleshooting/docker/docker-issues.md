---
layout: default
title: Docker Issues
parent: Troubleshooting
nav_order: 5
---

# Docker Issues

## Issue: Container won't start

**Symptoms:**
- `docker ps` doesn't show tvx
- Container exits immediately
- Port already in use

**Solutions:**

1. **Check port availability:**
   ```bash
   lsof -i :8777
   ```

   If occupied, stop the process or use different port

2. **Check container logs:**
   ```bash
   docker logs tvx
   ```

3. **Remove and recreate:**
   ```bash
   docker rm -f tvx
   docker run -d --name tvx -p 8777:80 \
     -e VITE_M3U_URL=http://your-server:8000/api/channels.m3u \
     -e VITE_XMLTV_URL=http://your-server:8000/api/xmltv.xml \
     tvx:latest
   ```

## Issue: Changes not reflected after rebuild

**Symptoms:**
- Code changes don't appear
- Old version still running
- Build shows cached layers

**Solutions:**

1. **Force rebuild without cache:**
   ```bash
   docker build --no-cache -t tvx:latest .
   ```

2. **Remove old container and images:**
   ```bash
   docker rm -f tvx
   docker rmi tvx:latest
   docker build -t tvx:latest .
   ```