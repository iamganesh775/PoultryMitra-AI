# PoultryMitra - AI-Powered Poultry Farm Management System

A production-ready serverless web application for poultry farm management powered by AWS cloud services and generative AI.

## Features

### Core Features
- 🤖 AI Conversational Assistant for poultry advisory
- 📸 Smart Disease Scanner using image upload
- 📊 Farm Dashboard with analytics
- 🐔 Breed Recommendation and Planning
- 💼 Business Planner and Profit Calculator
- 📝 Invoice and Expense Manager
- 💉 Health Scheduler and Vaccination Reminders
- 🌍 Multi-language Support (English, Hindi, Telugu)

### Advanced AI Features (NEW!)
- 🎙️ Voice Advisory using Amazon Polly
- 🧠 RAG-powered Chatbot with Knowledge Base
- 🔔 Real-time Notifications via Amazon SNS
- 📈 Predictive Analytics (Mortality & Profit Forecasting)
- 🤖 Bedrock Agents for Workflow Automation
- 📊 Farm Analytics using Amazon QuickSight
- 📱 Offline-Friendly PWA Support

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- TailwindCSS
- AWS Amplify UI Components

### Backend (AWS Serverless)
- AWS Lambda (Node.js 20.x)
- Amazon API Gateway (REST API)
- Amazon Cognito (Authentication)
- Amazon DynamoDB (Database)
- Amazon S3 (Storage)
- Amazon Bedrock (Generative AI)
  - Claude 3 Sonnet (Conversational AI)
  - Bedrock Agents (Workflow Automation)
  - Knowledge Bases (RAG)
- AWS Rekognition (Image Analysis)
- Amazon Polly (Text-to-Speech)
- Amazon SNS (Real-time Notifications)
- Amazon QuickSight (Business Intelligence)

## Architecture

```
┌─────────────┐
│   CloudFront│
│  + Amplify  │
└──────┬──────┘
       │
┌──────▼──────────────────────────────────────┐
│           React Frontend                     │
│  (Vite + TypeScript + TailwindCSS)          │
└──────┬──────────────────────────────────────┘
       │
┌──────▼──────────┐
│  Amazon Cognito │
│  (Auth)         │
└──────┬──────────┘
       │
┌──────▼──────────────────────────────────────┐
│        API Gateway (REST)                    │
└──┬───┬───┬───┬───┬───┬───┬───┬──────────────┘
   │   │   │   │   │   │   │   │
   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼
┌────────────────────────────────────────────┐
│         AWS Lambda Functions               │
│  (Advisory, Disease, Farm, Breed, etc.)    │
└──┬───┬───┬───┬───┬───┬───┬────────────────┘
   │   │   │   │   │   │   │
   ▼   ▼   ▼   │   │   │   ▼
┌─────────┐    │   │   │  ┌──────────┐
│DynamoDB │    │   │   │  │    S3    │
└─────────┘    │   │   │  └──────────┘
               ▼   ▼   ▼
          ┌──────────────────┐
          │  Amazon Bedrock  │
          │  (Claude/Titan)  │
          └──────────────────┘
               │
          ┌────▼─────────┐
          │ Rekognition  │
          └──────────────┘
```

## Project Structure

```
poultry-mitra/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API and AWS service integrations
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Utility functions
│   │   ├── types/          # TypeScript type definitions
│   │   └── config/         # Configuration files
│   ├── public/
│   └── package.json
├── backend/                 # AWS Lambda functions
│   ├── functions/
│   │   ├── advisory/       # AI advisory chatbot
│   │   ├── disease/        # Disease detection
│   │   ├── farm/           # Farm management
│   │   ├── breed/          # Breed recommendations
│   │   ├── business/       # Business planning
│   │   ├── invoice/        # Invoice management
│   │   └── health/         # Health scheduler
│   ├── layers/             # Lambda layers (shared code)
│   └── package.json
├── infrastructure/          # IaC and deployment
│   ├── cloudformation/     # CloudFormation templates
│   ├── scripts/            # Deployment scripts
│   └── diagrams/           # Architecture diagrams
└── docs/                   # Documentation
```

## Prerequisites

- Node.js 20.x or later
- AWS Account with appropriate permissions
- AWS CLI configured
- npm or yarn

## Environment Variables

Create `.env` files in both frontend and backend:

### Frontend (.env)
```
VITE_AWS_REGION=us-east-1
VITE_USER_POOL_ID=your-user-pool-id
VITE_USER_POOL_CLIENT_ID=your-client-id
VITE_API_ENDPOINT=your-api-gateway-url
VITE_S3_BUCKET=your-s3-bucket
```

### Backend (.env)
```
AWS_REGION=us-east-1
DYNAMODB_TABLE_PREFIX=poultry-mitra
S3_BUCKET=your-s3-bucket
BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
KNOWLEDGE_BASE_ID=your-knowledge-base-id
```

## Installation

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
npm install
```

## Deployment

### 1. Deploy Backend Infrastructure
```bash
cd infrastructure
./scripts/deploy-backend.sh
```

### 2. Deploy Frontend to Amplify
```bash
cd frontend
npm run build
# Connect to AWS Amplify via console or CLI
```

### 3. Configure Cognito
```bash
./infrastructure/scripts/setup-cognito.sh
```

### 4. Setup Bedrock Knowledge Base
```bash
./infrastructure/scripts/setup-bedrock-kb.sh
```

## API Endpoints

### Core APIs
- `POST /api/advisory/chat` - AI advisory chatbot
- `POST /api/disease/scan` - Disease detection from image
- `GET /api/farm/dashboard` - Farm analytics
- `POST /api/breed/recommend` - Breed recommendations
- `POST /api/business/plan` - Business planning
- `POST /api/invoice` - Invoice management
- `GET /api/health/schedule` - Vaccination schedule

### Advanced AI APIs (NEW!)
- `POST /api/voice-advisory` - Voice-enabled AI advisory
- `POST /api/rag-chat` - RAG-powered chatbot
- `POST /api/notifications` - Send real-time notifications
- `POST /api/notifications/subscribe` - Subscribe to alerts
- `POST /api/predictions` - AI predictions (mortality/profit)
- `POST /api/agent` - Bedrock agent automation

## Security

- All APIs protected with Cognito JWT authentication
- IAM roles follow least privilege principle
- S3 buckets with encryption at rest
- API Gateway with throttling and WAF
- DynamoDB encryption enabled

## Cost Optimization

- Lambda functions with appropriate memory allocation
- DynamoDB on-demand pricing for variable workloads
- S3 lifecycle policies for old data
- CloudWatch logs retention policies
- Bedrock usage monitoring

## Testing

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test
```

## Monitoring

- CloudWatch Dashboards for metrics
- X-Ray for distributed tracing
- CloudWatch Alarms for critical metrics
- Cost Explorer for budget tracking

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

MIT License

## Support

For issues and questions, please open a GitHub issue or contact support@poultrymitra.com
