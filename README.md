# 📺 TVx — the warmth returns

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

## ⌨️ Keyboard shortcuts

| Key | Action |
|-----|--------|
| `↑` `↓` | Channel surf (hold to skim) |
| `G` | Toggle full TV guide |
| `F` | Fullscreen |
| `M` | Mute/Unmute |
| `Esc` | Close modals/Exit theater |

## 🚀 Quick start

Point TVx at your M3U and XMLTV URLs in Settings. That's it.

## 💾 Install

<details>
<summary><strong>🐳 Docker</strong></summary>

<br>

### Run with Docker

```bash
docker run -d \
  --name tvx \
  -p 8777:80 \
  --restart unless-stopped \
  ghcr.io/dopeytree/tvx:latest
```

Then open <http://localhost:8777>

### Run with Docker Compose

```yaml
services:
  tvx:
    image: ghcr.io/dopeytree/tvx:latest
    ports:
      - "8777:80"
    restart: unless-stopped
    environment:
      - TZ=UTC
```

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
| **Network Type** | `Bridge` |

4. Click **Apply**
5. Access at: `http://YOUR-UNRAID-IP:8777`

**No AppData path or PIDs needed** — TVx stores all settings in your browser's localStorage (client-side only).

**Note**: An official Unraid Community Apps template is coming soon for one-click installation!

</details>

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

## 📜 License

PolyForm Noncommercial 1.0.0

This project is licensed under the [PolyForm Noncommercial License 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0/). You are free to use, modify, and share this software for any noncommercial purpose. Commercial use requires a separate license.

**In brief**: Use it for joy, learn from it, fork it, improve it - just don't sell it or use it to make money without permission.

## 🤝 Contributing

This is a personal passion project, but contributions, suggestions, and feedback are welcome! Feel free to open issues or submit pull requests.


