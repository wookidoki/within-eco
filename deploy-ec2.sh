#!/bin/bash
set -e

echo "=========================================="
echo "  Within App - EC2 Deployment Script"
echo "=========================================="

# 1. Docker 설치 확인
if ! command -v docker &> /dev/null; then
  echo "[1/4] Installing Docker..."
  sudo dnf update -y
  sudo dnf install -y docker
  sudo systemctl start docker
  sudo systemctl enable docker
  sudo usermod -aG docker $USER
  echo "Docker installed. You may need to log out and back in for group changes."
else
  echo "[1/4] Docker already installed."
fi

# 2. Docker Compose 설치 확인
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
  echo "[2/4] Installing Docker Compose..."
  COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep '"tag_name"' | sed -E 's/.*"([^"]+)".*/\1/')
  sudo curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
  echo "Docker Compose installed: $(docker-compose --version)"
else
  echo "[2/4] Docker Compose already installed."
fi

# 3. .env 파일 검증
echo "[3/4] Validating .env file..."

if [ ! -f .env ]; then
  echo "ERROR: .env file not found!"
  echo "Copy .env.example to .env and fill in the values:"
  echo "  cp .env.example .env"
  echo "  nano .env"
  exit 1
fi

REQUIRED_VARS=(
  "VITE_GOOGLE_MAPS_API_KEY"
  "GOOGLE_CLIENT_ID"
  "GOOGLE_CLIENT_SECRET"
  "JWT_SECRET"
  "POSTGRES_PASSWORD"
)

MISSING=0
for VAR in "${REQUIRED_VARS[@]}"; do
  VALUE=$(grep "^${VAR}=" .env | cut -d'=' -f2-)
  if [ -z "$VALUE" ] || [[ "$VALUE" == *"your-"* ]] || [[ "$VALUE" == *"change-this"* ]]; then
    echo "  WARNING: $VAR is not set or still has placeholder value"
    MISSING=1
  fi
done

if [ $MISSING -eq 1 ]; then
  echo ""
  echo "Some required variables are missing or have placeholder values."
  read -p "Continue anyway? (y/N): " CONFIRM
  if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "Aborted. Please update .env and try again."
    exit 1
  fi
fi

echo "  .env validation complete."

# 4. Build & Start
echo "[4/4] Building and starting containers..."
docker compose down --remove-orphans 2>/dev/null || true
docker compose up --build -d

echo ""
echo "=========================================="
echo "  Deployment Complete!"
echo "=========================================="
echo ""
echo "Checking health..."
sleep 10

# Health check
for i in {1..6}; do
  HEALTH=$(curl -s http://localhost/api/health 2>/dev/null || echo "waiting...")
  if echo "$HEALTH" | grep -q '"status":"ok"'; then
    echo "Health check passed!"
    echo "$HEALTH" | python3 -m json.tool 2>/dev/null || echo "$HEALTH"
    break
  fi
  echo "  Attempt $i/6 - waiting for services..."
  sleep 10
done

echo ""
echo "Container status:"
docker compose ps
echo ""
echo "View logs: docker compose logs -f"
echo "Stop:      docker compose down"
