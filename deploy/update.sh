#!/bin/bash
set -euo pipefail

# ============================================================
# Secureline GRC Platform - Quick Update Script
# ============================================================

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

echo "Updating Secureline GRC Platform..."

# Pull latest code
echo "[1/4] Pulling latest code..."
git pull origin main

# Rebuild and restart
echo "[2/4] Rebuilding application..."
docker compose build --no-cache secureline-grc

echo "[3/4] Restarting services..."
docker compose up -d secureline-grc

# Health check
echo "[4/4] Health check..."
sleep 5
if curl -sf http://localhost:3000/ > /dev/null 2>&1; then
    echo "Update successful! https://grc.secureline.in is live."
else
    echo "WARNING: App may still be starting. Check: docker compose logs secureline-grc -f"
fi
