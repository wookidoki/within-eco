#!/bin/bash

# =================================
# Within App - Deployment Script
# =================================

set -e

echo "=========================================="
echo "  Within App - Docker Deployment"
echo "=========================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "Error: .env file not found!"
    echo "Please copy .env.example to .env and configure it."
    echo "  cp .env.example .env"
    exit 1
fi

# Load environment variables
export $(grep -v '^#' .env | xargs)

# Check required variables
if [ -z "$VITE_GOOGLE_MAPS_API_KEY" ]; then
    echo "Error: VITE_GOOGLE_MAPS_API_KEY is required"
    exit 1
fi

if [ -z "$GOOGLE_CLIENT_ID" ]; then
    echo "Warning: GOOGLE_CLIENT_ID not set. Google login will not work."
fi

echo ""
echo "Building and starting containers..."
echo ""

# Build and run
docker-compose down --remove-orphans 2>/dev/null || true
docker-compose build --no-cache
docker-compose up -d

echo ""
echo "=========================================="
echo "  Deployment Complete!"
echo "=========================================="
echo ""
echo "Services:"
echo "  Frontend: http://localhost"
echo "  Backend:  http://localhost/api/health"
echo ""
echo "Commands:"
echo "  View logs:    docker-compose logs -f"
echo "  Stop:         docker-compose down"
echo "  Restart:      docker-compose restart"
echo ""

# Wait for health check
echo "Waiting for services to be healthy..."
sleep 5

# Check health
HEALTH=$(curl -s http://localhost/api/health 2>/dev/null || echo '{"status":"error"}')
if echo "$HEALTH" | grep -q '"status":"ok"'; then
    echo "✅ Services are healthy!"
else
    echo "⚠️  Services may still be starting. Check logs with: docker-compose logs -f"
fi
