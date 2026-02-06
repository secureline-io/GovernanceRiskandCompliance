#!/bin/bash

# AWS Amplify Deployment Script
# This script guides you through connecting GitHub to AWS Amplify

set -e

echo "🚀 AWS Amplify Deployment Script"
echo "=================================="
echo ""

APP_ID="dmxjcxqpoywpy"
APP_URL="https://dmxjcxqpoywpy.amplifyapp.com"
GITHUB_REPO="secureline-io/GovernanceRiskandCompliance"
REGION="us-east-1"

echo "✅ Amplify App Details:"
echo "   App ID: $APP_ID"
echo "   Default URL: $APP_URL"
echo "   GitHub Repo: https://github.com/$GITHUB_REPO"
echo ""

# Check AWS credentials
echo "🔑 Checking AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured"
    exit 1
fi
echo "✅ AWS credentials verified"
echo ""

# Option 1: Console Setup (Recommended for first-time GitHub connection)
echo "📋 STEP 1: Connect GitHub to Amplify (One-time setup)"
echo "-------------------------------------------------------"
echo ""
echo "Since this is a GitHub connection, you need to authorize AWS Amplify"
echo "to access your GitHub repository through the AWS Console."
echo ""
echo "Option A: Use AWS Console (Recommended)"
echo "  1. Open: https://console.aws.amazon.com/amplify/home?region=$REGION#/$APP_ID"
echo "  2. Click 'Connect branch'"
echo "  3. Select 'GitHub'"
echo "  4. Authorize AWS Amplify (first time only)"
echo "  5. Select repository: $GITHUB_REPO"
echo "  6. Select branch: main"
echo "  7. Confirm build settings (should auto-detect from amplify.yml)"
echo "  8. Click 'Save and deploy'"
echo ""
echo "Environment variables are already configured:"
echo "  ✅ NEXT_PUBLIC_SUPABASE_URL"
echo "  ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo ""

read -p "Press Enter after you've connected GitHub in the console..."

echo ""
echo "🔄 Checking for connected branches..."
BRANCHES=$(aws amplify list-branches --app-id $APP_ID --region $REGION --query 'branches[].branchName' --output text)

if [ -z "$BRANCHES" ]; then
    echo "⚠️  No branches connected yet. Please complete the console setup above."
    exit 1
fi

echo "✅ Connected branches: $BRANCHES"
echo ""

# Trigger a new build
echo "🚀 Triggering deployment..."
BRANCH_NAME="main"

JOB_ID=$(aws amplify start-job \
    --app-id $APP_ID \
    --branch-name $BRANCH_NAME \
    --job-type RELEASE \
    --region $REGION \
    --query 'jobSummary.jobId' \
    --output text 2>&1)

if [ $? -eq 0 ]; then
    echo "✅ Deployment started!"
    echo "   Job ID: $JOB_ID"
    echo ""
    echo "🔗 Monitor your deployment:"
    echo "   Console: https://console.aws.amazon.com/amplify/home?region=$REGION#/$APP_ID/$BRANCH_NAME/$JOB_ID"
    echo "   App URL: https://$BRANCH_NAME.$APP_URL"
    echo ""
    
    # Wait for deployment
    echo "⏳ Waiting for deployment to complete..."
    echo ""
    
    while true; do
        STATUS=$(aws amplify get-job \
            --app-id $APP_ID \
            --branch-name $BRANCH_NAME \
            --job-id $JOB_ID \
            --region $REGION \
            --query 'job.summary.status' \
            --output text 2>&1)
        
        if [ "$STATUS" = "SUCCEED" ]; then
            echo ""
            echo "🎉 Deployment successful!"
            echo "   Your app is live at: https://$BRANCH_NAME.$APP_URL"
            break
        elif [ "$STATUS" = "FAILED" ] || [ "$STATUS" = "CANCELLED" ]; then
            echo ""
            echo "❌ Deployment $STATUS"
            echo "   Check logs: https://console.aws.amazon.com/amplify/home?region=$REGION#/$APP_ID/$BRANCH_NAME/$JOB_ID"
            exit 1
        else
            echo -n "."
            sleep 10
        fi
    done
else
    echo "⚠️  Could not start deployment automatically."
    echo "   Please trigger deployment manually from the console:"
    echo "   https://console.aws.amazon.com/amplify/home?region=$REGION#/$APP_ID"
fi

echo ""
echo "✨ Deployment complete!"
echo ""
echo "📋 Next Steps:"
echo "   1. Visit your app: https://$BRANCH_NAME.$APP_URL"
echo "   2. Test all features"
echo "   3. Set up custom domain (optional)"
echo ""
