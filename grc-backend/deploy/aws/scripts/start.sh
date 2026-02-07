#!/bin/bash

# Start script for CodeDeploy
# Starts the GRC Platform application containers

set -e

cd /opt/grc-platform

echo "=== CodeDeploy Start Phase ==="

# Load environment variables
echo "Loading environment configuration..."
if [ -f /opt/grc-platform/.env.production ]; then
    export $(cat /opt/grc-platform/.env.production | grep -v '^#' | xargs)
fi

# Start Docker containers
echo "Starting application containers with Docker Compose..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Wait for application to be ready
echo "Waiting for application to be ready..."
for i in {1..60}; do
    if curl -f http://localhost:5000/health > /dev/null 2>&1; then
        echo "Application is healthy"
        echo "=== Start Phase Completed Successfully ==="
        exit 0
    fi
    echo "Waiting for application... ($i/60)"
    sleep 1
done

echo "ERROR: Application failed to start"
exit 1
