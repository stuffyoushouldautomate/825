#!/bin/bash

# Railway Deployment Script
# This script helps deploy the application to Railway

set -e

echo "🚂 Railway Deployment Script"
echo "============================"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI is not installed."
    echo "Please install it with: npm install -g @railway/cli"
    exit 1
fi

# Check if user is logged in to Railway
if ! railway whoami &> /dev/null; then
    echo "❌ Not logged in to Railway."
    echo "Please run: railway login"
    exit 1
fi

# Check if we're in a Railway project
if ! railway status &> /dev/null; then
    echo "❌ Not in a Railway project."
    echo "Please run: railway init"
    exit 1
fi

echo "✅ Railway environment is ready"

# Check if required environment variables are set
echo "🔍 Checking environment variables..."

required_vars=("OPENAI_API_KEY" "TAVILY_API_KEY")
missing_vars=()

for var in "${required_vars[@]}"; do
    if ! railway variables get "$var" &> /dev/null; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
    echo "⚠️  Missing required environment variables:"
    for var in "${missing_vars[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "Please set them with:"
    for var in "${missing_vars[@]}"; do
        echo "   railway variables set $var=your_value_here"
    done
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ All required environment variables are set"
fi

# Check if Redis service is available
echo "🔍 Checking Redis service..."
if railway variables get REDIS_URL &> /dev/null; then
    echo "✅ Redis service is configured"
else
    echo "⚠️  Redis service not found"
    echo "Consider adding a Redis service to your Railway project"
fi

# Run build check
echo "🔍 Running build check..."
if [ -f "scripts/build-check.sh" ]; then
    ./scripts/build-check.sh
else
    echo "⚠️  Build check script not found"
fi

# Deploy to Railway
echo "🚀 Deploying to Railway..."
echo "This may take several minutes..."

if railway up; then
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo ""
    echo "📊 Your application is now live at:"
    railway status --json | jq -r '.service.url' 2>/dev/null || echo "Check Railway dashboard for URL"
    echo ""
    echo "🔍 Health check:"
    echo "Visit: https://your-app.railway.app/api/health"
    echo ""
    echo "📖 View logs with: railway logs"
    echo "🔄 Restart with: railway service restart"
else
    echo ""
    echo "❌ Deployment failed!"
    echo ""
    echo "🔍 Troubleshooting:"
    echo "1. Check logs: railway logs"
    echo "2. Verify environment variables: railway variables"
    echo "3. Restart service: railway service restart"
    echo "4. Check build logs in Railway dashboard"
    exit 1
fi 