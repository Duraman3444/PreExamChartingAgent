# n8n Workflow Setup Guide 🔧

*Complete setup and configuration guide for n8n workflow automation in the Pre-Examination Charting Agent.*

---

## Overview

This guide provides step-by-step instructions for setting up, configuring, and managing n8n workflows for automated visit transcript processing and EHR integration in the medical charting application.

## Prerequisites

### System Requirements
- **n8n Version**: 1.0.0 or higher
- **Node.js**: 18.x or higher
- **Memory**: Minimum 2GB RAM
- **Storage**: 5GB free space
- **Network**: Stable internet connection for API calls

### Required API Keys and Credentials
- **OpenAI API Key**: For GPT-4o-mini integration
- **EHR System API**: Authentication credentials for your EHR system
- **Slack Bot Token**: For notification integration
- **Firebase Admin SDK**: For database operations (optional)

---

## Installation and Setup

### 1. Install n8n

#### Option A: Docker (Recommended)
```bash
# Create n8n directory
mkdir n8n-medical-workflows
cd n8n-medical-workflows

# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=your_secure_password
      - N8N_HOST=localhost
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - WEBHOOK_URL=http://localhost:5678/
      - N8N_METRICS=true
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  n8n_data:
    driver: local
EOF

# Start n8n
docker-compose up -d
```

#### Option B: NPM Installation
```bash
# Install n8n globally
npm install -g n8n

# Start n8n
n8n start

# Access at http://localhost:5678
```

### 2. Initial Configuration

1. **Access n8n Interface**: Open http://localhost:5678
2. **Create Admin Account**: Set up your admin credentials
3. **Configure Basic Settings**:
   - Set timezone to your healthcare facility's timezone
   - Configure webhook base URL
   - Set up execution timeout (300 seconds recommended)

---

## Credential Configuration

### 1. OpenAI Credentials

1. Go to **Settings** → **Credentials**
2. Click **Add Credential**
3. Select **OpenAI**
4. Enter your OpenAI API key
5. Test the connection
6. Save as "OpenAI-Medical"

### 2. HTTP Authentication (EHR System)

1. Add new credential
2. Select **HTTP Header Auth** or **HTTP Basic Auth**
3. Configure based on your EHR system:
   - **Header Auth**: Authorization: Bearer {your-token}
   - **Basic Auth**: Username and password
4. Save as "EHR-System-Auth"

### 3. Slack Integration

1. Add new credential
2. Select **Slack**
3. Enter your Slack Bot Token
4. Select the workspace
5. Test the connection
6. Save as "Slack-Medical-Notifications"

---

## Workflow Import and Configuration

### 1. Import the Medical Workflow

1. **Create New Workflow**: Click the "+" button
2. **Import Workflow**: Use the JSON provided in `docs/automation-workflows.md`
3. **Configure Nodes**: Update each node with your specific settings

### 2. Node Configuration Details

#### Webhook Trigger Node
```json
{
  "parameters": {
    "httpMethod": "POST",
    "path": "patient-charting",
    "responseMode": "onReceived",
    "options": {
      "rawBody": true
    }
  }
}
```

**Configuration Steps:**
1. Set the webhook path to `patient-charting`
2. Configure authentication if needed
3. Note the webhook URL for your EHR system

#### Get Visit Transcript Node
```json
{
  "parameters": {
    "authentication": "predefinedCredentialType",
    "nodeCredentialType": "httpHeaderAuth",
    "url": "={{ $json.ehrApiUrl }}/patients/{{$json.patientId}}/visits/{{$json.visitId}}/transcript",
    "options": {
      "timeout": 30000
    }
  }
}
```

**Configuration Steps:**
1. Select your EHR system credentials
2. Update the URL pattern to match your EHR API
3. Set appropriate timeout values

#### OpenAI Summarization Node
```json
{
  "parameters": {
    "model": "gpt-4o-mini",
    "temperature": 0.2,
    "maxTokens": 1000,
    "messages": [
      {
        "role": "system",
        "content": "You are a medical assistant. Summarize the patient visit transcript and provide concise chart notes and next nursing steps. Format your response with clear sections: VISIT SUMMARY, KEY FINDINGS, NEXT STEPS."
      },
      {
        "role": "user",
        "content": "={{$node[\"Extract Transcript\"].json.transcript}}"
      }
    ]
  }
}
```

**Configuration Steps:**
1. Select your OpenAI credentials
2. Adjust temperature and max tokens as needed
3. Customize the system prompt for your specific needs

#### EHR Update Node
```json
{
  "parameters": {
    "authentication": "predefinedCredentialType",
    "nodeCredentialType": "httpHeaderAuth",
    "url": "={{ $json.ehrApiUrl }}/patients/{{$json.patientId}}/visits/{{$json.visitId}}/chart",
    "method": "PATCH",
    "sendBody": true,
    "bodyContentType": "json",
    "jsonBody": "={{ { \"chartNotes\": $json.chartSummary, \"nursingInstructions\": $json.nextSteps, \"processedAt\": new Date().toISOString() } }}"
  }
}
```

**Configuration Steps:**
1. Configure EHR system authentication
2. Update API endpoints to match your EHR
3. Adjust payload structure as needed

#### Slack Notification Node
```json
{
  "parameters": {
    "authentication": "oAuth2",
    "channel": "#nursing-updates",
    "text": "📋 Patient {{$json.patientId}} visit {{$json.visitId}} chart updated.\n\n*Next nursing steps:*\n{{$json.nextSteps}}\n\n_Processed automatically at {{new Date().toLocaleString()}}_",
    "otherOptions": {
      "includeLinkToWorkflow": true
    }
  }
}
```

**Configuration Steps:**
1. Select your Slack credentials
2. Configure the target channel
3. Customize message templates

---

## Testing and Validation

### 1. Test Webhook Endpoint

```bash
# Test webhook trigger
curl -X POST http://localhost:5678/webhook/patient-charting \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "12345",
    "visitId": "67890",
    "ehrApiUrl": "https://your-ehr-system.com/api"
  }'
```

### 2. Test Individual Nodes

1. **Manual Execution**: Use n8n's manual execution feature
2. **Test Data**: Create sample patient data for testing
3. **Debug Mode**: Enable debug mode to see data flow
4. **Error Handling**: Test error scenarios

### 3. Validation Checklist

- [ ] Webhook receives and processes requests
- [ ] EHR API connections work correctly
- [ ] OpenAI integration produces quality summaries
- [ ] Slack notifications are delivered
- [ ] Error handling works as expected
- [ ] Performance meets requirements (< 60 seconds total)

---

## Production Deployment

### 1. Environment Configuration

Create production environment variables:

```bash
# .env file for production
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=your_secure_production_password
N8N_HOST=your-domain.com
N8N_PORT=443
N8N_PROTOCOL=https
WEBHOOK_URL=https://your-domain.com/
N8N_METRICS=true
N8N_LOG_LEVEL=info
N8N_EXECUTIONS_TIMEOUT=300
N8N_EXECUTIONS_TIMEOUT_MAX=600
```

### 2. SSL/TLS Configuration

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    restart: unless-stopped
    ports:
      - "443:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=${N8N_BASIC_AUTH_USER}
      - N8N_BASIC_AUTH_PASSWORD=${N8N_BASIC_AUTH_PASSWORD}
      - N8N_HOST=${N8N_HOST}
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=https://${N8N_HOST}/
      - N8N_METRICS=true
    volumes:
      - n8n_data:/home/node/.n8n
      - ./ssl:/etc/ssl:ro
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    restart: unless-stopped
    environment:
      - POSTGRES_USER=n8n
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=n8n
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  n8n_data:
  postgres_data:
```

### 3. Database Configuration

For production, configure PostgreSQL:

```bash
# Add to environment variables
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=postgres
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=n8n
DB_POSTGRESDB_USER=n8n
DB_POSTGRESDB_PASSWORD=your_secure_db_password
```

---

## Monitoring and Maintenance

### 1. Health Monitoring

Create a health check workflow:

```json
{
  "name": "Health Check",
  "nodes": [
    {
      "parameters": {
        "cron": "*/5 * * * *",
        "triggerAtStartup": true
      },
      "name": "Every 5 minutes",
      "type": "n8n-nodes-base.cron",
      "position": [240, 300]
    },
    {
      "parameters": {
        "url": "http://localhost:5678/healthz",
        "options": {}
      },
      "name": "Health Check",
      "type": "n8n-nodes-base.httpRequest",
      "position": [440, 300]
    }
  ]
}
```

### 2. Performance Monitoring

Key metrics to monitor:
- **Execution Time**: Average workflow execution time
- **Success Rate**: Percentage of successful executions
- **Error Rate**: Failed executions per hour
- **API Response Times**: EHR and OpenAI API performance

### 3. Alerting Setup

Configure alerts for:
- Workflow failures
- API timeouts
- High error rates
- System resource usage

### 4. Log Management

```bash
# View n8n logs
docker-compose logs -f n8n

# Export logs for analysis
docker-compose logs n8n > n8n-logs.txt
```

---

## Security Considerations

### 1. Access Control

- **Authentication**: Always enable basic auth or OAuth
- **Network Security**: Use VPN or private networks
- **Credential Management**: Rotate API keys regularly
- **Audit Logging**: Enable comprehensive logging

### 2. Data Protection

- **Encryption**: Encrypt data in transit and at rest
- **PHI Handling**: Ensure HIPAA compliance
- **Data Retention**: Configure appropriate retention policies
- **Backup Security**: Secure backup storage

### 3. Compliance

- **HIPAA**: Ensure all data handling meets HIPAA requirements
- **Audit Trails**: Maintain complete audit logs
- **Data Minimization**: Process only necessary data
- **Access Logs**: Log all access to patient data

---

## Troubleshooting

### Common Issues

#### 1. Webhook Not Triggering
- **Check URL**: Verify webhook URL is correct
- **Check Authentication**: Ensure proper auth headers
- **Check Payload**: Verify JSON structure
- **Check Logs**: Review n8n execution logs

#### 2. EHR API Connection Failures
- **Check Credentials**: Verify API keys and tokens
- **Check Network**: Ensure n8n can reach EHR system
- **Check Rate Limits**: Verify API rate limit compliance
- **Check Timeouts**: Increase timeout values if needed

#### 3. OpenAI API Errors
- **Check API Key**: Verify OpenAI API key validity
- **Check Usage**: Monitor API usage limits
- **Check Model**: Ensure model availability
- **Check Prompt**: Verify prompt length and format

#### 4. Slack Notification Failures
- **Check Bot Token**: Verify Slack bot token
- **Check Permissions**: Ensure bot has channel permissions
- **Check Channel**: Verify channel exists
- **Check Message Format**: Ensure valid message structure

### Debug Process

1. **Enable Debug Mode**: Turn on detailed logging
2. **Check Execution History**: Review past executions
3. **Test Individual Nodes**: Isolate problematic nodes
4. **Review Error Messages**: Analyze error details
5. **Check External Services**: Verify third-party service status

---

## Workflow Optimization

### 1. Performance Optimization

- **Parallel Processing**: Use parallel branches where possible
- **Caching**: Implement result caching for repeated requests
- **Batch Processing**: Process multiple items together
- **Resource Limits**: Configure appropriate resource limits

### 2. Error Handling

```json
{
  "parameters": {
    "rules": [
      {
        "type": "expression",
        "expression": "{{ $json.error }}",
        "output": 1
      }
    ]
  },
  "name": "Error Handling",
  "type": "n8n-nodes-base.if",
  "position": [640, 300]
}
```

### 3. Retry Logic

```json
{
  "parameters": {
    "maxTries": 3,
    "waitBetweenTries": 1000,
    "errorOutput": "continue"
  },
  "name": "Retry on Failure",
  "type": "n8n-nodes-base.httpRequest",
  "position": [840, 300]
}
```

---

## Advanced Configuration

### 1. Custom Functions

Create custom JavaScript functions for complex data processing:

```javascript
// Custom data transformation function
function transformMedicalData(items) {
  return items.map(item => ({
    patientId: item.json.patientId,
    visitId: item.json.visitId,
    summary: item.json.transcript.substring(0, 500),
    priority: calculatePriority(item.json),
    processedAt: new Date().toISOString()
  }));
}

function calculatePriority(data) {
  // Implement priority calculation logic
  const urgentKeywords = ['emergency', 'critical', 'urgent'];
  const summary = data.transcript.toLowerCase();
  
  return urgentKeywords.some(keyword => 
    summary.includes(keyword)
  ) ? 'high' : 'normal';
}

return transformMedicalData($input.all());
```

### 2. Conditional Logic

```json
{
  "parameters": {
    "conditions": {
      "string": [
        {
          "value1": "={{$json.priority}}",
          "operation": "equal",
          "value2": "high"
        }
      ]
    }
  },
  "name": "Check Priority",
  "type": "n8n-nodes-base.if",
  "position": [1040, 300]
}
```

### 3. Dynamic Routing

Configure dynamic routing based on patient data:

```json
{
  "parameters": {
    "mode": "expression",
    "output": "={{$json.department === 'emergency' ? 0 : 1}}"
  },
  "name": "Route by Department",
  "type": "n8n-nodes-base.switch",
  "position": [1240, 300]
}
```

---

## Backup and Recovery

### 1. Workflow Backup

```bash
# Export all workflows
curl -X GET "http://localhost:5678/api/v1/workflows" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  > workflows-backup.json

# Export specific workflow
curl -X GET "http://localhost:5678/api/v1/workflows/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  > workflow-1-backup.json
```

### 2. Database Backup

```bash
# PostgreSQL backup
docker exec postgres pg_dump -U n8n n8n > n8n-backup.sql

# Restore from backup
docker exec -i postgres psql -U n8n n8n < n8n-backup.sql
```

### 3. Credential Backup

**Important**: Store credentials securely and separately from workflow backups.

---

## Integration with Medical Systems

### 1. HL7 FHIR Integration

```json
{
  "parameters": {
    "url": "https://fhir.ehr-system.com/Patient/{{$json.patientId}}",
    "authentication": "predefinedCredentialType",
    "nodeCredentialType": "httpHeaderAuth",
    "options": {
      "headers": {
        "Accept": "application/fhir+json",
        "Content-Type": "application/fhir+json"
      }
    }
  },
  "name": "FHIR Patient Lookup",
  "type": "n8n-nodes-base.httpRequest"
}
```

### 2. Medical Device Integration

```json
{
  "parameters": {
    "url": "https://device-api.hospital.com/vitals/{{$json.deviceId}}",
    "authentication": "predefinedCredentialType",
    "options": {
      "headers": {
        "X-Device-Token": "{{$credentials.deviceToken}}"
      }
    }
  },
  "name": "Get Device Data",
  "type": "n8n-nodes-base.httpRequest"
}
```

---

## Compliance and Audit

### 1. Audit Logging

Enable comprehensive audit logging:

```json
{
  "parameters": {
    "functionCode": "// Log all workflow executions\nconst auditLog = {\n  workflowId: $workflow.id,\n  executionId: $execution.id,\n  patientId: $json.patientId,\n  action: 'transcript_processing',\n  timestamp: new Date().toISOString(),\n  user: $json.userId,\n  result: 'success'\n};\n\n// Send to audit system\nreturn [{json: auditLog}];"
  },
  "name": "Audit Logger",
  "type": "n8n-nodes-base.function"
}
```

### 2. Data Retention

Configure automatic data cleanup:

```json
{
  "parameters": {
    "cron": "0 0 * * 0",
    "triggerAtStartup": false
  },
  "name": "Weekly Cleanup",
  "type": "n8n-nodes-base.cron"
}
```

---

This comprehensive guide provides everything needed to set up, configure, and maintain n8n workflows for the medical charting application. Regular updates to this document will ensure it remains current with evolving requirements and best practices. 