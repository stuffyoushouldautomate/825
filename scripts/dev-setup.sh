#!/bin/bash

# Development Environment Setup Script
# This script sets up the development environment for Bulldozer Search

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
    echo -e "${BLUE}  Bulldozer Search Dev Setup${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Check if required tools are installed
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node > /dev/null 2>&1; then
        print_error "Node.js is not installed. Please install Node.js 18+"
        exit 1
    fi
    
    # Check Bun
    if ! command -v bun > /dev/null 2>&1; then
        print_warning "Bun is not installed. Installing Bun..."
        curl -fsSL https://bun.sh/install | bash
        source ~/.bashrc
    fi
    
    # Check Docker
    if ! command -v docker > /dev/null 2>&1; then
        print_warning "Docker is not installed. Please install Docker for containerized development."
    fi
    
    # Check Git
    if ! command -v git > /dev/null 2>&1; then
        print_error "Git is not installed. Please install Git"
        exit 1
    fi
    
    print_status "Prerequisites check completed!"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    if [ -f "package.json" ]; then
        bun install
        print_status "Dependencies installed successfully!"
    else
        print_error "package.json not found!"
        exit 1
    fi
}

# Setup environment variables
setup_environment() {
    print_status "Setting up environment variables..."
    
    if [ ! -f ".env.local" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env.local
            print_status "Created .env.local from .env.example"
            print_warning "Please edit .env.local with your API keys:"
            echo "  - OPENAI_API_KEY"
            echo "  - TAVILY_API_KEY"
            echo "  - Other optional keys as needed"
        else
            print_warning ".env.example not found. Please create .env.local manually"
        fi
    else
        print_status ".env.local already exists"
    fi
}

# Setup Git hooks
setup_git_hooks() {
    print_status "Setting up Git hooks..."
    
    if [ -d ".git" ]; then
        # Create pre-commit hook
        cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Pre-commit hook for Bulldozer Search

echo "Running pre-commit checks..."

# Run linting
bun run lint

# Run type checking
bun run build --dry-run

echo "Pre-commit checks completed!"
EOF
        
        chmod +x .git/hooks/pre-commit
        print_status "Git hooks configured!"
    else
        print_warning "Not a Git repository. Skipping Git hooks setup."
    fi
}

# Setup development database
setup_dev_database() {
    print_status "Setting up development database..."
    
    # Check if Docker is available
    if command -v docker > /dev/null 2>&1; then
        print_status "Starting development database with Docker..."
        
        # Start Redis for development
        docker run -d --name bulldozer-redis-dev \
            -p 6379:6379 \
            redis:7-alpine \
            redis-server --appendonly yes
        
        print_status "Development Redis started on localhost:6379"
        
        # Start PostgreSQL for development (optional)
        read -p "Start PostgreSQL for Supabase development? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker run -d --name bulldozer-postgres-dev \
                -p 5432:5432 \
                -e POSTGRES_DB=bulldozer \
                -e POSTGRES_USER=postgres \
                -e POSTGRES_PASSWORD=password \
                postgres:15-alpine
            
            print_status "Development PostgreSQL started on localhost:5432"
        fi
    else
        print_warning "Docker not available. Please install Docker for containerized development."
    fi
}

# Setup VS Code settings
setup_vscode() {
    print_status "Setting up VS Code settings..."
    
    if [ ! -d ".vscode" ]; then
        mkdir -p .vscode
    fi
    
    # Create VS Code settings
    cat > .vscode/settings.json << 'EOF'
{
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.codeActionsOnSave": {
        "source.organizeImports": "always"
    },
    "typescript.preferences.importModuleSpecifier": "relative",
    "typescript.suggest.autoImports": true,
    "emmet.includeLanguages": {
        "typescript": "html",
        "typescriptreact": "html"
    },
    "tailwindCSS.includeLanguages": {
        "typescript": "html",
        "typescriptreact": "html"
    },
    "files.associations": {
        "*.css": "tailwindcss"
    }
}
EOF
    
    # Create VS Code extensions recommendations
    cat > .vscode/extensions.json << 'EOF'
{
    "recommendations": [
        "bradlc.vscode-tailwindcss",
        "esbenp.prettier-vscode",
        "ms-vscode.vscode-typescript-next",
        "formulahendry.auto-rename-tag",
        "christian-kohler.path-intellisense",
        "ms-vscode.vscode-json"
    ]
}
EOF
    
    print_status "VS Code settings configured!"
}

# Create development scripts
create_dev_scripts() {
    print_status "Creating development scripts..."
    
    # Add development scripts to package.json
    if [ -f "package.json" ]; then
        # Check if dev scripts already exist
        if ! grep -q '"dev:docker"' package.json; then
            # Add development scripts
            sed -i '' '/"scripts": {/a\
    "dev:docker": "docker-compose up -d && bun dev",\
    "dev:redis": "docker run -d --name bulldozer-redis-dev -p 6379:6379 redis:7-alpine",\
    "dev:clean": "docker stop bulldozer-redis-dev bulldozer-postgres-dev 2>/dev/null || true && docker rm bulldozer-redis-dev bulldozer-postgres-dev 2>/dev/null || true",\
    "dev:reset": "bun run dev:clean && bun run dev:redis",\
    "db:migrate": "supabase db push",\
    "db:reset": "supabase db reset",\
    "db:studio": "supabase studio",' package.json
        fi
    fi
    
    print_status "Development scripts added to package.json!"
}

# Setup Supabase CLI
setup_supabase() {
    print_status "Setting up Supabase CLI..."
    
    if ! command -v supabase > /dev/null 2>&1; then
        print_status "Installing Supabase CLI..."
        
        # Install Supabase CLI
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            brew install supabase/tap/supabase
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Linux
            curl -fsSL https://supabase.com/install.sh | sh
        else
            print_warning "Please install Supabase CLI manually: https://supabase.com/docs/guides/cli"
        fi
    else
        print_status "Supabase CLI already installed"
    fi
    
    # Initialize Supabase if not already done
    if [ ! -f "supabase/config.toml" ]; then
        print_status "Initializing Supabase project..."
        supabase init
    fi
}

# Main setup function
main() {
    print_header
    
    check_prerequisites
    install_dependencies
    setup_environment
    setup_git_hooks
    setup_dev_database
    setup_vscode
    create_dev_scripts
    setup_supabase
    
    print_status "Development environment setup completed!"
    echo ""
    print_status "Next steps:"
    echo "1. Edit .env.local with your API keys"
    echo "2. Run 'bun dev' to start development server"
    echo "3. Run './scripts/docker-manage.sh start basic' for containerized development"
    echo "4. Visit http://localhost:3000"
    echo ""
    print_status "Useful commands:"
    echo "  bun dev                    - Start development server"
    echo "  bun run dev:docker         - Start with Docker services"
    echo "  bun run dev:reset          - Reset development database"
    echo "  ./scripts/docker-manage.sh - Manage Docker services"
    echo "  supabase studio            - Open Supabase Studio"
}

# Run main function
main "$@" 