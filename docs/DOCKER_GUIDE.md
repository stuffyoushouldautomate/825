# Docker Guide for Bulldozer Search

This guide covers Docker setup, management, and deployment for Bulldozer Search.

## 🐳 Quick Start

### Prerequisites

- Docker Desktop installed and running
- Docker Compose available
- Git repository cloned

### Basic Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd bulldozer-search

# Start basic services (app + Redis)
./scripts/docker-manage.sh start basic

# Visit the application
open http://localhost:3000
```

## 📋 Service Profiles

### Basic Profile (Default)

- **App**: Main Next.js application
- **Redis**: Chat history and caching

```bash
./scripts/docker-manage.sh start basic
```

### Search Profile

- **App**: Main Next.js application
- **Redis**: Chat history and caching
- **SearXNG**: Alternative search engine

```bash
./scripts/docker-manage.sh start search
```

### Auth Profile

- **App**: Main Next.js application
- **Redis**: Chat history and caching
- **PostgreSQL**: Database for Supabase
- **Supabase**: Local authentication service

```bash
./scripts/docker-manage.sh start auth
```

### Proxy Profile

- **App**: Main Next.js application
- **Redis**: Chat history and caching
- **Nginx**: Reverse proxy with load balancing

```bash
./scripts/docker-manage.sh start proxy
```

### Full Profile

- **App**: Main Next.js application
- **Redis**: Chat history and caching
- **SearXNG**: Alternative search engine
- **PostgreSQL**: Database for Supabase
- **Supabase**: Local authentication service
- **Nginx**: Reverse proxy with load balancing

```bash
./scripts/docker-manage.sh start full
```

## 🛠️ Docker Management

### Available Commands

```bash
# View all commands
./scripts/docker-manage.sh help

# Start services with profile
./scripts/docker-manage.sh start [profile]

# Stop all services
./scripts/docker-manage.sh stop

# Restart services
./scripts/docker-manage.sh restart [profile]

# View logs
./scripts/docker-manage.sh logs [service]

# Check status
./scripts/docker-manage.sh status

# Health check
./scripts/docker-manage.sh health

# Build services
./scripts/docker-manage.sh build

# Update services
./scripts/docker-manage.sh update

# Backup data
./scripts/docker-manage.sh backup

# Restore from backup
./scripts/docker-manage.sh restore [file]

# Clean up everything
./scripts/docker-manage.sh clean
```

### Examples

```bash
# Start with search engine
./scripts/docker-manage.sh start search

# View app logs
./scripts/docker-manage.sh logs app

# Check health of all services
./scripts/docker-manage.sh health

# Create backup
./scripts/docker-manage.sh backup

# Restore from backup
./scripts/docker-manage.sh restore backups/backup_20250101_120000.tar.gz
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with your configuration:

```bash
# Required
OPENAI_API_KEY=your_openai_api_key
TAVILY_API_KEY=your_tavily_api_key

# Optional
ENABLE_SAVE_CHAT_HISTORY=true
NEXT_PUBLIC_ENABLE_SHARE=true

# Redis (auto-configured by Docker)
REDIS_URL=redis://redis:6379

# SearXNG (when using search profile)
SEARXNG_API_URL=http://searxng:8080

# Supabase (when using auth profile)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Docker Compose Configuration

The `docker-compose.yaml` file defines all services:

```yaml
services:
  app: # Main application
  redis: # Redis for caching
  searxng: # Search engine (profile: search)
  postgres: # Database (profile: auth)
  supabase: # Auth service (profile: auth)
  nginx: # Reverse proxy (profile: proxy)
```

### Volumes

Data persistence is handled by Docker volumes:

- `redis_data`: Redis persistence
- `searxng_data`: SearXNG data
- `postgres_data`: PostgreSQL data
- `supabase_data`: Supabase data

## 🚀 Development

### Development Setup

```bash
# Run development setup script
./scripts/dev-setup.sh

# Start development environment
bun dev

# Or use Docker for development
./scripts/docker-manage.sh start basic
```

### Development Commands

```bash
# Start development server
bun dev

# Start with Docker services
bun run dev:docker

# Reset development database
bun run dev:reset

# Run tests
bun test

# Build for production
bun run build
```

### VS Code Integration

The project includes VS Code configuration:

- **Settings**: Auto-formatting, import organization
- **Extensions**: Recommended extensions for development
- **Git Hooks**: Pre-commit checks

## 🔍 Monitoring

### Health Checks

Each service includes health checks:

```bash
# Application health
curl http://localhost:3000/api/health

# Redis health
docker exec bulldozer-search-redis-1 redis-cli ping

# All services health
./scripts/docker-manage.sh health
```

### Logs

```bash
# All services logs
./scripts/docker-manage.sh logs

# Specific service logs
./scripts/docker-manage.sh logs app
./scripts/docker-manage.sh logs redis
```

### Resource Usage

```bash
# Container status
./scripts/docker-manage.sh status

# Resource usage
docker stats
```

## 🔒 Security

### Network Security

- Services communicate over internal Docker network
- External access only through exposed ports
- Nginx provides additional security layer

### Environment Variables

- Never commit sensitive data to Git
- Use `.env.local` for local development
- Use Railway Variables for production

### SSL/TLS

For production, configure SSL in `nginx.conf`:

```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    # ... rest of configuration
}
```

## 📊 Performance

### Optimization

- **Multi-stage builds**: Smaller production images
- **Layer caching**: Faster builds
- **Health checks**: Automatic restart on failure
- **Resource limits**: Prevent resource exhaustion

### Scaling

```bash
# Scale app service
docker compose up -d --scale app=3

# Scale with load balancer
docker compose --profile proxy up -d
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Port Conflicts

```bash
# Check what's using port 3000
lsof -i :3000

# Use different port
docker compose up -d -p 3001:3000
```

#### 2. Memory Issues

```bash
# Check Docker memory usage
docker stats

# Increase Docker memory limit in Docker Desktop
```

#### 3. Build Failures

```bash
# Clean build
./scripts/docker-manage.sh clean
./scripts/docker-manage.sh build

# Check build logs
docker compose build --no-cache
```

#### 4. Database Issues

```bash
# Reset database
./scripts/docker-manage.sh clean
./scripts/docker-manage.sh start auth

# Check database logs
./scripts/docker-manage.sh logs postgres
```

### Debugging

```bash
# Enter container shell
docker exec -it bulldozer-search-app-1 sh

# View container details
docker inspect bulldozer-search-app-1

# Check container logs
docker logs bulldozer-search-app-1
```

## 🔄 Backup and Restore

### Creating Backups

```bash
# Create backup
./scripts/docker-manage.sh backup

# Manual backup
docker run --rm -v bulldozer-search_redis_data:/data \
  -v $(pwd)/backups:/backup alpine \
  tar czf /backup/backup_$(date +%Y%m%d_%H%M%S).tar.gz -C /data .
```

### Restoring Backups

```bash
# Restore from backup
./scripts/docker-manage.sh restore backups/backup_20250101_120000.tar.gz

# Manual restore
docker run --rm -v bulldozer-search_redis_data:/data \
  -v $(pwd)/backups:/backup alpine \
  tar xzf /backup/backup_file.tar.gz -C /data
```

## 🌐 Production Deployment

### Railway Deployment

```bash
# Deploy to Railway
./scripts/railway-deploy.sh

# Or use Railway CLI
railway up
```

### Docker Registry

```bash
# Build and push to registry
docker build -t your-registry/bulldozer-search:latest .
docker push your-registry/bulldozer-search:latest
```

### Kubernetes

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/

# Deploy with Helm
helm install bulldozer-search ./helm/
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Railway Documentation](https://docs.railway.app/)
- [Next.js Docker Guide](https://nextjs.org/docs/deployment#docker-image)

---

**Last Updated:** January 2025
