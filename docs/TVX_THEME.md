---
layout: default
title: Theme Colors
parent: Documentation
nav_order: 3
---

# TVx Custom Theme
{: .no_toc }

## Overview

The TVx documentation now uses a custom color scheme inspired by the [TeXt Jekyll Theme](https://kitian616.github.io/jekyll-TeXt-theme/), featuring:

- **Modern, Clean Design** - Light background with vibrant blue accents
- **Excellent Readability** - High contrast, comfortable typography
- **Professional Look** - Polished UI elements and smooth interactions
- **Warm Blues** - Primary color `#3498db` (vibrant blue)

## Color Palette

### Primary Colors

| Color | Hex | Usage |
|:------|:----|:------|
| Accent Blue | `#3498db` | Links, buttons, active states |
| Accent Blue (Hover) | `#2980b9` | Hover effects |
| Heading Gray | `#2c3e50` | Headings, important text |
| Body Text | `#333333` | Main content text |
| Background | `#ffffff` | Page background |
| Sidebar | `#f8f9fa` | Sidebar background |

### Accent Colors

| Color | Hex | Usage |
|:------|:----|:------|
| Light Blue | `#e3f2fd` | Highlights, info boxes, table hover |
| Blue 100 | `#bbdefb` | Subtle backgrounds |
| Blue 200 | `#90caf9` | Medium highlights |
| Border Gray | `#e1e4e8` | Borders, separators |

### Feedback Colors

| Color | Hex | Usage |
|:------|:----|:------|
| Success Green | `#66bb6a` | Success messages |
| Warning Yellow | `#ffd54f` | Warning callouts |
| Error Red | `#e57373` | Error messages |

## Features

### 1. Modern Navigation
- Clean sidebar with hover effects
- Active page highlighting with blue border
- Smooth transitions

### 2. Beautiful Code Blocks
- Rounded corners (6px border-radius)
- Light gray background `#f6f8fa`
- Subtle border
- Line numbers enabled

### 3. Enhanced Tables
- Light blue header background
- Blue accent border on header
- Hover effects on rows
- Clean borders

### 4. Callout Boxes

Three types of callouts with colored left borders:

**Note** (Blue)
```markdown
{: .note }
> This is an informational note
```

**Warning** (Yellow)
```markdown
{: .warning }
> This is a warning message
```

**Important** (Red)
```markdown
{: .important }
> This is critical information
```

### 5. Modern Buttons
- Vibrant blue primary button
- Smooth hover effects with shadow
- Clean, rounded appearance

### 6. Improved Typography
- Consistent heading hierarchy
- H1 and H2 with bottom borders
- Comfortable line spacing
- Professional font stack

## Customization

### Change Primary Color

Edit `/docs/_sass/color_schemes/tvx.scss`:

```scss
$accent-color: #3498db; // Change this to your preferred color
$link-color: #3498db;   // Keep consistent
$btn-primary-color: #3498db;
```

### Adjust Sidebar

Edit `/docs/_sass/custom/custom.scss`:

```scss
.side-bar {
  background-color: #f8f9fa; // Change sidebar background
  border-right: 1px solid #e1e4e8;
}
```

### Modify Code Blocks

```scss
pre {
  border-radius: 6px; // Adjust corner roundness
  border: 1px solid #e1e4e8;
  
  code {
    background-color: #f6f8fa; // Change code background
  }
}
```

## File Structure

```
docs/
├── _sass/
│   ├── color_schemes/
│   │   └── tvx.scss          # Color variable definitions
│   └── custom/
│       └── custom.scss       # Custom styling overrides
└── _config.yml               # Theme configuration
```

## Switching Back to Dark Mode

If you prefer the dark theme:

Edit `_config.yml`:
```yaml
color_scheme: dark
```

Then restart Jekyll.

## Creating Additional Color Schemes

1. Create new file: `_sass/color_schemes/myscheme.scss`
2. Define your colors using Just the Docs variables
3. Update `_config.yml`: `color_scheme: myscheme`
4. Restart Jekyll

## Comparison with TeXt Theme

| Feature | TeXt Theme | TVx Theme |
|:--------|:-----------|:----------|
| Primary Color | Blue | Vibrant Blue `#3498db` |
| Layout | Multi-layout | Documentation-focused |
| Navigation | Top nav + sidebar | Sidebar only |
| Search | Algolia optional | Built-in Lunr.js |
| Code Blocks | Syntax highlighting | + Line numbers |
| Callouts | Native support | Custom CSS classes |

## Performance

- **Load Time**: Fast (static site)
- **Search**: Instant (client-side)
- **Responsiveness**: Full mobile support
- **Accessibility**: WCAG compliant

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

## Resources

- [Just the Docs Documentation](https://just-the-docs.github.io/just-the-docs/)
- [TeXt Theme](https://kitian616.github.io/jekyll-TeXt-theme/)
- [Color Customization Guide](https://just-the-docs.github.io/just-the-docs/docs/customization/#color-schemes)
