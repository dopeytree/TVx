---
layout: default
title: Logging & Monitoring
parent: Usage
grand_parent: Getting Started
nav_order: 4
---

## Logging & Monitoring

TVx provides comprehensive logging of all user interactions directly to your Docker container logs, making it easy to monitor usage and troubleshoot issues.

### What Gets Logged

- **Channel Selection**: When channels are selected (including channel names and source)
- **Program Interactions**: Opening/closing program popups with show details and episode info
- **Poster Views**: Opening/closing program posters
- **Google Searches**: When "More Info" links are clicked (with show name and year)
- **Guide Navigation**: Opening/closing full TV guide and channel guide
- **Settings Changes**: All settings operations and modifications
- **File Operations**: M3U/XMLTV file uploads and parsing results
- **Video Controls**: Play/pause, mute/unmute, fullscreen toggles
- **UI Interactions**: Stats panel, favorites management, keyboard shortcuts
- **Errors**: All application errors and parsing failures

### Viewing Logs

**Docker Container Logs:**

```bash
docker logs tvx
```

**Docker Compose Logs:**

```bash
docker-compose logs -f tvx
```

**Persistent Log File:**

```bash
# View the persistent log file (survives container restarts)
cat ./config/tvx.log
tail -f ./config/tvx.log  # Follow/tail logs
```

**Unraid Logs:**

- **Container Logs**: Docker tab → TVx container → Logs button
- **Persistent Log File**: Navigate to `/mnt/user/appdata/tvx/tvx.log` or use terminal:

```bash
tail -f /mnt/user/appdata/tvx/tvx.log
```

### Sample Log Output

```log
[2025-10-15T20:18:28.467Z] INFO: Loaded 20 channels
[2025-10-15T20:18:28.481Z] INFO: Channel changed to: Favourite TV Shows
[2025-10-15T20:18:28.498Z] INFO: Loaded stream URL for Favourite TV Shows: http://192.168.22.2:8000/stream/channels/0136ef47-9ddc-468f-8f81-3b9bbe9e09ba?streamMode=hls
[2025-10-15T20:18:28.529Z] INFO: Loaded EPG data for 467 programmes
[2025-10-15T20:18:28.675Z] INFO: Loading video loaded successfully
[2025-10-15T20:18:28.680Z] INFO: Loading video started playing
[2025-10-15T20:18:31.008Z] INFO: Channel changed to: Gerry Anderson Shows
[2025-10-15T20:18:31.014Z] INFO: Loaded stream URL for Gerry Anderson Shows: http://192.168.22.2:8000/stream/channels/b460e1c6-d129-4146-ba60-ffd7a7d0f2ef?streamMode=hls
[2025-10-15T20:18:50.406Z] INFO: Channel changed to: Gerry Anderson Shows
[2025-10-15T20:18:50.484Z] INFO: Loading video started playing
```

### Benefits

This logging system helps you:

- Monitor viewing patterns and popular channels/programs
- Debug user interaction issues
- Track application usage in multi-user environments
- Verify that features are working correctly
- Analyze user behavior and preferences
