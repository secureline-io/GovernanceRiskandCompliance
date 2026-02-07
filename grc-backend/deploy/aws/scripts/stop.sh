#!/bin/bash

# Stop script for CodeDeploy
# Stops the GRC Platform application containers gracefully

set -e

cd /opt/grc-platform

echo "=== CodeDeploy Stop Phase ==="

# Stop Docker containers gracefully
echo "Stopping application containers..."
docker-compose down --remove-orphans || true

echo "=== Stop Phase Completed ==="
