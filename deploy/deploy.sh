#!/bin/bash
set -euo pipefail

# ============================================================
# Secureline GRC Platform - Deployment Script
# Domain: grc.secureline.in
# ============================================================

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

echo "==========================================="
echo "  Deploying Secureline GRC Platform"
echo "  Domain: grc.secureline.in"
echo "==========================================="

# Check prerequisites
echo "[1/6] Checking prerequisites..."
command -v docker >/dev/null 2>&1 || { echo "ERROR: Docker not installed. Run deploy/ec2-setup.sh first"; exit 1; }
command -v docker compose >/dev/null 2>&1 || docker compose version >/dev/null 2>&1 || { echo "ERROR: Docker Compose not installed"; exit 1; }

# Check env file
if [ ! -f ".env" ]; then
    if [ -f ".env.local" ]; then
        echo "  Copying .env.local to .env..."
        cp .env.local .env
        # Add production vars
        echo "" >> .env
        echo "# Production Configuration" >> .env
        echo "NEXT_PUBLIC_APP_URL=https://grc.secureline.in" >> .env
        echo "NODE_ENV=production" >> .env
    else
        echo "ERROR: No .env file found. Create one from .env.example"
        exit 1
    fi
fi

# Source env vars
set -a
source .env
set +a

echo "  Supabase URL: ${NEXT_PUBLIC_SUPABASE_URL:-NOT SET}"
echo "  App URL: ${NEXT_PUBLIC_APP_URL:-NOT SET}"

# Step 1: Initial HTTP-only deployment (for SSL cert)
echo ""
echo "[2/6] Starting initial deployment (HTTP only)..."

# Use default.conf (HTTP only) first
if [ ! -f "/etc/letsencrypt/live/grc.secureline.in/fullchain.pem" ]; then
    echo "  SSL not yet configured. Starting with HTTP-only mode..."

    # Ensure only default.conf is active (remove SSL conf temporarily)
    if [ -f deploy/nginx/conf.d/grc.secureline.in.conf ]; then
        mv deploy/nginx/conf.d/grc.secureline.in.conf deploy/nginx/conf.d/grc.secureline.in.conf.ssl
    fi

    # Build and start
    docker compose build --no-cache secureline-grc
    docker compose up -d secureline-grc nginx

    echo "  Waiting for services to start..."
    sleep 10

    # Obtain SSL certificate
    echo ""
    echo "[3/6] Obtaining SSL certificate via Let's Encrypt..."
    docker compose run --rm certbot

    # Switch to SSL config
    echo "[4/6] Switching to SSL configuration..."
    if [ -f deploy/nginx/conf.d/grc.secureline.in.conf.ssl ]; then
        # Remove HTTP-only config and enable SSL config
        rm -f deploy/nginx/conf.d/default.conf
        mv deploy/nginx/conf.d/grc.secureline.in.conf.ssl deploy/nginx/conf.d/grc.secureline.in.conf
    fi

    # Reload nginx with SSL config
    docker compose restart nginx
    echo "  SSL configured successfully!"
else
    echo "  SSL certificate already exists. Deploying with HTTPS..."

    # Ensure SSL config is active
    if [ -f deploy/nginx/conf.d/grc.secureline.in.conf.ssl ]; then
        rm -f deploy/nginx/conf.d/default.conf
        mv deploy/nginx/conf.d/grc.secureline.in.conf.ssl deploy/nginx/conf.d/grc.secureline.in.conf
    fi

    echo ""
    echo "[3/6] Building application..."
    docker compose build --no-cache secureline-grc

    echo ""
    echo "[4/6] Starting services..."
    docker compose up -d
fi

# Health check
echo ""
echo "[5/6] Running health check..."
sleep 5
MAX_RETRIES=30
RETRY=0
while [ $RETRY -lt $MAX_RETRIES ]; do
    if curl -sf http://localhost:3000/ > /dev/null 2>&1; then
        echo "  Application is healthy!"
        break
    fi
    RETRY=$((RETRY + 1))
    echo "  Waiting for app to start... ($RETRY/$MAX_RETRIES)"
    sleep 2
done

if [ $RETRY -eq $MAX_RETRIES ]; then
    echo "  WARNING: Health check failed. Check logs: docker compose logs secureline-grc"
fi

# Setup SSL auto-renewal
echo ""
echo "[6/6] Setting up SSL auto-renewal..."
CRON_JOB="0 3 * * * cd $PROJECT_DIR && docker compose run --rm certbot renew && docker compose exec nginx nginx -s reload"
(crontab -l 2>/dev/null | grep -v "certbot renew"; echo "$CRON_JOB") | crontab -
echo "  Cron job added for daily SSL renewal check"

echo ""
echo "==========================================="
echo "  Deployment Complete!"
echo "==========================================="
echo ""
echo "  URL: https://grc.secureline.in"
echo ""
echo "  Useful commands:"
echo "    docker compose logs -f          # View all logs"
echo "    docker compose logs secureline-grc -f  # View app logs"
echo "    docker compose restart          # Restart all services"
echo "    docker compose down             # Stop all services"
echo "    docker compose up -d --build    # Rebuild and restart"
echo ""
