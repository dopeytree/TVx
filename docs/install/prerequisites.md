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

