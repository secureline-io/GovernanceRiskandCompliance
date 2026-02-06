#!/bin/bash

# GRC Platform - AWS Amplify Deployment Script
# This script helps prepare your application for AWS deployment

set -e

echo "🚀 GRC Platform - AWS Deployment Preparation"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if git is initialized
if [ ! -d .git ]; then
    echo -e "${YELLOW}⚠️  Git not initialized. Initializing...${NC}"
    git init
    echo -e "${GREEN}✅ Git initialized${NC}"
fi

# Check for .gitignore
if [ ! -f .gitignore ]; then
    echo -e "${RED}❌ .gitignore not found!${NC}"
    exit 1
fi

# Verify .env files are ignored
if grep -q "^\.env\*" .gitignore; then
    echo -e "${GREEN}✅ Environment files are properly ignored${NC}"
else
    echo -e "${RED}❌ .env files not in .gitignore!${NC}"
    exit 1
fi

# Check for .env.local
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}⚠️  .env.local not found. Creating template...${NC}"
    cat > .env.local << 'EOF'
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional: Service role key for admin operations
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
    echo -e "${YELLOW}⚠️  Please update .env.local with your Supabase credentials${NC}"
fi

# Check for amplify.yml
if [ -f amplify.yml ]; then
    echo -e "${GREEN}✅ amplify.yml configuration found${NC}"
else
    echo -e "${YELLOW}⚠️  Creating amplify.yml...${NC}"
    cat > amplify.yml << 'EOF'
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - nvm use 20
        - npm ci
    build:
      commands:
        - env | grep -e NEXT_PUBLIC_ >> .env.production
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
EOF
    echo -e "${GREEN}✅ amplify.yml created${NC}"
fi

# Test build locally
echo ""
echo "🔨 Testing production build..."
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Production build successful${NC}"
else
    echo -e "${RED}❌ Build failed! Fix errors before deploying${NC}"
    exit 1
fi

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo ""
    echo -e "${YELLOW}📝 You have uncommitted changes:${NC}"
    git status -s
    echo ""
    read -p "Do you want to commit these changes? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        echo ""
        read -p "Enter commit message: " commit_msg
        git commit -m "$commit_msg"
        echo -e "${GREEN}✅ Changes committed${NC}"
    fi
fi

# Check for remote
if ! git remote | grep -q 'origin'; then
    echo ""
    echo -e "${YELLOW}⚠️  No git remote configured${NC}"
    echo "Please add your GitHub repository:"
    echo ""
    echo "  git remote add origin https://github.com/YOUR_USERNAME/grc-platform.git"
    echo "  git push -u origin main"
    echo ""
else
    echo -e "${GREEN}✅ Git remote configured${NC}"
    echo ""
    read -p "Push to GitHub now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git push -u origin main || git push origin main
        echo -e "${GREEN}✅ Pushed to GitHub${NC}"
    fi
fi

echo ""
echo "=============================================="
echo -e "${GREEN}🎉 Deployment preparation complete!${NC}"
echo "=============================================="
echo ""
echo "📋 Next Steps:"
echo "1. Go to: https://console.aws.amazon.com/amplify/"
echo "2. Click 'New app' → 'Host web app'"
echo "3. Connect your GitHub repository"
echo "4. Add environment variables:"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   - NEXT_PUBLIC_APP_URL (use your Amplify URL)"
echo "5. Click 'Save and deploy'"
echo "6. Wait 3-5 minutes"
echo "7. Your app will be live! 🚀"
echo ""
echo "📖 Full guide: See AWS_DEPLOYMENT_GUIDE.md"
echo ""
