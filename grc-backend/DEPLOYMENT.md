# GRC Platform Backend - Deployment Guide

This guide covers deployment of the GRC Platform backend to various cloud providers and local environments.

## Table of Contents

1. [Local Development](#local-development)
2. [Docker Deployment](#docker-deployment)
3. [AWS Deployment](#aws-deployment)
4. [GCP Deployment](#gcp-deployment)
5. [Kubernetes Deployment](#kubernetes-deployment)
6. [Environment Configuration](#environment-configuration)
7. [Health Checks](#health-checks)
8. [Troubleshooting](#troubleshooting)

## Local Development

### Prerequisites

- Docker and Docker Compose
- Node.js 20+
- npm

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd grc-backend

# Copy environment file
cp .env.example .env

# Start development environment
./scripts/deploy.sh docker-local

# Application will be available at http://localhost:5000
# MongoDB at mongodb://admin:changeme@localhost:27017
# Mongo Express at http://localhost:8081
```

### Development with Docker Compose

```bash
# Start all services
npm run docker:run

# View logs
docker-compose logs -f app

# Stop services
npm run docker:stop

# Rebuild container
npm run docker:build
```

## Docker Deployment

### Building Docker Image

```bash
# Build production image
npm run docker:build

# Or with custom tag
docker build -t grc-platform:v1.0.0 .

# Run locally
docker run -p 5000:5000 \
  -e NODE_ENV=production \
  -e JWT_SECRET=your-secret \
  -e MONGODB_URI=mongodb://mongo:27017/grc-platform \
  grc-platform:latest
```

### Production Docker Compose

```bash
# Start production environment
npm run docker:prod

# Or with specific compose files
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## AWS Deployment

### Prerequisites

- AWS account with appropriate permissions
- AWS CLI configured
- Docker installed
- Amazon ECR repository created

### Option 1: ECS Fargate

#### 1. Build and Push to ECR

```bash
export AWS_ACCOUNT_ID=your-account-id
export AWS_REGION=us-east-1

# Build and push to ECR
./scripts/deploy.sh aws-ecr v1.0.0

# Or manually
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

docker build -t grc-platform .
docker tag grc-platform:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/grc-platform:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/grc-platform:latest
```

#### 2. Deploy with CloudFormation

```bash
# Review the template
cat deploy/aws/cloudformation.yml

# Deploy stack
./scripts/deploy.sh aws-cf grc-platform-stack .env.production

# Monitor deployment
aws cloudformation describe-stacks --stack-name grc-platform-stack --region $AWS_REGION
```

#### 3. Update ECS Service

```bash
# Deploy to existing ECS service
./scripts/deploy.sh aws-ecs grc-platform-cluster grc-platform-service

# View service status
aws ecs describe-services \
  --cluster grc-platform-cluster \
  --services grc-platform-service \
  --region $AWS_REGION
```

### Option 2: EC2 with CodeDeploy

#### 1. Create CodeDeploy Application

```bash
# Create application
aws codedeploy create-app \
  --application-name grc-platform \
  --region $AWS_REGION

# Create deployment group
aws codedeploy create-deployment-group \
  --application-name grc-platform \
  --deployment-group-name grc-platform-dg \
  --service-role-arn arn:aws:iam::$AWS_ACCOUNT_ID:role/CodeDeployRole \
  --deployment-config-name CodeDeployDefault.OneAtATime \
  --ec2-tag-filters Key=Name,Value=grc-platform,Type=KEY_AND_VALUE \
  --region $AWS_REGION
```

#### 2. Deploy Application

```bash
# Push code and trigger deployment
aws codedeploy create-deployment \
  --application-name grc-platform \
  --deployment-group-name grc-platform-dg \
  --revision revisionType=S3,s3Location=s3://bucket-name/grc-platform.zip \
  --region $AWS_REGION
```

### Option 3: CodeBuild for CI/CD

```bash
# Start build
aws codebuild start-build \
  --project-name grc-platform-build \
  --region $AWS_REGION

# View build logs
aws codebuild batch-get-builds \
  --ids <build-id> \
  --region $AWS_REGION
```

## GCP Deployment

### Prerequisites

- GCP account with Cloud Run enabled
- gcloud CLI installed and authenticated
- GCP project configured

### Option 1: Cloud Run

```bash
# Deploy directly from source
gcloud run deploy grc-platform \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,JWT_SECRET=your-secret \
  --memory 512Mi \
  --cpu 1

# View service
gcloud run services describe grc-platform --region us-central1
```

### Option 2: Cloud Build + Cloud Run

```bash
# Build and deploy
gcloud builds submit \
  --config deploy/gcp/cloudbuild.yaml \
  --region us-central1
```

### Option 3: App Engine

```bash
# Deploy to App Engine
gcloud app deploy deploy/gcp/app.yaml \
  --region us-central1 \
  --quiet

# View application
gcloud app browse
```

## Kubernetes Deployment

### Prerequisites

- Kubernetes cluster running
- kubectl configured
- Kustomize (optional but recommended)

### Using kubectl

```bash
# Create namespace
kubectl apply -f deploy/k8s/namespace.yaml

# Deploy application
kubectl apply -f deploy/k8s/

# Check status
kubectl get pods -n grc-platform
kubectl get svc -n grc-platform

# View logs
kubectl logs -n grc-platform deployment/grc-platform

# Port forward for testing
kubectl port-forward -n grc-platform svc/grc-platform 5000:5000
```

### Using Kustomize

```bash
# Deploy with kustomization
kubectl apply -k deploy/k8s/

# View status
kubectl get all -n grc-platform

# Cleanup
kubectl delete -k deploy/k8s/
```

### Using the Deployment Script

```bash
# Deploy to Kubernetes
./scripts/deploy.sh k8s-deploy my-context latest

# View logs
./scripts/deploy.sh k8s-logs grc-platform-xxxxx

# Open pod shell
./scripts/deploy.sh k8s-shell grc-platform-xxxxx

# Delete deployment
./scripts/deploy.sh k8s-delete yes
```

### Scaling

```bash
# Manual scaling
kubectl scale deployment grc-platform -n grc-platform --replicas=5

# Check HPA status
kubectl get hpa -n grc-platform

# Describe HPA
kubectl describe hpa grc-platform-hpa -n grc-platform
```

## Environment Configuration

### Development (.env)

```bash
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/grc-platform
JWT_SECRET=dev-secret-key
CORS_ORIGIN=http://localhost:3000
```

### Production (.env.production)

Use `.env.production.example` as a template:

```bash
cp .env.production.example .env.production
# Edit with your actual values
nano .env.production
```

### Secrets Management

#### AWS Secrets Manager

```bash
# Create secret
aws secretsmanager create-secret \
  --name grc-platform/jwt-secret \
  --secret-string your-jwt-secret \
  --region us-east-1

# Update secret
aws secretsmanager update-secret \
  --secret-id grc-platform/jwt-secret \
  --secret-string new-value
```

#### Google Secret Manager

```bash
# Create secret
echo -n "your-jwt-secret" | gcloud secrets create grc-jwt-secret --data-file=-

# Access secret
gcloud secrets versions access latest --secret=grc-jwt-secret
```

#### Kubernetes Secrets

```bash
# Create secret from literal values
kubectl create secret generic grc-platform-secret \
  -n grc-platform \
  --from-literal=JWT_SECRET=your-secret \
  --from-literal=MONGODB_URI=your-uri

# Create secret from file
kubectl create secret generic grc-platform-secret \
  -n grc-platform \
  --from-file=.env.production
```

## Health Checks

### Endpoint

The application exposes a health check endpoint at `/health`:

```bash
curl http://localhost:5000/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 123.45
}
```

### Docker Health Check

Health checks are configured in:
- `Dockerfile`: HEALTHCHECK instruction
- `docker-compose.yml`: healthcheck configuration
- `docker-compose.prod.yml`: healthcheck configuration

### Kubernetes Health Checks

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 5000
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /health
    port: 5000
  initialDelaySeconds: 10
  periodSeconds: 5
```

## Monitoring

### Docker

```bash
# View container stats
docker stats grc-platform-app

# View logs
docker logs -f grc-platform-app

# Inspect container
docker inspect grc-platform-app
```

### Kubernetes

```bash
# View pod metrics
kubectl top pods -n grc-platform

# View node metrics
kubectl top nodes

# Watch pod status
kubectl get pods -n grc-platform --watch

# View events
kubectl get events -n grc-platform --sort-by='.lastTimestamp'
```

### AWS CloudWatch

```bash
# View logs
aws logs tail /ecs/grc-platform-backend --follow

# Get logs from specific time
aws logs filter-log-events \
  --log-group-name /ecs/grc-platform-backend \
  --start-time $(date -d '1 hour ago' +%s)000
```

## Troubleshooting

### Application won't start

1. Check logs:
   ```bash
   docker-compose logs app
   # or
   kubectl logs -n grc-platform deployment/grc-platform
   ```

2. Verify environment variables are set correctly

3. Check MongoDB connectivity:
   ```bash
   # Docker
   docker-compose exec mongo mongosh

   # Kubernetes
   kubectl exec -it -n grc-platform grc-platform-mongo-0 -- mongosh
   ```

### Database connection errors

```bash
# Test MongoDB connection
mongosh "mongodb://admin:changeme@localhost:27017/grc-platform?authSource=admin"

# Check connection string format
# Should be: mongodb://username:password@host:port/database?authSource=admin
```

### High memory/CPU usage

```bash
# Docker: Check resource limits
docker stats grc-platform-app

# Kubernetes: Check resource requests/limits
kubectl describe pod -n grc-platform <pod-name>

# Increase limits in deployment.yaml if needed
```

### Port conflicts

```bash
# Check what's using port 5000
lsof -i :5000

# Use different port
PORT=5001 docker-compose up

# Or update docker-compose.yml
```

### DNS resolution issues (Kubernetes)

```bash
# Check DNS
kubectl run -it --rm debug --image=alpine --restart=Never -- nslookup grc-platform-mongo

# Check service discovery
kubectl exec -it <pod> -- nslookup grc-platform-mongo.grc-platform.svc.cluster.local
```

## Best Practices

1. **Always use environment variables** for sensitive data
2. **Use health checks** to ensure service readiness
3. **Implement logging** at all application levels
4. **Monitor resource usage** and scale accordingly
5. **Use version tags** for Docker images
6. **Backup MongoDB** regularly
7. **Test deployments** in staging before production
8. **Use CI/CD pipelines** for automated deployments
9. **Keep dependencies updated** for security patches
10. **Document environment-specific configurations**

## Additional Resources

- Docker Documentation: https://docs.docker.com/
- Kubernetes Documentation: https://kubernetes.io/docs/
- AWS ECS Documentation: https://docs.aws.amazon.com/ecs/
- GCP Cloud Run Documentation: https://cloud.google.com/run/docs/
- MongoDB Documentation: https://docs.mongodb.com/

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review application logs
3. Contact your DevOps/Platform team
4. Open an issue on the GitHub repository
