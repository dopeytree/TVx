# 🚀 IMPORTANT: Separate Repository Setup

## ⚠️ You Mentioned Using a Separate unraid-templates Repository

I've created an **additional workflow** for the common pattern where Unraid templates live in a separate repository.

## 📋 Two Workflow Options

### Option 1: Same Repository (Simple)
**File:** `.github/workflows/update-unraid-template.yml`
- Updates `tvx-unraid-template.xml` in the TVx repo
- ✅ Already created
- ✅ No extra setup needed

### Option 2: Separate Repository (Standard Pattern)
**File:** `.github/workflows/update-unraid-template-remote.yml`
- Updates template in your `unraid-templates` repository
- ⚠️ **Requires setup** (see below)
- ✅ Standard pattern used by most developers

## 🔧 Required Setup for Separate Repository

### 1. Create Personal Access Token (PAT)

1. Go to: <https://github.com/settings/tokens>
2. Click **Generate new token** → **Generate new token (classic)**
3. Configure:
   - **Note:** `Unraid Templates Automation`
   - **Expiration:** No expiration
   - **Scopes:** Check ✅ `repo` and ✅ `workflow`
4. Click **Generate token**
5. **COPY THE TOKEN** immediately

### 2. Add Secret to TVx Repository

1. Go to: <https://github.com/dopeytree/TVx/settings/secrets/actions>
2. Click **New repository secret**
3. Set:
   - **Name:** `PAT_UNRAID_TEMPLATES`
   - **Value:** Paste your token
4. Click **Add secret**

### 3. Update Template URL

In `tvx-unraid-template.xml`, change:

```xml
<TemplateURL>https://raw.githubusercontent.com/dopeytree/unraid-templates/main/tvx.xml</TemplateURL>
```

## 📚 Documentation

**Complete setup guide:** `docs/AUTOMATION_SEPARATE_REPO.md`

## 🎯 Decision Time

### Use Same Repo (Option 1) If:
- You only have TVx
- You want simplest setup
- Template URL: `...TVx/main/tvx-unraid-template.xml`

**→ Delete:** `.github/workflows/update-unraid-template-remote.yml`
**→ Keep:** `.github/workflows/update-unraid-template.yml`

### Use Separate Repo (Option 2) If:
- You have multiple apps
- You want standard pattern
- Template URL: `...unraid-templates/main/tvx.xml`

**→ Keep Both Workflows** (or delete the single-repo one)
**→ Complete Setup:** Follow steps above

## ✅ Quick Actions

### If Using Same Repo (Simpler):

```bash
# Remove the separate repo workflow
rm .github/workflows/update-unraid-template-remote.yml

# Commit
git add -A
git commit -m "🤖 Use same-repo automation workflow"
git push
```

### If Using Separate Repo (Standard):

```bash
# 1. Create PAT (see above)
# 2. Add secret (see above)
# 3. Commit both workflows
git add .github/workflows/
git commit -m "🤖 Add automation workflows for separate template repo"
git push

# 4. Update TemplateURL in tvx-unraid-template.xml
```

## 📖 Full Documentation

- **Same Repo:** `docs/AUTOMATION.md`
- **Separate Repo:** `docs/AUTOMATION_SEPARATE_REPO.md`
- **Quick Start:** `AUTOMATION_QUICKSTART.md`

---

**Choose your path and follow the setup!** 🚀
