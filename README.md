# TVx - Modern IPTV Viewer with EPG

## Philosophy

TVx is about reclaiming the experience of "watching TV" - not endlessly scrolling through catalogs, not being bombarded with autoplay previews, just sitting down and watching. The vintage CRT aesthetic isn't mere decoration; it's a deliberate choice to make digital content feel less clinical and more inviting, like settling in front of an old television set.

This is a passion project built for the joy of it. No ads, no tracking, no subscriptions - just a clean, focused viewing experience that respects your time and attention. Creating a distraction-free, cinematic viewing experience.

https://github.com/user-attachments/assets/1.mp4

https://github.com/user-attachments/assets/2.mp4

https://github.com/user-attachments/assets/3.mp4


## Designed
For [Tunarr](https://github.com/chrisbenincasa/tunarr) - Works seamlessly with Tunarr to view IPTV channels from your Plex or Jellyfin library. TVx is a viewer only - it does not provide any content or streaming material.

## Usage

- **Switch Channels**: Click channels in sidebar list or use ↑/↓ arrow keys
- **Quick Channel Surf**: Hold ↑/↓ arrows to rapidly flip through channels
- **View Program Info**: Click any program in the EPG or Full TV Guide
- **Toggle Full Guide**: Press `G` or click "Full TV Guide" button
- **Theater Mode**: Click the video player to cycle through views
- **Mute/Unmute**: Press `M` or click volume icon
- **Favorites**: Click star icon on any program to save

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `↑` | Previous Channel |
| `↓` | Next Channel |
| `G` | Toggle Full TV Guide |
| `S` | Toggle Stats Panel |
| `M` | Toggle Mute/Unmute |
| `F` | Fullscreen Mode |
| `Esc` | Close modals/Exit theater mode |

## Features

### 📺 Core Functionality

- **M3U Playlist Support** - Load channel lists from URLs or local files
- **XMLTV EPG Data** - Full program guide with show details, descriptions, and schedules
- **Live Streaming** - HLS/HTTP stream playback with instant channel switching
- **Auto-Load** - Automatically loads configured sources on startup
- **Quick Channel Surfing** - Use ↑/↓ arrow keys to rapidly flip through channels

### 🎨 Vintage CRT Experience

The authentic retro television aesthetic isn't just for nostalgia - these effects serve a purpose:

- **CRT Distortion** - Subtle barrel distortion recreates the curved screen geometry of classic tube TVs, giving the image that characteristic "wrapped around glass" feel
- **Chromatic Aberration** - RGB color separation mimics the electron gun behavior in CRT displays, where red, green, and blue phosphors didn't always align perfectly at screen edges
- **Scanlines** - Horizontal scan pattern authentic to analog television technology
- **Vignette** - Edge darkening with smooth feathering simulates natural light falloff on curved glass screens
- **Edge Glass Mirage** - Vaseline-like blur on frame edges recreates the thick glass tube effect
- **Frame Edge Blur** - Controllable anti-aliasing creates the soft focus characteristic of vintage displays
- **Neon Clock** - Beautiful cyan neon tube-style time display with realistic glow and flicker

These effects combine to transform modern flat digital video into something that feels tangible and warm - like watching through actual curved glass rather than a flat LCD panel. It's the difference between "watching pixels" and "watching television."

### 📖 TV Guide Features

- **Full TV Guide** - 12-hour scrollable timeline view across all channels
- **Now Playing Badge** - Highlights currently playing programs on selected channel
- **Program Details** - Click any program to see full information, ratings, cast & crew
- **Favorites** - Star your favorite shows for quick access
- **Smart Scrolling** - Auto-scrolls to keep current time visible
- **Episode Truncation** - Smart text limiting (69 chars) keeps listings clean

### ⚡ Distraction-Free Viewing

- **Theater Mode** - Click video player to cycle through display modes (Guide → Normal → Theater)
- **Intelligent Idle Timer** - Auto-hides sidebar after inactivity, resets on any mouse movement
- **Clean Interface** - Minimal, unobtrusive design that gets out of the way
- **Keyboard Shortcuts** - Navigate without reaching for the mouse
- **Toast Notifications** - Subtle, informative feedback for all actions
- **Panel Styles** - Choose between bordered or shadow panel designs
- **Loading Video** - Optional VHS-style loading screen during channel changes

### 🎯 Interface Modes

1. **Normal View** - Video + sidebar with EPG and channel list
2. **Theater Mode** - Video-only immersive view
3. **Full TV Guide** - Compact video with comprehensive channel grid

## Quick Start

### Installation

```sh
# Clone the repository
git clone https://github.com/dopeytree/streamly-vue-epg.git

# Navigate to project
cd streamly-vue-epg

# Install dependencies
npm install

# Start development server
npm run dev
```

### Configuration

1. Set up **TunaRR** (or your IPTV source) to generate M3U and XMLTV files
2. Open TVx **Settings** (gear icon)
3. Configure your sources:
   - **M3U URL**: Your IPTV playlist URL (e.g., `http://your-tunarr-server:8000/api/channels.m3u`)
   - **XMLTV URL**: Your EPG data URL (e.g., `http://your-tunarr-server:8000/api/xmltv.xml`)
4. Enable **Auto Load** to automatically fetch on startup
5. Adjust visual settings to your preference

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **WebGL Shaders** - Custom vintage video effects
- **Sonner** - Toast notifications

## Browser Support

Works best in modern browsers with WebGL support:

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

PolyForm Noncommercial 1.0.0

This project is licensed under the [PolyForm Noncommercial License 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0/). You are free to use, modify, and share this software for any noncommercial purpose. Commercial use requires a separate license.

**In brief**: Use it, learn from it, fork it, improve it - just don't sell it or use it to make money without permission.

## Contributing

This is a personal passion project, but contributions, suggestions, and feedback are welcome! Feel free to open issues or submit pull requests.
