#!/bin/bash
# Quick Deploy to AWS Amplify

set -e

echo "🚀 Deploying GRC Platform to AWS Amplify..."

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit - GRC Platform"
fi

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed"
    echo "📥 Install with: brew install gh"
    exit 1
fi

# Check if logged in to GitHub
if ! gh auth status &> /dev/null; then
    echo "🔐 Please login to GitHub..."
    gh auth login
fi

# Create GitHub repository
echo "📝 Creating GitHub repository..."
REPO_NAME="grc-platform"
gh repo create $REPO_NAME --public --source=. --remote=origin --push || echo "Repository might already exist"

# Push to GitHub
echo "⬆️  Pushing to GitHub..."
git branch -M main
git push -u origin main

echo ""
echo "✅ Code pushed to GitHub!"
echo ""
echo "📋 Next Steps:"
echo "1. Go to AWS Amplify Console: https://console.aws.amazon.com/amplify/"
echo "2. Click 'New app' → 'Host web app'"
echo "3. Select 'GitHub' and authorize AWS"
echo "4. Select repository: $REPO_NAME"
echo "5. Add environment variables:"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   - NEXT_PUBLIC_APP_URL"
echo "6. Click 'Save and deploy'"
echo ""
echo "🎉 Your app will be live in 3-5 minutes!"
