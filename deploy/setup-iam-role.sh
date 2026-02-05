#!/bin/bash

# Setup IAM Role for AWS App Runner to access ECR

set -e

ROLE_NAME="AppRunnerECRAccessRole"
AWS_REGION="${AWS_REGION:-us-east-1}"

echo "Creating IAM Role for App Runner ECR Access..."

# Trust policy for App Runner
cat > /tmp/trust-policy.json << 'EOF'
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Service": "build.apprunner.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
        }
    ]
}
EOF

# Check if role exists
if aws iam get-role --role-name ${ROLE_NAME} 2>/dev/null; then
    echo "Role ${ROLE_NAME} already exists"
else
    # Create the role
    aws iam create-role \
        --role-name ${ROLE_NAME} \
        --assume-role-policy-document file:///tmp/trust-policy.json

    # Attach ECR access policy
    aws iam attach-role-policy \
        --role-name ${ROLE_NAME} \
        --policy-arn arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess

    echo "Role ${ROLE_NAME} created and policy attached"
fi

# Get the role ARN
ROLE_ARN=$(aws iam get-role --role-name ${ROLE_NAME} --query 'Role.Arn' --output text)
echo "Role ARN: ${ROLE_ARN}"

# Cleanup
rm /tmp/trust-policy.json

echo "IAM Role setup complete!"
