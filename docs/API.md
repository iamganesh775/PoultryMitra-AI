# PoultryMitra API Documentation

## Base URL
```
https://<api-id>.execute-api.<region>.amazonaws.com/prod
```

## Authentication
All endpoints require JWT token from Cognito in Authorization header:
```
Authorization: Bearer <jwt-token>
```

## Endpoints

### 1. AI Advisory Chat

**POST** `/api/advisory/chat`

Send message to AI advisory chatbot.

Request:
```json
{
  "message": "How do I prevent Newcastle disease?",
  "conversationId": "optional-conversation-id"
}
```

Response:
```json
{
  "conversationId": "uuid",
  "message": "AI response text"
}
```

### 2. Disease Detection

**POST** `/api/disease/scan`

Analyze poultry image for disease detection.

Request:
```json
{
  "imageKey": "disease-scans/image.jpg"
}
```

Response:
```json
{
  "id": "uuid",
  "imageUrl": "https://...",
  "disease": "Newcastle Disease",
  "confidence": 0.85,
  "recommendations": [
    "Isolate affected birds",
    "Consult veterinarian"
  ],
  "detectedAt": "2024-01-01T00:00:00Z"
}
```

### 3. Farm Dashboard

**GET** `/api/farm/dashboard`

Get farm analytics and statistics.

Response:
```json
{
  "totalBirds": 500,
  "activeBreeds": 3,
  "healthScore": 95,
  "monthlyRevenue": 5000,
  "productionData": [...],
  "recentActivities": [...]
}
```

**PUT** `/api/farm`

Update farm data.

Request:
```json
{
  "name": "My Farm",
  "location": "Location",
  "totalBirds": 500,
  "breeds": ["Rhode Island Red"]
}
```

### 4. Breed Recommendation

**POST** `/api/breed/recommend`

Get AI-powered breed recommendations.

Request:
```json
{
  "purpose": "eggs",
  "climate": "moderate",
  "experience": "beginner",
  "budget": "medium"
}
```

Response:
```json
{
  "recommendations": [
    {
      "breed": "Rhode Island Red",
      "suitability": 0.9,
      "pros": ["Hardy", "Good production"],
      "cons": ["Can be aggressive"],
      "expectedProduction": {
        "eggs": 250,
        "meat": 3.5
      }
    }
  ]
}
```

### 5. Business Planning

**POST** `/api/business/plan`

Generate business plan with AI insights.

Request:
```json
{
  "initialInvestment": 10000,
  "birdCount": 500,
  "feedCostPerBird": 5,
  "expectedEggPrice": 0.5,
  "expectedMeatPrice": 3
}
```

Response:
```json
{
  "id": "uuid",
  "monthlyExpenses": 3250,
  "projectedRevenue": 5000,
  "breakEvenMonth": 6,
  "roi": 17,
  "insights": [
    "Consider diversifying income",
    "Implement feed optimization"
  ]
}
```

### 6. Invoice Management

**GET** `/api/invoice`

Get all invoices.

**POST** `/api/invoice`

Create new invoice.

Request:
```json
{
  "type": "income",
  "category": "Egg Sales",
  "amount": 500,
  "description": "Weekly egg sales",
  "date": "2024-01-01"
}
```

**DELETE** `/api/invoice/{id}`

Delete invoice.

### 7. Health Scheduler

**GET** `/api/health/schedule`

Get vaccination schedules.

**POST** `/api/health/schedule`

Create vaccination schedule.

Request:
```json
{
  "vaccineName": "Newcastle",
  "dueDate": "2024-02-01",
  "birdCount": 500,
  "notes": "First dose"
}
```

**PUT** `/api/health/schedule/{id}`

Update schedule status.

Request:
```json
{
  "status": "completed"
}
```

## Error Responses

All errors follow this format:
```json
{
  "error": "Error message"
}
```

Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error
