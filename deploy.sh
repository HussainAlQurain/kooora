#!/bin/bash

# Kooora Application Deployment Script
# This script automates the deployment process for different environments

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
ENV_FILE="$PROJECT_ROOT/.env"
VERSION_FILE="$PROJECT_ROOT/VERSION"

# Default values
ENVIRONMENT="development"
BUILD_IMAGES="true"
RUN_TESTS="true"
BACKUP_DB="false"
FORCE_RECREATE="false"

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    cat << EOF
Usage: $0 [OPTIONS] [ENVIRONMENT]

Deploy Kooora application to specified environment.

ARGUMENTS:
    ENVIRONMENT     Target environment (development|production) [default: development]

OPTIONS:
    -h, --help              Show this help message
    -v, --version           Show version information
    --no-build             Skip building Docker images
    --no-tests             Skip running tests
    --backup-db            Backup database before deployment (production only)
    --force-recreate       Force recreate all containers
    --check-health         Only check application health
    --stop                 Stop all services  
    --logs                 Show service logs
    --cleanup              Clean up Docker resources only

EXAMPLES:
    $0 development                    # Deploy to development
    $0 production --backup-db         # Deploy to production with database backup
    $0 --check-health                 # Check application health
    $0 --stop production              # Stop production services

EOF
}

# Function to check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Function to load environment variables
load_environment() {
    if [ -f "$ENV_FILE" ]; then
        print_info "Loading environment variables from $ENV_FILE"
        source "$ENV_FILE"
    else
        print_warning "Environment file $ENV_FILE not found. Using defaults."
        if [ "$ENVIRONMENT" = "production" ]; then
            print_error "Environment file is required for production deployment."
            print_info "Please copy .env.example to .env and configure your settings."
            exit 1
        fi
    fi
}

# Function to get application version
get_version() {
    if [ -f "$VERSION_FILE" ]; then
        cat "$VERSION_FILE"
    else
        echo "1.0.0"
    fi
}

# Function to run tests
run_tests() {
    if [ "$RUN_TESTS" = "true" ]; then
        print_info "Running tests..."
        
        # Backend tests
        print_info "Running backend tests..."
        cd "$PROJECT_ROOT/backend"
        if ./mvnw test; then
            print_success "Backend tests passed"
        else
            print_error "Backend tests failed"
            exit 1
        fi
        
        # Frontend tests (if they exist)
        cd "$PROJECT_ROOT/frontend"
        if [ -f "package.json" ] && grep -q '"test"' package.json; then
            print_info "Running frontend tests..."
            if npm test -- --watchAll=false; then
                print_success "Frontend tests passed"
            else
                print_error "Frontend tests failed"
                exit 1
            fi
        fi
        
        cd "$PROJECT_ROOT"
        print_success "All tests passed"
    else
        print_warning "Skipping tests"
    fi
}

# Function to cleanup Docker resources
cleanup_docker() {
    print_info "Cleaning up Docker resources..."
    
    # Remove stopped containers
    docker container prune -f > /dev/null 2>&1 || true
    
    # Remove dangling images
    docker image prune -f > /dev/null 2>&1 || true
    
    # Remove unused build cache
    docker builder prune -f > /dev/null 2>&1 || true
    
    print_success "Docker cleanup completed"
}

# Function to backup database
backup_database() {
    if [ "$BACKUP_DB" = "true" ] && [ "$ENVIRONMENT" = "production" ]; then
        print_info "Creating database backup..."
        
        BACKUP_DIR="$PROJECT_ROOT/backups"
        mkdir -p "$BACKUP_DIR"
        
        BACKUP_FILE="$BACKUP_DIR/kooora_backup_$(date +%Y%m%d_%H%M%S).sql"
        
        # Create backup using docker-compose
        docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump \
            -U "${DATABASE_USERNAME:-kooora_user}" \
            -d "${DATABASE_NAME:-kooora_prod}" > "$BACKUP_FILE"
        
        if [ $? -eq 0 ]; then
            print_success "Database backup created: $BACKUP_FILE"
        else
            print_error "Database backup failed"
            exit 1
        fi
    fi
}

# Function to build Docker images
build_images() {
    if [ "$BUILD_IMAGES" = "true" ]; then
        print_info "Building Docker images..."
        
        VERSION=$(get_version)
        export VERSION
        
        if [ "$ENVIRONMENT" = "production" ]; then
            COMPOSE_FILE="docker-compose.prod.yml"
        else
            COMPOSE_FILE="docker-compose.yml"
        fi
        
        # Use DOCKER_BUILDKIT for better build performance and caching
        DOCKER_BUILDKIT=1 docker-compose -f "$COMPOSE_FILE" build --no-cache
        
        print_success "Docker images built successfully"
    else
        print_warning "Skipping image build"
    fi
}

# Function to deploy application
deploy_application() {
    print_info "Deploying to $ENVIRONMENT environment..."
    
    VERSION=$(get_version)
    export VERSION
    
    if [ "$ENVIRONMENT" = "production" ]; then
        COMPOSE_FILE="docker-compose.prod.yml"
    else
        COMPOSE_FILE="docker-compose.yml"
    fi
    
    # Stop and remove existing containers to avoid conflicts
    print_info "Stopping existing containers..."
    docker-compose -f "$COMPOSE_FILE" down --remove-orphans 2>/dev/null || true
    
    # Deploy with appropriate options - always force recreate to avoid image hash conflicts
    print_info "Starting containers..."
    DOCKER_BUILDKIT=1 docker-compose -f "$COMPOSE_FILE" up -d --build --force-recreate --remove-orphans
    
    print_success "Application deployed successfully"
}

# Function to check application health
check_health() {
    print_info "Checking application health..."
    
    # Wait for services to start
    sleep 30
    
    # Check backend health
    if curl -f http://localhost:8080/actuator/health > /dev/null 2>&1; then
        print_success "Backend is healthy"
    else
        print_error "Backend health check failed"
        return 1
    fi
    
    # Check frontend health
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        print_success "Frontend is healthy"
    else
        print_error "Frontend health check failed"
        return 1
    fi
    
    print_success "All services are healthy"
}

# Function to stop services
stop_services() {
    print_info "Stopping services..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        COMPOSE_FILE="docker-compose.prod.yml"
    else
        COMPOSE_FILE="docker-compose.yml"
    fi
    
    docker-compose -f "$COMPOSE_FILE" down
    
    print_success "Services stopped"
}

# Function to show logs
show_logs() {
    if [ "$ENVIRONMENT" = "production" ]; then
        COMPOSE_FILE="docker-compose.prod.yml"
    else
        COMPOSE_FILE="docker-compose.yml"
    fi
    
    docker-compose -f "$COMPOSE_FILE" logs -f
}

# Main deployment function
main_deploy() {
    print_info "Starting deployment process..."
    print_info "Environment: $ENVIRONMENT"
    print_info "Version: $(get_version)"
    
    check_prerequisites
    load_environment
    cleanup_docker
    run_tests
    backup_database
    build_images
    deploy_application
    check_health
    
    print_success "Deployment completed successfully!"
    print_info "Access the application at:"
    if [ "$ENVIRONMENT" = "production" ]; then
        print_info "  Frontend: https://kooora.com"
        print_info "  API: https://api.kooora.com"
    else
        print_info "  Frontend: http://localhost:3000"
        print_info "  API: http://localhost:8080"
    fi
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_usage
            exit 0
            ;;
        -v|--version)
            echo "Kooora Deployment Script v$(get_version)"
            exit 0
            ;;
        --no-build)
            BUILD_IMAGES="false"
            shift
            ;;
        --no-tests)
            RUN_TESTS="false"
            shift
            ;;
        --backup-db)
            BACKUP_DB="true"
            shift
            ;;
        --force-recreate)
            FORCE_RECREATE="true"
            shift
            ;;
        --check-health)
            load_environment
            check_health
            exit $?
            ;;
        --stop)
            shift
            if [[ $# -gt 0 ]]; then
                ENVIRONMENT="$1"
                shift
            fi
            load_environment
            stop_services
            exit 0
            ;;
        --logs)
            shift
            if [[ $# -gt 0 ]]; then
                ENVIRONMENT="$1"
                shift
            fi
            load_environment
            show_logs
            exit 0
            ;;
        --cleanup)
            cleanup_docker
            exit 0
            ;;
        development|production)
            ENVIRONMENT="$1"
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Execute main deployment
main_deploy
