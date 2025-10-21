# 🤖 Agent Instructions for TVx

> **Last Updated**: 2025-10-21  
> **Project**: TVx - IPTV + EPG Viewer with CRT Nostalgia  
> **Repository**: [dopeytree/TVx](https://github.com/dopeytree/TVx)  
> **Branch**: `iptv`

---

## 📋 Project Overview

**TVx** is a client-side web application that provides a nostalgic CRT-style interface for viewing IPTV streams with EPG (Electronic Program Guide) data. It's designed for **Tunarr** (Plex/Jellyfin) playlists and XMLTV guides, focusing on channel surfing rather than catalog browsing.

### Core Purpose

- Anti-algorithm television experience
- Vintage CRT aesthetic (scanlines, curvature, chromatic aberration)
- Instant channel surfing with keyboard shortcuts
- Full TV guide integration with poster artwork
- Theater viewing modes

---

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS + Radix UI components
- **Video Streaming**: HLS.js for adaptive streaming
- **Visual Effects**: WebGL Fragment Shaders for CRT effects
- **State Management**: React hooks + context
- **Icons**: Lucide React

### Project Structure

```text
/Users/ed/TVx/
├── src/
│   ├── components/     # React components (ChannelList, EPGView, VideoPlayer, etc.)
│   ├── hooks/          # Custom React hooks (useSettings, useKeyboardShortcuts)
│   ├── pages/          # Page components (Index, NotFound)
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utilities (m3uParser, xmltvParser, logger)
│   ├── App.tsx         # Main app component
│   └── main.tsx        # Entry point
├── docs/               # Jekyll documentation site
├── public/             # Static assets
├── config/             # Configuration files
├── .vscode/            # VS Code tasks and settings
└── Docker files        # Dockerfile, docker-compose.yml, nginx.conf
```

---

## 🛠️ Development Workflow

### Initial Setup

```bash
# Install Node.js dependencies
npm install

# Install documentation dependencies (Jekyll)
cd docs && bundle install
```

### Common Commands

Reference the **commands-cheatsheet.json** in the project root for frequently used commands. Top commands:

1. **Development Server** (localhost:5173)

   ```bash
   npm run dev
   ```

2. **Documentation Server** (localhost:4000)

   ```bash
   cd docs && bundle exec jekyll serve --host 0.0.0.0 --port 4000 --baseurl /TVx
   ```

3. **Build Production**

   ```bash
   npm run build
   ```

4. **Lint Code**

   ```bash
   npm run lint
   ```

5. **Docker Build & Run**

   ```bash
   docker build -t tvx:latest . && docker run -d --name tvx -p 8777:80 \
     -e VITE_M3U_URL=http://your-server:8000/api/channels.m3u \
     -e VITE_XMLTV_URL=http://your-server:8000/api/xmltv.xml \
     tvx:latest
   ```

6. **Docker Logs**

   ```bash
   docker logs -f tvx
   # or with docker-compose
   docker-compose logs -f tvx
   ```

### prefil vite urls for testing

for all test docker & dev builds prefil the env variables as:

VITE_M3U_URL=http://192.168.22.2:8000/api/channels.m3u

VITE_XMLTV_URLhttp://192.168.22.2:8000/api/xmltv.xml

### VS Code Tasks

Use **Cmd+Shift+P** → "Tasks: Run Task" or **Cmd+Shift+B** for default build task.

Available tasks (see `.vscode/tasks.json`):

- Serve Documentation
- Run Dev Server (default)
- Watch Docker Logs
- Build Production
- Build Documentation
- Lint Code

---

## 🎯 Key Features to Understand

### 1. Channel Management

- M3U playlist parsing (`src/utils/m3uParser.ts`)
- Smart channel name formatting (strips filler words, adds emoji icons)
- Channel grouping and organization

### 2. EPG Integration

- XMLTV parser (`src/utils/xmltvParser.ts`)
- Full TV guide view with 12-hour timeline
- Program metadata display with poster artwork

### 3. Video Playback

- HLS.js adaptive streaming
- Multiple viewing modes (normal, guide, immersive)
- Keyboard shortcuts for navigation

### 4. Visual Effects

- WebGL shaders for CRT effects
- Configurable vintage filters (scanlines, vignette, chromatic aberration)
- Theater mode toggles

### 5. Logging & Monitoring

- Comprehensive user interaction logging
- Docker container log output
- Settings persistence via localStorage

---

## 📝 Coding Standards

### TypeScript

- Use strict type checking
- Define interfaces in `src/types/`
- Avoid `any` types when possible
- Use descriptive variable/function names

### React

- Functional components with hooks
- Custom hooks in `src/hooks/`
- Component-specific styles in `.css` files when needed
- Use Radix UI for accessible components

### Styling

- Tailwind CSS utility classes
- Follow existing design patterns (dark theme, neon accents)
- Maintain CRT aesthetic consistency

### File Organization

- Components: One component per file
- Utils: Pure functions, well-documented
- Types: Shared interfaces and types
- Keep related code together

---

## 🐳 Docker & Deployment

### Environment Variables

Required for Docker deployment:

- `VITE_M3U_URL` - M3U playlist URL (Tunarr API)
- `VITE_XMLTV_URL` - XMLTV EPG URL (Tunarr API)
- `TZ` - Timezone (optional, default: UTC)

### Build Process

1. Vite builds static files to `dist/`
2. Nginx serves static content on port 80
3. Health checks configured for container monitoring
4. Alpine-based image for minimal size

### Deployment Targets

- Docker Hub: `ghcr.io/dopeytree/tvx:latest`
- Unraid Community Apps
- Self-hosted via Docker Compose

---

## 📚 Documentation

### Structure

- Jekyll static site in `docs/`
- GitHub Pages: https://dopeytree.github.io/TVx/
- Markdown source files with YAML frontmatter

### Updating Docs

```bash
# Local preview
cd docs && bundle exec jekyll serve --host 0.0.0.0 --port 4000 --baseurl /TVx

# Build static site
cd docs && bundle exec jekyll build
```

### Documentation Sections

- **Install**: Docker, Unraid, prerequisites
- **Quick Start**: GUI, keyboard shortcuts, screenshots
- **Manual**: Features, browser support, tech stack, troubleshooting
- **Development**: Contributing, server setup, bug fixes

---

## 🔍 Common Tasks for Agents

### Adding a New Feature

1. Check if it fits the project philosophy (analog nostalgia, simplicity)
2. Create component in `src/components/` if UI-related
3. Add types to `src/types/` if new data structures
4. Update documentation in `docs/manual/`
5. Test in development server
6. Update README.md if user-facing

### Fixing a Bug

1. Check `docs/development/bug fixes/` for known issues
2. Review Docker logs for error context
3. Test fix in dev environment
4. Update relevant documentation
5. Consider adding to troubleshooting guide

### Documentation Updates

1. Edit Markdown files in `docs/`
2. Preview locally with Jekyll
3. Maintain consistent formatting and style
4. Update navigation if adding new pages

### Performance Optimization

1. Check bundle size after changes (`npm run build`)
2. Optimize images and assets
3. Review HLS.js configuration for streaming
4. Test on target browsers (Chrome 90+, Firefox 88+, Safari 14+)

---

## ⚠️ Important Conventions

### DO

- ✅ Maintain the vintage CRT aesthetic
- ✅ Keep the interface simple and intuitive
- ✅ Document all user-facing changes
- ✅ Test keyboard shortcuts thoroughly
- ✅ Ensure Docker builds successfully
- ✅ Follow existing code patterns
- ✅ Add comprehensive logging for debugging

### DON'T

- ❌ Add algorithm-driven features (recommendations, trending, etc.)
- ❌ Break keyboard navigation
- ❌ Remove or significantly alter the CRT effects
- ❌ Add unnecessary dependencies
- ❌ Ignore TypeScript errors
- ❌ Change Docker ports without documentation updates
- ❌ Modify the PolyForm Noncommercial license

---

## 🔗 External Dependencies

### Required Services

- **Tunarr**: IPTV channel streaming backend
- **Plex/Jellyfin**: Media server for content metadata
- **M3U source**: Channel playlist feed
- **XMLTV source**: EPG data feed

### Browser APIs Used

- WebGL for shader effects
- localStorage for settings persistence
- MediaSource Extensions for HLS playback
- Fullscreen API

---

## 📞 Getting Help

### Resources

- **Documentation**: https://dopeytree.github.io/TVx/
- **GitHub Issues**: Report bugs or feature requests
- **Code Comments**: Inline documentation in source files
- **README.md**: Quick reference and setup guide

### Key Files to Reference

- `README.md` - Project overview and quick start
- `commands-cheatsheet.json` - Frequently used commands
- `docs/manual/tech-stack.md` - Technical architecture
- `docs/manual/troubleshooting/` - Common issues and solutions
- `.vscode/tasks.json` - Configured development tasks

---

## 📊 Testing & Validation

### Before Committing

1. Run linter: `npm run lint`
2. Test build: `npm run build`
3. Verify Docker build: `docker build -t tvx .`
4. Test in target browsers
5. Check documentation builds: `cd docs && bundle exec jekyll build`

### Manual Testing Checklist

- [ ] Channel surfing (up/down arrows)
- [ ] EPG guide toggle (G key)
- [ ] Fullscreen mode (F key)
- [ ] Settings dialog
- [ ] Video playback
- [ ] CRT effects toggle
- [ ] Theater mode cycling
- [ ] Mobile responsiveness

---

## 🎨 Design Philosophy

**TVx is about feeling, not features.**

The goal is to recreate the *experience* of classic television:

- Present and unhurried
- Intentional channel surfing
- Warm, imperfect visuals
- Ritualistic viewing

When making decisions, prioritize:

1. **Simplicity** over feature bloat
2. **Nostalgia** over modern trends
3. **Moment** over metrics
4. **Analog warmth** over digital perfection

---

## 📄 License

**PolyForm Noncommercial 1.0.0**

- ✅ Free for personal, educational, and non-profit use
- ✅ Can modify and share
- ❌ Cannot use commercially without permission

When contributing, ensure all code is compatible with this license.

---

## 🏁 Quick Start for New Agents

```bash
# 1. Clone and navigate to project
cd /Users/ed/TVx

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev

# 4. Start docs server (separate terminal)
cd docs && bundle exec jekyll serve --host 0.0.0.0 --port 4000 --baseurl /TVx

# 5. View in browser
# App: http://localhost:5173
# Docs: http://localhost:4000/TVx
```

Reference `commands-cheatsheet.json` and `.vscode/tasks.json` for additional workflows.

---

**Happy coding! Keep the analog warmth alive. 📺✨**
