#!/bin/bash
set -euo pipefail

# ============================================================
# Secureline GRC Platform - EC2 Instance Setup
# Domain: grc.secureline.in
# ============================================================

echo "==========================================="
echo "  Secureline GRC Platform - EC2 Setup"
echo "==========================================="

# Update system
echo "[1/8] Updating system packages..."
sudo apt-get update -y && sudo apt-get upgrade -y

# Install Docker
echo "[2/8] Installing Docker..."
sudo apt-get install -y ca-certificates curl gnupg lsb-release
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add current user to docker group
sudo usermod -aG docker $USER
echo "Docker installed: $(docker --version)"

# Install Docker Compose v2
echo "[3/8] Installing Docker Compose..."
sudo apt-get install -y docker-compose-plugin
echo "Docker Compose installed: $(docker compose version)"

# Install Node.js 20 (for local testing if needed)
echo "[4/8] Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
echo "Node.js installed: $(node --version)"

# Install Git
echo "[5/8] Installing Git..."
sudo apt-get install -y git
echo "Git installed: $(git --version)"

# Configure firewall
echo "[6/8] Configuring firewall..."
sudo apt-get install -y ufw
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw --force enable
echo "Firewall configured"

# Create app directory
echo "[7/8] Creating application directory..."
sudo mkdir -p /opt/secureline-grc
sudo chown $USER:$USER /opt/secureline-grc

# Configure swap (for small instances)
echo "[8/8] Configuring swap space..."
if [ ! -f /swapfile ]; then
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "2GB swap configured"
else
    echo "Swap already exists"
fi

echo ""
echo "==========================================="
echo "  EC2 Setup Complete!"
echo "==========================================="
echo ""
echo "Next steps:"
echo "  1. Clone your repo: cd /opt/secureline-grc && git clone <repo-url> ."
echo "  2. Create .env file: cp .env.example .env && nano .env"
echo "  3. Deploy: bash deploy/deploy.sh"
echo ""
echo "NOTE: Log out and back in for Docker group permissions to take effect"
