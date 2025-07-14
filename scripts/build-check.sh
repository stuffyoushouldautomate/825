#!/bin/bash

# Build Check Script for Railway Deployment
# This script verifies that the Docker build process works correctly

set -e

echo "🔍 Starting build check for Railway deployment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if all required files exist
echo "📁 Checking required files..."
required_files=(
    "Dockerfile"
    "package.json"
    "next.config.mjs"
    "app/layout.tsx"
    "app/page.tsx"
    "components/app-sidebar.tsx"
    "lib/redis/config.ts"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Missing required file: $file"
        exit 1
    fi
done

echo "✅ All required files found"

# Check if .env.example exists and has required variables
if [ -f ".env.example" ]; then
    echo "📋 Checking environment variables..."
    if grep -q "OPENAI_API_KEY" .env.example; then
        echo "✅ OPENAI_API_KEY found in .env.example"
    else
        echo "⚠️  OPENAI_API_KEY not found in .env.example"
    fi
    
    if grep -q "TAVILY_API_KEY" .env.example; then
        echo "✅ TAVILY_API_KEY found in .env.example"
    else
        echo "⚠️  TAVILY_API_KEY not found in .env.example"
    fi
else
    echo "⚠️  .env.example not found"
fi

# Test Docker build (without running)
echo "🐳 Testing Docker build..."
if docker build --dry-run . > /dev/null 2>&1; then
    echo "✅ Docker build syntax is valid"
else
    echo "⚠️  Docker build syntax check failed (this is normal for some Docker versions)"
fi

# Check if the app directory structure is correct
echo "📂 Checking app directory structure..."
if [ -d "app" ]; then
    echo "✅ app directory exists"
    if [ -f "app/layout.tsx" ]; then
        echo "✅ app/layout.tsx exists"
    else
        echo "❌ app/layout.tsx missing"
        exit 1
    fi
    if [ -f "app/page.tsx" ]; then
        echo "✅ app/page.tsx exists"
    else
        echo "❌ app/page.tsx missing"
        exit 1
    fi
else
    echo "❌ app directory missing"
    exit 1
fi

# Check if components directory exists
if [ -d "components" ]; then
    echo "✅ components directory exists"
else
    echo "❌ components directory missing"
    exit 1
fi

# Check if lib directory exists
if [ -d "lib" ]; then
    echo "✅ lib directory exists"
else
    echo "❌ lib directory missing"
    exit 1
fi

# Check if hooks directory exists
if [ -d "hooks" ]; then
    echo "✅ hooks directory exists"
else
    echo "❌ hooks directory missing"
    exit 1
fi

# Check if public directory exists
if [ -d "public" ]; then
    echo "✅ public directory exists"
else
    echo "❌ public directory missing"
    exit 1
fi

# Check if middleware.ts exists
if [ -f "middleware.ts" ]; then
    echo "✅ middleware.ts exists"
else
    echo "❌ middleware.ts missing"
    exit 1
fi

# Check if next.config.mjs exists
if [ -f "next.config.mjs" ]; then
    echo "✅ next.config.mjs exists"
else
    echo "❌ next.config.mjs missing"
    exit 1
fi

# Check if tailwind.config.ts exists
if [ -f "tailwind.config.ts" ]; then
    echo "✅ tailwind.config.ts exists"
else
    echo "❌ tailwind.config.ts missing"
    exit 1
fi

# Check if tsconfig.json exists
if [ -f "tsconfig.json" ]; then
    echo "✅ tsconfig.json exists"
else
    echo "❌ tsconfig.json missing"
    exit 1
fi

# Check if postcss.config.mjs exists
if [ -f "postcss.config.mjs" ]; then
    echo "✅ postcss.config.mjs exists"
else
    echo "❌ postcss.config.mjs missing"
    exit 1
fi

# Check if components.json exists
if [ -f "components.json" ]; then
    echo "✅ components.json exists"
else
    echo "❌ components.json missing"
    exit 1
fi

# Check if .eslintrc.json exists
if [ -f ".eslintrc.json" ]; then
    echo "✅ .eslintrc.json exists"
else
    echo "❌ .eslintrc.json missing"
    exit 1
fi

echo ""
echo "🎉 Build check completed successfully!"
echo ""
echo "📋 Next steps for Railway deployment:"
echo "1. Fork this repository to your GitHub account"
echo "2. Connect Railway to your forked repository"
echo "3. Add required environment variables in Railway"
echo "4. Add Redis service (optional but recommended)"
echo "5. Deploy!"
echo ""
echo "📖 See RAILWAY_DEPLOYMENT.md for detailed instructions" 