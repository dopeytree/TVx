

<!DOCTYPE html>

<html lang="en-US">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=Edge">

  <link rel="stylesheet" href="/TVx/assets/css/just-the-docs-default.css">

  <link rel="stylesheet" href="/TVx/assets/css/just-the-docs-head-nav.css" id="jtd-head-nav-stylesheet">

  <style id="jtd-nav-activation">
  
    .site-nav ul li a {
      background-image: none;
    }

  </style>

  

  
    <script src="/TVx/assets/js/vendor/lunr.min.js"></script>
  

  <script src="/TVx/assets/js/just-the-docs.js"></script>

  <meta name="viewport" content="width=device-width, initial-scale=1">

  



  <!-- Begin Jekyll SEO tag v2.8.0 -->
<title>Bug Fixes | TVx</title>
<meta name="generator" content="Jekyll v3.9.5" />
<meta property="og:title" content="Bug Fixes" />
<meta property="og:locale" content="en_US" />
<meta name="description" content="The warmth of modern nostalgia - IPTV + EPG viewer for Tunarr" />
<meta property="og:description" content="The warmth of modern nostalgia - IPTV + EPG viewer for Tunarr" />
<link rel="canonical" href="http://localhost:4001/TVx/development/bug%20fixes/README.txt" />
<meta property="og:url" content="http://localhost:4001/TVx/development/bug%20fixes/README.txt" />
<meta property="og:site_name" content="TVx" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary" />
<meta property="twitter:title" content="Bug Fixes" />
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"WebPage","description":"The warmth of modern nostalgia - IPTV + EPG viewer for Tunarr","headline":"Bug Fixes","url":"http://localhost:4001/TVx/development/bug%20fixes/README.txt"}</script>
<!-- End Jekyll SEO tag -->


  

</head>

<!-- GLightbox CSS -->
<link rel="stylesheet" href="/TVx/assets/css/glightbox.min.css">
<body>
  <a class="skip-to-main" href="#main-content">Skip to main content</a>
  <svg xmlns="http://www.w3.org/2000/svg" class="d-none">
  <symbol id="svg-link" viewBox="0 0 24 24">
  <title>Link</title>
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-link">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
  </svg>
</symbol>

  <symbol id="svg-menu" viewBox="0 0 24 24">
  <title>Menu</title>
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-menu">
    <line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
</symbol>

  <symbol id="svg-arrow-right" viewBox="0 0 24 24">
  <title>Expand</title>
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-right">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
</symbol>

  <!-- Feather. MIT License: https://github.com/feathericons/feather/blob/master/LICENSE -->
<symbol id="svg-external-link" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-external-link">
  <title id="svg-external-link-title">(external link)</title>
  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line>
</symbol>

  
    <symbol id="svg-doc" viewBox="0 0 24 24">
  <title>Document</title>
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-file">
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline>
  </svg>
</symbol>

    <symbol id="svg-search" viewBox="0 0 24 24">
  <title>Search</title>
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-search">
    <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
</symbol>

  
  
    <!-- Bootstrap Icons. MIT License: https://github.com/twbs/icons/blob/main/LICENSE.md -->
<symbol id="svg-copy" viewBox="0 0 16 16">
  <title>Copy</title>
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clipboard" viewBox="0 0 16 16">
    <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
    <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
  </svg>
</symbol>
<symbol id="svg-copied" viewBox="0 0 16 16">
  <title>Copied</title>
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clipboard-check-fill" viewBox="0 0 16 16">
    <path d="M6.5 0A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3Zm3 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3Z"/>
    <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1A2.5 2.5 0 0 1 9.5 5h-3A2.5 2.5 0 0 1 4 2.5v-1Zm6.854 7.354-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 0 1 .708-.708L7.5 10.793l2.646-2.647a.5.5 0 0 1 .708.708Z"/>
  </svg>
</symbol>

  
</svg>

  
    <div class="side-bar">
  <div class="site-header" role="banner">
    <a href="/TVx/" class="site-title lh-tight">
  TVx

</a>
    <button id="menu-button" class="site-button btn-reset" aria-label="Toggle menu" aria-pressed="false">
      <svg viewBox="0 0 24 24" class="icon" aria-hidden="true"><use xlink:href="#svg-menu"></use></svg>
    </button>
  </div>

  <nav aria-label="Main" id="site-nav" class="site-nav">
  
  
    <ul class="nav-list"><li class="nav-list-item"><a href="/TVx/" class="nav-list-link">Home</a></li><li class="nav-list-item"><button class="nav-list-expander btn-reset" aria-label="toggle items in Install category" aria-pressed="false">
        <svg viewBox="0 0 24 24" aria-hidden="true"><use xlink:href="#svg-arrow-right"></use></svg>
      </button><a href="/TVx/install/" class="nav-list-link">Install</a><ul class="nav-list"><li class="nav-list-item"><a href="/TVx/install/prerequisites.html" class="nav-list-link">Prerequisites</a></li><li class="nav-list-item"><a href="/TVx/install/unraid.html" class="nav-list-link">Unraid</a></li><li class="nav-list-item"><a href="/TVx/install/docker.html" class="nav-list-link">Docker</a></li></ul></li><li class="nav-list-item"><button class="nav-list-expander btn-reset" aria-label="toggle items in Quick Start category" aria-pressed="false">
        <svg viewBox="0 0 24 24" aria-hidden="true"><use xlink:href="#svg-arrow-right"></use></svg>
      </button><a href="/TVx/quick-start/" class="nav-list-link">Quick Start</a><ul class="nav-list"><li class="nav-list-item"><a href="/TVx/quick-start/gui.html" class="nav-list-link">GUI</a></li><li class="nav-list-item"><a href="/TVx/quick-start/keyboard-shortcuts.html" class="nav-list-link">Keyboard Shortcuts</a></li></ul></li><li class="nav-list-item"><button class="nav-list-expander btn-reset" aria-label="toggle items in Manual category" aria-pressed="false">
        <svg viewBox="0 0 24 24" aria-hidden="true"><use xlink:href="#svg-arrow-right"></use></svg>
      </button><a href="/TVx/manual/" class="nav-list-link">Manual</a><ul class="nav-list"><li class="nav-list-item"><a href="/TVx/manual/usage-overview.html" class="nav-list-link">Usage</a></li><li class="nav-list-item"><a href="/TVx/manual/features.html" class="nav-list-link">Features</a></li><li class="nav-list-item"><a href="/TVx/manual/browser-support.html" class="nav-list-link">Browser Support</a></li><li class="nav-list-item"><a href="/TVx/manual/tech-stack.html" class="nav-list-link">Tech Stack</a></li><li class="nav-list-item"><a href="/TVx/manual/logging.html" class="nav-list-link">Logging</a></li><li class="nav-list-item"><button class="nav-list-expander btn-reset" aria-label="toggle items in Troubleshooting category" aria-pressed="false">
        <svg viewBox="0 0 24 24" aria-hidden="true"><use xlink:href="#svg-arrow-right"></use></svg>
      </button><a href="/TVx/manual/troubleshooting/" class="nav-list-link">Troubleshooting</a><ul class="nav-list"><li class="nav-list-item"><a href="/TVx/manual/troubleshooting/channels/channels-not-loading.html" class="nav-list-link">Channels Not Loading</a></li><li class="nav-list-item"><a href="/TVx/manual/troubleshooting/video/video-not-playing.html" class="nav-list-link">Video Not Playing</a></li><li class="nav-list-item"><a href="/TVx/manual/troubleshooting/video/loading-vhs-not-playing.html" class="nav-list-link">Loading VHS Video Not Playing</a></li><li class="nav-list-item"><a href="/TVx/manual/troubleshooting/epg/epg-not-showing.html" class="nav-list-link">EPG Not Showing</a></li><li class="nav-list-item"><a href="/TVx/manual/troubleshooting/docker/docker-issues.html" class="nav-list-link">Docker Issues</a></li><li class="nav-list-item"><a href="/TVx/manual/troubleshooting/performance/performance-issues.html" class="nav-list-link">Performance Issues</a></li><li class="nav-list-item"><a href="/TVx/manual/troubleshooting/browser/browser-console-errors.html" class="nav-list-link">Browser Console Errors</a></li><li class="nav-list-item"><a href="/TVx/manual/troubleshooting/effects/vintage-tv-effects-issues.html" class="nav-list-link">Vintage TV Effects Issues</a></li><li class="nav-list-item"><a href="/TVx/manual/troubleshooting/logging/logging-issues.html" class="nav-list-link">Logging Issues</a></li></ul></li></ul></li><li class="nav-list-item"><button class="nav-list-expander btn-reset" aria-label="toggle items in Development category" aria-pressed="false">
        <svg viewBox="0 0 24 24" aria-hidden="true"><use xlink:href="#svg-arrow-right"></use></svg>
      </button><a href="/TVx/development/" class="nav-list-link">Development</a><ul class="nav-list"><li class="nav-list-item"><a href="/TVx/development/development.html" class="nav-list-link">Contributing</a></li><li class="nav-list-item"><a href="/TVx/development/server-implementation.html" class="nav-list-link">Server Implementation</a></li><li class="nav-list-item"><button class="nav-list-expander btn-reset" aria-label="toggle items in Documentation category" aria-pressed="false">
        <svg viewBox="0 0 24 24" aria-hidden="true"><use xlink:href="#svg-arrow-right"></use></svg>
      </button><a href="/TVx/development/documentation%20dev/" class="nav-list-link">Documentation</a><ul class="nav-list"><li class="nav-list-item"><a href="/TVx/development/documentation%20dev/DOCUMENTATION_UPDATE_SUMMARY.html" class="nav-list-link">Update Summary</a></li><li class="nav-list-item"><a href="/TVx/development/documentation%20dev/THEME_SETUP.html" class="nav-list-link">Theme & Search</a></li><li class="nav-list-item"><a href="/TVx/development/documentation%20dev/TVX_THEME.html" class="nav-list-link">Theme Colors</a></li><li class="nav-list-item"><a href="/TVx/development/documentation%20dev/running-docs-server.html" class="nav-list-link">Running Docs Server</a></li></ul></li><li class="nav-list-item"><button class="nav-list-expander btn-reset" aria-label="toggle items in GitHub Automation category" aria-pressed="false">
        <svg viewBox="0 0 24 24" aria-hidden="true"><use xlink:href="#svg-arrow-right"></use></svg>
      </button><a href="/TVx/development/github/" class="nav-list-link">GitHub Automation</a><ul class="nav-list"><li class="nav-list-item"><a href="/TVx/development/github/AUTOMATION.html" class="nav-list-link">Unraid Template Automation</a></li><li class="nav-list-item"><a href="/TVx/development/github/AUTOMATION_SEPARATE_REPO.html" class="nav-list-link">Separate Repo Automation</a></li></ul></li><li class="nav-list-item"><button class="nav-list-expander btn-reset" aria-label="toggle items in Bug Fixes category" aria-pressed="false">
        <svg viewBox="0 0 24 24" aria-hidden="true"><use xlink:href="#svg-arrow-right"></use></svg>
      </button><a href="/TVx/development/bug%20fixes/" class="nav-list-link">Bug Fixes</a><ul class="nav-list"><li class="nav-list-item"><a href="/TVx/development/bug%20fixes/BUG_FIX_SYSTEM.html" class="nav-list-link">Bug Fix System</a></li><li class="nav-list-item"><a href="/TVx/development/bug%20fixes/2025-10/vhs-video-not-playing.html" class="nav-list-link">VHS Video Not Playing Fix</a></li></ul></li></ul></li></ul>
  
</nav>




  
  
    <footer class="site-footer">
      This site uses <a href="https://github.com/just-the-docs/just-the-docs">Just the Docs</a>, a documentation theme for Jekyll.
    </footer>
  
</div>

  
  <div class="main" id="top">
    <div id="main-header" class="main-header">
  
    

<div class="search" role="search">
  <div class="search-input-wrap">
    <input type="text" id="search-input" class="search-input" tabindex="0" placeholder="Search TVx" aria-label="Search TVx" autocomplete="off">
    <label for="search-input" class="search-label"><svg viewBox="0 0 24 24" class="search-icon"><use xlink:href="#svg-search"></use></svg></label>
  </div>
  <div id="search-results" class="search-results"></div>
</div>

  
  
  
    <nav aria-label="Auxiliary" class="aux-nav">
  <ul class="aux-nav-list">
    
      <li class="aux-nav-list-item">
        <a href="//github.com/dopeytree/TVx" class="site-button"
          
        >
          GitHub
        </a>
      </li>
    
      <li class="aux-nav-list-item">
        <a href="//github.com/sponsors/dopeytree" class="site-button"
          
        >
          Sponsor ❤️
        </a>
      </li>
    
  </ul>
</nav>

  
</div>

    <div class="main-content-wrap">
      <nav aria-label="Breadcrumb" class="breadcrumb-nav">
  <ol class="breadcrumb-nav-list">
    <li class="breadcrumb-nav-list-item"><span>Bug Fixes</span></li>
  </ol>
</nav>


      <div id="main-content" class="main-content">
        <main>
          
            <h# Bug Fix Documentation

This directory contains detailed documentation for major bug fixes in TVx.

## Purpose

Bug fix documentation helps:
- **Future debugging**: Understand what went wrong and why
- **Knowledge sharing**: Help other developers learn from issues
- **Project history**: Track significant problems and solutions
- **Prevent regressions**: Know what to test when making similar changes

## Directory Structure

Bug fixes are organized by year-month:

```
docs/bugfix/
├── README.md (this file)
├── 2025-10/
│   └── vhs-video-not-playing.md
├── 2025-11/
│   └── example-bug-fix.md
└── YYYY-MM/
    └── descriptive-name.md
```

## When to Create Bug Fix Documentation

Create a bug fix document when:

1. ✅ The bug significantly impacted functionality
2. ✅ The root cause was non-obvious or took significant time to find
3. ✅ The fix required understanding of architecture or system behavior
4. ✅ Other developers might encounter similar issues
5. ✅ The debugging process revealed important insights

**Do NOT document:**
- Minor typos or cosmetic fixes
- Simple one-line changes
- Obvious bugs with obvious fixes

## Bug Fix Documentation Template

Each bug fix document should include:

### 1. Header Information
```markdown
# Bug Fix: [Brief Description]

**Date:** YYYY-MM-DD
**Branch:** branch-name
**Issue:** One-sentence summary
```

### 2. Problem Description
- What wasn't working?
- How did users experience the bug?
- What was the expected behavior?

### 3. Root Cause Analysis
- Step-by-step investigation process
- What you tried that didn't work
- How you found the actual cause
- Relevant log outputs or error messages

### 4. The Fix
- Code changes made (with snippets)
- Why this approach was chosen
- Alternative solutions considered

### 5. Testing Commands
- Exact commands to reproduce the bug
- Commands to build and deploy the fix
- Commands to verify the fix works
- Include any necessary environment variables or configuration

### 6. Verification
- How to confirm the fix works
- What to look for in logs
- Expected vs actual behavior after fix

### 7. Files Modified
- List of all changed files
- Brief description of changes to each

### 8. Technical Notes
- Deeper explanation of concepts involved
- Why the bug occurred in the first place
- Related system behaviors or constraints

### 9. Related Commits
- Git commit hashes and messages
- Links to related issues or PRs

### 10. Lessons Learned
- Key takeaways from debugging
- What to check in the future
- Prevention strategies

### 11. Future Improvements (Optional)
- Better ways to solve this problem
- Related technical debt
- Monitoring or alerts to add

## Process After Fixing a Bug

After completing a bug fix:

1. **Document immediately** while details are fresh
2. **Include all commands** used during debugging and testing
3. **Add code snippets** showing before/after changes
4. **Explain the "why"** not just the "what"
5. **Update related documentation** if needed
6. **Add to this README** if the bug reveals a common pattern

## Example: Full Bug Fix Document

See `2025-10/vhs-video-not-playing.md` for a complete example showing:
- Thorough root cause analysis
- All testing commands with environment variables
- Technical explanation of HTTP Range Requests
- Lessons learned about server implementations

## Common Bug Patterns

As we document bugs, common patterns will be added here:

### Pattern: Server Feature Parity
**Example:** VHS video not playing (2025-10)
- **Problem:** Replacing nginx with custom Node.js server
- **Root Cause:** Missing HTTP Range Request support
- **Lesson:** Nginx provides many features "for free" that must be reimplemented
- **Prevention:** Test all media types when switching servers

### Pattern: [Future patterns will be added here]

## Contributing

When you fix a significant bug:

1. Create a new directory: `docs/bugfix/YYYY-MM/` (if it doesn't exist)
2. Create a new file: `descriptive-name.md`
3. Use the template above
4. Add your bug pattern to this README if it's a common issue

## Questions?

If you're unsure whether a bug fix deserves documentation, ask yourself:
- Would I want this information if I encountered this bug again in 6 months?
- Did this take me more than 2 hours to debug?
- Did I learn something important about the system?

If yes to any of these, **document it!**

          

          
            
          
        </main>
        

  <hr>
  <footer>
    
      <p><a href="#top" id="back-to-top">Back to top</a></p>
    

    <p class="text-small text-grey-dk-100 mb-0">Copyright &copy; 2025 dopeytree. Distributed under the <a href="https://github.com/dopeytree/TVx/blob/main/LICENSE">PolyForm Noncommercial License</a>.</p>

    
  </footer>


      </div>
    </div>
    
      
<button id="search-button" class="search-button btn-reset" aria-label="Focus on search">
  <svg viewBox="0 0 24 24" class="icon" aria-hidden="true"><use xlink:href="#svg-search"></use></svg>
</button>


<div class="search-overlay"></div>

    
  </div>

  
  <!-- GLightbox JavaScript -->
<script src="/TVx/assets/js/glightbox.min.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', function() {
    // Auto-convert images to lightbox format
    const contentSelectors = [
      '.main-content',
      '.post-content',
      '.page-content',
      'article',
      '.content'
    ];

    let contentArea = null;
    for (const selector of contentSelectors) {
      contentArea = document.querySelector(selector);
      if (contentArea) break;
    }

    if (contentArea) {
      const images = contentArea.querySelectorAll('img');
      images.forEach((img) => {
        // Skip if already wrapped in a link
        if (img.closest('a')) return;

        // Create wrapper link
        const link = document.createElement('a');
        link.href = img.src;
        link.setAttribute('data-glightbox', 'gallery');
        link.setAttribute('data-title', img.alt || 'Image');

        // Wrap the image
        img.parentNode.insertBefore(link, img);
        link.appendChild(img);

        // Add responsive styling
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
      });
    }

    // Initialize GLightbox AFTER converting images
    // Small delay to ensure DOM is fully updated
    setTimeout(function() {
      const lightbox = GLightbox({
        touchNavigation: true,
        loop: true,
        autoplayVideos: true,
        selector: '[data-glightbox]'
      });
    }, 100);
  });
</script>
</body>
</html>

