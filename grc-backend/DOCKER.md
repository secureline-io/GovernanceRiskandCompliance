# Docker Configuration Guide

## Overview

The GRC Platform backend is fully containerized with multi-stage Docker builds for production optimization.

## Files

- `Dockerfile`: Production-optimized multi-stage build
- `.dockerignore`: Excludes unnecessary files from build context
- `docker-compose.yml`: Development environment configuration
- `docker-compose.prod.yml`: Production overrides
- `docker-compose.test.yml`: Testing environment

## Dockerfile Details

### Build Stages

#### Stage 1: Builder
- Base image: `node:20-alpine`
- Installs dependencies with `--production` flag
- Smaller and faster than npm install

#### Stage 2: Production
- Base image: `node:20-alpine`
- Copies only built dependencies from builder
- Adds non-root `nodejs` user for security
- Configures dumb-init for proper signal handling
- Exposes port 5000
- Includes health check
- Minimal final image size

### Security Features

- Non-root user execution
- dumb-init for PID 1 handling
- Health check with retry logic
- Minimal base image
- No development dependencies in production

### Image Size

- Layer 1 (Builder): ~150MB
- Layer 2 (Runtime): ~100MB
- Final image: ~100MB (only production dependencies)

## Docker Compose Configurations

### Development (docker-compose.yml)

**Services:**
- `app`: Development Node.js application with hot-reload
- `mongo`: MongoDB 7 with authentication
- `mongo-express`: Web-based MongoDB admin interface (profile: dev)

**Features:**
- Volume mounts for live code editing
- Development environment variables
- Health checks
- Network isolation

**Usage:**

```bash
# Start services
docker-compose up -d

# With mongo-express
docker-compose --profile dev up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Clean up volumes
docker-compose down -v
```

### Production (docker-compose.prod.yml)

**Overrides:**
- Pre-built image from registry
- Resource limits (CPU/Memory)
- Production logging configuration
- Enhanced security settings
- Read-only root filesystem
- No mongo-express service

**Features:**
- JSON file logging with rotation
- Container resource constraints
- Security hardening
- Monitoring labels

**Usage:**

```bash
# Start production environment
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Or with npm script
npm run docker:prod

# Environment file required
export DOCKER_REGISTRY=your-registry.azurecr.io
export APP_VERSION=v1.0.0
```

### Testing (docker-compose.test.yml)

**Configuration:**
- Isolated test environment
- Separate MongoDB instance for tests
- Test-specific environment variables
- Automatic test execution

**Usage:**

```bash
# Run tests in Docker
docker-compose -f docker-compose.test.yml up

# View results
docker-compose -f docker-compose.test.yml logs app
```

## Building Docker Images

### Basic Build

```bash
# Build with default tag
docker build -t grc-platform .

# With npm script
npm run docker:build

# With version tag
docker build -t grc-platform:v1.0.0 .

# With multiple tags
docker build \
  -t grc-platform:latest \
  -t grc-platform:v1.0.0 \
  -t registry.example.com/grc-platform:latest .
```

### Build Arguments

```bash
# Custom build arguments
docker build \
  --build-arg NODE_ENV=production \
  -t grc-platform:custom .
```

### Build Cache

```bash
# Disable cache
docker build --no-cache -t grc-platform .

# Use cache from source
docker build \
  --cache-from registry.example.com/grc-platform:latest \
  -t grc-platform .
```

## Running Containers

### Basic Run

```bash
# Run container
docker run -p 5000:5000 grc-platform

# With environment variables
docker run -p 5000:5000 \
  -e NODE_ENV=production \
  -e JWT_SECRET=your-secret \
  grc-platform

# With environment file
docker run -p 5000:5000 \
  --env-file .env.production \
  grc-platform
```

### Named Container

```bash
# Run named container
docker run -d --name grc-app \
  -p 5000:5000 \
  grc-platform

# View logs
docker logs grc-app

# Stop container
docker stop grc-app

# Remove container
docker rm grc-app
```

### Interactive Mode

```bash
# Run and attach to terminal
docker run -it grc-platform

# Open shell in running container
docker exec -it grc-app /bin/sh
```

## Registry Operations

### Docker Hub

```bash
# Login
docker login

# Tag image
docker tag grc-platform username/grc-platform:latest

# Push
docker push username/grc-platform:latest

# Pull
docker pull username/grc-platform:latest
```

### ECR (AWS)

```bash
# Login
aws ecr get-login-password | docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com

# Create repository
aws ecr create-repository --repository-name grc-platform

# Tag image
docker tag grc-platform:latest <account-id>.dkr.ecr.<region>.amazonaws.com/grc-platform:latest

# Push
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/grc-platform:latest
```

### ACR (Azure)

```bash
# Login
az acr login --name <registry-name>

# Tag image
docker tag grc-platform <registry-name>.azurecr.io/grc-platform:latest

# Push
docker push <registry-name>.azurecr.io/grc-platform:latest
```

### GCR (Google Cloud)

```bash
# Login
gcloud auth configure-docker gcr.io

# Tag image
docker tag grc-platform gcr.io/<project-id>/grc-platform:latest

# Push
docker push gcr.io/<project-id>/grc-platform:latest
```

## Health Checks

### Container Health Check

```bash
# Manual health check
curl http://localhost:5000/health

# Health check from container
docker exec grc-app curl http://localhost:5000/health

# View health status
docker ps --format "table {{.Names}}\t{{.Status}}"
```

### Wait for Health

```bash
# Wait for container to be healthy
docker run \
  --name grc-app \
  grc-platform &

# Wait for health
while [ "$(docker inspect -f '{{.State.Health.Status}}' grc-app)" != "healthy" ]; do
  sleep 1
done
```

## Networking

### Bridge Network

```bash
# Create custom network
docker network create grc-network

# Run container on network
docker run \
  --network grc-network \
  --name app \
  grc-platform

# Run MongoDB on same network
docker run \
  --network grc-network \
  --name mongo \
  mongo:7

# Containers can now communicate by name
# From app: mongodb://mongo:27017
```

### Port Mapping

```bash
# Map single port
docker run -p 5000:5000 grc-platform

# Map multiple ports
docker run -p 5000:5000 -p 5001:5000 grc-platform

# Map to random port
docker run -p 5000 grc-platform

# Map specific interface
docker run -p 127.0.0.1:5000:5000 grc-platform

# Show port mappings
docker port grc-app
```

## Volumes

### Volume Types

```bash
# Named volume
docker run -v grc-data:/data grc-platform

# Bind mount
docker run -v /host/path:/container/path grc-platform

# Read-only volume
docker run -v /data:/data:ro grc-platform
```

### Volume Management

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect grc-data

# Remove volume
docker volume rm grc-data

# Clean unused volumes
docker volume prune
```

## Debugging

### View Container Info

```bash
# View container details
docker inspect grc-app

# View resource usage
docker stats grc-app

# View processes
docker top grc-app

# View port mappings
docker port grc-app
```

### View Logs

```bash
# View recent logs
docker logs grc-app

# Follow logs
docker logs -f grc-app

# View specific lines
docker logs --tail 100 grc-app

# View with timestamps
docker logs -t grc-app

# View since specific time
docker logs --since 10m grc-app
```

### Execute Commands

```bash
# Run command in container
docker exec grc-app npm list

# Interactive shell
docker exec -it grc-app /bin/sh

# Root access
docker exec -u root grc-app apt-get update
```

## Optimization

### Reducing Image Size

1. Use alpine base images (done)
2. Multi-stage builds (done)
3. Combine RUN commands
4. Remove development dependencies (done)
5. Minimize layers

### Build Performance

1. Order instructions by change frequency
2. Use .dockerignore effectively (done)
3. Cache layer reuse
4. Parallel builds with BuildKit

```bash
# Enable BuildKit
DOCKER_BUILDKIT=1 docker build -t grc-platform .
```

## Best Practices

1. **Always use specific versions** for base images
2. **Run as non-root user** (done)
3. **Use .dockerignore** to reduce context (done)
4. **Include health checks** (done)
5. **Use multi-stage builds** for optimization (done)
6. **Implement proper signal handling** with dumb-init (done)
7. **Use environment variables** for configuration
8. **Don't store secrets** in images
9. **Keep images as small as possible** (done)
10. **Use registry authentication** for private images

## Troubleshooting

### Image Won't Build

```bash
# Check for syntax errors
docker build --no-cache -t grc-platform . --progress=plain

# View build context
docker build --dry-run -t grc-platform .
```

### Container Won't Start

```bash
# View logs
docker logs <container-id>

# Run in foreground
docker run grc-platform

# Debug shell
docker run -it grc-platform /bin/sh
```

### Port Already in Use

```bash
# Find process using port
lsof -i :5000

# Stop conflicting container
docker stop <container-id>

# Use different port
docker run -p 5001:5000 grc-platform
```

### Out of Memory

```bash
# Check memory usage
docker stats grc-app

# Increase memory limit
docker run -m 1g grc-platform
```

## Security Scanning

```bash
# Scan image with Trivy
trivy image grc-platform

# Scan with docker scout
docker scout cves grc-platform

# Scan with snyk
snyk container test grc-platform
```

## Resources

- Docker Documentation: https://docs.docker.com/
- Best Practices: https://docs.docker.com/develop/dev-best-practices/
- Alpine Linux: https://alpinelinux.org/
