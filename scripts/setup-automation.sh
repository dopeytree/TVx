#!/bin/bash

# Quick Setup Script for Unraid Template Automation
# Run this after creating the workflow files

set -e

echo "🚀 TVx Unraid Template Automation Setup"
echo "========================================"
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Not a git repository. Please run this from the TVx root directory."
    exit 1
fi

echo "✅ Git repository detected"
echo ""

# Check if workflow files exist
if [ ! -f ".github/workflows/update-unraid-template.yml" ]; then
    echo "❌ Workflow file not found: .github/workflows/update-unraid-template.yml"
    exit 1
fi

if [ ! -f ".github/workflows/validate-unraid-template.yml" ]; then
    echo "❌ Workflow file not found: .github/workflows/validate-unraid-template.yml"
    exit 1
fi

echo "✅ Workflow files found"
echo ""

# Check if template exists
if [ ! -f "tvx-unraid-template.xml" ]; then
    echo "❌ Template file not found: tvx-unraid-template.xml"
    exit 1
fi

echo "✅ Template file found"
echo ""

# Add a Date tag if it doesn't exist
if ! grep -q "<Date>" tvx-unraid-template.xml; then
    echo "📝 Adding <Date> tag to template..."
    DATE=$(date +%Y-%m-%d)
    sed -i.bak "s|</Changes>|</Changes>\n  <Date>$DATE</Date>|" tvx-unraid-template.xml
    rm tvx-unraid-template.xml.bak 2>/dev/null || true
    echo "✅ Added <Date>$DATE</Date>"
else
    echo "✅ <Date> tag already exists"
fi

echo ""
echo "📋 Setup Checklist:"
echo ""
echo "1. ✅ Workflow files created"
echo "2. ✅ Template file verified"
echo "3. ⏳ Commit and push workflows"
echo ""

# Ask if user wants to commit
read -p "Do you want to commit and push the workflow files now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "📤 Committing and pushing..."
    
    git add .github/workflows/update-unraid-template.yml
    git add .github/workflows/validate-unraid-template.yml
    git add docs/AUTOMATION.md
    
    # Add template if Date was added
    if ! git diff --cached --quiet tvx-unraid-template.xml 2>/dev/null; then
        git add tvx-unraid-template.xml
    fi
    
    git commit -m "🤖 Add Unraid template automation workflows

- Auto-update template on releases
- Validate template on changes
- Add automation documentation"
    
    BRANCH=$(git rev-parse --abbrev-ref HEAD)
    git push origin "$BRANCH"
    
    echo ""
    echo "✅ Workflows pushed to GitHub!"
    echo ""
    echo "🎉 Setup Complete!"
    echo ""
    echo "📖 Next Steps:"
    echo "   1. Go to GitHub Actions tab to see the workflows"
    echo "   2. Create a test release to trigger automation"
    echo "   3. Read docs/AUTOMATION.md for detailed usage"
    echo ""
else
    echo ""
    echo "⏭️  Skipped commit. Remember to push the files manually:"
    echo ""
    echo "   git add .github/workflows/*.yml docs/AUTOMATION.md"
    echo "   git commit -m '🤖 Add Unraid template automation'"
    echo "   git push"
    echo ""
fi

echo "📚 Documentation: docs/AUTOMATION.md"
echo ""
