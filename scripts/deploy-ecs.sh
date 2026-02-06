#!/bin/bash
# Deploy to AWS ECS

set -e

# Configuration
AWS_REGION="us-east-1"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REPOSITORY="grc-platform"
ECS_CLUSTER="grc-platform-cluster"
ECS_SERVICE="grc-platform-service"

echo "🚀 Deploying GRC Platform to AWS ECS..."

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI is not configured"
    echo "Run: aws configure"
    exit 1
fi

echo "📦 Building Docker image..."
docker build -t $ECR_REPOSITORY:latest .

echo "🔐 Logging in to ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

echo "🏷️  Tagging image..."
docker tag $ECR_REPOSITORY:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest

echo "⬆️  Pushing to ECR..."
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest

echo "🔄 Updating ECS service..."
aws ecs update-service \
    --cluster $ECS_CLUSTER \
    --service $ECS_SERVICE \
    --force-new-deployment \
    --region $AWS_REGION

echo ""
echo "✅ Deployment initiated!"
echo "📊 Monitor deployment: aws ecs describe-services --cluster $ECS_CLUSTER --services $ECS_SERVICE"
