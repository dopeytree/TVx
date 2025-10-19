---
layout: default
title: Docker
parent: Install
nav_order: 3
---

# Installation

## Prerequisites 

See [Prerequisites](prerequisites.html) for system requirements.

## Docker Installation

### Quick Docker Run

```bash
docker run -d \
  --name tvx \
  -p 8777:80 \
  --restart unless-stopped \
  -e VITE_M3U_URL="http://your-tunarr-ip:8000/api/channels.m3u" \
  -e VITE_XMLTV_URL="http://your-tunarr-ip:8000/api/xmltv.xml" \
  ghcr.io/dopeytree/tvx:latest
```

Then open <http://localhost:8777>

### Docker Compose

```yaml
services:
  tvx:
    image: ghcr.io/dopeytree/tvx:latest
    ports:
      - "8777:80"
    restart: unless-stopped
    environment:
      - TZ=UTC
      - VITE_M3U_URL=http://your-tunarr-ip:8000/api/channels.m3u
      - VITE_XMLTV_URL=http://your-tunarr-ip:8000/api/xmltv.xml
    volumes:
      - ./config:/config
```

Save as `docker-compose.yml` and run:

```bash
docker-compose up -d
```

### Build Locally

```bash
# Build the image
docker build -t tvx .

# Run it
docker run -d \
  -p 8777:80 \
  --name tvx \
  -e VITE_M3U_URL="http://your-tunarr-ip:8000/api/channels.m3u" \
  -e VITE_XMLTV_URL="http://your-tunarr-ip:8000/api/xmltv.xml" \
  tvx
```