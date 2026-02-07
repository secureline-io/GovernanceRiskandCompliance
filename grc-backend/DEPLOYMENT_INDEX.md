# GRC Platform Backend - Deployment Configuration Index

## Quick Navigation

### Getting Started
- Start here: [CLOUD_DEPLOYMENT_SETUP.md](CLOUD_DEPLOYMENT_SETUP.md) - Overview and quick start guide
- Full details: [DEPLOYMENT.md](DEPLOYMENT.md) - Complete deployment guide
- Docker info: [DOCKER.md](DOCKER.md) - Docker-specific documentation

### Deployment Tools
- **Main Script**: `scripts/deploy.sh` - Universal deployment tool with 14 commands

### Docker Configuration

#### Development
- `docker-compose.yml` - Local development environment with app, MongoDB, Mongo Express
- `.env.example` - Development environment variables template

#### Production
- `Dockerfile` - Multi-stage production build (minimal, secure, optimized)
- `docker-compose.prod.yml` - Production overrides with resource limits
- `.dockerignore` - Build context optimization
- `.env.production.example` - Production environment template

#### Testing
- `docker-compose.test.yml` - Isolated testing environment

#### Database
- `init-mongo.js` - MongoDB initialization with schemas and indexes

### Cloud-Specific Deployments

#### AWS Deployment Files (`deploy/aws/`)
- **Infrastructure as Code**
  - `cloudformation.yml` - Complete infrastructure (VPC, ECS, ALB, DocumentDB, security, IAM, autoscaling)
  - `task-definition.json` - ECS Fargate task configuration

- **CI/CD**
  - `buildspec.yml` - AWS CodeBuild pipeline (test, build, push to ECR)
  - `appspec.yml` - AWS CodeDeploy configuration

- **Reverse Proxy**
  - `Dockerfile.nginx` - Nginx container for reverse proxy
  - `nginx.conf` - Advanced nginx configuration (rate limiting, security headers, compression)

- **Deployment Scripts** (`scripts/`)
  - `before-install.sh` - Pre-deployment setup (Docker, permissions)
  - `after-install.sh` - Dependencies and configuration
  - `start.sh` - Service startup with health checks
  - `stop.sh` - Graceful shutdown
  - `validate.sh` - Post-deployment validation

#### GCP Deployment Files (`deploy/gcp/`)
- `cloudbuild.yaml` - Cloud Build pipeline for CI/CD
- `app.yaml` - App Engine standard environment configuration
- `secret-manager.yaml` - Google Secret Manager integration

#### Kubernetes Deployment Files (`deploy/k8s/`)
- **Core Configuration**
  - `namespace.yaml` - grc-platform namespace
  - `configmap.yaml` - Non-sensitive environment variables
  - `secret.yaml` - Sensitive data template

- **Access Control**
  - `rbac.yaml` - ServiceAccount, Role, RoleBinding

- **Application**
  - `deployment.yaml` - Application deployment (2 replicas) + ClusterIP Service

- **Database**
  - `statefulset.yaml` - MongoDB StatefulSet (3 replicas) + Headless Service

- **Networking & Ingress**
  - `ingress.yaml` - Nginx Ingress with TLS and cert-manager integration

- **Autoscaling**
  - `hpa.yaml` - Horizontal Pod Autoscaler (2-10 replicas, 70% CPU, 75% Memory)

- **Package Management**
  - `kustomization.yaml` - Kustomize composition

### Environment Configuration

```
Development:       .env.example
Production:        .env.production.example
```

### Package.json Scripts

```bash
npm run start           # Start application
npm run dev            # Start with nodemon
npm run seed           # Seed database
npm run test           # Run tests
npm run docker:build   # Build Docker image
npm run docker:run     # Start docker-compose
npm run docker:stop    # Stop docker-compose
npm run docker:prod    # Start production compose
```

### Deployment Script Commands

```bash
./scripts/deploy.sh docker-local              # Local development
./scripts/deploy.sh docker-stop               # Stop local services
./scripts/deploy.sh docker-prod               # Production docker-compose
./scripts/deploy.sh docker-build              # Build Docker image
./scripts/deploy.sh aws-ecr [tag]             # Push to AWS ECR
./scripts/deploy.sh aws-ecs [cluster] [svc]   # Deploy to AWS ECS
./scripts/deploy.sh aws-cf [stack] [env]      # CloudFormation deploy
./scripts/deploy.sh k8s-deploy [ctx] [tag]    # Kubernetes deploy
./scripts/deploy.sh k8s-logs [pod] [lines]    # View Kubernetes logs
./scripts/deploy.sh k8s-shell [pod]           # Open pod shell
./scripts/deploy.sh k8s-delete [yes]          # Delete Kubernetes resources
./scripts/deploy.sh seed                      # Seed database
./scripts/deploy.sh test                      # Run tests
./scripts/deploy.sh help                      # Show help
```

## Deployment Options Matrix

| Target | Files | Setup Time | Scaling | Production Ready |
|--------|-------|-----------|---------|-----------------|
| Local Dev | docker-compose.yml, .env | 2 min | No | No |
| Docker Prod | docker-compose.yml/prod.yml | 5 min | Manual | Yes |
| AWS ECS | cloudformation.yml, task-def | 30 min | Auto | Yes |
| AWS EC2 | appspec.yml, scripts | 20 min | Manual | Yes |
| GCP Cloud Run | app.yaml, cloudbuild.yaml | 15 min | Auto | Yes |
| Kubernetes | k8s/*.yaml | 20 min | Auto (HPA) | Yes |

## File Structure

```
grc-backend/
├── Dockerfile                          # Production image
├── .dockerignore                       # Build optimization
├── init-mongo.js                       # MongoDB setup
├── docker-compose.yml                  # Dev environment
├── docker-compose.prod.yml             # Prod overrides
├── docker-compose.test.yml             # Test environment
├── .env.example                        # Dev env template
├── .env.production.example             # Prod env template
├── package.json                        # Updated with docker scripts
├── DEPLOYMENT_INDEX.md                 # This file
├── CLOUD_DEPLOYMENT_SETUP.md           # Setup overview
├── DEPLOYMENT.md                       # Full deployment guide (100+ sections)
├── DOCKER.md                           # Docker documentation
├── server.js                           # Application entry point
├── deploy/
│   ├── aws/
│   │   ├── Dockerfile.nginx            # Nginx reverse proxy
│   │   ├── nginx.conf                  # Nginx configuration
│   │   ├── buildspec.yml               # CodeBuild config
│   │   ├── appspec.yml                 # CodeDeploy config
│   │   ├── task-definition.json        # ECS Fargate task
│   │   ├── cloudformation.yml          # Complete infrastructure
│   │   └── scripts/
│   │       ├── before-install.sh       # Pre-deployment
│   │       ├── after-install.sh        # Setup
│   │       ├── start.sh                # Startup
│   │       ├── stop.sh                 # Shutdown
│   │       └── validate.sh             # Validation
│   ├── gcp/
│   │   ├── cloudbuild.yaml             # Cloud Build
│   │   ├── app.yaml                    # App Engine
│   │   └── secret-manager.yaml         # Secrets
│   └── k8s/
│       ├── namespace.yaml              # Namespace
│       ├── configmap.yaml              # Config
│       ├── secret.yaml                 # Secrets
│       ├── rbac.yaml                   # Access control
│       ├── deployment.yaml             # App + Service
│       ├── statefulset.yaml            # MongoDB + Service
│       ├── ingress.yaml                # Ingress + TLS
│       ├── hpa.yaml                    # Autoscaling
│       └── kustomization.yaml          # Package manager
└── scripts/
    └── deploy.sh                       # Universal deployment tool
```

## Common Tasks

### Local Development
```bash
cp .env.example .env
./scripts/deploy.sh docker-local
# Application: http://localhost:5000
# MongoDB: mongodb://admin:changeme@localhost:27017
# Mongo Express: http://localhost:8081
```

### Test Changes
```bash
npm run test
npm run docker:run  # If testing with docker
```

### AWS Deployment
```bash
export AWS_ACCOUNT_ID=your-account-id
export AWS_REGION=us-east-1
./scripts/deploy.sh aws-ecr v1.0.0
./scripts/deploy.sh aws-cf grc-platform-stack .env.production
```

### Kubernetes Deployment
```bash
cp .env.production.example .env.production
# Edit .env.production with your values
./scripts/deploy.sh k8s-deploy my-context latest
```

### View Logs
```bash
# Docker
docker-compose logs -f app

# Kubernetes
./scripts/deploy.sh k8s-logs grc-platform-xxxxx

# AWS CloudWatch
aws logs tail /ecs/grc-platform-backend --follow
```

## Key Features Included

### Security
- Multi-stage Docker builds (minimal image)
- Non-root container user
- dumb-init for proper signal handling
- Security headers (CSP, X-Frame-Options, etc.)
- Read-only root filesystem (production)
- IAM roles and policies
- RBAC for Kubernetes
- Secrets management integration

### Scalability
- Horizontal Pod Autoscaling (2-10 replicas)
- AWS Auto Scaling Groups
- Load balancing (ALB, Ingress)
- Resource limits and requests
- Multi-replica deployments

### Monitoring
- Health check endpoints
- CloudWatch integration
- Structured logging
- Container metrics
- Pod metrics in Kubernetes

### Reliability
- Database replication
- Load balancing
- Graceful shutdown
- Retry policies
- Rolling updates

## Documentation Structure

1. **DEPLOYMENT_INDEX.md** (this file) - Quick reference and navigation
2. **CLOUD_DEPLOYMENT_SETUP.md** - Overview, features, architecture
3. **DEPLOYMENT.md** - Comprehensive guide (100+ sections)
4. **DOCKER.md** - Docker-specific documentation

## Recommended Reading Order

1. Start with **CLOUD_DEPLOYMENT_SETUP.md** (5 min read)
2. Choose your deployment target
3. Read the relevant section in **DEPLOYMENT.md**
4. Follow the setup instructions
5. Use **DOCKER.md** for Docker-specific questions
6. Refer to **scripts/deploy.sh** help for command details

## Support Resources

### Docker
- Documentation: https://docs.docker.com/
- Best Practices: https://docs.docker.com/develop/dev-best-practices/

### AWS
- ECS: https://docs.aws.amazon.com/ecs/
- CloudFormation: https://docs.aws.amazon.com/cloudformation/
- CodeBuild: https://docs.aws.amazon.com/codebuild/

### GCP
- Cloud Run: https://cloud.google.com/run/docs/
- App Engine: https://cloud.google.com/appengine/docs/
- Cloud Build: https://cloud.google.com/build/docs/

### Kubernetes
- Documentation: https://kubernetes.io/docs/
- Best Practices: https://kubernetes.io/docs/concepts/configuration/overview/

### Database
- MongoDB: https://docs.mongodb.com/
- DocumentDB (AWS MongoDB-compatible): https://docs.aws.amazon.com/documentdb/

## Troubleshooting Quick Links

See **DEPLOYMENT.md** "Troubleshooting" section for:
- Application won't start
- Database connection errors
- High memory/CPU usage
- Port conflicts
- DNS resolution issues (Kubernetes)

## Quick Checklist

Before deploying to production:

- [ ] Update JWT_SECRET to strong random value
- [ ] Configure MONGODB_URI for your database
- [ ] Set CORS_ORIGIN to your frontend domain
- [ ] Review security group rules
- [ ] Set up SSL/TLS certificates
- [ ] Configure backup strategy
- [ ] Set up monitoring and alerts
- [ ] Test health checks
- [ ] Run full test suite
- [ ] Load test the application
- [ ] Document runbook
- [ ] Test rollback procedure

## File Sizes (Approximate)

| File | Size | Purpose |
|------|------|---------|
| cloudformation.yml | 35KB | Complete AWS infrastructure |
| task-definition.json | 4KB | ECS Fargate configuration |
| deployment.yaml | 5KB | Kubernetes app deployment |
| statefulset.yaml | 6KB | Kubernetes MongoDB |
| deploy.sh | 15KB | Universal deployment tool |
| nginx.conf | 3KB | Reverse proxy config |

## Version Information

| Technology | Version | Base Image |
|-----------|---------|-----------|
| Node.js | 20 | node:20-alpine |
| MongoDB | 7 | mongo:7 |
| Nginx | Latest | nginx:alpine |
| Kubernetes | 1.20+ | (varies by platform) |

---

**Last Updated**: February 2026
**Status**: Production Ready
**Tested With**: Docker 24.x, Kubernetes 1.27+, AWS ECS, GCP Cloud Run

For specific deployment instructions, see the appropriate document:
- Local/Docker: See [DOCKER.md](DOCKER.md)
- AWS: See [DEPLOYMENT.md - AWS Section](DEPLOYMENT.md)
- GCP: See [DEPLOYMENT.md - GCP Section](DEPLOYMENT.md)
- Kubernetes: See [DEPLOYMENT.md - Kubernetes Section](DEPLOYMENT.md)
