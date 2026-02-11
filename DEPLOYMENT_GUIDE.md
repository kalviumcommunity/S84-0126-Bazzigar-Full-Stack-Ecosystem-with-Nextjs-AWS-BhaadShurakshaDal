# Deployment Guide

This guide covers deploying BhaadShurakshaDal to production environments using Docker, AWS, and Azure.

## Prerequisites

- Docker and Docker Compose installed
- AWS or Azure account with appropriate permissions
- Domain name (optional but recommended)
- SSL certificate (Let's Encrypt recommended)

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# Redis
REDIS_URL="redis://host:6379"

# Application
NODE_ENV="production"
NEXT_PUBLIC_API_URL="https://your-domain.com/api"

# Authentication
JWT_SECRET="your-secure-jwt-secret"
SESSION_SECRET="your-secure-session-secret"

# External Services (Optional)
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
AWS_REGION="ap-south-1"
SNS_TOPIC_ARN="arn:aws:sns:region:account:topic"

# Email Service (Optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
```

## Docker Deployment

### Build Docker Image

```bash
docker build -t bhaadshurakshadal:latest .
```

### Run with Docker Compose

```bash
docker-compose up -d
```

This starts:

- Next.js application (port 3000)
- PostgreSQL database (port 5432)
- Redis cache (port 6379)

### Verify Deployment

```bash
docker-compose ps
docker-compose logs -f app
```

## AWS Deployment

### Option 1: AWS ECS (Elastic Container Service)

#### 1. Push Image to ECR

```bash
# Authenticate Docker to ECR
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.ap-south-1.amazonaws.com

# Tag and push image
docker tag bhaadshurakshadal:latest <account-id>.dkr.ecr.ap-south-1.amazonaws.com/bhaadshurakshadal:latest
docker push <account-id>.dkr.ecr.ap-south-1.amazonaws.com/bhaadshurakshadal:latest
```

#### 2. Create ECS Task Definition

```json
{
  "family": "bhaadshurakshadal",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "app",
      "image": "<account-id>.dkr.ecr.ap-south-1.amazonaws.com/bhaadshurakshadal:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:db-url"
        }
      ]
    }
  ]
}
```

#### 3. Create ECS Service

```bash
aws ecs create-service \
  --cluster bhaadshurakshadal-cluster \
  --service-name bhaadshurakshadal-service \
  --task-definition bhaadshurakshadal \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
```

#### 4. Set Up RDS PostgreSQL

```bash
aws rds create-db-instance \
  --db-instance-identifier bhaadshurakshadal-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password <secure-password> \
  --allocated-storage 20
```

#### 5. Set Up ElastiCache Redis

```bash
aws elasticache create-cache-cluster \
  --cache-cluster-id bhaadshurakshadal-cache \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1
```

### Option 2: AWS Elastic Beanstalk

```bash
# Initialize EB
eb init -p docker bhaadshurakshadal

# Create environment
eb create production-env

# Deploy
eb deploy
```

## Azure Deployment

### Option 1: Azure App Service

#### 1. Create Resource Group

```bash
az group create --name bhaadshurakshadal-rg --location eastus
```

#### 2. Create App Service Plan

```bash
az appservice plan create \
  --name bhaadshurakshadal-plan \
  --resource-group bhaadshurakshadal-rg \
  --sku B1 \
  --is-linux
```

#### 3. Create Web App

```bash
az webapp create \
  --resource-group bhaadshurakshadal-rg \
  --plan bhaadshurakshadal-plan \
  --name bhaadshurakshadal \
  --deployment-container-image-name <your-dockerhub-username>/bhaadshurakshadal:latest
```

#### 4. Configure Environment Variables

```bash
az webapp config appsettings set \
  --resource-group bhaadshurakshadal-rg \
  --name bhaadshurakshadal \
  --settings NODE_ENV=production DATABASE_URL=<connection-string>
```

#### 5. Set Up Azure Database for PostgreSQL

```bash
az postgres server create \
  --resource-group bhaadshurakshadal-rg \
  --name bhaadshurakshadal-db \
  --location eastus \
  --admin-user adminuser \
  --admin-password <secure-password> \
  --sku-name B_Gen5_1
```

#### 6. Set Up Azure Cache for Redis

```bash
az redis create \
  --resource-group bhaadshurakshadal-rg \
  --name bhaadshurakshadal-cache \
  --location eastus \
  --sku Basic \
  --vm-size c0
```

## CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: |
          npm install
          cd frontend && npm install

      - name: Run tests
        run: npm test

      - name: Build Docker image
        run: docker build -t bhaadshurakshadal:${{ github.sha }} .

      - name: Push to ECR
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        run: |
          aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin ${{ secrets.ECR_REGISTRY }}
          docker tag bhaadshurakshadal:${{ github.sha }} ${{ secrets.ECR_REGISTRY }}/bhaadshurakshadal:latest
          docker push ${{ secrets.ECR_REGISTRY }}/bhaadshurakshadal:latest

      - name: Deploy to ECS
        run: |
          aws ecs update-service --cluster bhaadshurakshadal-cluster --service bhaadshurakshadal-service --force-new-deployment
```

## Database Migrations

Run migrations before deploying new code:

```bash
# Production migration
npm run db:migrate

# Or using Prisma directly
npx prisma migrate deploy
```

## Health Checks

The application exposes health check endpoints:

- `/api/health` - Basic health check
- `/api/health/db` - Database connectivity
- `/api/health/redis` - Redis connectivity

## Monitoring

### CloudWatch (AWS)

```bash
# View logs
aws logs tail /ecs/bhaadshurakshadal --follow

# Create alarm for high CPU
aws cloudwatch put-metric-alarm \
  --alarm-name high-cpu \
  --alarm-description "Alert when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold
```

### Application Insights (Azure)

```bash
# Enable Application Insights
az monitor app-insights component create \
  --app bhaadshurakshadal-insights \
  --location eastus \
  --resource-group bhaadshurakshadal-rg
```

## Backup Strategy

### Database Backups

**AWS RDS:**

```bash
# Automated daily backups (enabled by default)
# Manual snapshot
aws rds create-db-snapshot \
  --db-instance-identifier bhaadshurakshadal-db \
  --db-snapshot-identifier backup-$(date +%Y%m%d)
```

**Azure PostgreSQL:**

```bash
# Automated backups (enabled by default, 7-day retention)
# Point-in-time restore available
```

## Scaling

### Horizontal Scaling (AWS ECS)

```bash
# Update desired count
aws ecs update-service \
  --cluster bhaadshurakshadal-cluster \
  --service bhaadshurakshadal-service \
  --desired-count 4
```

### Auto Scaling (Azure)

```bash
# Enable autoscale
az monitor autoscale create \
  --resource-group bhaadshurakshadal-rg \
  --resource bhaadshurakshadal \
  --resource-type Microsoft.Web/sites \
  --name autoscale-rules \
  --min-count 1 \
  --max-count 5 \
  --count 2
```

## SSL/TLS Configuration

### Using Let's Encrypt

```bash
# Install certbot
sudo apt-get install certbot

# Obtain certificate
sudo certbot certonly --standalone -d your-domain.com

# Configure in nginx or load balancer
```

### AWS Certificate Manager

```bash
# Request certificate
aws acm request-certificate \
  --domain-name your-domain.com \
  --validation-method DNS
```

## Rollback Strategy

### Docker Rollback

```bash
# Tag previous version
docker tag bhaadshurakshadal:previous bhaadshurakshadal:latest

# Restart containers
docker-compose up -d
```

### ECS Rollback

```bash
# Update to previous task definition
aws ecs update-service \
  --cluster bhaadshurakshadal-cluster \
  --service bhaadshurakshadal-service \
  --task-definition bhaadshurakshadal:previous-revision
```

## Troubleshooting

### Check Application Logs

```bash
# Docker
docker-compose logs -f app

# AWS ECS
aws logs tail /ecs/bhaadshurakshadal --follow

# Azure
az webapp log tail --name bhaadshurakshadal --resource-group bhaadshurakshadal-rg
```

### Database Connection Issues

```bash
# Test database connectivity
psql $DATABASE_URL -c "SELECT 1"

# Check security groups (AWS)
aws ec2 describe-security-groups --group-ids sg-xxx
```

### Redis Connection Issues

```bash
# Test Redis connectivity
redis-cli -h <redis-host> -p 6379 ping
```

## Security Checklist

- [ ] Environment variables stored in secrets manager
- [ ] Database uses strong passwords
- [ ] SSL/TLS enabled for all connections
- [ ] Security groups configured with minimal access
- [ ] Regular security updates applied
- [ ] Backup strategy implemented
- [ ] Monitoring and alerting configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured

## Cost Optimization

- Use reserved instances for predictable workloads
- Enable auto-scaling to match demand
- Use spot instances for non-critical tasks
- Implement caching to reduce database load
- Compress static assets
- Use CDN for static content

## Support

For deployment issues, contact the team or open an issue on GitHub.
