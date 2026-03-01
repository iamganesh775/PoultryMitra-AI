#!/bin/bash

set -e

ENVIRONMENT=${1:-prod}
REGION=${2:-us-east-1}

echo "Setting up Bedrock Agent for PoultryMitra"

# Create agent instruction file
cat > ../bedrock-agent-instructions.txt << 'EOF'
You are a PoultryMitra farm automation assistant. Your role is to help farmers with:

1. VACCINATION SCHEDULING
   - Schedule vaccinations based on bird age and type
   - Send reminders for upcoming vaccinations
   - Track vaccination history

2. FEED ORDERING
   - Calculate feed requirements based on bird count
   - Recommend optimal feed types
   - Automate feed orders when stock is low

3. HEALTH MONITORING
   - Monitor bird health metrics
   - Alert on abnormal patterns
   - Recommend veterinary consultations

4. PRODUCTION TRACKING
   - Track egg and meat production
   - Identify production trends
   - Suggest optimization strategies

When responding:
- Be concise and actionable
- Provide specific recommendations
- Include relevant data and metrics
- Prioritize farmer safety and bird welfare
EOF

echo "Agent instructions created at: ../bedrock-agent-instructions.txt"
echo ""
echo "Next steps:"
echo "1. Go to AWS Bedrock Console"
echo "2. Create a new Agent"
echo "3. Upload the instructions file"
echo "4. Configure action groups:"
echo "   - scheduleVaccination"
echo "   - orderFeed"
echo "   - monitorHealth"
echo "   - trackProduction"
echo "5. Link Lambda functions for each action"
echo "6. Test and deploy the agent"
echo "7. Update Lambda environment with BEDROCK_AGENT_ID"
