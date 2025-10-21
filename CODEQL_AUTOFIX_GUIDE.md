# CodeQL Auto-Fix Guide

## Overview

This project has automated CodeQL security scanning with auto-fix capabilities. When CodeQL detects security issues, the system can automatically create fixes or notify you for manual review.

## How It Works

### 1. **CodeQL Scanning** (`.github/workflows/codeql.yml`)
- Runs on every push to `main`
- Runs on all pull requests
- Scheduled scan every Monday at 6 AM UTC
- Detects security vulnerabilities in your code
- Creates alerts in the Security tab

### 2. **Auto-Fix Workflow** (`.github/workflows/codeql-autofix.yml`)
- Runs every Monday at 8 AM UTC (after CodeQL scan)
- Can be triggered manually via GitHub Actions
- **Automated Process:**
  1. Checks for open CodeQL alerts
  2. Runs `npm run lint --fix` to auto-fix issues
  3. Creates a PR if fixes are found
  4. Creates an issue if manual review is needed

## Usage

### Option 1: Automatic (Recommended)
The workflow runs automatically every Monday. You'll receive:
- ✅ **Pull Request** - if auto-fixes were applied
- ⚠️ **Issue** - if manual review is needed

### Option 2: Manual Trigger
1. Go to: **Actions** → **CodeQL Auto-Fix**
2. Click **Run workflow**
3. Select branch (usually `main`)
4. Click **Run workflow** button

### Option 3: On-Demand via CLI
```bash
# Trigger the workflow from command line
gh workflow run codeql-autofix.yml
```

## Reviewing Auto-Fix PRs

When you receive an auto-fix PR:

### 1. **Review the Changes**
```bash
# Fetch the PR branch
gh pr checkout <PR-number>

# Or manually
git fetch origin auto-fix/codeql-YYYYMMDD-HHMMSS
git checkout auto-fix/codeql-YYYYMMDD-HHMMSS
```

### 2. **Test Locally**
```bash
# Install dependencies
npm ci

# Run the dev server
npm run dev

# Test the application thoroughly
# Visit http://localhost:5173

# Run linter
npm run lint

# Check for TypeScript errors
npm run build
```

### 3. **Review Security Alerts**
- Go to: **Security** → **Code scanning**
- Click on each alert
- Verify the PR addresses the issues
- Check CodeQL's recommendations

### 4. **Approve and Merge**
If everything looks good:
```bash
# Via CLI
gh pr review --approve <PR-number>
gh pr merge <PR-number> --squash

# Or use the GitHub UI
```

## Manual Review Process

If auto-fix creates an issue instead of a PR:

### 1. **View the Alerts**
- Go to: **Security** → **Code scanning**
- Click on each open alert
- Read the vulnerability description
- Review CodeQL's suggested fixes

### 2. **Create a Fix Branch**
```bash
# Create a new branch for fixes
git checkout -b fix/codeql-security-issues

# Make your fixes based on CodeQL recommendations
# Edit the affected files

# Commit your changes
git add .
git commit -m "fix: Address CodeQL security alerts"

# Push and create PR
git push origin fix/codeql-security-issues
gh pr create --title "fix: Address CodeQL security alerts"
```

### 3. **Common Fixes**

#### XSS Prevention
```typescript
// ❌ Bad - vulnerable to XSS
element.innerHTML = userInput;

// ✅ Good - safe
element.textContent = userInput;
// or use React's JSX (automatically escapes)
```

#### SQL Injection (if applicable)
```typescript
// ❌ Bad
const query = `SELECT * FROM users WHERE id = ${userId}`;

// ✅ Good - use parameterized queries
const query = 'SELECT * FROM users WHERE id = ?';
db.query(query, [userId]);
```

#### Path Traversal
```typescript
// ❌ Bad
const filePath = userInput;
fs.readFile(filePath);

// ✅ Good - validate and sanitize
import path from 'path';
const safePath = path.resolve(basePath, path.basename(userInput));
```

## Configuration

### Enable Additional Auto-Fixes

You can enhance the auto-fix workflow by adding more fixers:

#### ESLint Security Plugin
```bash
npm install --save-dev eslint-plugin-security
```

Update `eslint.config.js`:
```javascript
import security from 'eslint-plugin-security';

export default [
  security.configs.recommended,
  // ... your existing config
];
```

#### TypeScript Strict Mode
In `tsconfig.json`:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### Customize Workflow Schedule

Edit `.github/workflows/codeql-autofix.yml`:
```yaml
schedule:
  - cron: '0 2 * * *'  # Daily at 2 AM
  # or
  - cron: '0 8 * * 1,4'  # Monday and Thursday at 8 AM
```

## GitHub Settings

### Enable Required Features

1. **Code Scanning Alerts**
   - Go to: **Settings** → **Code security and analysis**
   - Enable: **Code scanning**
   - Enable: **CodeQL analysis**

2. **Dependabot**
   - Enable: **Dependabot alerts**
   - Enable: **Dependabot security updates**

3. **Branch Protection** (Optional but recommended)
   - Go to: **Settings** → **Branches**
   - Add rule for `main`:
     - ✅ Require status checks to pass
     - ✅ Require branches to be up to date
     - Select: CodeQL, Security Audit

## Notifications

### Configure Alerts

1. **Watch Settings**
   - Go to: **👁️ Watch** → **Custom**
   - Enable: **Security alerts**

2. **Email Notifications**
   - Go to: **Settings** (your profile) → **Notifications**
   - Enable: **Security alerts**
   - Choose: **Email** or **Web**

3. **GitHub Mobile App**
   - Install GitHub mobile app
   - Receive push notifications for security alerts

## Troubleshooting

### Workflow Fails to Create PR

**Issue**: "refusing to allow a GitHub App to create or update workflow"

**Solution**: Enable workflow permissions
1. Go to: **Settings** → **Actions** → **General**
2. Under "Workflow permissions"
3. Select: **Read and write permissions**
4. Check: **Allow GitHub Actions to create and approve pull requests**

### No Alerts Found

**Good news!** This means:
- ✅ No security vulnerabilities detected
- ✅ Your code follows security best practices
- ✅ All dependencies are up to date

### Auto-Fix Doesn't Work

Some issues require manual fixes:
- Complex logic vulnerabilities
- Context-specific security issues
- Issues requiring architectural changes

**Action**: Follow the manual review process above

### False Positives

If CodeQL reports a false positive:
1. **Add a suppression comment** in code:
   ```typescript
   // codeql[js/sql-injection] - false positive, input is validated
   const query = buildQuery(validatedInput);
   ```

2. **Or dismiss in UI**:
   - Go to the alert
   - Click **Dismiss alert**
   - Select reason
   - Add comment

## Best Practices

### 1. **Review, Don't Auto-Merge**
- Always review auto-fix PRs
- Test thoroughly before merging
- Security fixes can have side effects

### 2. **Keep Dependencies Updated**
- Dependabot handles this automatically
- Review and merge Dependabot PRs promptly
- Security patches are important

### 3. **Regular Security Audits**
```bash
# Run npm audit
npm audit

# Auto-fix vulnerabilities
npm audit fix

# Check for available updates
npm outdated
```

### 4. **Monitor Security Tab**
- Check weekly: **Security** → **Code scanning**
- Review trends: Are alerts increasing?
- Prioritize: Critical > High > Medium

### 5. **Educate Team**
- Share this guide with team members
- Discuss security findings in code reviews
- Learn from CodeQL recommendations

## Resources

### Documentation
- [CodeQL Documentation](https://codeql.github.com/docs/)
- [GitHub Code Scanning](https://docs.github.com/en/code-security/code-scanning)
- [CodeQL Query Help](https://codeql.github.com/codeql-query-help/)

### Project Security
- [Security Policy](./SECURITY.md)
- [Security Audit Report](./SECURITY_AUDIT.md)
- [GitHub Security Tab](../../security)

### CLI Tools
```bash
# Install GitHub CLI (if not installed)
brew install gh  # macOS
# or visit: https://cli.github.com/

# Login
gh auth login

# View security alerts
gh api /repos/:owner/:repo/code-scanning/alerts

# Trigger workflow
gh workflow run codeql-autofix.yml
```

## Support

### Need Help?

1. **Check existing issues**: Search for similar problems
2. **Review CodeQL documentation**: Often has detailed examples
3. **Ask in discussions**: Create a discussion thread
4. **Contact security team**: For sensitive issues

### Report Security Issues

**DO NOT** create public issues for security vulnerabilities.

Use: **Security** → **Report a vulnerability**

---

## Quick Reference

| Task | Command |
|------|---------|
| Trigger auto-fix | `gh workflow run codeql-autofix.yml` |
| View alerts | Go to: Security → Code scanning |
| Test PR locally | `gh pr checkout <number>` |
| Run linter | `npm run lint` |
| Security audit | `npm audit` |
| View workflow runs | `gh run list --workflow=codeql-autofix.yml` |

---

**Last Updated**: October 2025  
**Maintainer**: Your Team
