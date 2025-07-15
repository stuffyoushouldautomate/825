#!/bin/bash

echo "🚀 Starting SigNoz locally..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start SigNoz
docker-compose -f docker-compose.signoz.yml up -d

echo "⏳ Waiting for SigNoz to be ready..."
sleep 10

# Check if SigNoz is running
if curl -s http://localhost:3301 > /dev/null; then
    echo "✅ SigNoz is running!"
    echo "📊 SigNoz UI: http://localhost:3301"
    echo "🔍 Jaeger UI: http://localhost:16686"
    echo ""
    echo "To enable telemetry in your app, set:"
    echo "  ENABLE_TELEMETRY=true"
    echo "  SIGNOZ_ENDPOINT=http://localhost:4318/v1/traces"
    echo ""
    echo "To stop SigNoz:"
    echo "  docker-compose -f docker-compose.signoz.yml down"
else
    echo "❌ SigNoz failed to start. Check the logs:"
    echo "  docker-compose -f docker-compose.signoz.yml logs"
fi 