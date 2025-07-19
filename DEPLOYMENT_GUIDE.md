# 🚀 FlexaBrain Empire - Production Deployment Guide

## Phase 1 Deployment Checklist

### Prerequisites
- **Node.js** 20+ installed
- **Docker** and **Docker Compose** installed
- **PostgreSQL** 15+ available
- **Redis** 7+ available
- **Ollama** with required models installed
- **Stripe** account configured (for payments)

### Environment Variables

Create `.env` files based on `.env.example`:

```bash
# Database Configuration
DATABASE_URL=postgresql://flexabrain:your_secure_password@localhost:5432/flexabrain
REDIS_URL=redis://localhost:6379

# Ollama Configuration
OLLAMA_URL=http://localhost:11434

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_256_bits
JWT_EXPIRES_IN=24h

# Stripe Configuration (Production Keys)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PRO_MONTHLY_PRICE_ID=price_your_pro_monthly_id
STRIPE_PRO_YEARLY_PRICE_ID=price_your_pro_yearly_id
STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=price_your_enterprise_monthly_id
STRIPE_ENTERPRISE_YEARLY_PRICE_ID=price_your_enterprise_yearly_id
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# API Configuration
ORACLE_API_PORT=3001
FRONTEND_URL=https://app.flexabrain.com

# Security
NODE_ENV=production
```

### 1. Database Setup

```sql
-- Create database
CREATE DATABASE flexabrain;
CREATE USER flexabrain WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE flexabrain TO flexabrain;
```

### 2. Ollama Models Installation

```bash
# Install required models
ollama pull llama2:7b-chat      # Sentinel Agent
ollama pull mistral:7b-instruct # Oracle Agent  
ollama pull codellama:7b-instruct # Sage Agent

# Verify installation
ollama list
```

### 3. Docker Production Deployment

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy services
docker-compose -f docker-compose.prod.yml up -d

# Initialize database
docker-compose -f docker-compose.prod.yml exec oracle-sales-api npm run db:init

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 4. Manual Deployment (Traditional Server)

```bash
# Clone repository
git clone <your-repo-url>
cd flexabrain-empire

# Install dependencies
npm install
cd oracle-sales-api && npm install

# Build application
npm run build

# Start production services
npm run start:prod
```

### 5. Kubernetes Deployment (Optional)

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/oracle-api.yaml
kubectl apply -f k8s/ingress.yaml

# Check deployment status
kubectl get pods -n flexabrain
```

### 6. Load Balancer & SSL Configuration

#### Nginx Configuration

```nginx
upstream flexabrain_api {
    server 127.0.0.1:3001;
}

server {
    listen 443 ssl http2;
    server_name api.flexabrain.com;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;

    location / {
        proxy_pass http://flexabrain_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 7. Monitoring Setup

#### Health Checks
```bash
# API Health Check
curl https://api.flexabrain.com/health

# Database Health Check
curl https://api.flexabrain.com/api/admin/health
```

#### Log Monitoring
```bash
# View application logs
tail -f logs/combined.log
tail -f logs/error.log

# Monitor Docker logs
docker-compose logs -f oracle-sales-api
```

### 8. Stripe Webhook Configuration

1. **Create Webhook Endpoint** in Stripe Dashboard:
   - URL: `https://api.flexabrain.com/api/subscriptions/webhook`
   - Events: 
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

2. **Configure Webhook Secret** in environment variables

### 9. Database Migration & Seeding

```bash
# Run database migrations
npm run db:migrate

# Seed initial data
npm run db:seed

# Create admin user
npm run create-admin -- --email admin@flexabrain.com --password SecureAdminPass123!
```

### 10. Performance Optimization

#### Redis Optimization
```bash
# Configure Redis for production
redis-cli CONFIG SET maxmemory 2gb
redis-cli CONFIG SET maxmemory-policy allkeys-lru
redis-cli CONFIG SET save "900 1 300 10 60 10000"
```

#### PostgreSQL Optimization
```sql
-- Optimize PostgreSQL settings
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
SELECT pg_reload_conf();
```

### 11. Security Configuration

#### Rate Limiting (Additional Layer)
```bash
# Install fail2ban for additional protection
sudo apt install fail2ban

# Configure rate limiting rules
sudo nano /etc/fail2ban/jail.local
```

#### Firewall Rules
```bash
# Allow only necessary ports
sudo ufw allow 22      # SSH
sudo ufw allow 80      # HTTP
sudo ufw allow 443     # HTTPS
sudo ufw enable
```

### 12. Backup Strategy

#### Database Backup Script
```bash
#!/bin/bash
# backup-db.sh
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump flexabrain > "backup_flexabrain_$DATE.sql"
aws s3 cp "backup_flexabrain_$DATE.sql" s3://flexabrain-backups/
```

#### Automated Backups
```bash
# Add to crontab
0 2 * * * /path/to/backup-db.sh
```

## Testing Production Deployment

### 1. Run API Tests
```bash
cd oracle-sales-api
node test-api.js
```

### 2. Performance Testing
```bash
# Install Apache Bench
sudo apt install apache2-utils

# Test API performance
ab -n 1000 -c 10 https://api.flexabrain.com/health
```

### 3. Load Testing
```bash
# Install Artillery
npm install -g artillery

# Run load tests
artillery run tests/load-test.yml
```

## Go-Live Checklist

### Pre-Launch
- [ ] All environment variables configured
- [ ] Database initialized and migrated
- [ ] Ollama models downloaded and running
- [ ] SSL certificates installed
- [ ] Stripe webhooks configured
- [ ] Monitoring and logging setup
- [ ] Backup strategy implemented

### Launch Day
- [ ] DNS records pointed to production
- [ ] Health checks passing
- [ ] API tests successful
- [ ] Load testing completed
- [ ] Team notified and ready

### Post-Launch
- [ ] Monitor error rates and performance
- [ ] Track user registrations and conversions
- [ ] Monitor subscription payments
- [ ] Review logs for any issues
- [ ] Prepare for scaling if needed

## Success Metrics to Monitor

### Business Metrics
- **User Registrations**: Target 100+ in first week
- **Free-to-Pro Conversion**: Target 15-25%
- **Daily Oracle Queries**: Track usage patterns
- **Revenue**: Monitor MRR growth

### Technical Metrics
- **API Response Time**: <2 seconds (95th percentile)
- **Uptime**: >99.5%
- **Error Rate**: <1%
- **Database Performance**: <100ms average query time

## Troubleshooting

### Common Issues

1. **Ollama Connection Failed**
   ```bash
   # Check Ollama status
   ollama serve --port 11434
   curl http://localhost:11434/api/tags
   ```

2. **Database Connection Issues**
   ```bash
   # Test database connection
   psql -h localhost -U flexabrain -d flexabrain -c "SELECT 1;"
   ```

3. **High Memory Usage**
   ```bash
   # Monitor memory usage
   docker stats
   free -h
   ```

4. **SSL Certificate Issues**
   ```bash
   # Renew Let's Encrypt certificates
   sudo certbot renew
   ```

## Phase 1 Complete! 🎉

Your FlexaBrain Empire Phase 1 deployment is now PRODUCTION READY with:

✅ **Freemium Oracle Agent** with 5 queries/day limit
✅ **Conversion-optimized upgrade prompts**
✅ **Stripe payment processing** for Pro/Enterprise
✅ **Enterprise-grade security** and audit logging
✅ **Comprehensive admin dashboard**
✅ **Production monitoring** and health checks

**Next Steps**: Deploy Phase 2 (Sentinel + Sage agents) and Phase 3 (Advanced enterprise features)

**The AI Empire begins now.** 🔥👑⚡