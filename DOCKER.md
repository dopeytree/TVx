# Docker Deployment Guide

## Quick Start

### Pull and Run

```bash
docker run -d \
  --name tvx \
  -p 8777:80 \
  --restart unless-stopped \
  dopeytree/tvx:latest
```

Access at: <http://localhost:8777>

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  tvx:
    image: dopeytree/tvx:latest
    container_name: tvx
    ports:
      - "8777:80"
    restart: unless-stopped
    environment:
      - TZ=America/New_York
```

Run:
```bash
docker-compose up -d
```

## Building Locally

### Build the Image

```bash
docker build -t tvx .
```

### Run Your Local Build

```bash
docker run -d -p 8777:80 --name tvx tvx
```

## Configuration

### Port Mapping

Change the host port (left side):
```bash
docker run -d -p 8080:80 --name tvx dopeytree/tvx:latest
```

Access at: <http://localhost:8080>

### Timezone

Set your timezone:
```bash
docker run -d \
  -p 8777:80 \
  -e TZ=Europe/London \
  --name tvx \
  dopeytree/tvx:latest
```

### Persistent Settings

TVx stores settings in browser localStorage (client-side), so no volume mounting is needed.

## Image Details

- **Base**: Alpine Linux (nginx:alpine)
- **Size**: ~50MB compressed
- **Architecture**: Multi-arch (amd64, arm64)
- **Health Check**: Included
- **Compression**: Gzip enabled
- **Cache**: Optimized for static assets

## Advanced

### Custom nginx Configuration

Mount your own config:
```bash
docker run -d \
  -p 8777:80 \
  -v /path/to/nginx.conf:/etc/nginx/conf.d/default.conf:ro \
  --name tvx \
  dopeytree/tvx:latest
```

### Reverse Proxy

Behind Nginx/Traefik, use a simple proxy pass. TVx is a SPA, so all routes should point to `index.html`.

Example nginx reverse proxy:
```nginx
location / {
    proxy_pass http://localhost:8777;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

## Publishing to Docker Hub

### Setup (One-time)

1. Create Docker Hub account at https://hub.docker.com
2. Create repository: `dopeytree/tvx`
3. Generate access token: Account Settings → Security → New Access Token
4. Add to GitHub Secrets:
   - `DOCKER_USERNAME`: Your Docker Hub username
   - `DOCKER_PASSWORD`: Your access token

### Automatic Builds

The GitHub Actions workflow (`.github/workflows/docker-build.yml`) automatically:
- Builds on every push to `main`
- Creates multi-arch images (amd64, arm64)
- Tags with `latest` and version numbers
- Pushes to Docker Hub

### Manual Build & Push

```bash
# Build
docker build -t dopeytree/tvx:latest .

# Login
docker login

# Push
docker push dopeytree/tvx:latest
```

### Multi-arch Build

```bash
# Create buildx builder
docker buildx create --name multiarch --use

# Build and push for multiple architectures
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t dopeytree/tvx:latest \
  --push \
  .
```

## Troubleshooting

### Check Logs
```bash
docker logs tvx
```

### Health Check
```bash
docker inspect --format='{{.State.Health.Status}}' tvx
```

### Restart Container
```bash
docker restart tvx
```

### Remove and Recreate
```bash
docker rm -f tvx
docker run -d -p 3000:80 --name tvx dopeytree/tvx:latest
```

## Updates

### Pull Latest Version
```bash
docker pull dopeytree/tvx:latest
docker rm -f tvx
docker run -d -p 8777:80 --restart unless-stopped --name tvx dopeytree/tvx:latest
```

### With Docker Compose
```bash
docker-compose pull
docker-compose up -d
```
