#!/bin/bash

# Post-installation script for CodeDeploy
# Installs dependencies and prepares the application

set -e

cd /opt/grc-platform

echo "=== CodeDeploy After-Install Phase ==="

# Pull the latest Docker image from ECR
echo "Pulling Docker image from ECR..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

docker pull ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/grc-platform:latest || true

# Load environment variables
echo "Loading environment configuration..."
if [ -f /opt/grc-platform/.env.production ]; then
    export $(cat /opt/grc-platform/.env.production | grep -v '^#' | xargs)
fi

# Create required directories
echo "Creating application directories..."
mkdir -p logs data

# Set proper permissions
echo "Setting file permissions..."
chown -R ec2-user:ec2-user /opt/grc-platform

echo "=== After-Install Phase Completed ==="
