#!/bin/bash

# FlexaBrain Empire Setup Script
# Creates the complete directory structure and initializes the development environment

echo "🚀 Initializing FlexaBrain Empire..."

# Create main directory structure
echo "📁 Creating directory structure..."

# Core APIs
mkdir -p oracle-sales-api/{src/{controllers,services,models,middleware,utils},tests,docs}
mkdir -p sentinel-monitoring-api/{src/{controllers,services,models,middleware,utils},tests,docs}  
mkdir -p sage-analytics-api/{src/{controllers,services,models,middleware,utils},tests,docs}

# n8n Integration
mkdir -p n8n-nodes/{src/{nodes,credentials},dist,docs}
mkdir -p n8n-templates/{sales-intelligence,it-monitoring,business-analytics}

# Shared Resources
mkdir -p shared/{database,types,utils,config}
mkdir -p database/{migrations,seeds,init}

# Templates and Documentation
mkdir -p templates/{starter,professional,enterprise}
mkdir -p docs/{api,templates,deployment,tutorials}

# Marketing and Community
mkdir -p marketing/{content,videos,demos,assets}
mkdir -p community/{discord,reddit,linkedin}

# Enterprise Features
mkdir -p enterprise/{white-label,consulting,support}

# DevOps and Deployment
mkdir -p deployment/{docker,kubernetes,terraform}
mkdir -p monitoring/{grafana,prometheus}

# Testing and Quality
mkdir -p tests/{integration,e2e,performance}

echo "✅ Directory structure created!"

# Initialize git repository if not exists
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
    echo "✅ Git repository initialized!"
fi

# Create .gitignore
echo "📄 Creating .gitignore..."
cat > .gitignore << EOF
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
dist/
build/
coverage/

# Database
*.db
*.sqlite

# Logs
logs/
*.log

# Runtime
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Docker
docker-compose.override.yml

# Temporary files
tmp/
temp/
EOF

echo "✅ .gitignore created!"

# Copy environment file
if [ ! -f ".env" ]; then
    echo "🔧 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created!"
fi

echo ""
echo "🎉 FlexaBrain Empire structure initialized!"
echo ""
echo "Next steps:"
echo "1. Update .env with your configuration"
echo "2. Run 'npm install' to install dependencies"
echo "3. Run 'docker-compose up -d' to start services"
echo "4. Start building your empire! 👑"
echo ""