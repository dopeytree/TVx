---
layout: default
title: Jekyll Setup
---

# Jekyll Midnight Theme Setup

This document explains the GitHub Pages setup for TVx documentation.

## Configuration

The documentation site uses the **Midnight Jekyll theme** with the following setup:

### Files Created/Modified:

1. **`_config.yml`** - Jekyll configuration
   - Theme: `jekyll-theme-midnight`
   - Remote theme from GitHub Pages themes
   - GitHub Flavored Markdown (GFM) support
   - Relative links plugin for `.md` navigation

2. **Front matter added** to all documentation files:
   ```yaml
   ---
   layout: default
   title: Page Title
   ---
   ```

3. **Removed files**:
   - `.nojekyll` - Removed to enable Jekyll processing
   - `index.html` - Removed in favor of Jekyll rendering `index.md`

## Theme Features

The Midnight theme provides:
- 🌙 Dark, professional aesthetic
- 📱 Responsive design
- 🎨 Clean typography
- 🔗 Automatic navigation from markdown links
- 💻 Code syntax highlighting

## How It Works

1. GitHub Pages detects the `_config.yml` file
2. Jekyll processes all `.md` files with front matter
3. Markdown is converted to HTML using the Midnight theme layout
4. Relative links between `.md` files work automatically
5. Site is published at: `https://dopeytree.github.io/TVx/`

## Local Testing (Optional)

To test the site locally:

```bash
# Install Jekyll
gem install bundler jekyll

# Create Gemfile in docs/
cat > Gemfile << 'EOF'
source 'https://rubygems.org'
gem 'github-pages', group: :jekyll_plugins
EOF

# Install dependencies
bundle install

# Serve locally
bundle exec jekyll serve

# Visit: http://localhost:4000/TVx/
```

## GitHub Pages Settings

In your GitHub repository:
1. Go to **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: `logging` (or your preferred branch)
4. Folder: `/docs`
5. Click **Save**

## Navigation

The theme automatically generates navigation from:
- Links in your `index.md`
- Front matter titles in all `.md` files
- Relative links work seamlessly

## Customization

To customize the theme further, you can:
1. Add custom CSS in `assets/css/style.scss`
2. Modify layouts by creating `_layouts/` directory
3. Add custom includes in `_includes/` directory
4. Configure more plugins in `_config.yml`

## Resources

- [Jekyll Documentation](https://jekyllrb.com/docs/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Midnight Theme Repository](https://github.com/pages-themes/midnight)
- [Jekyll Themes](https://pages.github.com/themes/)
