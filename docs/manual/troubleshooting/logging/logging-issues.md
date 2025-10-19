---
layout: default
title: Logging Issues
parent: Troubleshooting
nav_order: 9
---

# Logging Issues

## Issue: No logs in Docker container

**Solutions:**

1. **Check if logger is working:**
   ```bash
   docker logs tvx | tail -20
   ```

2. **Verify server.js logging endpoint:**
   ```bash
   curl -X POST http://localhost:8777/log \
     -H "Content-Type: application/json" \
     -d '{"level":"info","message":"test"}'
   ```

3. **Check browser console:**
   - Logs should appear in both browser and Docker
   - If only in browser, server.js may have issues