# 🤖 Unraid Template Automation - Separate Repository Setup

This guide is for maintaining your Unraid template in a **separate repository** (the common pattern used by many developers).

## 📋 Repository Structure

**Two Repositories:**

1. **`dopeytree/TVx`** - Your main application repository
2. **`dopeytree/unraid-templates`** - Your Unraid templates repository

## 🔧 Setup Required

### Step 1: Create Personal Access Token (PAT)

The workflow needs permission to push to your unraid-templates repository.

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Or direct link: <https://github.com/settings/tokens>

2. Click **Generate new token** → **Generate new token (classic)**

3. Configure the token:
   - **Note:** `Unraid Templates Automation`
   - **Expiration:** `No expiration` (or 1 year)
   - **Scopes:** Select:
     - ✅ `repo` (Full control of private repositories)
     - ✅ `workflow` (Update GitHub Action workflows)

4. Click **Generate token**

5. **COPY THE TOKEN NOW** - You won't see it again!

### Step 2: Add Token to TVx Repository Secrets

1. Go to your TVx repository settings:
   - <https://github.com/dopeytree/TVx/settings/secrets/actions>

2. Click **New repository secret**

3. Configure:
   - **Name:** `PAT_UNRAID_TEMPLATES`
   - **Value:** Paste the token you copied
   - Click **Add secret**

### Step 3: Create/Verify unraid-templates Repository

If you don't have it yet:

```bash
# Create the repository on GitHub first, then:
git clone https://github.com/dopeytree/unraid-templates.git
cd unraid-templates

# Add a README
echo "# Unraid Templates

Docker templates for Unraid Community Applications.

Maintained by dopeytree.
" > README.md

git add README.md
git commit -m "Initial commit"
git push
```

### Step 4: Add Workflow to TVx Repository

The workflow file has been created at:
`.github/workflows/update-unraid-template-remote.yml`

Commit and push it:

```bash
cd /Users/ed/TVx

git add .github/workflows/update-unraid-template-remote.yml
git commit -m "🤖 Add workflow to update template in separate repo"
git push
```

## 🚀 How It Works

### On Every Release:

1. **Workflow triggers** when you create a release in TVx
2. **Checks out both repos:**
   - Your TVx repository
   - Your unraid-templates repository
3. **Updates template:**
   - Copies `tvx-unraid-template.xml` → `unraid-templates/tvx.xml`
   - Updates `<Date>` tag
   - Updates `<Changes>` from release notes
4. **Commits to unraid-templates:**
   - Pushes updated `tvx.xml` to unraid-templates repo
5. **Optionally syncs back:**
   - Updates local `tvx-unraid-template.xml` in TVx repo

## 📝 Template URL Update

Update your template's `<TemplateURL>` to point to the separate repo:

```xml
<TemplateURL>https://raw.githubusercontent.com/dopeytree/unraid-templates/main/tvx.xml</TemplateURL>
```

Instead of:

```xml
<TemplateURL>https://raw.githubusercontent.com/dopeytree/TVx/main/tvx-unraid-template.xml</TemplateURL>
```

## 🎯 Repository Patterns

### Pattern 1: Separate Repo (Recommended)

**Structure:**

```
dopeytree/TVx/
├── tvx-unraid-template.xml (development copy)
└── .github/workflows/update-unraid-template-remote.yml

dopeytree/unraid-templates/
├── tvx.xml (published template)
├── other-app.xml
└── README.md
```

**Pros:**
- ✅ Clean separation of concerns
- ✅ Multiple apps in one templates repo
- ✅ Easy for Community Apps to track
- ✅ Standard pattern used by most developers

**Cons:**
- ⚠️ Requires PAT setup
- ⚠️ Two repos to manage

### Pattern 2: Same Repo

**Structure:**

```
dopeytree/TVx/
├── tvx-unraid-template.xml
└── .github/workflows/update-unraid-template.yml
```

**Pros:**
- ✅ Simpler setup
- ✅ Everything in one place
- ✅ No PAT needed

**Cons:**
- ⚠️ Template mixed with application code
- ⚠️ Harder if you have multiple apps

## 🔄 Workflow Comparison

### Separate Repo Workflow

**File:** `.github/workflows/update-unraid-template-remote.yml`

**What it does:**
1. Checkout TVx repo
2. Checkout unraid-templates repo (using PAT)
3. Copy template between repos
4. Update template
5. Push to unraid-templates
6. Optionally sync back to TVx

### Same Repo Workflow

**File:** `.github/workflows/update-unraid-template.yml`

**What it does:**
1. Checkout TVx repo
2. Update template in place
3. Push to TVx

## 🧪 Testing

### Test the Separate Repo Workflow

1. **Create a test release in TVx:**

   ```bash
   gh release create v1.0.1-test \
     --title "Test Separate Repo Automation" \
     --notes "Testing automatic template update to separate repo" \
     --prerelease
   ```

2. **Watch the workflow:**
   - TVx Actions: <https://github.com/dopeytree/TVx/actions>
   - Look for "Update Unraid Template (Separate Repo)"

3. **Verify in unraid-templates:**
   - Check: <https://github.com/dopeytree/unraid-templates>
   - Look for automated commit
   - Check `tvx.xml` was updated

4. **Check TVx was synced:**
   - Pull latest: `git pull`
   - Check `tvx-unraid-template.xml` was also updated

## ⚙️ Configuration Options

### Change Template Filename

If you want a different filename in unraid-templates:

```yaml
# In update-unraid-template-remote.yml
- name: Copy template to unraid-templates repo
  run: |
    cp tvx/tvx-unraid-template.xml unraid-templates/your-name.xml
```

### Disable Local Sync

If you don't want to sync back to TVx repo, comment out this step:

```yaml
# - name: Also update local template (optional)
#   working-directory: tvx
#   run: |
#     ...
```

### Different Branch

If your unraid-templates uses a different branch:

```yaml
- name: Checkout unraid-templates repository
  uses: actions/checkout@v4
  with:
    repository: dopeytree/unraid-templates
    ref: master  # or whatever branch you use
    token: ${{ secrets.PAT_UNRAID_TEMPLATES }}
    path: unraid-templates
```

## 🐛 Troubleshooting

### Error: "Could not resolve to a Repository"

**Problem:** PAT secret not set or incorrect repository name

**Fix:**
1. Verify secret exists: Settings → Secrets → Actions
2. Check repository name in workflow matches yours
3. Regenerate PAT if needed

### Error: "Authentication failed"

**Problem:** PAT doesn't have correct permissions

**Fix:**
1. Go to <https://github.com/settings/tokens>
2. Find your token
3. Edit and ensure `repo` and `workflow` scopes are checked
4. Update secret in TVx repository

### Error: "refusing to allow a Personal Access Token"

**Problem:** Fine-grained PAT instead of Classic PAT

**Fix:**
- Use **Classic PAT**, not Fine-grained
- Or configure fine-grained PAT with correct repository permissions

### Template Not Pushed to unraid-templates

**Check:**

```bash
# View workflow logs
gh run list --repo dopeytree/TVx --workflow="Update Unraid Template (Separate Repo)"
gh run view --repo dopeytree/TVx --log
```

**Common causes:**
- PAT expired
- Wrong repository name
- Wrong branch name
- Repository doesn't exist

## 📚 Which Workflow Should I Use?

### Use Separate Repo If:

- ✅ You have multiple Unraid apps
- ✅ You want clean separation
- ✅ You follow standard Unraid developer patterns
- ✅ You're okay with PAT setup

**→ Use:** `.github/workflows/update-unraid-template-remote.yml`

### Use Same Repo If:

- ✅ You only have one app
- ✅ You want simpler setup
- ✅ You don't mind template in app repo

**→ Use:** `.github/workflows/update-unraid-template.yml`

## 🎯 Recommended: Separate Repo

Most established Unraid developers use the separate repository pattern because:

1. **Scalability** - Easy to add more apps
2. **Organization** - Clean separation of concerns
3. **Community Apps** - Easier for CA to track one templates repo
4. **Best Practice** - Industry standard pattern

## ✅ Setup Checklist

- [ ] Created PAT with `repo` and `workflow` scopes
- [ ] Added PAT as secret `PAT_UNRAID_TEMPLATES` in TVx repo
- [ ] Created/verified unraid-templates repository exists
- [ ] Added workflow file to TVx repository
- [ ] Updated `<TemplateURL>` in template to point to separate repo
- [ ] Tested with a pre-release
- [ ] Verified template updated in unraid-templates repo
- [ ] Verified local template synced back (if enabled)

## 🎉 You're Done!

Your Unraid template will now automatically update in your separate templates repository whenever you create a release!

---

**Need Help?**

- 📖 Read: `docs/AUTOMATION.md`
- 💬 Ask: [Unraid Forum](https://forums.unraid.net/topic/194221-support-dopeytree-docker-templates/)
- 🐛 Report: [GitHub Issues](https://github.com/dopeytree/TVx/issues)
