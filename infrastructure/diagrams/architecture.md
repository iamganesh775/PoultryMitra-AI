# PoultryMitra Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  React + TypeScript + Vite + TailwindCSS                 │  │
│  │  - Dashboard  - Advisory  - Disease Scanner              │  │
│  │  - Breed Recommendation  - Business Planner              │  │
│  │  - Invoice Manager  - Health Scheduler                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                    AWS Amplify Hosting                          │
└──────────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│                      AUTHENTICATION LAYER                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Amazon Cognito                              │  │
│  │  - User Pool (Authentication)                            │  │
│  │  - Identity Pool (AWS Resource Access)                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│                         API LAYER                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           Amazon API Gateway (REST API)                  │  │
│  │  - /api/advisory/*    - /api/disease/*                   │  │
│  │  - /api/farm/*        - /api/breed/*                     │  │
│  │  - /api/business/*    - /api/invoice/*                   │  │
│  │  - /api/health/*                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│                      COMPUTE LAYER                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              AWS Lambda Functions                        │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐        │  │
│  │  │ Advisory   │  │  Disease   │  │   Farm     │        │  │
│  │  │  Handler   │  │  Handler   │  │  Handler   │        │  │
│  │  └────────────┘  └────────────┘  └────────────┘        │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐        │  │
│  │  │   Breed    │  │ Business   │  │  Invoice   │        │  │
│  │  │  Handler   │  │  Handler   │  │  Handler   │        │  │
│  │  └────────────┘  └────────────┘  └────────────┘        │  │
│  │  ┌────────────┐                                         │  │
│  │  │  Health    │                                         │  │
│  │  │  Handler   │                                         │  │
│  │  └────────────┘                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────┬────────────┬────────────┬────────────┬────────────────┘
          │            │            │            │
┌─────────▼────┐  ┌───▼─────┐  ┌──▼──────┐  ┌──▼──────────────┐
│   DynamoDB   │  │   S3    │  │ Bedrock │  │  Rekognition    │
│              │  │         │  │         │  │                 │
│ - farms      │  │ Images  │  │ Claude  │  │ Image Analysis  │
│ - convos     │  │ Docs    │  │ Titan   │  │ Label Detection │
│ - diseases   │  │ KB      │  │ RAG     │  │                 │
│ - invoices   │  │         │  │         │  │                 │
│ - schedules  │  │         │  │         │  │                 │
│ - plans      │  │         │  │         │  │                 │
└──────────────┘  └─────────┘  └─────────┘  └─────────────────┘
```

## Data Flow

### 1. User Authentication Flow
```
User → Cognito User Pool → JWT Token → API Gateway → Lambda
```

### 2. AI Advisory Flow
```
User Message → API Gateway → Advisory Lambda → Bedrock (Claude) 
→ DynamoDB (Save) → Response to User
```

### 3. Disease Detection Flow
```
Image Upload → S3 → Disease Lambda → Rekognition (Labels) 
→ Bedrock (Analysis) → DynamoDB (Save) → Response
```

### 4. RAG Knowledge Base Flow
```
Query → Bedrock → S3 Knowledge Base → Vector Search 
→ Context Retrieval → LLM Response
```
