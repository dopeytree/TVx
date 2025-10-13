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

## 5. Set Up Branch Protection (Recommended)

Branch protection prevents accidental force pushes, deletions, and ensures code quality through automated checks.

### Quick Setup (Minimal Protection):

For personal projects, enable basic protection without blocking yourself:

1. Go to **Settings** → **Branches** (or visit: `https://github.com/dopeytree/TVx/settings/branches`)
2. Click **Add branch protection rule**
3. Branch name pattern: `main`
4. Enable these settings:
   - ✅ **Require status checks to pass before merging** (optional, see Advanced Setup)
   - ⚠️ **Do not allow force pushes** - LEAVE UNCHECKED (prevents rewriting history)
   - ⚠️ **Allow deletions** - LEAVE UNCHECKED (prevents accidental branch deletion)
5. Click **Create**

This removes the GitHub warning and protects your main branch from force pushes and accidental deletion.

### Advanced Setup (Recommended for Teams):

For stricter protection with automated workflow checks:

1. Go to **Settings** → **Branches**
2. Click **Add branch protection rule** (or edit existing rule)
3. Branch name pattern: `main`
4. Configure:
   - ✅ **Require a pull request before merging**
     - Require approvals: 1 (if working with others)
     - Dismiss stale pull request approvals when new commits are pushed
   - ✅ **Require status checks to pass before merging**
     - ✅ Require branches to be up to date before merging
     - Select these status checks:
       * `CodeQL` (security scanning)
       * `Security Audit` (npm vulnerabilities)
       * `build-and-push / build-and-push` (Docker build)
   - ✅ **Require conversation resolution before merging**
   - ✅ **Require signed commits** (optional, requires GPG setup)
   - ✅ **Do not allow bypassing the above settings**
   - ✅ **Restrict who can push to matching branches** (optional)
   - ⚠️ **Do not allow force pushes** - LEAVE UNCHECKED
   - ⚠️ **Allow deletions** - LEAVE UNCHECKED
5. Click **Create** or **Save changes**

**Note**: If you enable "Require a pull request before merging", you'll need to create PRs even for your own changes. This is great for discipline but can slow down solo work.

### Testing Branch Protection:

After setup, try to force push to test:
```bash
# This should now be blocked
git push --force origin main
```

You should see an error like: `remote: error: GH006: Protected branch update failed`

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

## 8. GitHub Container Registry Setup (for Automated Builds)

The Docker build workflow is already configured to use GitHub Container Registry (ghcr.io).

**No additional setup required!** The workflow uses `GITHUB_TOKEN` which is automatically available.

### What happens automatically:

1. On every push to `main`, Docker images are built and pushed to `ghcr.io/dopeytree/tvx`
2. Images are tagged with:
   - `latest` for main branch
   - Version tags (e.g., `v1.0.0`, `v1.0`, `v1`) for releases
   - Branch names for feature branches
3. Multi-arch support: `linux/amd64` and `linux/arm64`

### Making the package public:

1. After first build, go to: https://github.com/dopeytree?tab=packages
2. Find `tvx` package
3. Click **Package settings**
4. Scroll to **Danger Zone**
5. Click **Change visibility** → **Public**

This allows anyone to pull your image without authentication.

## What Happens Next

### Automatic Actions:

- **Every Monday**: Dependabot checks for updates
- **Every Day**: npm security audit runs
- **Every Monday**: CodeQL security scan runs
- **Every Push**: All security workflows run + Docker images built
- **Every PR**: Security checks must pass

### You'll Receive:

- Pull requests from Dependabot for dependency updates
- Email alerts for any security vulnerabilities
- CodeQL findings in the Security tab
- Automated Docker builds pushed to GitHub Container Registry

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
