# Kooora Application - Production Deployment Guide

This guide provides comprehensive instructions for deploying the Kooora football application to production environments.

## 🚀 Quick Start

1. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd kooora
   cp .env.example .env
   # Edit .env with your production values
   ```

2. **Deploy**
   ```bash
   ./deploy.sh production --backup-db
   ```

## 📋 Prerequisites

### System Requirements
- **OS**: Linux (Ubuntu 20.04+ recommended)
- **CPU**: 4+ cores
- **RAM**: 8GB+ (16GB recommended)
- **Storage**: 50GB+ SSD
- **Network**: Static IP with domain name

### Software Requirements
- Docker 24.0+
- Docker Compose 2.0+
- Git
- curl
- SSL certificate (Let's Encrypt recommended)

### External Services
- PostgreSQL 16+ (or use Docker)
- Redis 7+ (or use Docker)
- Football API key (api.football-data.org)
- VAPID keys for push notifications

## 🔧 Configuration

### 1. Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Database
DATABASE_HOST=localhost
DATABASE_NAME=kooora_prod
DATABASE_USERNAME=kooora_user
DATABASE_PASSWORD=your_secure_password

# JWT
JWT_SECRET=your_256_bit_secret_key

# External APIs
FOOTBALL_API_KEY=your_api_key

# VAPID Keys (generate with web-push)
VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key

# Domain
CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

### 2. SSL Certificates

Place SSL certificates in `ssl/` directory:
```
ssl/
├── fullchain.pem
└── privkey.pem
```

### 3. Generate VAPID Keys

```bash
npx web-push generate-vapid-keys
```

## 🏗️ Architecture

```
┌─────────────────┐
│   Nginx Proxy   │ ← Port 80/443
└─────────────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼──┐
│ Frontend│ │ API │ ← Port 3000/8080
└───────┘ └─────┘
    │         │
    └─────┬───┘
          │
  ┌───────▼────────┐
  │   PostgreSQL   │ ← Port 5432
  │     Redis      │ ← Port 6379
  └────────────────┘
```

## 🚀 Deployment Options

### Option 1: Automated Deployment (Recommended)

```bash
# Full production deployment with backup
./deploy.sh production --backup-db

# Quick update without tests
./deploy.sh production --no-tests

# Force recreate all containers
./deploy.sh production --force-recreate
```

### Option 2: Manual Docker Compose

```bash
# Start production services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down
```

### Option 3: Individual Services

```bash
# Database only
docker-compose -f docker-compose.prod.yml up -d postgres redis

# Backend only
docker-compose -f docker-compose.prod.yml up -d backend

# Frontend only
docker-compose -f docker-compose.prod.yml up -d frontend
```

## 🗄️ Database Management

### Initial Setup

```bash
# Run migrations
cd backend
./mvnw flyway:migrate -Pprod

# Create admin user
docker-compose exec backend curl -X POST \
  http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"admin@yourdomain.com","password":"secure_password","firstName":"Admin","lastName":"User"}'
```

### Backups

```bash
# Manual backup
./deploy.sh --backup-db production

# Automated backup (add to cron)
0 2 * * * /path/to/kooora/deploy.sh --backup-db production
```

### Restore

```bash
# Restore from backup
docker-compose -f docker-compose.prod.yml exec -T postgres psql \
  -U kooora_user -d kooora_prod < backups/backup_file.sql
```

## 📊 Monitoring

### Health Checks

```bash
# Check all services
./deploy.sh --check-health

# Individual health checks
curl http://localhost:8080/actuator/health
curl http://localhost:3000/health
```

### Monitoring Stack

Access monitoring dashboards:
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001
- **Nginx Status**: http://localhost:8080/nginx-status

### Logs

```bash
# View all logs
./deploy.sh --logs

# Individual service logs
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f postgres
```

## 🔒 Security

### SSL/TLS Configuration

1. **Obtain certificates** (Let's Encrypt recommended):
   ```bash
   certbot certonly --webroot -w /var/www/html -d yourdomain.com
   ```

2. **Auto-renewal** (add to cron):
   ```bash
   0 12 * * * /usr/bin/certbot renew --quiet
   ```

### Firewall Configuration

```bash
# UFW Configuration
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### Security Headers

Nginx automatically adds security headers:
- HSTS
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Content Security Policy

## 🔄 Updates and Maintenance

### Application Updates

```bash
# Update with zero downtime
./deploy.sh production --no-tests

# Update with full testing
./deploy.sh production
```

### Database Migrations

```bash
# Run pending migrations
cd backend
./mvnw flyway:migrate -Pprod
```

### Container Updates

```bash
# Update base images
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```bash
   # Check database logs
   docker-compose logs postgres
   
   # Verify credentials
   docker-compose exec postgres psql -U kooora_user -d kooora_prod
   ```

2. **SSL Certificate Issues**
   ```bash
   # Check certificate validity
   openssl x509 -in ssl/fullchain.pem -text -noout
   
   # Test SSL configuration
   curl -I https://yourdomain.com
   ```

3. **API Rate Limiting**
   ```bash
   # Check rate limit status
   curl -I http://localhost/api/matches
   
   # Adjust nginx configuration if needed
   ```

### Performance Tuning

1. **Database Optimization**
   ```sql
   -- Check slow queries
   SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;
   
   -- Analyze tables
   ANALYZE;
   ```

2. **Memory Management**
   ```bash
   # Monitor memory usage
   docker stats
   
   # Adjust JVM settings in docker-compose.prod.yml
   JAVA_OPTS: "-Xmx2g -Xms1g"
   ```

## 📞 Support

### Monitoring Alerts

Set up alerts for:
- High memory usage (>80%)
- High CPU usage (>90%)
- Database connection failures
- API response time >5s
- SSL certificate expiration (30 days)

### Log Analysis

```bash
# Find errors in logs
docker-compose logs backend | grep ERROR

# Monitor API response times
tail -f /var/log/nginx/access.log | grep "rt="
```

### Backup Verification

```bash
# Test backup restoration
./scripts/test-backup.sh backup_file.sql
```

## 🎯 Performance Metrics

Expected performance metrics:
- **API Response Time**: <500ms (95th percentile)
- **Page Load Time**: <2s (initial load)
- **Database Queries**: <100ms (average)
- **Memory Usage**: <70% (sustained)
- **CPU Usage**: <60% (sustained)

## 📈 Scaling

### Horizontal Scaling

1. **Load Balancer Setup**
2. **Multiple Backend Instances**
3. **Database Read Replicas**
4. **CDN for Static Assets**

### Vertical Scaling

1. **Increase Server Resources**
2. **Optimize Database Queries**
3. **Enable Caching**
4. **Compress Assets**

---

For additional support, please check the application logs and monitoring dashboards first. If issues persist, contact the development team with detailed error information.
