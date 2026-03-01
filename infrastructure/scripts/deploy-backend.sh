#!/bin/bash

set -e

ENVIRONMENT=${1:-prod}
REGION=${2:-us-east-1}
STACK_PREFIX="poultry-mitra"

echo "Deploying PoultryMitra Backend Infrastructure to $ENVIRONMENT environment in $REGION"

# Deploy S3 buckets
echo "Deploying S3 buckets..."
aws cloudformation deploy \
  --template-file ../cloudformation/s3.yaml \
  --stack-name ${STACK_PREFIX}-s3-${ENVIRONMENT} \
  --parameter-overrides Environment=${ENVIRONMENT} \
  --region ${REGION} \
  --capabilities CAPABILITY_IAM

# Deploy DynamoDB tables
echo "Deploying DynamoDB tables..."
aws cloudformation deploy \
  --template-file ../cloudformation/dynamodb.yaml \
  --stack-name ${STACK_PREFIX}-dynamodb-${ENVIRONMENT} \
  --parameter-overrides Environment=${ENVIRONMENT} \
  --region ${REGION} \
  --capabilities CAPABILITY_IAM

# Deploy Cognito
echo "Deploying Cognito..."
aws cloudformation deploy \
  --template-file ../cloudformation/cognito.yaml \
  --stack-name ${STACK_PREFIX}-cognito-${ENVIRONMENT} \
  --parameter-overrides Environment=${ENVIRONMENT} \
  --region ${REGION} \
  --capabilities CAPABILITY_IAM

# Build Lambda functions
echo "Building Lambda functions..."
cd ../../backend
npm install
npm run build

# Package and deploy Lambda functions
echo "Packaging Lambda functions..."
cd functions

for dir in */; do
  FUNCTION_NAME=$(basename "$dir")
  echo "Packaging $FUNCTION_NAME..."
  
  cd "$dir"
  zip -r "../${FUNCTION_NAME}.zip" . ../../layers
  cd ..
done

# Deploy API Gateway
echo "Deploying API Gateway..."
cd ../../infrastructure
aws cloudformation deploy \
  --template-file cloudformation/api-gateway.yaml \
  --stack-name ${STACK_PREFIX}-api-${ENVIRONMENT} \
  --parameter-overrides Environment=${ENVIRONMENT} \
  --region ${REGION} \
  --capabilities CAPABILITY_IAM

echo "Backend deployment complete!"
echo "Retrieving outputs..."

# Get stack outputs
API_ENDPOINT=$(aws cloudformation describe-stacks \
  --stack-name ${STACK_PREFIX}-api-${ENVIRONMENT} \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
  --output text \
  --region ${REGION})

USER_POOL_ID=$(aws cloudformation describe-stacks \
  --stack-name ${STACK_PREFIX}-cognito-${ENVIRONMENT} \
  --query 'Stacks[0].Outputs[?OutputKey==`UserPoolId`].OutputValue' \
  --output text \
  --region ${REGION})

USER_POOL_CLIENT_ID=$(aws cloudformation describe-stacks \
  --stack-name ${STACK_PREFIX}-cognito-${ENVIRONMENT} \
  --query 'Stacks[0].Outputs[?OutputKey==`UserPoolClientId`].OutputValue' \
  --output text \
  --region ${REGION})

IDENTITY_POOL_ID=$(aws cloudformation describe-stacks \
  --stack-name ${STACK_PREFIX}-cognito-${ENVIRONMENT} \
  --query 'Stacks[0].Outputs[?OutputKey==`IdentityPoolId`].OutputValue' \
  --output text \
  --region ${REGION})

S3_BUCKET=$(aws cloudformation describe-stacks \
  --stack-name ${STACK_PREFIX}-s3-${ENVIRONMENT} \
  --query 'Stacks[0].Outputs[?OutputKey==`UploadsBucketName`].OutputValue' \
  --output text \
  --region ${REGION})

echo ""
echo "=== Deployment Complete ==="
echo "API Endpoint: $API_ENDPOINT"
echo "User Pool ID: $USER_POOL_ID"
echo "User Pool Client ID: $USER_POOL_CLIENT_ID"
echo "Identity Pool ID: $IDENTITY_POOL_ID"
echo "S3 Bucket: $S3_BUCKET"
echo ""
echo "Update your frontend .env file with these values"
