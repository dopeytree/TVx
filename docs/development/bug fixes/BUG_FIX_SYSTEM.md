---
layout: default
title: Bug Fix System
parent: Bug Fixes
nav_order: 1
---

# Bug Fix Documentation System

## Overview

A standardized system for documenting significant bug fixes in TVx. This ensures knowledge is preserved and future developers can learn from past issues.

## Structure Created

```
docs/
├── bugfix/
│   ├── README.md                    # Complete documentation guidelines
│   ├── 2025-10/
│   │   └── vhs-video-not-playing.md # Example bug fix documentation
│   └── YYYY-MM/                     # Future bug fixes organized by month
│       └── descriptive-name.md
└── development.md                    # Updated with bug fix documentation section

.github/
└── BUG_FIX_DOCUMENTATION_PROMPT.md  # Template for prompting documentation
```

## Files Created/Modified

### 1. `docs/bugfix/README.md`
- Complete guidelines for bug fix documentation
- Template structure for all bug fixes
- When to document and when not to
- Example patterns and common issues
- **Purpose:** Central reference for all bug fix documentation

### 2. `docs/bugfix/2025-10/vhs-video-not-playing.md`
- Moved from root `BUGFIX_VHS_VIDEO.md`
- Complete example of bug fix documentation
- Includes investigation process, fix, testing commands
- **Purpose:** Reference example showing best practices

### 3. `docs/development.md` (Updated)
- Added "Bug Fix Documentation" section
- Explains when and how to document bugs
- Links to template and examples
- Includes prompt text for after fixes
- **Purpose:** Main developer guide integration

### 4. `.github/BUG_FIX_DOCUMENTATION_PROMPT.md`
- Template for prompting bug fix documentation
- Questions to ask to gather information
- Docker command templates
- Commit message format
- **Purpose:** Guide for AI/reviewers to ensure documentation

## The Process

### After Fixing a Bug

1. **Evaluate if documentation is needed:**
   - Took > 2 hours to debug?
   - Non-obvious root cause?
   - Architectural understanding required?
   - Could help others?

2. **If yes, user is prompted:**
   ```
   🐛 Bug Fix Complete!
   
   Would you like to create bug fix documentation?
   (Recommended for significant fixes)
   ```

3. **If user agrees:**
   - Create file in `docs/bugfix/YYYY-MM/descriptive-name.md`
   - Use template from `docs/bugfix/README.md`
   - Include all required sections

4. **Required sections:**
   - Problem Description
   - Root Cause Analysis
   - The Fix
   - Testing Commands (with Docker/env vars)
   - Verification
   - Files Modified
   - Technical Notes
   - Lessons Learned

## Documentation Guidelines

### DO Document:
✅ Non-obvious bugs that took significant debugging
✅ Issues revealing architectural insights
✅ Problems that could recur
✅ Fixes requiring special testing procedures
✅ Bugs involving complex system interactions

### DON'T Document:
❌ Simple typos or cosmetic fixes
❌ One-line obvious changes
❌ Trivial configuration updates
❌ Minor formatting issues

## Testing Commands

**Always include full commands with environment variables:**

```bash
# Build
docker build -t tvx:latest .

# Remove old container
docker rm -f tvx

# Run with environment variables
docker run -d --name tvx -p 8777:80 \
  -e VITE_M3U_URL=http://192.168.22.2:8000/api/channels.m3u \
  -e VITE_XMLTV_URL=http://192.168.22.2:8000/api/xmltv.xml \
  tvx:latest

# Test
curl -I http://localhost:8777/

# View logs
docker logs -f tvx
```

## Commit Message Format

```
fix: [brief description]

[Detailed explanation]

Bug fix documentation: docs/bugfix/YYYY-MM/descriptive-name.md

Root cause: [one sentence]
Impact: [who/what was affected]
```

## Benefits

1. **Knowledge Preservation**: Future developers understand past issues
2. **Faster Debugging**: Similar issues solved quicker
3. **Better Architecture**: Patterns emerge from documented bugs
4. **Team Learning**: Developers learn from each other's investigations
5. **Quality Improvement**: Understanding bugs prevents future issues

## Example

See `docs/bugfix/2025-10/vhs-video-not-playing.md` for a complete example showing:
- Thorough investigation process
- Failed attempts before finding solution
- Complete testing commands with environment variables
- Technical explanation of HTTP Range Requests
- Lessons learned about nginx vs Node.js

## Monthly Organization

Bug fixes are organized by year-month for easy navigation:
- `2025-10/` - October 2025
- `2025-11/` - November 2025
- etc.

This keeps documentation organized and easy to find by date.

## Common Patterns

As bugs are documented, common patterns will be added to `docs/bugfix/README.md`:

### Example Pattern: Server Feature Parity
- **Symptom:** Feature worked with nginx, broke with Node.js
- **Root Cause:** Missing standard server features
- **Prevention:** Test all functionality when changing servers
- **Reference:** `2025-10/vhs-video-not-playing.md`

## Future Enhancements

Potential improvements to this system:
- Automated prompts in CI/CD for significant changes
- Bug fix index/search functionality
- Integration with issue tracking
- Automated testing checklist generation
- Pattern detection across bug fixes

## Quick Reference

- **Template:** `docs/bugfix/README.md`
- **Example:** `docs/bugfix/2025-10/vhs-video-not-playing.md`
- **Guidelines:** `docs/development.md` (Bug Fix Documentation section)
- **Prompt Template:** `.github/BUG_FIX_DOCUMENTATION_PROMPT.md`

## Questions?

If unsure whether to document a bug fix, ask:
- Would I want this information in 6 months?
- Did this teach me something important?
- Could someone else hit this issue?

**When in doubt, document it!** It's better to over-document than lose valuable knowledge.
