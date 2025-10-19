---
layout: default
title: Unraid
parent: Install
nav_order: 2
---

# Installation

## Prerequisites

See [Prerequisites](prerequisites.html) for system requirements.

## Unraid Installation

1. Open **Docker** tab in Unraid
2. Click **Add Container**
3. Configure the following fields:

| Field | Value |
|-------|-------|
| **Name** | `tvx` |
| **Repository** | `ghcr.io/dopeytree/tvx:latest` |
| **Registry URL** | `https://github.com/dopeytree/TVx/pkgs/container/tvx` |
| **Icon URL** | `https://raw.githubusercontent.com/dopeytree/TVx/main/public/logo.png` |
| **WebUI** | `http://[IP]:[PORT:8777]` |
| **Port** | Container: `80`, Host: `8777` |
| **Network Type** | `Bridge` |

4. Add environment variables:
   - `VITE_M3U_URL` = `http://your-tunarr-ip:8000/api/channels.m3u`
   - `VITE_XMLTV_URL` = `http://your-tunarr-ip:8000/api/xmltv.xml`
   - `TZ` = `America/New_York` (your timezone)

5. Add path mapping (optional but recommended):
   - Container Path: `/config`
   - Host Path: `/mnt/user/appdata/tvx`
   - Access Mode: `Read/Write`

6. Click **Apply**
7. Access at: `http://YOUR-UNRAID-IP:8777`

**Persistent Storage**: The `/config` path stores:
- Settings and configuration (`settings.json`)
- Application logs (`tvx.log`) - automatically rotated
- Access logs at: `/mnt/user/appdata/tvx/tvx.log`
