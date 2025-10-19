# CodeRabbit Setup Guide

This repository uses CodeRabbit for AI-powered code reviews on pull requests.

## Features

CodeRabbit provides:

- 🤖 **Automated Code Reviews**: AI analyzes every pull request
- 📝 **High-Level Summaries**: Get an overview of changes
- 🔍 **Line-by-Line Feedback**: Detailed suggestions for improvements
- 🛡️ **Security Analysis**: Identifies potential security issues
- ✅ **Best Practices**: Ensures code follows best practices
- 📊 **Context-Aware**: Understands your project structure

## Configuration

The CodeRabbit configuration is in `.coderabbit.yaml` at the root of the repository.

### Key Settings

- **Profile**: `chill` - Balanced review approach
- **Auto Review**: Enabled for branches: `main`, `master`, `develop`, `iptv`
- **Path Filters**: Excludes `node_modules`, `dist`, `docs/_site`, lock files
- **Tools**: Enabled linters include shellcheck, markdownlint, yamllint, biome, actionlint

## Usage

### Automatic Reviews

CodeRabbit automatically reviews pull requests when:

- A PR is opened
- New commits are pushed to a PR
- The PR is reopened

### Manual Triggers

You can interact with CodeRabbit by commenting on PRs:

- `@coderabbitai summary` - Get a high-level summary
- `@coderabbitai review` - Trigger a full review
- `@coderabbitai resolve` - Mark conversations as resolved
- `@coderabbitai help` - Get help with available commands

### Customization

To customize reviews for specific paths, edit the `path_instructions` in `.coderabbit.yaml`:

```yaml
path_instructions:
  - path: "src/**/*.tsx"
    instructions: |
      - Review for React best practices
      - Check TypeScript types
```

## Installation

1. Install the CodeRabbit GitHub App from the [GitHub Marketplace](https://github.com/apps/coderabbitai)
2. Grant access to this repository
3. CodeRabbit will automatically start reviewing new PRs

## Free Tier

This configuration uses CodeRabbit's free tier which includes:

- Unlimited public repositories
- AI-powered reviews
- All standard features

For private repositories or advanced features, see [CodeRabbit Pricing](https://coderabbit.ai/pricing).

## Disable CodeRabbit

To disable CodeRabbit temporarily:

- Add `[no-review]` to your PR title or description
- Comment `@coderabbitai pause` on the PR

To disable permanently:

- Remove `.coderabbit.yaml` and `.github/workflows/coderabbit.yml`
- Uninstall the GitHub App from repository settings

## Learn More

- [CodeRabbit Documentation](https://docs.coderabbit.ai/)
- [Configuration Guide](https://docs.coderabbit.ai/guides/configure-coderabbit)
- [Commands Reference](https://docs.coderabbit.ai/guides/review-instructions)
