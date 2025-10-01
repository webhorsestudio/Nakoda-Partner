# 📞 Acefone Masked Calling System - Setup Guide

## 🎯 **Overview**

This system implements **masked calling** using Acefone's API Dialplan feature. When customers call your DID number, the system automatically routes the call to the appropriate partner while keeping both numbers masked.

## 🔧 **System Architecture**

```
Customer → DID Number (08065343250) → Acefone → Your API → Partner
```

1. **Customer calls DID number** (08065343250)
2. **Acefone receives call** and makes HTTP request to your API Dialplan endpoint
3. **Your API determines** which partner to route the call to
4. **Acefone connects** the call using your DID as the bridge
5. **Both parties see DID number** - their real numbers remain hidden

## 📋 **Setup Steps**

### **Step 1: Database Setup**

Run the database migration to create the call logs table:

```sql
-- Run this migration in your Supabase SQL editor
-- File: migration-create-call-logs.sql
```

### **Step 2: Environment Variables**

Add these to your `.env.local` file:

```bash
# Your app URL (for webhook endpoints)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Webhook secret for security
ACEFONE_WEBHOOK_SECRET=your_webhook_secret_here
```

### **Step 3: Acefone Dashboard Configuration**

#### **3.1 Configure API Dialplan**

1. **Login** to your Acefone dashboard
2. Navigate to **"API Connect"** → **"API Dialplan"**
3. Click **"Add API Dialplan"**
4. Fill in the details:

| Field | Value |
|-------|-------|
| **Name** | Nakoda Partner Routing |
| **Description** | Routes customer calls to assigned partners |
| **URL** | `http://localhost:3000/api/acefone-dialplan` |
| **Request Method** | `POST` |
| **Failover Destination** | `voicemail` |

#### **3.2 Configure Webhook (Optional)**

1. Navigate to **"API Connect"** → **"Webhook"**
2. Add webhook configuration:

| Field | Value |
|-------|-------|
| **Webhook URL** | `http://localhost:3000/api/acefone-webhook` |
| **Events** | Call Status Updates |
| **Secret** | `your_webhook_secret_here` |

### **Step 4: Test the System**

#### **4.1 Test Configuration**

Visit: `http://localhost:3000/api/test-masked-calling?type=config`

#### **4.2 Test API Dialplan**

Visit: `http://localhost:3000/api/test-masked-calling?type=dialplan`

#### **4.3 Test Webhook**

Visit: `http://localhost:3000/api/test-masked-calling?type=webhook`

#### **4.4 Test Call Now Button**

1. Go to `/partner/ongoing` page
2. Click **"Call Now"** button on any task card
3. Verify DID number is copied to clipboard
4. Toast notification should show success message

## 🔄 **Call Flow Process**

### **1. Partner Clicks "Call Now"**

```typescript
// Button shows DID number to customer
const didNumber = '08065343250';
navigator.clipboard.writeText(didNumber);
toast.success('DID Number copied! Customer should call: 08065343250');
```

### **2. Customer Calls DID Number**

Customer dials `08065343250` on their phone.

### **3. Acefone Calls Your API**

```json
POST /api/acefone-dialplan
{
  "uuid": "call-uuid-123",
  "call_id": "call-id-456", 
  "call_to_number": "08065343250",
  "caller_id_number": "9876543210",
  "start_stamp": "2025-01-17T10:30:00Z"
}
```

### **4. Your API Routes the Call**

```typescript
// System looks up partner for customer
const partnerPhone = await findPartnerForCustomer('9876543210');

// Returns transfer response
return [{
  "transfer": {
    "type": "number",
    "data": [partnerPhone],
    "ring_type": "order_by",
    "skip_active": true
  }
}];
```

### **5. Call Status Updates**

```json
POST /api/acefone-webhook
{
  "call_id": "call-id-456",
  "call_status": "completed",
  "duration": "300",
  "hangup_cause": "NORMAL_CLEARING"
}
```

## 🎯 **Call Routing Logic**

The system uses a **3-tier routing strategy**:

### **Tier 1: Active Orders**
- Looks for orders with status `assigned` or `in-progress`
- Partner completion status is not `completed`
- Partner status is `active`

### **Tier 2: Recent Orders**
- Looks for orders from the last 7 days
- Partner status is `active`

### **Tier 3: Any Orders**
- Looks for any order with the customer's phone number
- Partner status is `active`

## 📊 **Call Logging**

All calls are logged in the `call_logs` table with:

- **Call identifiers**: `call_id`, `uuid`
- **Participants**: `caller_number`, `called_number`
- **Routing info**: `partner_id`, `order_id`
- **Call details**: `status`, `duration`, `call_quality`
- **Timestamps**: `start_time`, `end_time`

## 🔧 **API Endpoints**

### **API Dialplan Endpoint**
- **URL**: `/api/acefone-dialplan`
- **Method**: `POST`
- **Purpose**: Main routing endpoint called by Acefone
- **Test**: `GET /api/acefone-dialplan?test=true`

### **Webhook Endpoint**
- **URL**: `/api/acefone-webhook`
- **Method**: `POST`
- **Purpose**: Receives call status updates
- **Test**: `GET /api/acefone-webhook?test=true`

### **Test Endpoint**
- **URL**: `/api/test-masked-calling`
- **Method**: `GET`
- **Purpose**: System testing and verification
- **Tests**: `?type=config|dialplan|webhook|button`

## 🚨 **Troubleshooting**

### **Common Issues**

1. **"No destination found"**
   - Check if customer has active orders
   - Verify partner phone numbers are correct
   - Check partner status is `active`

2. **"API Dialplan not responding"**
   - Verify endpoint URL in Acefone dashboard
   - Check server logs for errors
   - Test endpoint manually

3. **"Webhook not receiving updates"**
   - Verify webhook URL in Acefone dashboard
   - Check webhook secret configuration
   - Test webhook manually

### **Debug Steps**

1. **Check logs**: Look at server console for API calls
2. **Test endpoints**: Use test endpoints to verify functionality
3. **Verify database**: Check `call_logs` table for entries
4. **Check configuration**: Verify Acefone dashboard settings

## 📈 **Monitoring**

### **Active Calls View**
```sql
SELECT * FROM active_calls;
```

### **Call Statistics**
```sql
SELECT * FROM call_statistics;
```

### **Partner Call Logs**
```sql
SELECT * FROM get_partner_call_logs(partner_id);
```

## 🔒 **Security**

- **Webhook Secret**: Optional but recommended for webhook security
- **Row Level Security**: Enabled on call_logs table
- **Input Validation**: All inputs validated with Zod schemas
- **Error Handling**: Graceful fallbacks on API failures

## 🎉 **Success Indicators**

✅ **System Ready**: All endpoints responding correctly  
✅ **Database**: Call logs table created and accessible  
✅ **Configuration**: Acefone dashboard configured  
✅ **Button**: Call Now button copies DID number  
✅ **Routing**: Calls routed to correct partners  
✅ **Logging**: Call status updates received  

## 📞 **Next Steps**

1. **Deploy to production** with proper environment variables
2. **Update Acefone dashboard** with production URLs
3. **Monitor call logs** for system performance
4. **Enhance routing logic** based on business requirements
5. **Add call analytics** and reporting features

---

**Need Help?** Check the test endpoint: `/api/test-masked-calling` for system status and debugging information.