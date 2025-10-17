---
layout: default
title: Contributing
parent: Development
nav_order: 1
---

# Development

## Prerequisites

- Node.js 18+
- npm or yarn
- Git

## Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/dopeytree/TVx.git
   cd TVx
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set environment variables (create `.env` file):

   ```bash
   VITE_M3U_URL=http://your-tunarr-ip:8000/api/channels.m3u
   VITE_XMLTV_URL=http://your-tunarr-ip:8000/api/xmltv.xml
   ```

4. Start development server:

   ```bash
   npm run dev
   ```

Open [http://localhost:5173](http://localhost:5173)

## Build

```bash
npm run build
```

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **HLS.js** for video streaming
- **WebGL shaders** for CRT effects

## Project Structure

```text
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── ChannelList.tsx # Channel list component
│   ├── EPGView.tsx     # Electronic Program Guide
│   ├── VideoPlayer.tsx # Main video player
│   └── ...
├── hooks/              # Custom React hooks
├── lib/                # Utilities
├── pages/              # Page components
├── types/              # TypeScript type definitions
└── utils/              # Helper functions
```

## Key Components

### VideoPlayer

Handles HLS video streaming with custom WebGL effects for CRT simulation.

### EPGView

Displays the electronic program guide with timeline and channel grid.

### ChannelList

Manages channel navigation and metadata display.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Bug Fix Documentation

When you fix a significant bug, create documentation following these guidelines:

### When to Document a Bug Fix

Document bug fixes that are:
- ✅ **Non-obvious** - Took significant time to debug
- ✅ **Architectural** - Reveals system behavior or design issues  
- ✅ **Impactful** - Significantly affected functionality
- ✅ **Educational** - Other developers can learn from it

### Bug Fix Documentation Process

After fixing a major bug, **you will be prompted** to create documentation:

```
🐛 Bug fixed! Would you like to create bug fix documentation? (Recommended for significant fixes)
```

**If yes:**

1. Create a new file in `docs/bugfix/YYYY-MM/descriptive-name.md`
2. Use the template from `docs/bugfix/README.md`
3. Include all of the following:

   - **Problem Description**: What wasn't working?
   - **Root Cause Analysis**: Step-by-step investigation
   - **The Fix**: Code changes and reasoning
   - **Testing Commands**: Exact commands including Docker builds with environment variables
   - **Verification**: How to confirm the fix works
   - **Files Modified**: List of changed files
   - **Technical Notes**: Deep explanation of why the bug occurred
   - **Lessons Learned**: Key takeaways and prevention strategies

### Example Documentation Structure

```markdown
# Bug Fix: Loading VHS Video Not Playing

**Date:** 2025-10-15
**Branch:** logging
**Issue:** Loading video not playing after switching to Node.js server

## Problem Description
[What wasn't working...]

## Root Cause Analysis
[Step-by-step investigation...]

## The Fix
[Code changes...]

## Testing Commands
```bash
# Build with environment variables
docker build -t tvx:latest .
docker run -d --name tvx -p 8777:80 \
  -e VITE_M3U_URL=http://192.168.22.2:8000/api/channels.m3u \
  -e VITE_XMLTV_URL=http://192.168.22.2:8000/api/xmltv.xml \
  tvx:latest
```

## Verification
[How to confirm the fix...]

## Lessons Learned
[Key takeaways...]
```

### Complete Template

See `docs/bugfix/README.md` for the complete template and examples.

### Example Bug Fix Documentation

See `docs/bugfix/2025-10/vhs-video-not-playing.md` for a full example showing:
- Thorough investigation process
- All testing commands with environment variables  
- Technical explanation of HTTP Range Requests
- Lessons learned about server implementations

## Code Style

- Use TypeScript for all new code
- Follow React best practices
- Use Tailwind CSS classes for styling
- Run `npm run lint` before committing

## Testing

Currently no automated tests are set up. Manual testing is required for all changes.

## Deployment

The app is containerized using Docker. See the main README for deployment instructions.

## License

PolyForm Noncommercial 1.0.0 - See LICENSE file for details.
