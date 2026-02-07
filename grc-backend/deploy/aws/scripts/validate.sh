#!/bin/bash

# Validation script for CodeDeploy
# Validates that the application is running correctly

set -e

echo "=== CodeDeploy Validate Phase ==="

# Check if containers are running
echo "Checking Docker containers..."
running_containers=$(docker ps -q | wc -l)
if [ "$running_containers" -lt 2 ]; then
    echo "ERROR: Expected at least 2 containers running (app and mongo)"
    exit 1
fi

# Health check
echo "Performing health check..."
max_attempts=10
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if curl -f http://localhost:5000/health > /dev/null 2>&1; then
        echo "Application health check passed"
        echo "=== Validate Phase Completed Successfully ==="
        exit 0
    fi
    attempt=$((attempt + 1))
    echo "Health check attempt $attempt/$max_attempts..."
    sleep 2
done

echo "ERROR: Application health check failed"
exit 1
