#!/bin/bash

set -e

ENVIRONMENT=${1:-prod}
REGION=${2:-us-east-1}
STACK_PREFIX="poultry-mitra"

echo "=========================================="
echo "Deploying Enhanced PoultryMitra"
echo "Environment: $ENVIRONMENT"
echo "Region: $REGION"
echo "=========================================="

# Deploy base infrastructure first
echo ""
echo "Step 1: Deploying base infrastructure..."
./deploy-backend.sh $ENVIRONMENT $REGION

# Deploy SNS topics
echo ""
echo "Step 2: Deploying SNS topics for notifications..."
aws cloudformation deploy \
  --template-file ../cloudformation/sns.yaml \
  --stack-name ${STACK_PREFIX}-sns-${ENVIRONMENT} \
  --parameter-overrides Environment=${ENVIRONMENT} \
  --region ${REGION} \
  --capabilities CAPABILITY_IAM

# Get SNS topic ARN
SNS_TOPIC_ARN=$(aws cloudformation describe-stacks \
  --stack-name ${STACK_PREFIX}-sns-${ENVIRONMENT} \
  --query 'Stacks[0].Outputs[?OutputKey==`NotificationTopicArn`].OutputValue' \
  --output text \
  --region ${REGION})

echo "SNS Topic ARN: $SNS_TOPIC_ARN"

# Deploy new Lambda functions
echo ""
echo "Step 3: Deploying enhanced Lambda functions..."

cd ../../backend

# Build TypeScript
npm install
npm run build

# Package Lambda functions
cd functions

FUNCTIONS=("voice-advisory" "rag-chatbot" "notifications" "bedrock-agent" "predictions")

for FUNCTION in "${FUNCTIONS[@]}"; do
  if [ -d "$FUNCTION" ]; then
    echo "Packaging $FUNCTION..."
    cd "$FUNCTION"
    zip -r "../${FUNCTION}.zip" . ../../layers ../../node_modules
    cd ..
    
    # Deploy or update Lambda function
    FUNCTION_NAME="${STACK_PREFIX}-${FUNCTION}-${ENVIRONMENT}"
    
    if aws lambda get-function --function-name $FUNCTION_NAME --region $REGION 2>/dev/null; then
      echo "Updating existing function: $FUNCTION_NAME"
      aws lambda update-function-code \
        --function-name $FUNCTION_NAME \
        --zip-file fileb://${FUNCTION}.zip \
        --region $REGION
    else
      echo "Creating new function: $FUNCTION_NAME"
      # Note: This requires IAM role ARN - should be created via CloudFormation
      echo "Please create $FUNCTION_NAME via CloudFormation or AWS Console"
    fi
  fi
done

cd ../..

# Setup Bedrock Knowledge Base
echo ""
echo "Step 4: Setting up Bedrock Knowledge Base..."
cd infrastructure/scripts
./setup-bedrock-kb.sh $ENVIRONMENT $REGION

# Setup Bedrock Agent
echo ""
echo "Step 5: Setting up Bedrock Agent..."
./setup-bedrock-agent.sh $ENVIRONMENT $REGION

# Deploy QuickSight (optional)
echo ""
read -p "Do you want to deploy QuickSight analytics? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  read -p "Enter your QuickSight User ARN: " QUICKSIGHT_ARN
  
  aws cloudformation deploy \
    --template-file ../cloudformation/quicksight.yaml \
    --stack-name ${STACK_PREFIX}-quicksight-${ENVIRONMENT} \
    --parameter-overrides \
      Environment=${ENVIRONMENT} \
      QuickSightUserArn=${QUICKSIGHT_ARN} \
    --region ${REGION} \
    --capabilities CAPABILITY_IAM
fi

# Get all outputs
echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
echo "Configuration Summary:"
echo "----------------------"

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

S3_BUCKET=$(aws cloudformation describe-stacks \
  --stack-name ${STACK_PREFIX}-s3-${ENVIRONMENT} \
  --query 'Stacks[0].Outputs[?OutputKey==`UploadsBucketName`].OutputValue' \
  --output text \
  --region ${REGION})

echo "API Endpoint: $API_ENDPOINT"
echo "User Pool ID: $USER_POOL_ID"
echo "User Pool Client ID: $USER_POOL_CLIENT_ID"
echo "S3 Bucket: $S3_BUCKET"
echo "SNS Topic ARN: $SNS_TOPIC_ARN"
echo ""
echo "New Features Deployed:"
echo "- Voice Advisory (Amazon Polly)"
echo "- RAG Chatbot (Bedrock Knowledge Base)"
echo "- Real-time Notifications (SNS)"
echo "- Predictive Analytics (Bedrock AI)"
echo "- Workflow Automation (Bedrock Agents)"
echo ""
echo "Next Steps:"
echo "1. Update frontend .env with these values"
echo "2. Enable Bedrock model access in AWS Console"
echo "3. Create and sync Bedrock Knowledge Base"
echo "4. Create and deploy Bedrock Agent"
echo "5. Test all new endpoints"
echo "6. Deploy frontend with PWA support"
echo ""
echo "See ENHANCEMENTS.md for detailed documentation"
