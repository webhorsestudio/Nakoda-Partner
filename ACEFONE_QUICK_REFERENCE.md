# Acefone API Dialplan - Quick Reference

## 🎯 Essential Configuration

### **DID Number**
```
08065343250
```

### **Webhook URL**
```
https://yourdomain.com/api/acefone-dialplan
```

### **Request Method**
```
POST
```

### **Content Type**
```
application/json
```

## 📞 Expected Request Format
```json
{
  "uuid": "unique-call-identifier",
  "call_id": "acefone-call-id", 
  "call_to_number": "08065343250",
  "caller_id_number": "919876543210",
  "start_stamp": "2025-01-17T10:30:00Z"
}
```

## ✅ Expected Response Format
```json
[
  {
    "transfer": {
      "type": "number",
      "data": ["919326499348"],
      "ring_type": "order_by",
      "skip_active": true
    }
  }
]
```

## 🔧 Key Settings

| Setting | Value |
|---------|-------|
| **Ring Strategy** | Order By |
| **Skip Active Agents** | Yes |
| **Call Timeout** | 30 seconds |
| **Failover Action** | Play Recording |
| **Call Recording** | Enabled |
| **Webhook Retry** | 3 attempts |

## 🧪 Test Commands

### **Test Webhook**
```bash
curl -X POST https://yourdomain.com/api/acefone-dialplan \
  -H "Content-Type: application/json" \
  -d '{
    "uuid": "test-123",
    "call_id": "test-456",
    "call_to_number": "08065343250", 
    "caller_id_number": "919876543210",
    "start_stamp": "2025-01-17T10:30:00Z"
  }'
```

### **Test Application Endpoints**
```
GET /api/test-masked-calling?type=config
GET /api/test-masked-calling?type=test-dialplan
GET /api/test-masked-calling?type=test-webhook
```

## 🚨 Troubleshooting

### **Webhook Not Working**
- Check URL is publicly accessible
- Verify SSL certificate
- Check firewall settings
- Review Acefone console logs

### **Call Not Routing**
- Verify partner phone number format
- Check partner has active orders
- Ensure partner status is "active"
- Review application logs

### **Common Error Responses**
```json
// No partner found
[
  {
    "play_recording": {
      "type": "system",
      "data": "no_agent_available"
    }
  },
  {
    "hangup": {}
  }
]

// System error
[
  {
    "play_recording": {
      "type": "system", 
      "data": "system_error"
    }
  },
  {
    "hangup": {}
  }
]
```

## 📊 Monitoring

### **Check Logs**
```bash
# Application logs
tail -f /var/log/nakoda-partner/app.log

# Acefone webhook logs
# Check Acefone console > API Dialplan > Logs
```

### **Key Metrics**
- Call volume per day
- Success rate percentage
- Webhook response time
- Failover rate

## 🔐 Security Notes

- Use HTTPS only
- Validate all webhook data
- Implement rate limiting
- Monitor for abuse
- Keep logs secure

---

**Quick Start**: Use this reference while configuring your Acefone API Dialplan console.
