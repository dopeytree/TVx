# 📺 TVx — the warmth of modern nostalgia

This is the way - television you remember feeling: present, unhurried, *analog*.

- TVx brings back the ritual of watching—not scrolling, not seeking, just *being* with what's on.

- Like the grain of 35mm film 🎞️ or the crackle before a record drops 💿, it trades sterile perfection for something alive.

- Curved glass 📟. Gentle flicker ✨. Scanlines that breathe.

- The soft bokeh of vintage anamorphic lenses 🎥—edges that blur like looking through aged glass, chromatic fringing that feels organic, not digital.

- The glow of a neon clock 🕰️ counting Saturday mornings long past


## Main View

![TVx Screenshot 1](https://github.com/dopeytree/TVx/blob/main/public/screenshot-1.png?raw=true)

## Full TV Guide View

![TVx Screenshot 2](https://github.com/dopeytree/TVx/blob/main/public/screenshot-2.png?raw=true)

## Full TV Guide View + Poster

![TVx Screenshot 3](https://github.com/dopeytree/TVx/blob/main/public/screenshot-3.png?raw=true)

## Full screen (vintage filter off) View

![TVx Screenshot 4](https://github.com/dopeytree/TVx/blob/main/public/screenshot-4.png?raw=true)

## Full screen (vintage filter on) View

![TVx Screenshot 5](https://github.com/dopeytree/TVx/blob/main/public/screenshot-5.png?raw=true)

## Buy me a coffee

[![GitHub Sponsors](https://img.shields.io/github/sponsors/dopeytree?style=for-the-badge&logo=githubsponsors&logoColor=white&label=Sponsor&labelColor=ea4aaa&color=ea4aaa)](https://github.com/sponsors/dopeytree)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-dopeytree-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://www.buymeacoffee.com/dopeytree)

## 🎯 What it does

An IPTV + EPG viewer for **TunaRR** (Plex/Jellyfin) playlists and XMLTV guides. Built for channel surfing, not catalog anxiety. Anti‑algorithm. Pro‑moment. Vibing.

## ✨ Why it feels different

- ⚡ **Instant channel surfing** — hold ↑/↓ to skim; land when something catches your eye
- 📟 **CRT warmth** — curvature, chromatic aberration, scanlines, vignette
- 📅 **Full TV guide** — press G for a 12‑hour timeline across all channels with poster artwork
- 🎬 **Theater modes** — click the player to cycle views (guide → normal → immersive)
- 🏷️ **Smart channel names** — strips filler words, adds icons:
  - *Pulp Fiction Movies* → Pulp Fiction [🎬]
  - *The Hitchhiker's Guide to the Galaxy Shows* → The Hitchhiker's Guide to the Galaxy [📺]
  - *Extreme Ironing Sports* → Extreme Ironing [🏆]
  - *The Tesla Files History* → The Tesla Files [📜]
  - *Cosmos Documentaries* → Cosmos [📜]


## 🚀 Quick start

- You need to have set up Plex/Jellyfin media server
- Tunarr or Dizquetv for channel streaming
- Open - `http://localhost:8777`
- Point TVx at your M3U and XMLTV URLs in Settings. 
- That's it
- Use the up/down arrow keys to browse your personal media

## 💾 Install

<details>
<summary><strong>🐳 Docker</strong></summary>

<br>

### Run with Docker

```bash
docker run -d \
  --name tvx \
  -p 8777:80 \
  -v /path/to/config:/config \
  --restart unless-stopped \
  ghcr.io/dopeytree/tvx:latest
```

**Important**: Mount a volume to `/config` to persist settings and URLs across container restarts.

Then open <http://localhost:8777>

### Run with Docker Compose

```yaml
services:
  tvx:
    image: ghcr.io/dopeytree/tvx:latest
    ports:
      - "8777:80"
    volumes:
      - /path/to/config:/config
    restart: unless-stopped
    environment:
      - TZ=UTC
```

**Important**: Mount a volume to `/config` to persist settings and URLs across container restarts.

Save as `docker-compose.yml` and run:
```bash
docker-compose up -d
```

### Build locally

```bash
# Build the image
docker build -t tvx .

# Run it
docker run -d -p 8777:80 --name tvx tvx
```

**Tiny Alpine-based image** — Production-ready with nginx, gzip compression, and health checks built in.

</details>

<details>
<summary><strong>🖥️ Unraid</strong></summary>

<br>

1. Open **Docker** tab in Unraid
2. Click **Add Container**
3. Fill in the following:

| Field | Value |
|-------|-------|
| **Name** | `tvx` |
| **Repository** | `ghcr.io/dopeytree/tvx:latest` |
| **Registry URL** | `https://github.com/dopeytree/TVx/pkgs/container/tvx` |
| **Icon URL** | `https://raw.githubusercontent.com/dopeytree/TVx/main/public/logo.png` |
| **WebUI** | `http://[IP]:[PORT:8777]` |
| **Port** | Container: `80`, Host: `8777` (or your preferred port) |
| **Path** | Target: `/config`, Default:`/mnt/user/appdata/tvx`, Mode:`rw`,  Description:`Path for storing TVx configuration files (settings, M3U/EPG URLs)` |
| **Network Type** | `Bridge` |

1. Click **Apply**
2. Access at: `http://YOUR-UNRAID-IP:8777`

**AppData path required** — Mount a volume to `/config` in the container to persist settings and URLs across container restarts. Logs are also stored in this directory as `tvx.log`.

**Note**: An official Unraid Community Apps template is available with proper AppData configuration!

</details>

## ⌨️ Keyboard shortcuts

| Key | Action |
|-----|--------|
| `↑` `↓` | Channel surf (hold to skim) |
| `G` | Toggle full TV guide |
| `F` | Fullscreen |
| `M` | Mute/Unmute |
| `Esc` | Close modals/Exit theater |

## 🛠️ Tech Stack

- ⚛️ **React 18** + **TypeScript** — Modern, type-safe UI
- ⚡ **Vite** — Lightning-fast build tool
- 🎨 **WebGL Fragment Shaders** — Custom CRT effects and visual processing
- 📡 **HLS.js** — Adaptive HTTP Live Streaming
- 🎭 **Radix UI** + **Tailwind CSS** — Accessible components, utility-first styling
- 🎯 **Lucide Icons** — Beautiful, consistent iconography

## 🌐 Browser Support

Works best in modern browsers with WebGL support:

- 🟢 Chrome/Edge 90+
- 🟠 Firefox 88+
- 🔵 Safari 14+

## � Monitoring & Logs

TVx includes comprehensive logging for debugging, monitoring, and troubleshooting:

### Server-Side Logging

- **Request/Response Logging**: All HTTP requests and responses are logged with timestamps, IP addresses, user agents, and response times
- **Settings Operations**: All settings saves and loads are logged with details
- **Health Monitoring**: Server health endpoint at `GET /health` returns uptime, config status, and timestamp

### Client-Side Logging

- **Channel Loading**: M3U parsing, XMLTV loading, and channel selection events
- **Settings Changes**: All user preference updates and configuration changes
- **Error Tracking**: Failed operations, network errors, and parsing issues
- **Performance Metrics**: Load times, parsing durations, and operation success rates

### Log Storage

- **Console Output**: Real-time logs visible in Docker logs (`docker logs tvx`)
- **Persistent Files**: All logs saved to `/config/tvx.log` with structured JSON data
- **Dual Output**: Both console and file logging for maximum visibility

### Log Levels

- `INFO`: Normal operations, successful loads, user actions
- `WARN`: Validation warnings, deprecated features, recoverable errors
- `ERROR`: Failures, exceptions, critical issues

### Log Format

```log
[2025-10-15T03:27:20.257Z] INFO: CLIENT: Channel loaded successfully | {"channelId":"123","channelName":"Test Channel","loadTime":"150ms"}
```

### Viewing Logs

```bash
# Docker container logs (real-time)
docker logs tvx

# Persistent log file (if volume mounted)
cat /path/to/config/tvx.log

# Follow logs in real-time
docker logs -f tvx

# Health check
curl http://localhost:8777/health
```

### Troubleshooting with Logs

- **Channel Loading Issues**: Check for M3U/XMLTV parsing errors
- **Settings Not Saving**: Look for API request/response logs
- **Performance Problems**: Monitor load times and response durations
- **Network Issues**: Check for connection timeouts and failed requests

## 🤝 Contributing

This is a personal passion project, but contributions, suggestions, and feedback are welcome! Feel free to open issues or submit pull requests.


