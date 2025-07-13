#!/bin/bash

# Build Check Script
# This script helps debug build issues before deploying to Railway

set -e

echo "🔍 Build Check Script"
echo "===================="

echo "📁 Checking project structure..."
if [ ! -d "app" ]; then
    echo "❌ Error: app directory not found!"
    exit 1
fi

if [ ! -d "components" ]; then
    echo "❌ Error: components directory not found!"
    exit 1
fi

if [ ! -d "lib" ]; then
    echo "❌ Error: lib directory not found!"
    exit 1
fi

echo "✅ Project structure looks good"

echo "📦 Checking dependencies..."
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found!"
    exit 1
fi

if [ ! -f "bun.lock" ]; then
    echo "❌ Error: bun.lock not found!"
    exit 1
fi

echo "✅ Dependencies look good"

echo "🔧 Checking configuration files..."
if [ ! -f "next.config.mjs" ]; then
    echo "❌ Error: next.config.mjs not found!"
    exit 1
fi

if [ ! -f "tailwind.config.ts" ]; then
    echo "❌ Error: tailwind.config.ts not found!"
    exit 1
fi

if [ ! -f "tsconfig.json" ]; then
    echo "❌ Error: tsconfig.json not found!"
    exit 1
fi

echo "✅ Configuration files look good"

echo "🐳 Checking Dockerfile..."
if [ ! -f "Dockerfile" ]; then
    echo "❌ Error: Dockerfile not found!"
    exit 1
fi

echo "✅ Dockerfile found"

echo "🚀 Testing build locally..."
echo "This will take a few minutes..."

# Clean previous build
rm -rf .next

# Install dependencies
bun install

# Run build
bun run build

echo "✅ Build completed successfully!"
echo ""
echo "🎉 Your project is ready for Railway deployment!"
echo ""
echo "Next steps:"
echo "1. Commit your changes"
echo "2. Push to GitHub"
echo "3. Deploy to Railway" 