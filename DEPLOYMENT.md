# PoultryMitra Deployment Guide

## Prerequisites

1. AWS Account with appropriate permissions
2. AWS CLI installed and configured
3. Node.js 20.x or later
4. Git

## Step-by-Step Deployment

### 1. Clone and Setup

```bash
git clone <repository-url>
cd poultry-mitra
```

### 2. Deploy Backend Infrastructure

```bash
cd infrastructure/scripts
chmod +x deploy-backend.sh
./deploy-backend.sh prod us-east-1
```

This will deploy:
- S3 buckets for uploads and knowledge base
- DynamoDB tables
- Cognito User Pool and Identity Pool
- API Gateway
- Lambda functions

### 3. Setup Bedrock Knowledge Base

```bash
chmod +x setup-bedrock-kb.sh
./setup-bedrock-kb.sh prod us-east-1
```

Follow the instructions to:
1. Create Bedrock Knowledge Base in AWS Console
2. Connect to S3 bucket
3. Select embedding model
4. Sync knowledge base

### 4. Enable Bedrock Model Access

1. Go to AWS Bedrock Console
2. Navigate to Model Access
3. Request access to:
   - Claude 3 Sonnet
   - Titan Embeddings

### 5. Configure Frontend

```bash
cd ../../frontend
cp .env.example .env
```

Update `.env` with values from deployment output:
```
VITE_AWS_REGION=us-east-1
VITE_USER_POOL_ID=<from-deployment-output>
VITE_USER_POOL_CLIENT_ID=<from-deployment-output>
VITE_API_ENDPOINT=<from-deployment-output>
VITE_S3_BUCKET=<from-deployment-output>
VITE_IDENTITY_POOL_ID=<from-deployment-output>
```

### 6. Deploy Frontend to Amplify

#### Option A: AWS Amplify Console (Recommended)

1. Go to AWS Amplify Console
2. Click "New App" → "Host web app"
3. Connect your Git repository
4. Configure build settings:
   - Build command: `npm run build`
   - Base directory: `frontend`
   - Output directory: `dist`
5. Add environment variables from `.env`
6. Deploy

#### Option B: Manual Deployment

```bash
cd frontend
npm install
npm run build

# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify
amplify init

# Add hosting
amplify add hosting

# Publish
amplify publish
```

### 7. Create Test User

```bash
aws cognito-idp admin-create-user \
  --user-pool-id <USER_POOL_ID> \
  --username testuser@example.com \
  --user-attributes Name=email,Value=testuser@example.com Name=name,Value='Test User' \
  --temporary-password TempPass123! \
  --region us-east-1
```

### 8. Test the Application

1. Open the Amplify URL
2. Sign in with test user credentials
3. Change temporary password
4. Test all features

## Post-Deployment Configuration

### Enable CloudWatch Monitoring

```bash
aws cloudwatch put-dashboard \
  --dashboard-name PoultryMitra \
  --dashboard-body file://infrastructure/monitoring/dashboard.json
```

### Setup Alarms

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name poultry-mitra-api-errors \
  --alarm-description "Alert on API errors" \
  --metric-name 5XXError \
  --namespace AWS/ApiGateway \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold
```

### Enable X-Ray Tracing

Already enabled in API Gateway configuration.

## Updating the Application

### Update Backend

```bash
cd backend
npm run build
cd ../infrastructure/scripts
./deploy-backend.sh prod us-east-1
```

### Update Frontend

Amplify will automatically deploy on git push if connected to repository.

Or manually:
```bash
cd frontend
npm run build
amplify publish
```

## Troubleshooting

### Lambda Function Errors

Check CloudWatch Logs:
```bash
aws logs tail /aws/lambda/poultry-mitra-advisory-prod --follow
```

### API Gateway Issues

Test endpoint:
```bash
curl -X POST https://<API_ID>.execute-api.us-east-1.amazonaws.com/prod/api/advisory/chat \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}'
```

### Cognito Issues

Verify user pool:
```bash
aws cognito-idp list-users --user-pool-id <USER_POOL_ID>
```

## Cost Optimization

1. Enable DynamoDB auto-scaling
2. Set S3 lifecycle policies
3. Use Lambda reserved concurrency
4. Monitor Bedrock usage
5. Enable CloudWatch Logs retention policies

## Security Checklist

- [ ] Enable MFA for AWS root account
- [ ] Use IAM roles with least privilege
- [ ] Enable CloudTrail logging
- [ ] Configure WAF for API Gateway
- [ ] Enable S3 bucket encryption
- [ ] Set up VPC for Lambda (optional)
- [ ] Regular security audits

## Backup and Recovery

### DynamoDB Backups

```bash
aws dynamodb create-backup \
  --table-name poultry-mitra-farms-prod \
  --backup-name farms-backup-$(date +%Y%m%d)
```

### S3 Versioning

Already enabled in CloudFormation templates.

## Monitoring URLs

- CloudWatch Dashboard: https://console.aws.amazon.com/cloudwatch/
- API Gateway Metrics: https://console.aws.amazon.com/apigateway/
- Lambda Metrics: https://console.aws.amazon.com/lambda/
- Bedrock Usage: https://console.aws.amazon.com/bedrock/

## Support

For issues, contact: support@poultrymitra.com
