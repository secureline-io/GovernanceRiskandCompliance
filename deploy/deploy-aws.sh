#!/bin/bash

# GRC Platform AWS Deployment Script
# This script deploys the GRC platform to AWS using ECR and App Runner

set -e

# Configuration
AWS_REGION="${AWS_REGION:-us-east-1}"
ECR_REPO_NAME="grc-platform"
APP_RUNNER_SERVICE_NAME="grc-platform"
IMAGE_TAG="${IMAGE_TAG:-latest}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== GRC Platform AWS Deployment ===${NC}"

# Check AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not installed${NC}"
    exit 1
fi

# Check Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    exit 1
fi

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}AWS Account ID: ${AWS_ACCOUNT_ID}${NC}"

# ECR Repository URL
ECR_URL="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
ECR_REPO_URL="${ECR_URL}/${ECR_REPO_NAME}"

echo -e "${YELLOW}Step 1: Creating ECR Repository (if not exists)${NC}"
aws ecr describe-repositories --repository-names ${ECR_REPO_NAME} --region ${AWS_REGION} 2>/dev/null || \
    aws ecr create-repository --repository-name ${ECR_REPO_NAME} --region ${AWS_REGION}

echo -e "${YELLOW}Step 2: Logging into ECR${NC}"
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_URL}

echo -e "${YELLOW}Step 3: Building Docker Image${NC}"
docker build \
    --build-arg NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL}" \
    --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    --build-arg NEXT_PUBLIC_APP_URL="${NEXT_PUBLIC_APP_URL}" \
    -t ${ECR_REPO_NAME}:${IMAGE_TAG} \
    -f Dockerfile .

echo -e "${YELLOW}Step 4: Tagging Image${NC}"
docker tag ${ECR_REPO_NAME}:${IMAGE_TAG} ${ECR_REPO_URL}:${IMAGE_TAG}

echo -e "${YELLOW}Step 5: Pushing Image to ECR${NC}"
docker push ${ECR_REPO_URL}:${IMAGE_TAG}

echo -e "${YELLOW}Step 6: Checking/Creating App Runner Service${NC}"

# Check if App Runner service exists
SERVICE_EXISTS=$(aws apprunner list-services --query "ServiceSummaryList[?ServiceName=='${APP_RUNNER_SERVICE_NAME}'].ServiceArn" --output text --region ${AWS_REGION})

if [ -z "$SERVICE_EXISTS" ]; then
    echo -e "${YELLOW}Creating new App Runner service...${NC}"

    # Create App Runner service
    aws apprunner create-service \
        --service-name ${APP_RUNNER_SERVICE_NAME} \
        --source-configuration '{
            "ImageRepository": {
                "ImageIdentifier": "'${ECR_REPO_URL}:${IMAGE_TAG}'",
                "ImageRepositoryType": "ECR",
                "ImageConfiguration": {
                    "Port": "3000",
                    "RuntimeEnvironmentVariables": {
                        "NODE_ENV": "production",
                        "NEXT_PUBLIC_SUPABASE_URL": "'${NEXT_PUBLIC_SUPABASE_URL}'",
                        "NEXT_PUBLIC_SUPABASE_ANON_KEY": "'${NEXT_PUBLIC_SUPABASE_ANON_KEY}'"
                    }
                }
            },
            "AutoDeploymentsEnabled": true,
            "AuthenticationConfiguration": {
                "AccessRoleArn": "arn:aws:iam::'${AWS_ACCOUNT_ID}':role/AppRunnerECRAccessRole"
            }
        }' \
        --instance-configuration '{
            "Cpu": "1024",
            "Memory": "2048"
        }' \
        --region ${AWS_REGION}
else
    echo -e "${YELLOW}Updating existing App Runner service...${NC}"

    # Update existing service
    aws apprunner update-service \
        --service-arn ${SERVICE_EXISTS} \
        --source-configuration '{
            "ImageRepository": {
                "ImageIdentifier": "'${ECR_REPO_URL}:${IMAGE_TAG}'",
                "ImageRepositoryType": "ECR",
                "ImageConfiguration": {
                    "Port": "3000",
                    "RuntimeEnvironmentVariables": {
                        "NODE_ENV": "production",
                        "NEXT_PUBLIC_SUPABASE_URL": "'${NEXT_PUBLIC_SUPABASE_URL}'",
                        "NEXT_PUBLIC_SUPABASE_ANON_KEY": "'${NEXT_PUBLIC_SUPABASE_ANON_KEY}'"
                    }
                }
            }
        }' \
        --region ${AWS_REGION}
fi

echo -e "${YELLOW}Step 7: Waiting for deployment...${NC}"
sleep 10

# Get service URL
SERVICE_URL=$(aws apprunner list-services \
    --query "ServiceSummaryList[?ServiceName=='${APP_RUNNER_SERVICE_NAME}'].ServiceUrl" \
    --output text \
    --region ${AWS_REGION})

echo -e "${GREEN}=== Deployment Complete ===${NC}"
echo -e "${GREEN}Service URL: https://${SERVICE_URL}${NC}"
echo ""
echo -e "${YELLOW}Note: It may take a few minutes for the service to become fully available.${NC}"
echo -e "${YELLOW}You can check the status in the AWS Console under App Runner.${NC}"
