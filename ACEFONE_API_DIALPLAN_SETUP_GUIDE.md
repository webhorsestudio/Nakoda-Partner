# Acefone API Dialplan Configuration Guide

## 📋 Overview
This guide will help you configure the Acefone API Dialplan in their console to enable masked calling functionality for your Nakoda Partner application.

## 🔧 Prerequisites
- Acefone account with API Dialplan access
- Your DID number: `08065343250`
- Your application URL: `https://yourdomain.com` (or `http://localhost:3000` for testing)

## 📞 Step-by-Step Configuration

### Step 1: Access Acefone Console
1. Log in to your Acefone account
2. Navigate to **"API Dialplan"** section
3. Click **"Add API Dialplan"** or **"Create New Dialplan"**

### Step 2: Configure Basic Settings

#### **Dialplan Name**
```
Nakoda Partner Masked Calling
```

#### **DID Number**
```
08065343250
```
*This is the number customers will call to reach partners*

#### **Description**
```
Masked calling system for Nakoda Partner application. Routes customer calls to assigned partners through API Dialplan.
```

### Step 3: Configure API Endpoint

#### **Webhook URL**
```
https://yourdomain.com/api/acefone-dialplan
```
*Replace `yourdomain.com` with your actual domain*

#### **Request Method**
```
POST
```

#### **Content Type**
```
application/json
```

### Step 4: Configure Request Parameters

#### **Request Format**
The API Dialplan will send requests in this format:
```json
{
  "uuid": "unique-call-identifier",
  "call_id": "acefone-call-id",
  "call_to_number": "08065343250",
  "caller_id_number": "919876543210",
  "start_stamp": "2025-01-17T10:30:00Z"
}
```

#### **Expected Response Format**
Your API should respond with:
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

### Step 5: Configure Failover Settings

#### **Failover Action**
```
Play Recording
```

#### **Failover Recording**
```
no_agent_available
```
*Or create a custom recording: "Sorry, no agent is available at the moment. Please try again later."*

#### **Alternative Failover Options**
- **Hangup**: Simply hang up the call
- **IVR**: Transfer to Interactive Voice Response
- **Voicemail**: Send to voicemail system

### Step 6: Configure Call Settings

#### **Ring Strategy**
```
Order By
```
*Ring agents one by one in sequence*

#### **Skip Active Agents**
```
Yes
```
*Don't ring agents who are already on a call*

#### **Call Timeout**
```
30 seconds
```

#### **Music on Hold**
```
Default
```
*Or upload your custom music file*

### Step 7: Configure Advanced Settings

#### **Call Recording**
```
Enabled
```
*Record calls for quality assurance*

#### **Call Analytics**
```
Enabled
```
*Track call metrics and performance*

#### **Webhook Retry**
```
3 attempts
```
*Retry failed webhook calls up to 3 times*

#### **Webhook Timeout**
```
10 seconds
```

### Step 8: Test Configuration

#### **Test Webhook URL**
Before activating, test your webhook URL:
```bash
curl -X POST https://yourdomain.com/api/acefone-dialplan \
  -H "Content-Type: application/json" \
  -d '{
    "uuid": "test-uuid-123",
    "call_id": "test-call-456",
    "call_to_number": "08065343250",
    "caller_id_number": "919876543210",
    "start_stamp": "2025-01-17T10:30:00Z"
  }'
```

#### **Expected Test Response**
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

### Step 9: Activate Dialplan

1. **Review all settings** carefully
2. **Test the webhook** to ensure it's working
3. **Click "Activate"** or "Save & Activate"
4. **Note the Dialplan ID** for future reference

## 🔍 Verification Steps

### Step 1: Check API Dialplan Status
- Verify the dialplan is **Active** in Acefone console
- Check that the webhook URL is **reachable**
- Ensure the DID number is **assigned** to the dialplan

### Step 2: Test Call Flow
1. **Call the DID number** `08065343250` from a test phone
2. **Check logs** in your application for incoming webhook requests
3. **Verify call routing** to the correct partner number
4. **Test failover** by calling when no active orders exist

### Step 3: Monitor Logs
Check your application logs for:
```
📞 Acefone API Dialplan webhook received
📞 Request body: {...}
📞 Parsed data: {...}
✅ Routing call from 919876543210 to partner: 919326499348
```

## 🚨 Troubleshooting

### Common Issues

#### **Webhook Not Receiving Requests**
- Check if the webhook URL is publicly accessible
- Verify SSL certificate is valid
- Ensure firewall allows incoming requests
- Check Acefone console for webhook delivery status

#### **Call Not Routing to Partner**
- Verify partner phone number format (should include country code)
- Check if partner has active orders
- Ensure partner status is "active"
- Review application logs for routing logic

#### **Webhook Returning Errors**
- Check API response format matches expected JSON structure
- Verify all required fields are present
- Ensure proper error handling in your API
- Test webhook manually with curl

### Debug Commands

#### **Test Webhook Manually**
```bash
# Test with sample data
curl -X POST https://yourdomain.com/api/acefone-dialplan \
  -H "Content-Type: application/json" \
  -d '{
    "uuid": "debug-uuid-123",
    "call_id": "debug-call-456", 
    "call_to_number": "08065343250",
    "caller_id_number": "919876543210",
    "start_stamp": "2025-01-17T10:30:00Z"
  }'
```

#### **Check Application Logs**
```bash
# If using PM2
pm2 logs nakoda-partner

# If using Docker
docker logs nakoda-partner-container

# If using systemd
journalctl -u nakoda-partner -f
```

## 📊 Monitoring & Analytics

### Key Metrics to Monitor
- **Call Volume**: Number of calls per day/hour
- **Success Rate**: Percentage of successful call routings
- **Response Time**: Webhook response time
- **Failover Rate**: Percentage of calls that hit failover
- **Partner Availability**: Active partners vs total partners

### Recommended Monitoring Tools
- **Acefone Analytics**: Built-in call analytics
- **Application Logs**: Custom logging for debugging
- **Uptime Monitoring**: Pingdom, UptimeRobot, etc.
- **Error Tracking**: Sentry, Bugsnag, etc.

## 🔐 Security Considerations

### Webhook Security
- **HTTPS Only**: Always use HTTPS for webhook URLs
- **IP Whitelisting**: Restrict webhook access to Acefone IPs
- **Request Validation**: Validate all incoming webhook data
- **Rate Limiting**: Implement rate limiting to prevent abuse

### Data Privacy
- **Call Recording**: Ensure compliance with local laws
- **Data Retention**: Set appropriate data retention policies
- **Access Control**: Limit access to call logs and recordings
- **Encryption**: Encrypt sensitive data in transit and at rest

## 📞 Support & Resources

### Acefone Support
- **Documentation**: https://docs.acefone.in/docs/api-dialplan
- **Support Email**: support@acefone.in
- **Phone Support**: Check your Acefone console for contact details

### Application Support
- **API Documentation**: `/api/test-masked-calling?type=config`
- **Test Endpoints**: `/api/test-masked-calling?type=test-dialplan`
- **Logs**: Check application logs for detailed debugging information

## ✅ Configuration Checklist

- [ ] Acefone account created and verified
- [ ] DID number `08065343250` assigned
- [ ] API Dialplan created with correct webhook URL
- [ ] Webhook URL tested and responding correctly
- [ ] Failover settings configured
- [ ] Call settings optimized
- [ ] Dialplan activated and status is "Active"
- [ ] Test call made to verify end-to-end flow
- [ ] Monitoring and logging configured
- [ ] Security measures implemented

## 🎯 Next Steps

1. **Complete the configuration** using this guide
2. **Test the system** with a real call
3. **Monitor performance** and adjust settings as needed
4. **Train partners** on the new calling system
5. **Document any customizations** for future reference

---

**Note**: This configuration enables masked calling where customers call the DID number `08065343250` and are automatically routed to their assigned partner's actual phone number, ensuring privacy for both parties.
