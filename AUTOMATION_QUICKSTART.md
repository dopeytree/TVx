# 🤖 Automation Quick Start

## Files Created

✅ **GitHub Actions Workflows:**
- `.github/workflows/update-unraid-template.yml` - Auto-updates template on releases
- `.github/workflows/validate-unraid-template.yml` - Validates template changes

✅ **Documentation:**
- `docs/AUTOMATION.md` - Complete automation guide

✅ **Scripts:**
- `scripts/setup-automation.sh` - Quick setup script

## 🚀 Quick Setup (3 Steps)

### Step 1: Commit the Workflow Files

```bash
# From the TVx root directory
git add .github/workflows/*.yml docs/AUTOMATION.md
git commit -m "🤖 Add Unraid template automation"
git push
```

### Step 2: Verify Workflows Are Active

1. Go to: https://github.com/dopeytree/TVx/actions
2. You should see two workflows:
   - ✅ Update Unraid Template
   - ✅ Validate Unraid Template

### Step 3: Test with a Release

Create a test release to see automation in action:

```bash
# Option 1: Using GitHub CLI
gh release create v1.0.1-test \
  --title "Test Release v1.0.1" \
  --notes "Testing automation workflow" \
  --prerelease

# Option 2: Via GitHub Web Interface
# Go to: https://github.com/dopeytree/TVx/releases/new
# Create a pre-release to test
```

Watch the workflow run at: https://github.com/dopeytree/TVx/actions

## 🎯 What Happens Next

When you create a release:

1. **Workflow Triggers** automatically
2. **Date Updates** in template (`<Date>2025-10-16</Date>`)
3. **Changelog Updates** from release notes
4. **XML Validates** for errors
5. **Commits & Pushes** changes back to repo

## 📖 Full Documentation

See `docs/AUTOMATION.md` for:
- Complete usage guide
- Best practices
- Troubleshooting
- Manual override instructions

## ✅ Checklist

- [ ] Commit workflow files
- [ ] Check GitHub Actions tab
- [ ] Create test release
- [ ] Verify template updated automatically
- [ ] Read full documentation

## 🆘 Need Help?

- **Full Guide:** `docs/AUTOMATION.md`
- **GitHub Actions:** https://github.com/dopeytree/TVx/actions
- **Unraid Forum:** https://forums.unraid.net/topic/194221-support-dopeytree-docker-templates/

---

**Pro Tip:** Test with a pre-release first (check the "pre-release" box) to ensure automation works before creating official releases!
