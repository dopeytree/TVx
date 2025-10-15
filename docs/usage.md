# Usage

## Getting Started

1. Ensure your Tunarr server is running and accessible
2. Set the `VITE_M3U_URL` and `VITE_XMLTV_URL` environment variables
3. Start TVx and open `http://localhost:8777`
4. Use arrow keys to browse channels

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `↑` `↓` | Channel surf (hold to skim) |
| `G` | Toggle full TV guide |
| `F` | Fullscreen |
| `M` | Mute/Unmute |
| `Esc` | Close modals/Exit theater |

## Features

### Instant Channel Surfing

⚡ **Instant channel surfing** — tap ↑/↓ to skim through channels quickly. Hold the keys to rapidly browse, release when you find something interesting.

### TV Guide

- Press `G` to open the full TV guide
- Shows a 12-hour timeline across all channels
- Displays poster artwork for programs
- Click on any program to jump to that channel and time

### Theater Modes

- Click on the video player to cycle through views:
  - **Guide View**: Shows channel list and current program info
  - **Normal View**: Standard player with controls
  - **Immersive View**: Full screen player with minimal UI

### Smart Channel Names

🏷️ **Smarter Tunarr channel names** — TVx automatically cleans up channel names and adds relevant icons:

- *Pulp Fiction Movies* → Pulp Fiction [🎬]
- *The Hitchhiker's Guide to the Galaxy Shows* → The Hitchhiker's Guide to the Galaxy [📺]
- *Extreme Ironing Sports* → Extreme Ironing [🏆]
- *The Tesla Files History* → The Tesla Files [📜]
- *Cosmos Documentaries* → Cosmos [📜]

### Vintage TV Effects

TVx includes authentic CRT television effects:

- Curved glass and scanlines
- Chromatic aberration and vignette
- Toggle vintage filter on/off for different aesthetics

### VHS Buffering

When a stream loads, TVx displays a vintage VHS loading animation while disks spin up and content buffers.

## Screenshots

### Main View

![Main View](https://private-user-images.githubusercontent.com/103341262/501486769-1f3ef27b-91b0-4713-b0ef-2bf33785d7fc.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NjA1NDUzMzcsIm5iZiI6MTc2MDU0NTAzNywicGF0aCI6Ii8xMDMzNDEyNjIvNTAxNDg2NzY5LTFmM2VmMjd...)

### Theatre Mode

![Theatre Mode](https://private-user-images.githubusercontent.com/103341262/501490640-123a68d4-8626-4a55-a524-56f1a5405a6c.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NjA1NDUzMzcsIm5iZiI6MTc2MDU0NTAzNywicGF0aCI6Ii8xMDMzNDEyNjIvNTAxNDkwNjQwLTEyM2E2OGQ0...)

### Full TV Guide

![Full TV Guide](https://private-user-images.githubusercontent.com/103341262/501491216-96e346fa-8ae6-4db4-b195-c371fe5b714c.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NjA1NDUzMzcsIm5iZiI6MTc2MDU0NTAzNywicGF0aCI6Ii8xMDMzNDEyNjIvNTAxNDkxMjE2LTk2ZTM0NmZhLT...)

### Keyboard Shortcuts Display

![Keyboard Shortcuts](https://private-user-images.githubusercontent.com/103341262/501506708-e7bb293a-4021-4a12-b7fa-078e8502fb68.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NjA1NDUzMzcsIm5iZiI6MTc2MDU0NTAzNywicGF0aCI6Ii8xMDMzNDEyNjIvNTAxNTA2NzA4LWU3YmIyOT...)

### Vintage TV Filter = On

![Vintage TV Filter On](https://private-user-images.githubusercontent.com/103341262/501507497-8bbd0cec-645f-4789-bb4b-268ef1f0a329.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NjA1NDUzMzcsIm5iZiI6MTc2MDU0NTAzNywicGF0aCI6Ii8xMDMzNDEyNjIvNTAxNTA3NDk3LThiYmQw...)

### Vintage TV Filter = OFF

![Vintage TV Filter Off](https://private-user-images.githubusercontent.com/103341262/501507446-94cd0844-ce80-4ef4-abc5-55c6ae687b8e.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NjA1NDUzMzcsIm5iZiI6MTc2MDU0NTAzNywicGF0aCI6Ii8xMDMzNDEyNjIvNTAxNTA3NDQ2LTk0Y2QwOD...)

### VHS Buffering Video

![VHS Buffering](https://private-user-images.githubusercontent.com/103341262/501509229-6cc65d37-008c-4bfb-8417-de53738b9e91.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NjA1NDUzMzcsIm5iZiI6MTc2MDU0NTAzNywicGF0aCI6Ii8xMDMzNDEyNjIvNTAxNTA5MjI5LTZj...)

## Browser Support

Works best in modern browsers with WebGL support:

- ✅ Chrome/Edge 90+
- ⚠️ Firefox 88+
- ✅ Safari 14+

## Troubleshooting

### Channels not loading

- Check that your M3U and XMLTV URLs are correct
- Ensure Tunarr is running and accessible
- Clear browser cache (Ctrl+Shift+R)

### Video not playing

- Verify HLS streams are working in Tunarr
- Check browser console for errors
- Try a different browser

### EPG not showing

- Confirm XMLTV URL is valid
- Check that XMLTV file contains program data
- Refresh the page

