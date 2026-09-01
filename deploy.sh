#!/bin/bash
set -e

echo "🚀 =========================================="
echo "   Starting Mess-Website Deployment Process  "
echo "=========================================="

# 1. Verify .env exists
if [ ! -f .env ]; then
  echo "❌ Error: .env file not found! Please create your .env file before deploying."
  exit 1
fi

# 2. Pull latest code (if using git)
if [ -d .git ]; then
  echo "📥 Pulling latest git changes..."
  git pull origin main || git pull origin master || echo "⚠️ Git pull skipped or not on default branch"
fi

# 3. Run Prisma database migrations / sync
echo "🗄️  Running Prisma database schema sync..."
if command -v npx &> /dev/null; then
  npx prisma db push --skip-generate || echo "⚠️ Local prisma sync skipped, will run inside container if configured."
fi

# 4. Build and restart Docker containers
echo "🐳 Building and starting Docker container on port 7691..."
docker compose down --remove-orphans || true
docker compose up -d --build

# 5. Clean up unused images and build cache
echo "🧹 Cleaning up old dangling Docker images..."
docker image prune -f

# 6. Check Container Status
echo "⏳ Waiting for container to become healthy..."
sleep 5
docker compose ps

echo "✅ =========================================="
echo "   Deployment completed successfully!        "
echo "   App is live at: http://localhost:7691     "
echo "=========================================="
