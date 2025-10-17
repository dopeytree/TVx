# 🤖 Unraid Template Automation Guide

This guide explains the automation system for the TVx Unraid template.

## 📋 Overview

Two GitHub Actions workflows automatically maintain the Unraid template:

1. **update-unraid-template.yml** - Auto-updates template on new releases
2. **validate-unraid-template.yml** - Validates template on changes

## 🚀 How It Works

### Automatic Updates on Release

When you create a new GitHub release, the workflow automatically:

1. ✅ Updates the `<Date>` tag with the current date
2. ✅ Extracts release notes and updates the `<Changes>` section
3. ✅ Maintains the last 3 version entries in the changelog
4. ✅ Validates the XML syntax
5. ✅ Commits and pushes changes to your repository

### Template Validation

On every push or PR that modifies the template:

1. ✅ Validates XML syntax
2. ✅ Checks for required elements
3. ✅ Detects common issues (unescaped characters, duplicate tags)
4. ✅ Provides a summary report

## 📖 Usage Guide

### Creating a New Release (Triggers Auto-Update)

#### Option 1: Via GitHub Web Interface

1. Go to your repository: https://github.com/dopeytree/TVx
2. Click **Releases** → **Draft a new release**
3. Click **Choose a tag** → Type version (e.g., `v1.0.1`)
4. Fill in **Release title**: `v1.0.1 - Brief description`
5. Add **Release notes** (these will be added to the template):
   ```markdown
   ## What's New
   - Added logging system
   - Fixed video playback issues
   - Improved CRT effects
   
   ## Bug Fixes
   - Fixed port configuration
   - Resolved CORS issues
   ```
6. Click **Publish release**
7. 🎉 The workflow will automatically update your template!

#### Option 2: Via Command Line

```bash
# Create a new tag
git tag -a v1.0.1 -m "Version 1.0.1 - Description"

# Push the tag
git push origin v1.0.1

# Create release using GitHub CLI (optional)
gh release create v1.0.1 \
  --title "v1.0.1 - Brief description" \
  --notes "
  ## What's New
  - Feature 1
  - Feature 2
  
  ## Bug Fixes
  - Fix 1
  - Fix 2
  "
```

### Manual Trigger

You can manually trigger the template update:

1. Go to **Actions** tab in your repository
2. Select **Update Unraid Template**
3. Click **Run workflow**
4. Select branch and click **Run workflow**

## 🔧 Workflow Details

### update-unraid-template.yml

**Triggers:**
- Automatic: When a new release is published
- Manual: Via workflow_dispatch

**What it updates:**
- `<Date>` tag with current date
- `<Changes>` section with latest release notes
- Keeps last 3 versions in changelog to prevent bloat

**Example output in template:**
```xml
<Changes>
### v1.0.1 (2025-10-16)
- Added logging system
- Fixed video playback issues
- Improved CRT effects

### v1.0.0 (2025-10-13)
- Initial Unraid Community Applications release
- Full IPTV player with EPG support
</Changes>
<Date>2025-10-16</Date>
```

### validate-unraid-template.yml

**Triggers:**
- On push to main branch (if template changed)
- On pull requests (if template changed)
- Manual trigger

**Checks:**
- XML syntax validity
- Required elements present (`Name`, `Repository`, `Overview`, etc.)
- No unescaped `&` characters (should be `&amp;`)
- No duplicate tags
- Proper port format in WebUI

## 📝 Best Practices

### Release Notes Format

Write clear, user-friendly release notes:

```markdown
## What's New in v1.0.1

### Features
- 🎨 New CRT effect presets
- ⚡ Improved channel switching speed
- 📊 Added logging system

### Bug Fixes
- Fixed video playback on Safari
- Resolved EPG timezone issues
- Fixed port configuration

### Documentation
- Updated installation guide
- Added troubleshooting section
```

### Version Numbering

Follow [Semantic Versioning](https://semver.org/):
- **Major** (v2.0.0): Breaking changes
- **Minor** (v1.1.0): New features, backwards compatible
- **Patch** (v1.0.1): Bug fixes

### Testing Before Release

1. Test your changes locally
2. Create a pre-release to test automation:
   ```bash
   gh release create v1.0.1-beta \
     --title "v1.0.1 Beta" \
     --notes "Testing release" \
     --prerelease
   ```
3. Check the auto-generated template
4. Create the official release

## 🔍 Troubleshooting

### Workflow Failed

1. Go to **Actions** tab
2. Click on the failed workflow run
3. Check the error message
4. Common issues:
   - XML syntax errors
   - Missing permissions
   - Invalid release notes format

### Changes Not Appearing

1. Check if workflow completed successfully
2. Verify you're on the correct branch
3. Clear browser cache
4. Pull latest changes: `git pull origin main`

### Manual Fix Required

If automation fails, you can manually update:

```bash
# Edit the template
nano tvx-unraid-template.xml

# Update Date and Changes sections manually

# Commit and push
git add tvx-unraid-template.xml
git commit -m "Manual template update for v1.0.1"
git push
```

## 🎯 What Gets Automated

✅ **Automated:**
- Date updates
- Changelog updates from release notes
- XML validation
- Git commits and pushes

❌ **Not Automated (requires manual editing):**
- Version-specific Config changes
- New features in Overview
- Icon or screenshot updates
- Category changes
- Port or path modifications

## 📊 Monitoring

### Check Workflow Status

View all workflow runs:
```bash
gh run list --workflow="Update Unraid Template"
```

View latest run details:
```bash
gh run view --log
```

### Notifications

GitHub will notify you if workflows fail:
- Email notifications
- Web notifications
- Can configure Slack/Discord webhooks

## 🔐 Permissions

The workflows need:
- ✅ `contents: write` - To commit changes
- ✅ `GITHUB_TOKEN` - Automatically provided

No additional secrets needed!

## 🎉 Benefits

1. **Consistency** - Template always up-to-date with releases
2. **Time Saving** - No manual XML editing needed
3. **Quality** - Automatic validation prevents errors
4. **Transparency** - All changes tracked in git history
5. **User Experience** - Users always see latest changes in Community Apps

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Unraid Template Schema](https://forums.unraid.net/topic/38619-docker-template-xml-schema/)
- [Semantic Versioning](https://semver.org/)

---

**Questions?** Open an issue or ask in the Unraid forum thread!
