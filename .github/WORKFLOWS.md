# GitHub Actions Workflows

This repository uses several automated workflows to maintain code quality and security:

## 🔒 Security Workflows

### CodeQL Security Scan
- **Triggers:** Push to main, PRs, Weekly on Mondays
- **Purpose:** Scans code for security vulnerabilities
- **Languages:** JavaScript/TypeScript

### Security Audit
- **Triggers:** Push to main, PRs, Daily at 2 AM UTC
- **Purpose:** Checks npm dependencies for known vulnerabilities
- **Behavior:** 
  - Fails on critical vulnerabilities in production dependencies
  - Warns on high vulnerabilities
  - Dev-only vulnerabilities generate warnings (not failures)

## 🐳 Docker Workflows

### Build and Push Docker Image
- **Triggers:** Push to main, version tags (v*), PRs
- **Purpose:** Builds and pushes Docker images to GitHub Container Registry
- **Platforms:** linux/amd64, linux/arm64
- **Registry:** ghcr.io/dopeytree/tvx
- **Tags:** 
  - `latest` for main branch
  - `v1.0.0`, `v1.0`, `v1` for version tags
  - Branch names for feature branches

## 🤖 Dependabot Workflows

### Dependabot Auto-Merge
- **Triggers:** Dependabot pull requests
- **Purpose:** Automatically approves and merges safe dependency updates
- **Behavior:**
  - Auto-merges patch updates (1.0.x)
  - Auto-merges minor updates (1.x.0)
  - Requires manual review for major updates (x.0.0)
  - Adds warning comment on breaking changes

## 📦 Dependabot Configuration

Located in `.github/dependabot.yml`:
- **Schedule:** Weekly on Mondays at 9 AM UTC
- **Ecosystems:** npm, Docker, GitHub Actions
- **Grouped Updates:**
  - All @radix-ui packages together
  - React packages together
  - Dev dependencies (minor/patch)

## 🔧 Workflow Status

Check workflow runs: https://github.com/dopeytree/TVx/actions

## 🚨 Current Known Issues

- **esbuild/vite vulnerability (moderate):** Dev-only dependency, does not affect production builds
  - The Docker image uses pre-built static files (not affected)
  - Will be resolved with Vite 7 upgrade (breaking change, needs testing)
