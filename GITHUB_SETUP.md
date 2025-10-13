# Instructions for Enabling GitHub Security Features

After pushing these changes to your repository, follow these steps in the GitHub UI:

## 1. Enable Dependabot Alerts & Updates

1. Go to your repository on GitHub
2. Click **Settings** → **Code security and analysis**
3. Enable the following:
   - ✅ **Dependency graph** (should already be on)
   - ✅ **Dependabot alerts**
   - ✅ **Dependabot security updates**
   - ✅ **Dependabot version updates** (uses `.github/dependabot.yml`)

## 2. Enable Code Scanning

1. Go to **Security** tab → **Code scanning**
2. Click **Set up code scanning**
3. Select **CodeQL Analysis**
4. The workflow file (`.github/workflows/codeql.yml`) is already committed
5. The first scan will run automatically on next push

## 3. Enable Secret Scanning

1. Go to **Settings** → **Code security and analysis**
2. Enable:
   - ✅ **Secret scanning**
   - ✅ **Push protection** (prevents accidentally pushing secrets)

## 4. Enable Private Vulnerability Reporting

1. Go to **Settings** → **Security**
2. Scroll to **Private vulnerability reporting**
3. Click **Enable**
4. This allows security researchers to report issues privately

## 5. Set Up Branch Protection (Optional but Recommended)

1. Go to **Settings** → **Branches**
2. Click **Add rule** for branch `main`
3. Configure:
   - ✅ **Require status checks to pass before merging**
   - Select: `CodeQL`, `Security Audit`, `npm audit`
   - ✅ **Require branches to be up to date before merging**
   - ✅ **Include administrators** (applies rules to you too)
4. Click **Create**

## 6. Configure Notifications

1. Go to **Settings** → **Notifications** (in your personal account)
2. Under **Security alerts**:
   - ✅ Enable notifications for security vulnerabilities
   - Choose: Email, Web, or GitHub Mobile

## 7. Review Security Overview

1. Go to **Security** tab
2. You'll see:
   - **Security advisories**: Any published vulnerabilities
   - **Dependabot alerts**: Vulnerable dependencies
   - **Code scanning alerts**: CodeQL findings
   - **Secret scanning alerts**: Any detected secrets

## 8. Docker Hub Setup (for Automated Builds)

1. Create account at https://hub.docker.com
2. Create new repository: `dopeytree/tvx`
3. Generate access token:
   - Account Settings → Security → New Access Token
   - Name it: `github-actions`
   - Copy the token
4. Add to GitHub Secrets:
   - Repository Settings → Secrets and variables → Actions
   - Click **New repository secret**
   - Name: `DOCKER_USERNAME`, Value: your Docker Hub username
   - Name: `DOCKER_PASSWORD`, Value: your access token

## What Happens Next

### Automatic Actions:

- **Every Monday**: Dependabot checks for updates
- **Every Day**: npm security audit runs
- **Every Monday**: CodeQL security scan runs
- **Every Push**: All security workflows run
- **Every PR**: Security checks must pass

### You'll Receive:

- Pull requests from Dependabot for dependency updates
- Email alerts for any security vulnerabilities
- CodeQL findings in the Security tab
- Automated Docker builds pushed to Docker Hub

## Testing the Setup

1. **Push these changes to main**:
   ```bash
   git add .
   git commit -m "feat: add security automation and Docker support"
   git push origin main
   ```

2. **Check Actions tab**:
   - You should see workflows running
   - CodeQL will start its first scan
   - Security audit will run
   - Docker build will trigger

3. **Check Security tab**:
   - Should show "No alerts" if all is well
   - May show Dependabot PRs for updates

## Maintenance

- **Weekly**: Review and merge Dependabot PRs
- **Monthly**: Check Security tab for any alerts
- **Quarterly**: Review SECURITY_AUDIT.md and update as needed

## Support

If you encounter issues:
1. Check the Actions tab for workflow failures
2. Review workflow logs for specific errors
3. Ensure all GitHub features are enabled (see steps above)

---

✅ **Your repository is now production-ready with enterprise-grade security!**
