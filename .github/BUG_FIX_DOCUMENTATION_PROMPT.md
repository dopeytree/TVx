# Bug Fix Documentation Prompt Template

## When to Use This Prompt

After completing a bug fix, if it meets any of these criteria:
- Took more than 2 hours to debug
- Required understanding of system architecture
- Involved non-obvious root causes
- Could help other developers in the future

## The Prompt

```
🐛 Bug Fix Complete!

Would you like to create bug fix documentation?

This bug fix appears to be significant. Documenting it will:
✅ Help future debugging efforts
✅ Share knowledge with the team
✅ Prevent similar issues
✅ Track project evolution

Create documentation? (yes/no)
```

## If User Says Yes

Guide them through creating documentation in:
`docs/bugfix/YYYY-MM/descriptive-name.md`

Use the template from: `docs/bugfix/README.md`

**Essential sections to include:**
1. Problem Description (what wasn't working)
2. Root Cause Analysis (step-by-step investigation)
3. The Fix (code changes with reasoning)
4. Testing Commands (exact commands with environment variables)
5. Verification (how to confirm it works)
6. Files Modified (list of changed files)
7. Technical Notes (why the bug occurred)
8. Lessons Learned (key takeaways)

## Example Questions to Ask

- "What was the first symptom you noticed?"
- "What debugging steps did you take?"
- "What finally led you to the root cause?"
- "What commands did you use to test the fix?"
- "What environment variables or configuration were needed?"
- "What would you do differently next time?"
- "What should other developers watch out for?"

## Docker Commands Template

Always include the full Docker build and run commands with environment variables:

```bash
# Build
docker build -t tvx:latest .

# Run with environment variables
docker run -d --name tvx -p 8777:80 \
  -e VITE_M3U_URL=http://your-server:8000/api/channels.m3u \
  -e VITE_XMLTV_URL=http://your-server:8000/api/xmltv.xml \
  tvx:latest

# Test
curl -I http://localhost:8777/

# View logs
docker logs -f tvx
```

## Common Documentation Mistakes to Avoid

❌ **Don't:**
- Skip testing commands
- Assume readers know the context
- Only show code without explanation
- Forget to include environment variables
- Document trivial fixes

✅ **Do:**
- Show the investigation process
- Explain WHY not just WHAT
- Include all commands needed to reproduce and test
- Add technical background information
- Focus on lessons learned

## After Documentation is Created

1. ✅ Add entry to `docs/bugfix/README.md` if it reveals a common pattern
2. ✅ Commit the documentation with the fix
3. ✅ Reference the documentation in commit messages
4. ✅ Update related documentation if needed

## Commit Message Format

```
fix: [brief description]

[Detailed explanation]

Bug fix documentation: docs/bugfix/YYYY-MM/descriptive-name.md

Root cause: [one sentence]
Impact: [who/what was affected]
```

## Example Commit Message

```
fix: loading VHS video not playing after server.js implementation

The loading-VHS.mp4 video stopped playing during channel changes after
switching from nginx to Node.js server. Root cause was missing HTTP Range
Request support, which browsers require for video elements.

Bug fix documentation: docs/bugfix/2025-10/vhs-video-not-playing.md

Root cause: Node.js server lacked HTTP Range Request support (RFC 7233)
Impact: All users - VHS loading animation not working during channel changes
```
