#!/bin/bash

# GRC Platform Deployment Script
# Supports multiple deployment targets: Docker, AWS ECS, AWS ECR, and Kubernetes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="grc-platform"
DOCKER_REGISTRY="${DOCKER_REGISTRY:-docker.io}"
AWS_REGION="${AWS_REGION:-us-east-1}"
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:-}"
KUBE_NAMESPACE="${KUBE_NAMESPACE:-grc-platform}"
KUBE_CONTEXT="${KUBE_CONTEXT:-}"

# Functions
print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  ${1:-GRC Platform Deployment}${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
    echo
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
    exit 1
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check prerequisites
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
    fi
}

check_aws_cli() {
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed"
    fi
}

check_kubectl() {
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed"
    fi
}

check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
    fi
}

# Docker operations
docker_build() {
    print_header "Docker Build"
    check_docker

    print_info "Building Docker image: $PROJECT_NAME"
    docker build -t "$PROJECT_NAME:latest" \
        --label "built-at=$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
        --label "git-commit=$(git rev-parse HEAD 2>/dev/null || echo 'unknown')" .

    print_success "Docker image built successfully"
}

docker_run_local() {
    print_header "Docker Compose - Local Development"
    check_docker

    print_info "Starting services with docker-compose..."
    docker-compose up -d

    print_info "Waiting for services to be healthy..."
    sleep 5

    print_info "Checking health..."
    for i in {1..30}; do
        if curl -f http://localhost:5000/health > /dev/null 2>&1; then
            print_success "Application is healthy"
            print_info "Application running at http://localhost:5000"
            print_info "MongoDB is running at mongodb://admin:changeme@localhost:27017"
            print_info "Mongo Express is available at http://localhost:8081"
            return 0
        fi
        print_info "Waiting for application to be ready... ($i/30)"
        sleep 1
    done

    print_error "Application failed to become healthy"
}

docker_stop_local() {
    print_header "Docker Compose - Stop"
    check_docker

    print_info "Stopping services..."
    docker-compose down

    print_success "Services stopped"
}

docker_run_prod() {
    print_header "Docker Compose - Production"
    check_docker

    if [ -z "$DOCKER_REGISTRY" ]; then
        print_error "DOCKER_REGISTRY environment variable is not set"
    fi

    print_info "Starting production services..."
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

    print_info "Waiting for services to be healthy..."
    sleep 10

    print_success "Production environment started"
}

# AWS ECR operations
aws_ecr_push() {
    print_header "AWS ECR - Build and Push"
    check_docker
    check_aws_cli

    if [ -z "$AWS_ACCOUNT_ID" ]; then
        print_error "AWS_ACCOUNT_ID environment variable is not set"
    fi

    local ecr_registry="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
    local image_tag="${1:-latest}"
    local commit_sha=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

    print_info "Logging in to ECR..."
    aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$ecr_registry"

    print_info "Building Docker image..."
    docker build -t "$ecr_registry/$PROJECT_NAME:$commit_sha" \
        -t "$ecr_registry/$PROJECT_NAME:$image_tag" .

    print_info "Pushing to ECR..."
    docker push "$ecr_registry/$PROJECT_NAME:$commit_sha"
    docker push "$ecr_registry/$PROJECT_NAME:$image_tag"

    print_success "Image pushed to ECR"
    print_info "Image URL: $ecr_registry/$PROJECT_NAME:$image_tag"
}

# AWS ECS operations
aws_ecs_deploy() {
    print_header "AWS ECS - Deploy"
    check_aws_cli

    local cluster_name="${1:-grc-platform-cluster}"
    local service_name="${2:-grc-platform-service}"

    print_info "Updating ECS service..."
    aws ecs update-service \
        --cluster "$cluster_name" \
        --service "$service_name" \
        --force-new-deployment \
        --region "$AWS_REGION"

    print_success "ECS service update initiated"
    print_info "Monitoring deployment..."

    # Wait for service to stabilize
    local max_attempts=60
    local attempt=0

    while [ $attempt -lt $max_attempts ]; do
        local deployments=$(aws ecs describe-services \
            --cluster "$cluster_name" \
            --services "$service_name" \
            --region "$AWS_REGION" \
            --query 'services[0].deployments | length()')

        if [ "$deployments" -eq 1 ]; then
            print_success "Deployment completed successfully"
            return 0
        fi

        print_info "Deployment in progress... ($attempt/$max_attempts)"
        sleep 5
        attempt=$((attempt + 1))
    done

    print_warning "Deployment monitoring timed out, but it may still be in progress"
}

# AWS CloudFormation operations
aws_cf_deploy() {
    print_header "AWS CloudFormation - Deploy Infrastructure"
    check_aws_cli

    local stack_name="${1:-grc-platform-stack}"
    local env_file="${2:-.env.production}"

    if [ ! -f "$env_file" ]; then
        print_error "Environment file not found: $env_file"
    fi

    print_info "Validating CloudFormation template..."
    aws cloudformation validate-template \
        --template-body file://deploy/aws/cloudformation.yml \
        --region "$AWS_REGION" > /dev/null

    print_info "Deploying CloudFormation stack: $stack_name"
    aws cloudformation deploy \
        --template-file deploy/aws/cloudformation.yml \
        --stack-name "$stack_name" \
        --region "$AWS_REGION" \
        --parameter-overrides \
            Environment=production \
            JWTSecret="$(grep JWT_SECRET "$env_file" | cut -d= -f2)" \
            MongoDBPassword="$(grep MONGO_PASSWORD "$env_file" | cut -d= -f2)" \
        --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM

    print_success "CloudFormation stack deployed"

    print_info "Stack outputs:"
    aws cloudformation describe-stacks \
        --stack-name "$stack_name" \
        --region "$AWS_REGION" \
        --query 'Stacks[0].Outputs' \
        --output table
}

# Kubernetes operations
k8s_deploy() {
    print_header "Kubernetes - Deploy"
    check_kubectl

    local context="$1"
    local image_tag="${2:-latest}"

    if [ -n "$context" ]; then
        print_info "Using Kubernetes context: $context"
        kubectl config use-context "$context"
    fi

    print_info "Creating namespace..."
    kubectl apply -f deploy/k8s/namespace.yaml

    print_info "Deploying application..."
    kubectl apply -f deploy/k8s/

    print_info "Waiting for deployment to be ready..."
    kubectl rollout status deployment/grc-platform -n "$KUBE_NAMESPACE" --timeout=5m

    print_success "Kubernetes deployment completed"

    print_info "Application status:"
    kubectl get pods -n "$KUBE_NAMESPACE" -l app=grc-platform

    print_info "Service information:"
    kubectl get svc grc-platform -n "$KUBE_NAMESPACE"
}

k8s_logs() {
    print_header "Kubernetes - View Logs"
    check_kubectl

    local pod_name="$1"
    local num_lines="${2:-100}"

    if [ -z "$pod_name" ]; then
        print_info "Available pods:"
        kubectl get pods -n "$KUBE_NAMESPACE" -l app=grc-platform
        return
    fi

    print_info "Fetching logs from $pod_name..."
    kubectl logs -n "$KUBE_NAMESPACE" "$pod_name" --tail="$num_lines"
}

k8s_shell() {
    print_header "Kubernetes - Pod Shell"
    check_kubectl

    local pod_name="$1"

    if [ -z "$pod_name" ]; then
        print_error "Pod name is required"
    fi

    print_info "Opening shell to pod: $pod_name"
    kubectl exec -it -n "$KUBE_NAMESPACE" "$pod_name" -- sh
}

k8s_delete() {
    print_header "Kubernetes - Delete Deployment"
    check_kubectl

    local confirm="$1"

    if [ "$confirm" != "yes" ]; then
        print_warning "This will delete all GRC Platform resources in namespace: $KUBE_NAMESPACE"
        read -p "Type 'yes' to confirm: " confirm
    fi

    if [ "$confirm" = "yes" ]; then
        print_info "Deleting Kubernetes resources..."
        kubectl delete namespace "$KUBE_NAMESPACE"
        print_success "Resources deleted"
    else
        print_info "Deletion cancelled"
    fi
}

# Database operations
seed_database() {
    print_header "Seed Database"
    check_npm

    print_info "Running database seed script..."
    npm run seed

    print_success "Database seeding completed"
}

# Test operations
run_tests() {
    print_header "Run Tests"
    check_npm

    print_info "Running tests..."
    npm run test

    print_success "Tests completed"
}

# Help
show_help() {
    cat << EOF
${BLUE}GRC Platform Deployment Script${NC}

${YELLOW}Usage:${NC}
    ./deploy.sh <command> [options]

${YELLOW}Docker Commands:${NC}
    docker-local              Start local development environment
    docker-stop               Stop local development environment
    docker-prod               Start production environment (with docker-compose)
    docker-build              Build Docker image

${YELLOW}AWS ECS Commands:${NC}
    aws-ecr [tag]             Build and push image to ECR (default: latest)
    aws-ecs [cluster] [svc]   Deploy to ECS (defaults: grc-platform-cluster, grc-platform-service)
    aws-cf [stack] [env]      Deploy infrastructure via CloudFormation

${YELLOW}Kubernetes Commands:${NC}
    k8s-deploy [ctx] [tag]    Deploy to Kubernetes
    k8s-logs [pod] [lines]    View pod logs
    k8s-shell <pod>           Open shell in pod
    k8s-delete [yes]          Delete all resources

${YELLOW}Database Commands:${NC}
    seed                      Seed database with initial data

${YELLOW}Testing:${NC}
    test                      Run tests

${YELLOW}Environment Variables:${NC}
    DOCKER_REGISTRY           Docker registry URL (default: docker.io)
    AWS_REGION                AWS region (default: us-east-1)
    AWS_ACCOUNT_ID            AWS account ID (required for ECR operations)
    KUBE_NAMESPACE            Kubernetes namespace (default: grc-platform)
    KUBE_CONTEXT              Kubernetes context (optional)

${YELLOW}Examples:${NC}
    ./deploy.sh docker-local
    ./deploy.sh aws-ecr v1.0.0
    ./deploy.sh k8s-deploy my-context latest

${BLUE}For more information, visit: https://github.com/your-org/grc-platform${NC}
EOF
}

# Main
main() {
    local command="${1:-}"

    case "$command" in
        docker-local)
            docker_run_local
            ;;
        docker-stop)
            docker_stop_local
            ;;
        docker-prod)
            docker_run_prod
            ;;
        docker-build)
            docker_build
            ;;
        aws-ecr)
            aws_ecr_push "$2"
            ;;
        aws-ecs)
            aws_ecs_deploy "$2" "$3"
            ;;
        aws-cf)
            aws_cf_deploy "$2" "$3"
            ;;
        k8s-deploy)
            k8s_deploy "$2" "$3"
            ;;
        k8s-logs)
            k8s_logs "$2" "$3"
            ;;
        k8s-shell)
            k8s_shell "$2"
            ;;
        k8s-delete)
            k8s_delete "$2"
            ;;
        seed)
            seed_database
            ;;
        test)
            run_tests
            ;;
        help|-h|--help)
            show_help
            ;;
        *)
            print_error "Unknown command: $command\n\nRun './deploy.sh help' for usage information"
            ;;
    esac
}

# Run main function
main "$@"
