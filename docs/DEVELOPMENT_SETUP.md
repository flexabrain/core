# 🚀 FlexaBrain Empire Development Setup

## Quick Start

1. **Clone and Setup**
```bash
git clone <your-repo-url>
cd flexabrain-empire
cp .env.example .env
```

2. **Install Dependencies**
```bash
npm install
cd oracle-sales-api && npm install
cd ../sentinel-monitoring-api && npm install  
cd ../sage-analytics-api && npm install
cd ../n8n-nodes && npm install
```

3. **Start Development Environment**
```bash
# Start all services with Docker
docker-compose up -d

# Or run individual APIs in development mode
npm run dev
```

## 🏗️ Architecture Overview

FlexaBrain Empire consists of three specialized AI agents:

### 🔮 Oracle Sales API (Port 3001)
**Purpose**: Advanced sales intelligence and revenue optimization
- Revenue forecasting with 87% accuracy
- Real-time deal risk assessment  
- Competitive analysis automation
- Automated sales workflow orchestration

### 🛡️ Sentinel Monitoring API (Port 3002)  
**Purpose**: Intelligent IT operations and system monitoring
- Predictive failure detection
- Automated incident response
- Performance optimization recommendations
- Security threat monitoring

### 📊 Sage Analytics API (Port 3003)
**Purpose**: Business intelligence and advanced analytics
- Customer churn prediction and prevention
- Lifetime value optimization
- Experience analytics and insights
- Strategic decision support

## 🔧 Development Environment

### Prerequisites
- **Node.js** 18+ 
- **Docker** and **Docker Compose**
- **PostgreSQL** 15+
- **Redis** 7+
- **Ollama** (for AI model hosting)

### Environment Variables
Copy [`.env.example`](.env.example) to `.env` and configure:

```bash
# Database
DB_PASSWORD=your_secure_password
DATABASE_URL=postgresql://flexabrain:your_password@localhost:5432/flexabrain

# AI Model Integration  
OLLAMA_URL=http://localhost:11434

# n8n Configuration
N8N_USER=admin
N8N_PASSWORD=your_secure_password

# API Security
JWT_SECRET=your_jwt_secret
API_KEY=your_api_key
```

### Service URLs
- **Oracle Sales API**: http://localhost:3001
- **Sentinel Monitoring API**: http://localhost:3002
- **Sage Analytics API**: http://localhost:3003
- **n8n Workflow Platform**: http://localhost:5678
- **PostgreSQL Database**: localhost:5432
- **Redis Cache**: localhost:6379

## 📁 Project Structure

```
flexabrain-empire/
├── 🔮 oracle-sales-api/          # Sales intelligence agent
│   ├── src/
│   │   ├── controllers/          # API endpoints
│   │   ├── services/            # Business logic
│   │   ├── models/              # Data models
│   │   ├── middleware/          # Express middleware
│   │   └── utils/               # Helper functions
│   ├── tests/                   # Unit & integration tests
│   └── docs/                    # API documentation
│
├── 🛡️ sentinel-monitoring-api/   # IT monitoring agent  
├── 📊 sage-analytics-api/        # Analytics agent
├── 🔗 n8n-nodes/                # Custom n8n integrations
├── 📦 n8n-templates/            # Pre-built workflows
├── 🔄 shared/                   # Shared utilities
├── 🗄️ database/                 # DB migrations & seeds
├── 📋 templates/                # Business solution templates
├── 📚 docs/                     # Documentation
├── 📢 marketing/                # Content & campaigns
├── 👥 community/                # Community engagement
├── 🏢 enterprise/               # Enterprise features
├── 🚀 deployment/               # DevOps & deployment
└── 📊 monitoring/               # System monitoring
```

## 🛠️ Development Commands

### Root Project
```bash
npm run dev          # Start all APIs in development mode
npm run build        # Build all APIs
npm run test         # Run all tests
npm run docker:up    # Start Docker services
npm run docker:down  # Stop Docker services
```

### Individual APIs
```bash
# Oracle Sales API
cd oracle-sales-api
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests

# Similar commands available for sentinel-monitoring-api and sage-analytics-api
```

## 🔍 Testing Strategy

### Unit Tests
```bash
npm test                    # Run all unit tests
npm run test:coverage      # Generate coverage report
```

### Integration Tests
```bash
npm run test:integration   # API integration tests
```

### End-to-End Tests  
```bash
npm run test:e2e          # Full workflow testing
```

## 📖 Development Workflow

### 1. Feature Development
1. Create feature branch: `git checkout -b feature/sales-intelligence-enhancement`
2. Develop in relevant API directory
3. Write tests for new functionality
4. Update documentation
5. Submit PR for review

### 2. API Development Pattern
```typescript
// 1. Define model (src/models/)
export interface SalesOpportunity {
  id: string;
  accountId: string;
  value: number;
  probability: number;
  stage: string;
}

// 2. Create service (src/services/)
export class SalesIntelligenceService {
  async analyzeDeal(dealId: string): Promise<DealAnalysis> {
    // Business logic implementation
  }
}

// 3. Build controller (src/controllers/)
export class SalesController {
  async analyzeDeal(req: Request, res: Response) {
    // Handle HTTP request/response
  }
}

// 4. Write tests (tests/)
describe('SalesIntelligenceService', () => {
  test('should analyze deal accurately', async () => {
    // Test implementation
  });
});
```

### 3. n8n Integration Development
1. Create custom node in [`n8n-nodes/src/nodes/`](n8n-nodes/src/nodes/)
2. Build workflow template in [`n8n-templates/`](n8n-templates/)
3. Document usage in [`docs/templates/`](docs/templates/)

## 🚀 Deployment Guide

### Development Deployment
```bash
docker-compose up -d
```

### Production Deployment
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

## 📊 Monitoring & Observability

### Health Checks
- **Oracle Sales API**: `GET /health`
- **Sentinel Monitoring API**: `GET /health`  
- **Sage Analytics API**: `GET /health`

### Metrics & Logging
- **Winston** logging to console and files
- **Prometheus** metrics collection
- **Grafana** dashboards for monitoring

## 🔐 Security Considerations

### API Security
- JWT authentication for all endpoints
- Rate limiting on public endpoints
- Input validation with Joi schemas
- CORS configuration for web clients

### Data Security
- Encrypted database connections
- Redis connection security
- Environment variable management
- Secrets management for production

## 🤝 Contributing

### Code Style
- **ESLint** for TypeScript linting
- **Prettier** for code formatting
- **Conventional commits** for git messages

### Pull Request Process
1. Fork the repository
2. Create feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Update documentation
6. Submit pull request

---

**Ready to build the FlexaBrain Empire? Start with the Oracle Sales API and dominate the market! 🔥👑⚡**