---
layout: default
title: Theme & Search
parent: Documentation
nav_order: 2
---

# Just the Docs Theme & Search Setup
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Theme Overview

TVx documentation now uses **Just the Docs**, a modern, highly customizable Jekyll theme with powerful built-in search functionality.

### Why Just the Docs?

- 🔍 **Built-in Search** - Fast, client-side search with previews
- 🎨 **Dark Mode** - Beautiful dark color scheme by default
- 📱 **Responsive** - Works perfectly on all devices
- 🚀 **Fast** - Optimized for performance
- 🎯 **Navigation** - Auto-generated sidebar from front matter
- 🔗 **Anchor Links** - Every heading gets an anchor
- 📝 **Clean Typography** - Excellent readability

## Search Functionality

### Built-in Search (Default)

Just the Docs includes a powerful search feature that's:

- **Client-side** - No server required, works on GitHub Pages
- **Fast** - Instant results as you type
- **Smart** - Searches headings, content, and page titles
- **Preview** - Shows context around matches
- **Configurable** - Customize behavior in `_config.yml`

### Search Configuration

Current settings in `_config.yml`:

```yaml
search_enabled: true
search:
  heading_level: 2          # Include h2 headings in search
  previews: 3               # Show 3 preview snippets per result
  preview_words_before: 5   # Words before match in preview
  preview_words_after: 10   # Words after match in preview
  tokenizer_separator: /[\s/]+/
  rel_url: true
  button: true
```

### Alternative Search Options

If you need more advanced search, here are three excellent options:

#### 1. Algolia DocSearch (Recommended for Popular Projects)

**Pros:**
- 🚀 Ultra-fast, hosted search
- 🎨 Beautiful UI with keyboard shortcuts
- 🔄 Auto-indexes your site
- 💰 Free for open-source documentation

**Setup:**
```yaml
# _config.yml
plugins:
  - jekyll-algolia

algolia:
  application_id: YOUR_APP_ID
  index_name: YOUR_INDEX_NAME
  search_only_api_key: YOUR_SEARCH_KEY
```

**Apply:** [https://docsearch.algolia.com/apply/](https://docsearch.algolia.com/apply/)

#### 2. Lunr.js (Just the Docs Default)

**Pros:**
- ✅ Already integrated in Just the Docs
- 📦 No external dependencies
- 🔒 Privacy-friendly (no tracking)
- 💻 Works offline

**Cons:**
- Limited to smaller sites (< 500 pages)
- Basic relevance ranking

This is what we're currently using! No additional setup needed.

#### 3. Custom Google Search

**Pros:**
- 🔍 Leverages Google's powerful search
- 📊 Search analytics
- 🎨 Customizable appearance

**Setup:**
1. Create a Custom Search Engine at [cse.google.com](https://cse.google.com)
2. Add this to your layout:

```html
<script async src="https://cse.google.com/cse.js?cx=YOUR_CX_ID"></script>
<div class="gcse-search"></div>
```

## Navigation Structure

Pages are ordered using `nav_order` in front matter:

```yaml
---
layout: default
title: Page Title
nav_order: 1  # Lower numbers appear first
---
```

### Current Navigation Order:

1. Home (Landing Page)
2. Installation
3. Usage
4. Troubleshooting
5. Development
6. Server Implementation
7. Bug Fix System
8. Bug Fix Documentation

## Customization Options

### Color Schemes

Available built-in schemes:
- `dark` (current)
- `light`
- `custom` (define your own)

Change in `_config.yml`:
```yaml
color_scheme: dark
```

### Custom Color Scheme

Create `_sass/color_schemes/tvx.scss`:

```scss
$body-background-color: #1a1a1a;
$sidebar-color: #2d2d2d;
$link-color: #b5e853;
$btn-primary-color: #b5e853;
$base-button-color: #f3f3f3;
```

Then use it:
```yaml
color_scheme: tvx
```

### Logo

Add your logo to `_config.yml`:
```yaml
logo: "/assets/images/tvx-logo.png"
```

### Aux Links (Top Right)

Currently configured:
```yaml
aux_links:
  "GitHub":
    - "//github.com/dopeytree/TVx"
  "Sponsor ❤️":
    - "//github.com/sponsors/dopeytree"
```

## Page Layout Options

### Home Layout

Landing pages use `layout: home`:
```yaml
---
layout: default
title: Home
nav_order: 1
description: "Your description"
permalink: /
---
```

### Default Layout

Standard documentation pages:
```yaml
---
layout: default
title: Page Title
nav_order: 2
---
```

### No Nav Pages

Exclude from navigation:
```yaml
---
layout: default
title: Hidden Page
nav_exclude: true
---
```

## Advanced Features

### Callouts

Create attention-grabbing blocks:

```markdown
{: .note }
> This is a note callout

{: .warning }
> This is a warning callout

{: .important }
> This is an important callout
```

### Code Blocks with Line Numbers

```yaml
kramdown:
  syntax_highlighter_opts:
    block:
      line_numbers: true
```

### Table of Contents

Auto-generate TOC for any page:

```markdown
## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}
```

### Buttons

```markdown
[Get Started](installation.md){: .btn .btn-primary }
[View on GitHub](https://github.com){: .btn }
```

## Local Development

### Start Server

```bash
cd docs
bundle install
jekyll serve --host 0.0.0.0 --port 4000 --baseurl /TVx
```

Visit: `http://localhost:4000/TVx/`

### Live Reload

Changes to markdown files auto-reload. Restart for `_config.yml` changes.

### Build Site

```bash
bundle exec jekyll build
```

Output in `_site/` directory.

## Deployment

### GitHub Pages

1. Push changes to your branch
2. GitHub Actions automatically builds with Just the Docs
3. Site live at: `https://dopeytree.github.io/TVx/`

### Custom Domain

Add `CNAME` file to `/docs`:
```
docs.tvx.example.com
```

Then configure DNS:
```
CNAME docs -> dopeytree.github.io
```

## Troubleshooting

### Search not working

1. Check `search_enabled: true` in `_config.yml`
2. Rebuild site: `bundle exec jekyll build`
3. Clear browser cache

### Sidebar not showing

1. Verify `nav_order` in front matter
2. Check layout is `default` or `home`
3. Ensure page is not `nav_exclude: true`

### Theme not loading

1. Verify `remote_theme: just-the-docs/just-the-docs`
2. Run `bundle install`
3. Check GitHub Pages build status

## Resources

- [Just the Docs Documentation](https://just-the-docs.github.io/just-the-docs/)
- [Customization Guide](https://just-the-docs.github.io/just-the-docs/docs/customization/)
- [Navigation Structure](https://just-the-docs.github.io/just-the-docs/docs/navigation-structure/)
- [Search Configuration](https://just-the-docs.github.io/just-the-docs/docs/search/)
- [Algolia DocSearch](https://docsearch.algolia.com/)
