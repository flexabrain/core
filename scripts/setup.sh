#!/bin/bash

# FlexaBrain Core Setup Script
set -e

echo "Ì∑† FlexaBrain Core Setup"
echo "======================="

# Check prerequisites
echo "Ì≥ã Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "‚ùå Node.js not found. Please install Node.js 20+"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "‚ùå Docker not found. Please install Docker"
    exit 1
fi

echo "‚úÖ Prerequisites check passed"

# Create directories
echo "Ì≥Å Creating directories..."
mkdir -p data logs uploads src/components/ui src/lib

# Setup environment
echo "‚öôÔ∏è Setting up environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "‚úÖ Created .env from .env.example"
    echo "‚ö†Ô∏è  Please review and update .env with your settings"
else
    echo "‚úÖ Using existing .env file"
fi

# Install dependencies
echo "Ì≥¶ Installing dependencies..."
npm install

echo ""
echo "Ìæâ Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Review and update .env file"
echo "2. Start development: npm run docker:dev"
echo "3. Access FlexaBrain: http://localhost:3000"
echo ""
