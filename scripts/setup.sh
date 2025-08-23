#!/bin/bash

echo "🚀 Setting up Mentorship Platform Development Environment"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker is not installed. You'll need to install PostgreSQL and Redis manually."
    echo "   PostgreSQL: https://www.postgresql.org/download/"
    echo "   Redis: https://redis.io/download"
else
    echo "✅ Docker is installed"
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "⚠️  Docker Compose is not installed. You'll need to start services manually."
else
    echo "✅ Docker Compose is installed"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔧 Setting up environment variables..."
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo "✅ Created .env.local from .env.example"
    echo "⚠️  Please update .env.local with your configuration"
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "🐳 Starting Docker services..."
if command -v docker-compose &> /dev/null; then
    docker-compose up -d
    echo "✅ Docker services started"
    echo "   PostgreSQL: localhost:5432"
    echo "   Redis: localhost:6379"
    echo "   Mailhog: http://localhost:8025"
else
    echo "⚠️  Please start PostgreSQL and Redis manually"
fi

echo ""
echo "🗄️  Setting up database..."
echo "   This will take a moment..."

# Wait for PostgreSQL to be ready
if command -v docker-compose &> /dev/null; then
    echo "   Waiting for PostgreSQL to be ready..."
    sleep 10
fi

# Generate Prisma client
echo "   Generating Prisma client..."
npm run db:generate

# Run migrations
echo "   Running database migrations..."
npm run db:migrate

# Seed database
echo "   Seeding database..."
npm run db:seed

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your configuration"
echo "2. Start the development servers:"
echo "   npm run dev:web    # Frontend (http://localhost:3000)"
echo "   npm run dev:api    # Backend (http://localhost:3001)"
echo ""
echo "Or start both at once:"
echo "   npm run dev"
echo ""
echo "📚 Documentation: README.md"
echo "🐛 Issues: Check the logs with 'npm run docker:logs'"