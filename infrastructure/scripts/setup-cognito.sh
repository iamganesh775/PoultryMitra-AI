#!/bin/bash

set -e

ENVIRONMENT=${1:-prod}
REGION=${2:-us-east-1}

echo "Setting up Cognito for PoultryMitra"

USER_POOL_ID=$(aws cloudformation describe-stacks \
  --stack-name poultry-mitra-cognito-${ENVIRONMENT} \
  --query 'Stacks[0].Outputs[?OutputKey==`UserPoolId`].OutputValue' \
  --output text \
  --region ${REGION})

echo "User Pool ID: $USER_POOL_ID"
echo ""
echo "Cognito setup complete!"
echo ""
echo "To create a test user, run:"
echo "aws cognito-idp admin-create-user \\"
echo "  --user-pool-id $USER_POOL_ID \\"
echo "  --username testuser@example.com \\"
echo "  --user-attributes Name=email,Value=testuser@example.com Name=name,Value='Test User' \\"
echo "  --temporary-password TempPass123! \\"
echo "  --region $REGION"
