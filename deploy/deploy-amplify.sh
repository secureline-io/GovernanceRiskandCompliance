#!/bin/bash

# GRC Platform AWS Amplify Deployment Script
# This script deploys the GRC platform to AWS Amplify

set -e

export PATH="/opt/homebrew/bin:$PATH"

# Configuration
AWS_REGION="${AWS_REGION:-us-east-1}"
APP_NAME="grc-platform"
BRANCH_NAME="${BRANCH_NAME:-main}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== GRC Platform AWS Amplify Deployment ===${NC}"

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}AWS Account ID: ${AWS_ACCOUNT_ID}${NC}"
echo -e "${GREEN}Region: ${AWS_REGION}${NC}"

# Check if Amplify app exists
echo -e "${YELLOW}Step 1: Checking for existing Amplify app...${NC}"
APP_ID=$(aws amplify list-apps --region ${AWS_REGION} --query "apps[?name=='${APP_NAME}'].appId" --output text 2>/dev/null || echo "")

if [ -z "$APP_ID" ] || [ "$APP_ID" == "None" ]; then
    echo -e "${YELLOW}Creating new Amplify app...${NC}"

    # Create Amplify app
    APP_ID=$(aws amplify create-app \
        --name ${APP_NAME} \
        --region ${AWS_REGION} \
        --platform WEB_COMPUTE \
        --environment-variables "NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL},NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY},NEXT_PUBLIC_APP_URL=https://main.${APP_NAME}.amplifyapp.com" \
        --build-spec "$(cat amplify.yml)" \
        --query 'app.appId' \
        --output text)

    echo -e "${GREEN}Created Amplify app: ${APP_ID}${NC}"
else
    echo -e "${GREEN}Found existing Amplify app: ${APP_ID}${NC}"

    # Update environment variables
    aws amplify update-app \
        --app-id ${APP_ID} \
        --region ${AWS_REGION} \
        --environment-variables "NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL},NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
        > /dev/null
fi

# Check if branch exists
echo -e "${YELLOW}Step 2: Setting up branch...${NC}"
BRANCH_EXISTS=$(aws amplify list-branches --app-id ${APP_ID} --region ${AWS_REGION} --query "branches[?branchName=='${BRANCH_NAME}'].branchName" --output text 2>/dev/null || echo "")

if [ -z "$BRANCH_EXISTS" ] || [ "$BRANCH_EXISTS" == "None" ]; then
    echo -e "${YELLOW}Creating branch ${BRANCH_NAME}...${NC}"

    aws amplify create-branch \
        --app-id ${APP_ID} \
        --branch-name ${BRANCH_NAME} \
        --region ${AWS_REGION} \
        --stage PRODUCTION \
        --enable-auto-build \
        > /dev/null
else
    echo -e "${GREEN}Branch ${BRANCH_NAME} already exists${NC}"
fi

# Create a zip of the source code for manual deployment
echo -e "${YELLOW}Step 3: Creating deployment package...${NC}"
cd /Users/lala/Desktop/grc-tool-cloud-ai

# Create a temporary directory for the deployment
DEPLOY_DIR=$(mktemp -d)
echo "Using temp directory: ${DEPLOY_DIR}"

# Copy files (excluding node_modules, .next, .git)
rsync -av --progress . ${DEPLOY_DIR}/ \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude '.git' \
    --exclude '*.log' \
    --exclude '.DS_Store'

# Create zip file
ZIP_FILE="/tmp/grc-platform-deploy.zip"
cd ${DEPLOY_DIR}
zip -r ${ZIP_FILE} . -x "*.git*" -x "*node_modules*" -x "*.next*"

echo -e "${YELLOW}Step 4: Starting deployment...${NC}"

# Start deployment
JOB_ID=$(aws amplify start-deployment \
    --app-id ${APP_ID} \
    --branch-name ${BRANCH_NAME} \
    --region ${AWS_REGION} \
    --source-url "file://${ZIP_FILE}" \
    --query 'jobSummary.jobId' \
    --output text 2>/dev/null || echo "")

if [ -z "$JOB_ID" ]; then
    # Alternative: Create a manual deployment using start-job
    echo -e "${YELLOW}Using alternative deployment method...${NC}"

    JOB_ID=$(aws amplify start-job \
        --app-id ${APP_ID} \
        --branch-name ${BRANCH_NAME} \
        --job-type RELEASE \
        --region ${AWS_REGION} \
        --query 'jobSummary.jobId' \
        --output text)
fi

echo -e "${GREEN}Deployment started with Job ID: ${JOB_ID}${NC}"

# Get the app URL
DEFAULT_DOMAIN=$(aws amplify get-app --app-id ${APP_ID} --region ${AWS_REGION} --query 'app.defaultDomain' --output text)
APP_URL="https://${BRANCH_NAME}.${DEFAULT_DOMAIN}"

# Cleanup
rm -rf ${DEPLOY_DIR}
rm -f ${ZIP_FILE}

echo ""
echo -e "${GREEN}=== Deployment Initiated ===${NC}"
echo -e "${GREEN}App ID: ${APP_ID}${NC}"
echo -e "${GREEN}App URL: ${APP_URL}${NC}"
echo ""
echo -e "${YELLOW}Note: The deployment is in progress.${NC}"
echo -e "${YELLOW}You can check the status in the AWS Amplify Console:${NC}"
echo -e "${YELLOW}https://${AWS_REGION}.console.aws.amazon.com/amplify/home?region=${AWS_REGION}#/${APP_ID}${NC}"
echo ""
echo -e "${YELLOW}Or run: aws amplify get-job --app-id ${APP_ID} --branch-name ${BRANCH_NAME} --job-id ${JOB_ID} --region ${AWS_REGION}${NC}"
