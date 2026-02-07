#!/bin/bash

# Pre-installation script for CodeDeploy
# Prepares the instance for GRC Platform deployment

set -e

echo "=== CodeDeploy Before-Install Phase ==="

# Update system packages
echo "Updating system packages..."
sudo yum update -y

# Install Docker if not already installed
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    sudo amazon-linux-extras install docker -y
    sudo systemctl start docker
    sudo systemctl enable docker
fi

# Install Docker Compose if not already installed
if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Add ec2-user to docker group
echo "Configuring Docker permissions..."
sudo usermod -aG docker ec2-user
newgrp docker

# Create application directory
echo "Creating application directory..."
sudo mkdir -p /opt/grc-platform
sudo chown -R ec2-user:ec2-user /opt/grc-platform

echo "=== Before-Install Phase Completed ==="
