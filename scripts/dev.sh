#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required. Install Docker Desktop and try again."
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Docker is not running. Start Docker and try again."
  exit 1
fi

docker compose version >/dev/null

echo "Building the development image..."
docker build -f Dockerfile.dev -t dapl-dev-app .

echo "Preparing development configuration..."
docker run --rm \
  --user "$(id -u):$(id -g)" \
  -e DEV_APP_URL \
  -e CODESPACE_NAME \
  -e GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN \
  --mount "type=bind,source=$PROJECT_DIR,target=/output" \
  dapl-dev-app \
  node scripts/setup-dev.mjs

echo "Starting the application and database..."
docker compose -f compose.dev.yaml up -d --no-build

echo ""
echo "Containers started. Check application readiness with:"
echo "docker compose -f compose.dev.yaml logs -f app"
echo ""
echo "Local URL: http://localhost:3000"
echo "For a hosted workspace, open forwarded port 3000."