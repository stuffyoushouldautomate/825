#!/bin/bash

# Docker Management Script for Bulldozer Search
# This script provides easy management of Docker containers and services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  Bulldozer Search Docker Manager${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to check if Docker Compose is available
check_docker_compose() {
    if ! command -v docker-compose > /dev/null 2>&1 && ! docker compose version > /dev/null 2>&1; then
        print_error "Docker Compose is not available. Please install Docker Compose."
        exit 1
    fi
}

# Function to get docker-compose command
get_docker_compose_cmd() {
    if command -v docker-compose > /dev/null 2>&1; then
        echo "docker-compose"
    else
        echo "docker compose"
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  start [profile]     Start all services (default: basic)"
    echo "  stop                Stop all services"
    echo "  restart [profile]   Restart all services"
    echo "  logs [service]      Show logs for all services or specific service"
    echo "  status              Show status of all services"
    echo "  clean               Remove all containers, networks, and volumes"
    echo "  build               Build all services"
    echo "  update              Pull latest images and rebuild"
    echo "  health              Check health of all services"
    echo "  backup              Create backup of data volumes"
    echo "  restore [file]      Restore from backup file"
    echo ""
    echo "Profiles:"
    echo "  basic               Start with app and Redis only"
    echo "  search              Include SearXNG search engine"
    echo "  auth                Include PostgreSQL and Supabase"
    echo "  proxy               Include Nginx reverse proxy"
    echo "  full                Start all services"
    echo ""
    echo "Examples:"
    echo "  $0 start basic"
    echo "  $0 start search"
    echo "  $0 logs app"
    echo "  $0 health"
}

# Function to start services
start_services() {
    local profile=${1:-basic}
    print_status "Starting services with profile: $profile"
    
    case $profile in
        basic)
            $(get_docker_compose_cmd) up -d app redis
            ;;
        search)
            $(get_docker_compose_cmd) --profile search up -d
            ;;
        auth)
            $(get_docker_compose_cmd) --profile auth up -d
            ;;
        proxy)
            $(get_docker_compose_cmd) --profile proxy up -d
            ;;
        full)
            $(get_docker_compose_cmd) --profile search --profile auth --profile proxy up -d
            ;;
        *)
            print_error "Unknown profile: $profile"
            echo "Available profiles: basic, search, auth, proxy, full"
            exit 1
            ;;
    esac
    
    print_status "Services started successfully!"
    print_status "Application URL: http://localhost:3000"
    print_status "Health check: http://localhost:3000/api/health"
}

# Function to stop services
stop_services() {
    print_status "Stopping all services..."
    $(get_docker_compose_cmd) down
    print_status "Services stopped successfully!"
}

# Function to restart services
restart_services() {
    local profile=${1:-basic}
    print_status "Restarting services with profile: $profile"
    stop_services
    start_services $profile
}

# Function to show logs
show_logs() {
    local service=$1
    if [ -n "$service" ]; then
        print_status "Showing logs for service: $service"
        $(get_docker_compose_cmd) logs -f $service
    else
        print_status "Showing logs for all services"
        $(get_docker_compose_cmd) logs -f
    fi
}

# Function to show status
show_status() {
    print_status "Service status:"
    $(get_docker_compose_cmd) ps
    echo ""
    print_status "Resource usage:"
    docker stats --no-stream
}

# Function to clean up
clean_up() {
    print_warning "This will remove all containers, networks, and volumes!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Cleaning up Docker resources..."
        $(get_docker_compose_cmd) down -v --remove-orphans
        docker system prune -f
        print_status "Cleanup completed!"
    else
        print_status "Cleanup cancelled."
    fi
}

# Function to build services
build_services() {
    print_status "Building all services..."
    $(get_docker_compose_cmd) build --no-cache
    print_status "Build completed!"
}

# Function to update services
update_services() {
    print_status "Pulling latest images..."
    $(get_docker_compose_cmd) pull
    print_status "Rebuilding services..."
    build_services
    print_status "Update completed!"
}

# Function to check health
check_health() {
    print_status "Checking service health..."
    
    # Check if containers are running
    local containers_running=$(docker ps --filter "name=bulldozer" --format "table {{.Names}}\t{{.Status}}" 2>/dev/null || true)
    if [ -n "$containers_running" ]; then
        echo "Container Status:"
        echo "$containers_running"
    else
        print_warning "No containers are running"
    fi
    
    # Check application health
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        print_status "Application is healthy"
    else
        print_error "Application health check failed"
    fi
    
    # Check Redis health
    if docker exec bulldozer-search-redis-1 redis-cli ping > /dev/null 2>&1; then
        print_status "Redis is healthy"
    else
        print_error "Redis health check failed"
    fi
}

# Function to create backup
create_backup() {
    local backup_dir="./backups"
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$backup_dir/backup_$timestamp.tar.gz"
    
    print_status "Creating backup..."
    mkdir -p $backup_dir
    
    # Create backup of volumes
    docker run --rm -v bulldozer-search_redis_data:/data -v $(pwd)/$backup_dir:/backup alpine tar czf /backup/backup_$timestamp.tar.gz -C /data .
    
    print_status "Backup created: $backup_file"
}

# Function to restore from backup
restore_backup() {
    local backup_file=$1
    if [ -z "$backup_file" ]; then
        print_error "Please specify a backup file"
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        print_error "Backup file not found: $backup_file"
        exit 1
    fi
    
    print_warning "This will overwrite existing data!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Restoring from backup: $backup_file"
        stop_services
        docker run --rm -v bulldozer-search_redis_data:/data -v $(pwd)/$(dirname $backup_file):/backup alpine tar xzf /backup/$(basename $backup_file) -C /data
        start_services
        print_status "Restore completed!"
    else
        print_status "Restore cancelled."
    fi
}

# Main script logic
main() {
    print_header
    
    # Check prerequisites
    check_docker
    check_docker_compose
    
    # Parse command
    case ${1:-help} in
        start)
            start_services $2
            ;;
        stop)
            stop_services
            ;;
        restart)
            restart_services $2
            ;;
        logs)
            show_logs $2
            ;;
        status)
            show_status
            ;;
        clean)
            clean_up
            ;;
        build)
            build_services
            ;;
        update)
            update_services
            ;;
        health)
            check_health
            ;;
        backup)
            create_backup
            ;;
        restore)
            restore_backup $2
            ;;
        help|--help|-h)
            show_usage
            ;;
        *)
            print_error "Unknown command: $1"
            show_usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@" 