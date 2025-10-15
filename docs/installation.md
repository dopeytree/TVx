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

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build**: Vite
- **Styling**: Tailwind CSS + Radix UI
- **Video**: HLS.js for streaming
- **Effects**: WebGL shaders for CRT effects
- **Container**: Alpine Linux + Nginx
