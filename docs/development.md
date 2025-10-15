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
