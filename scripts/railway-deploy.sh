#!/bin/bash

# Railway Deployment Script
# This script helps set up Railway deployment

set -e

echo "🚂 Railway Deployment Setup"
echo "=========================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Check if user is logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway:"
    railway login
fi

# Initialize Railway project if not already done
if [ ! -f "railway.json" ]; then
    echo "📁 Initializing Railway project..."
    railway init
fi

echo "✅ Railway setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Add environment variables:"
echo "   railway variables set OPENAI_API_KEY=your_key"
echo "   railway variables set TAVILY_API_KEY=your_key"
echo ""
echo "2. Deploy to Railway:"
echo "   railway up"
echo ""
echo "3. View logs:"
echo "   railway logs"
echo ""
echo "4. Open your app:"
echo "   railway open" 