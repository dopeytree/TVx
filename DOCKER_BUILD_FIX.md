# Docker Multi-Architecture Build Fix

## Problem
The Docker build was failing during ARM64 compilation with the error:
```
qemu: uncaught target signal 4 (Illegal instruction) - core dumped
```

This occurred during the `npm ci` step when building for ARM64 architecture using QEMU emulation on AMD64 GitHub Actions runners.

## Root Cause
- QEMU emulation can be unstable when running intensive Node.js operations
- Network concurrency issues during package installation
- Memory constraints during cross-platform builds

## Solutions Implemented

### 1. Dockerfile Optimizations (`Dockerfile`)

#### Added Node.js memory optimization:
```dockerfile
ENV NODE_OPTIONS="--max-old-space-size=4096"
```
- Increases memory allocation for Node.js processes
- Prevents out-of-memory errors during builds

#### Modified npm ci command:
```dockerfile
RUN npm ci --prefer-offline --no-audit --maxsockets 1
```
- `--prefer-offline`: Uses local cache when possible, reducing network requests
- `--no-audit`: Skips security audit during install (speeds up process)
- `--maxsockets 1`: Limits concurrent network connections to prevent QEMU crashes

### 2. GitHub Actions Workflow Improvements (`.github/workflows/docker-build.yml`)

#### Added explicit QEMU setup:
```yaml
- name: Set up QEMU
  uses: docker/setup-qemu-action@v3
  with:
    platforms: linux/amd64,linux/arm64
```

#### Enhanced Docker Buildx configuration:
```yaml
- name: Set up Docker Buildx
  uses: docker/setup-buildx-action@v3
  with:
    driver-opts: |
      image=moby/buildkit:latest
      network=host
```
- Uses latest BuildKit image for better multi-arch support
- `network=host` improves build performance

#### Added build optimizations:
```yaml
build-args: |
  BUILDKIT_INLINE_CACHE=1
provenance: true
```
- Enables inline caching for faster rebuilds
- Adds provenance attestation for supply chain security

## Testing
After these changes:
1. Commit and push to trigger the build workflow
2. Monitor the build at: Actions → Build and Push Docker Image
3. Verify both AMD64 and ARM64 platforms build successfully

## Alternative Solutions (if issues persist)

### Option 1: Build platforms separately
```yaml
strategy:
  matrix:
    platform: [linux/amd64, linux/arm64]
```

### Option 2: Use native ARM64 runners
```yaml
runs-on: ${{ matrix.platform == 'linux/arm64' && 'ubuntu-latest-arm' || 'ubuntu-latest' }}
```

### Option 3: Skip ARM64 temporarily
```yaml
platforms: linux/amd64
```

## Related Issues
- QEMU signal 4 errors are known issues with Node.js native modules
- See: https://github.com/docker/buildx/issues/395
- See: https://github.com/nodejs/docker-node/issues/1798

## Next Steps
1. Monitor the next build run
2. If successful, no further action needed
3. If issues persist, consider Option 1 (separate platform builds)

## Files Modified
- `Dockerfile` - Added Node.js optimizations and npm install flags
- `.github/workflows/docker-build.yml` - Enhanced QEMU and Buildx setup
