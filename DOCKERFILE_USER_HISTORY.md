# Dockerfile User Settings History

## Timeline of User Configuration Changes

### Initial Version (de5fe9b - 2025-10-13)
**No user settings** - Running as root
```dockerfile
FROM nginx:alpine
# ... no USER directive
```
- Used nginx:alpine base image
- No non-root user created
- Ran as root (default)

### First Non-Root User (5177ac9 - Rate limiting & security hardening)
**Added nodejs user (UID 1001)**
```dockerfile
# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Create config directory and set ownership
RUN mkdir -p /config && \
    chown -R nodejs:nodejs /usr/share/nginx/html /config

# Switch to non-root user
USER nodejs
```
- Changed from nginx to Node.js server
- Created `nodejs` user with UID 1001
- Created `/config` directory with ownership for nodejs user
- **PROBLEM**: UID 1001 doesn't match Unraid's default `nobody` user (UID 99)

### Current Fix (2025-10-24)
**Changed to appuser (UID 99)**
```dockerfile
# Create non-root user for security (using nobody UID/GID for better compatibility)
RUN addgroup -g 99 -S appuser && \
    adduser -S appuser -u 99 -G appuser

# Set ownership of application files
RUN chown -R appuser:appuser /usr/share/nginx/html

# Switch to non-root user
USER appuser
```
- Changed from UID 1001 to UID 99
- UID 99 = `nobody` user (standard in most Linux distros and Unraid)
- Removed explicit `/config` directory creation (let volume mount handle it)
- **FIXES**: Permission issues on Unraid mounted volumes

## Why The Change Was Needed

### The Problem
Unraid mounts volumes (like `/config`) with ownership of `nobody:users` (UID 99, GID 100 by default). When the container ran as UID 1001, it couldn't write to these mounted directories.

### Error Seen
```
Failed to write to log file: [Error: EACCES: permission denied, open '/config/tvx.log']
```

### The Solution
- Use UID 99 to match Unraid's default volume permissions
- Container user now matches host mount permissions
- No permission conflicts when writing to `/config`

## Related Changes

### Enhanced server.js
Added graceful fallback if `/config` still isn't writable:
- Tests write permissions on startup
- Falls back to console-only logging if file write fails
- Prevents error spam
- Application continues normally

### docker-compose.yml
Added explicit PUID/PGID variables:
```yaml
environment:
  - PUID=99
  - PGID=99
```

## Commits Reference
- `de5fe9b` - Initial Dockerfile (nginx, root user)
- `5177ac9` - Added nodejs user (UID 1001) - **This caused the Unraid issue**
- Current - Changed to appuser (UID 99) - **Fixes the issue**

## Best Practices Applied
1. ✅ Never run as root in containers
2. ✅ Use standard UIDs (99 = nobody) for compatibility
3. ✅ Match container UID to host volume ownership
4. ✅ Add graceful error handling for edge cases
5. ✅ Document all changes for future reference
