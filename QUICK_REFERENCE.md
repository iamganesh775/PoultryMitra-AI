# PoultryMitra Quick Reference Guide

## 🚀 Quick Commands

### Deploy Everything
```bash
cd infrastructure/scripts
chmod +x *.sh
./deploy-enhanced.sh prod us-east-1
```

### Test New Features
```bash
# Voice Advisory
curl -X POST $API_ENDPOINT/api/voice-advisory \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"question":"Test","language":"en"}'

# RAG Chatbot
curl -X POST $API_ENDPOINT/api/rag-chat \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"query":"What is Newcastle disease?"}'

# Predictions
curl -X POST $API_ENDPOINT/api/predictions \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"predictionType":"mortality"}'

# Notifications
curl -X POST $API_ENDPOINT/api/notifications \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"type":"test","message":"Hello"}'
```

## 📋 API Endpoints

### Original Features
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/advisory/chat` | POST | AI chatbot |
| `/api/disease/scan` | POST | Disease detection |
| `/api/farm/dashboard` | GET | Farm analytics |
| `/api/breed/recommend` | POST | Breed suggestions |
| `/api/business/plan` | POST | Business planning |
| `/api/invoice` | GET/POST/DELETE | Invoice management |
| `/api/health/schedule` | GET/POST/PUT | Health scheduler |

### New Features
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/voice-advisory` | POST | Voice responses |
| `/api/rag-chat` | POST | RAG chatbot |
| `/api/notifications` | POST | Send notification |
| `/api/notifications/subscribe` | POST | Subscribe to alerts |
| `/api/notifications` | GET | Get history |
| `/api/agent` | POST | Bedrock agent |
| `/api/predictions` | POST | AI predictions |

## 🔑 Environment Variables

### Backend (.env)
```bash
AWS_REGION=us-east-1
DYNAMODB_TABLE_PREFIX=poultry-mitra
S3_BUCKET=poultry-mitra-uploads-prod-123456789
BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
KNOWLEDGE_BASE_ID=your-kb-id
BEDROCK_AGENT_ID=your-agent-id
BEDROCK_AGENT_ALIAS_ID=your-agent-alias-id
SNS_TOPIC_ARN=arn:aws:sns:us-east-1:123456789:poultry-mitra-notifications-prod
```

### Frontend (.env)
```bash
VITE_AWS_REGION=us-east-1
VITE_USER_POOL_ID=us-east-1_xxxxxxxxx
VITE_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_API_ENDPOINT=https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod
VITE_S3_BUCKET=poultry-mitra-uploads-prod-123456789
VITE_IDENTITY_POOL_ID=us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

## 📊 AWS Services Used

### Core Services
- ✅ AWS Amplify (Frontend hosting)
- ✅ API Gateway (REST API)
- ✅ Lambda (Serverless compute)
- ✅ DynamoDB (Database)
- ✅ S3 (Storage)
- ✅ Cognito (Authentication)

### AI/ML Services
- ✅ Amazon Bedrock (Claude 3 AI)
- ✅ Bedrock Agents (Automation)
- ✅ Bedrock Knowledge Bases (RAG)
- ✅ Amazon Polly (Text-to-speech)
- ✅ AWS Rekognition (Image analysis)

### Additional Services
- ✅ Amazon SNS (Notifications)
- ✅ Amazon QuickSight (Analytics)
- ✅ CloudWatch (Monitoring)
- ✅ X-Ray (Tracing)

## 💰 Cost Estimate

### Monthly (1000 users, 10K requests)
| Service | Cost |
|---------|------|
| Lambda | $5-10 |
| DynamoDB | $2-5 |
| S3 | $1-3 |
| API Gateway | $3-5 |
| Cognito | Free |
| Bedrock | $30-50 |
| Polly | $4-8 |
| SNS | $0.50-2 |
| Rekognition | $10-15 |
| QuickSight | $9-18/user |
| **Total** | **$65-116** |

## 🎯 Feature Matrix

| Feature | Status | API | Frontend |
|---------|--------|-----|----------|
| Dashboard | ✅ | `/api/farm/dashboard` | `/dashboard` |
| AI Chat | ✅ | `/api/advisory/chat` | `/advisory` |
| Voice Chat | ✅ | `/api/voice-advisory` | `/voice-advisory` |
| RAG Chat | ✅ | `/api/rag-chat` | `/advisory` |
| Disease Scanner | ✅ | `/api/disease/scan` | `/disease-scanner` |
| Breed Recommend | ✅ | `/api/breed/recommend` | `/breed-recommendation` |
| Business Plan | ✅ | `/api/business/plan` | `/business-planner` |
| Predictions | ✅ | `/api/predictions` | `/predictions` |
| Invoices | ✅ | `/api/invoice` | `/invoices` |
| Health Schedule | ✅ | `/api/health/schedule` | `/health-scheduler` |
| Notifications | ✅ | `/api/notifications` | N/A |
| Agent | ✅ | `/api/agent` | N/A |
| PWA | ✅ | N/A | All pages |

## 🔧 Troubleshooting

### Issue: Lambda timeout
```bash
# Increase timeout in CloudFormation
Timeout: 60  # seconds
```

### Issue: Bedrock access denied
```bash
# Enable model access
AWS Console → Bedrock → Model Access → Enable Claude 3
```

### Issue: CORS errors
```bash
# Check API Gateway CORS
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET,POST,PUT,DELETE
```

### Issue: PWA not installing
```bash
# Verify HTTPS
# Check manifest.json
# Ensure service worker registered
```

## 📱 PWA Features

### Installation
1. Open app in Chrome/Edge
2. Click install prompt
3. Add to home screen

### Offline Support
- Cached pages
- Cached API responses (5 min)
- Cached images (30 days)
- Offline fallback page

### Push Notifications
- Vaccination reminders
- Disease alerts
- Production updates

## 🎓 Learning Path

### Day 1: Setup
1. Deploy infrastructure
2. Enable Bedrock models
3. Test basic features

### Day 2: AI Features
1. Setup Knowledge Base
2. Create Bedrock Agent
3. Test AI endpoints

### Day 3: Frontend
1. Deploy PWA
2. Test offline mode
3. Configure notifications

### Day 4: Analytics
1. Setup QuickSight
2. Create dashboards
3. Configure alerts

### Day 5: Optimization
1. Review costs
2. Optimize caching
3. Performance tuning

## 📞 Support Contacts

- **Documentation**: See docs/ folder
- **Issues**: GitHub Issues
- **Email**: support@poultrymitra.com

## 🔗 Useful Links

- [AWS Bedrock Docs](https://docs.aws.amazon.com/bedrock/)
- [Amazon Polly Guide](https://docs.aws.amazon.com/polly/)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Workbox Guide](https://developers.google.com/web/tools/workbox)

## ✅ Pre-Launch Checklist

- [ ] All infrastructure deployed
- [ ] Bedrock models enabled
- [ ] Knowledge Base synced
- [ ] Bedrock Agent created
- [ ] SNS topics configured
- [ ] All APIs tested
- [ ] PWA deployed
- [ ] Offline mode tested
- [ ] CloudWatch alarms set
- [ ] Cost alerts configured
- [ ] Documentation updated
- [ ] Users trained

## 🎉 Success!

You now have a fully enhanced AI-powered poultry farm management system!

**What's New:**
- 🎙️ Voice advisory
- 🧠 RAG chatbot
- 🔔 Real-time notifications
- 📈 Predictive analytics
- 🤖 Workflow automation
- 📊 Advanced analytics
- 📱 PWA support

**Next Steps:**
1. Deploy: `./deploy-enhanced.sh`
2. Test: Use curl commands above
3. Monitor: Check CloudWatch
4. Optimize: Review costs
5. Scale: Add more users

Happy farming! 🐔
