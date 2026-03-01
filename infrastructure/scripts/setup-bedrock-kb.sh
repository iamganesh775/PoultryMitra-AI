#!/bin/bash

set -e

ENVIRONMENT=${1:-prod}
REGION=${2:-us-east-1}

echo "Setting up Bedrock Knowledge Base for PoultryMitra"

# Create knowledge base documents directory
mkdir -p ../knowledge-base

# Create sample poultry farming knowledge documents
cat > ../knowledge-base/poultry-breeds.txt << 'EOF'
# Poultry Breeds Guide

## Rhode Island Red
- Origin: United States
- Purpose: Dual-purpose (eggs and meat)
- Egg Production: 250-300 eggs per year
- Temperament: Hardy, adaptable
- Climate Suitability: All climates
- Best For: Beginners

## Leghorn
- Origin: Italy
- Purpose: Egg production
- Egg Production: 280-320 eggs per year
- Temperament: Active, flighty
- Climate Suitability: Warm climates
- Best For: Commercial egg production

## Broiler (Cornish Cross)
- Purpose: Meat production
- Growth Rate: 6-8 weeks to market weight
- Feed Conversion: Excellent (1.8:1)
- Best For: Meat production farms
EOF

cat > ../knowledge-base/disease-management.txt << 'EOF'
# Poultry Disease Management

## Common Diseases

### Newcastle Disease
- Symptoms: Respiratory distress, nervous signs, drop in egg production
- Prevention: Vaccination at day 1, 7, and 21
- Treatment: No specific treatment, supportive care

### Infectious Bronchitis
- Symptoms: Coughing, sneezing, nasal discharge
- Prevention: Vaccination
- Treatment: Antibiotics for secondary infections

### Coccidiosis
- Symptoms: Bloody droppings, lethargy, poor growth
- Prevention: Clean housing, anticoccidial drugs
- Treatment: Sulfa drugs, amprolium

## Biosecurity Measures
1. Restrict farm access
2. Disinfect equipment regularly
3. Quarantine new birds
4. Proper waste disposal
5. Regular health monitoring
EOF

cat > ../knowledge-base/feed-management.txt << 'EOF'
# Poultry Feed Management

## Feed Types by Age

### Starter Feed (0-6 weeks)
- Protein: 20-22%
- Energy: 2900-3000 kcal/kg
- Form: Crumbles

### Grower Feed (6-20 weeks)
- Protein: 16-18%
- Energy: 2800-2900 kcal/kg
- Form: Pellets

### Layer Feed (20+ weeks)
- Protein: 16-17%
- Calcium: 3.5-4%
- Energy: 2700-2800 kcal/kg

## Feed Optimization Tips
1. Use quality ingredients
2. Maintain proper storage
3. Provide clean water
4. Monitor feed conversion ratio
5. Adjust based on production stage
EOF

# Upload knowledge base documents to S3
S3_BUCKET=$(aws cloudformation describe-stacks \
  --stack-name poultry-mitra-s3-${ENVIRONMENT} \
  --query 'Stacks[0].Outputs[?OutputKey==`KnowledgeBaseBucketName`].OutputValue' \
  --output text \
  --region ${REGION})

echo "Uploading knowledge base documents to S3..."
aws s3 sync ../knowledge-base s3://${S3_BUCKET}/knowledge-base/ --region ${REGION}

echo ""
echo "Knowledge base setup complete!"
echo "S3 Bucket: $S3_BUCKET"
echo ""
echo "Next steps:"
echo "1. Go to AWS Bedrock console"
echo "2. Create a Knowledge Base"
echo "3. Connect it to S3 bucket: $S3_BUCKET"
echo "4. Select embedding model: amazon.titan-embed-text-v1"
echo "5. Sync the knowledge base"
echo "6. Update Lambda environment variables with Knowledge Base ID"
