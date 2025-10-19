---
layout: default
title: Running Docs Server
parent: Documentation
nav_order: 5
---

# Running the Documentation Server

This guide explains how to run the Jekyll-based documentation server for the TVx project.

## Prerequisites

- Ruby installed (check with `ruby --version`)
- Bundler installed (check with `bundle --version`)

## Installation

1. Navigate to the docs directory:

   ```bash
   cd docs
   ```

2. Install dependencies:

   ```bash
   bundle install
   ```

## Running the Server

To start the documentation server, run:

```bash
cd docs && bundle exec jekyll serve
```

The server will start and be available at: **<http://127.0.0.1:4000/TVx/>**

## Building the Site

To build the documentation site without serving it, run:

```bash
cd docs && bundle exec jekyll build
```

This will generate the static site in the `_site` directory. The `jekyll serve` command automatically builds the site and serves it with live reloading enabled.

## Features

- Auto-regeneration: The server automatically rebuilds when you make changes to documentation files
- Live preview: View your changes in real-time in the browser
- Remote theme: Uses the Just the Docs theme for a clean, documentation-focused layout

## Stopping the Server

To stop the server, press `Ctrl+C` in the terminal where it's running.

## Troubleshooting

If you encounter issues:

- Ensure you're in the `docs` directory when running commands
- Make sure all dependencies are installed with `bundle install`
- Check that port 4000 is not already in use by another service
