---
layout: default
title: Prerequisites
parent: Install
nav_order: 1
---

# Installation

## Prerequisites

Before running TVx, you need:

- **Plex or Jellyfin media server** set up
- **Tunarr** (or Dizquetv) for channel streaming
- Your M3U playlist and XMLTV EPG URLs from Tunarr

## Required Configuration

You **MUST** set your IPTV sources using environment variables:

- `VITE_M3U_URL` - Your IPTV M3U playlist URL (e.g., `http://your-tunarr-ip:8000/api/channels.m3u`)
- `VITE_XMLTV_URL` - Your XMLTV EPG guide URL (e.g., `http://your-tunarr-ip:8000/api/xmltv.xml`)

**Note**: If you change URLs later, clear your browser cache (Ctrl+Shift+R) to see updates.

## Required Configuration in Tunarr (CORS)

TVx runs in your browser and fetches the playlist, the guide and the video straight from Tunarr. TVx and Tunarr sit on different ports, so that is a cross-origin request, and recent Tunarr versions block it by default.

Set this environment variable on your **Tunarr** container, then restart Tunarr:

```
TUNARR_CORS_ORIGINS=http://your-tvx-ip:8777
```

The value must be the address you open TVx at, exactly as your browser's address bar shows it, with no trailing slash. Separate several addresses with commas:

```
TUNARR_CORS_ORIGINS=http://192.168.1.50:8777,https://tv.example.com
```

Without this, TVx loads but shows an empty channel list and no guide, and the browser console reports `No 'Access-Control-Allow-Origin' header`.

Tunarr allowed any origin before a security fix in September 2026, so installs predating it worked without this step. Older Tunarr versions ignore the variable harmlessly.

