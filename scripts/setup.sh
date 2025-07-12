#!/bin/bash

# FlexaBrain Core Setup Script
set -e

echo "� FlexaBrain Core Setup"
echo "======================="

# Check prerequisites
echo "� Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 20+"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Create directories
echo "� Creating directories..."
mkdir -p data logs uploads src/components/ui src/lib

# Setup environment
echo "⚙️ Setting up environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env from .env.example"
    echo "⚠️  Please review and update .env with your settings"
else
    echo "✅ Using existing .env file"
fi

# Install dependencies
echo "� Installing dependencies..."
npm install

echo ""
echo "� Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Review and update .env file"
echo "2. Start development: npm run docker:dev"
echo "3. Access FlexaBrain: http://localhost:3000"
echo ""
