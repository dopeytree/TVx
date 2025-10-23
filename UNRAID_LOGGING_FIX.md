# Unraid Logging Permission Fix

## Problem
The container was failing to write logs with the error:
```
Failed to write to log file: [Error: EACCES: permission denied, open '/config/tvx.log']
```

## Root Cause
The Dockerfile was running as user `nodejs` (UID 1001), but Unraid typically mounts volumes with ownership of `nobody` user (UID 99/GID 99). This caused a permission mismatch when trying to write to `/config/tvx.log`.

## Solution Implemented

### 1. Changed User in Dockerfile
- Changed from `nodejs` (UID 1001) to `appuser` (UID 99)
- Uses UID/GID 99 which matches Unraid's default `nobody` user
- Ensures the container can write to mounted `/config` directory

### 2. Enhanced Server.js Error Handling
- Added permission check on startup
- Gracefully falls back to console-only logging if file write fails
- Prevents log spam by disabling file logging after first failure
- Application continues to run even if log directory is not writable

### 3. Updated docker-compose.yml
- Added `PUID=99` and `PGID=99` environment variables for clarity
- Ensures consistency across all deployment methods

## For Users

### Unraid Users
No action needed! The next container update will automatically fix this issue.

### Docker Compose Users
1. Pull the latest image
2. Recreate the container: `docker-compose up -d --force-recreate`

### Manual Docker Users
1. Ensure your `/config` mount point has proper permissions:
   ```bash
   sudo chown -R 99:99 /path/to/your/config
   ```
2. Pull and restart the container

## Verification
After update, check your logs:
```bash
docker logs tvx
```

You should see:
```
Server running on port 80
Process ID: 1
...
```

And the file `/config/tvx.log` should be created and writable.

## Fallback Behavior
If for any reason the `/config` directory is still not writable:
- The application will log a warning to console
- All logs will be sent to docker logs (viewable via `docker logs tvx`)
- The application will continue to function normally
- No errors will spam the console

## Technical Details

### Before:
```dockerfile
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs
```

### After:
```dockerfile
RUN addgroup -g 99 -S appuser && \
    adduser -S appuser -u 99 -G appuser
USER appuser
```

### Why UID 99?
- Standard UID/GID for `nobody` user in many Linux distributions
- Default user for Unraid appdata mounts
- Provides better compatibility across different systems
- Still maintains security by not running as root

## Related Files
- `Dockerfile` - User/permission changes
- `server.js` - Enhanced logging with fallback
- `docker-compose.yml` - Added PUID/PGID variables
