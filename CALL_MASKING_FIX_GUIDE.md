# 📞 Fixed Call Masking System - Setup Guide

## 🚨 **Issues Fixed**

### **Previous Problems:**
1. ❌ **Wrong API**: Using Click-to-Call API instead of proper call masking
2. ❌ **DID Format**: Missing leading `0` in DID number (`8065343250` → `08065343250`)
3. ❌ **No API Dialplan**: Missing proper API Dialplan configuration
4. ❌ **Call Logs**: Not generating due to incorrect implementation

### **Solutions Implemented:**
1. ✅ **Proper Call Masking**: Partner calls DID number, system routes to customer
2. ✅ **Correct DID Format**: Fixed to `08065343250`
3. ✅ **API Dialplan**: Created proper webhook endpoint for call routing
4. ✅ **Call Logging**: Fixed database logging for all calls

## 🔧 **How It Works Now**

### **New Call Flow:**
```
1. Partner clicks "Call Now" button
2. System logs call in database
3. DID number (08065343250) is copied to clipboard
4. Partner calls DID number on their phone
5. Acefone receives call and calls your API Dialplan
6. API determines which customer to route to
7. Call is transferred to customer
8. Both parties see DID number (masking achieved)
```

## 📋 **Setup Steps**

### **Step 1: Environment Variables**

Add these to your `.env.local` file:

```bash
# Acefone API Credentials
ACEFONE_API_TOKEN=your_api_token_here
ACEFONE_USERNAME=your_username_here
ACEFONE_PASSWORD=your_password_here

# Your app URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### **Step 2: Database Setup**

Run this migration in your Supabase SQL editor:

```sql
-- Create call_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.call_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id VARCHAR(50) NOT NULL UNIQUE,
    uuid VARCHAR(50) UNIQUE,
    
    -- Caller and Called Information
    caller_number VARCHAR(20),
    called_number VARCHAR(20),
    
    -- Partner and Customer Information
    partner_id INTEGER REFERENCES public.partners(id) ON DELETE SET NULL,
    partner_phone VARCHAR(20),
    customer_phone VARCHAR(20),
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    
    -- Call Details
    call_type VARCHAR(30) NOT NULL DEFAULT 'partner_to_customer',
    status VARCHAR(20) NOT NULL DEFAULT 'initiated',
    virtual_number VARCHAR(20), -- DID number
    
    -- Timing Information
    start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER, -- Duration in seconds
    
    -- Call Quality and Notes
    call_quality VARCHAR(20) DEFAULT 'unknown',
    notes TEXT,
    
    -- Transfer Information
    transfer_type VARCHAR(30),
    transfer_destination VARCHAR(20),
    failover_used BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_call_logs_call_id ON public.call_logs(call_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_uuid ON public.call_logs(uuid);
CREATE INDEX IF NOT EXISTS idx_call_logs_partner_id ON public.call_logs(partner_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_order_id ON public.call_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_caller_number ON public.call_logs(caller_number);
```

### **Step 3: Acefone Dashboard Configuration**

#### **3.1 Configure API Dialplan**

1. **Login** to your Acefone dashboard
2. Navigate to **"API Connect"** → **"API Dialplan"**
3. Click **"Add API Dialplan"**
4. Fill in the details:

| Field | Value |
|-------|-------|
| **Name** | Nakoda Partner Masked Calling |
| **Description** | Routes partner calls to assigned customers |
| **URL** | `https://yourdomain.com/api/acefone-dialplan` |
| **Request Method** | `POST` |
| **Failover Destination** | `voicemail` |

#### **3.2 Configure DID Number**

1. **Assign DID Number**: `08065343250` to the API Dialplan
2. **Enable Call Recording**: Optional but recommended
3. **Set Call Timeout**: 30 seconds
4. **Ring Strategy**: Order By

### **Step 4: Test the System**

#### **4.1 Test API Endpoints**

Visit these URLs to test:

```
GET /api/acefone-masked-call
GET /api/acefone-dialplan
```

#### **4.2 Test Call Flow**

1. Go to `/partner/ongoing` page
2. Click **"Call Now"** button on any task card
3. Verify DID number is copied to clipboard
4. Call the DID number from your phone
5. Check if call routes to customer

## 🔄 **New Call Process**

### **1. Partner Clicks "Call Now"**

```typescript
// Button now shows:
toast.success('Masked call setup complete! DID number copied to clipboard. Call 08065343250 to connect to customer.');
```

### **2. Partner Calls DID Number**

Partner dials `08065343250` on their phone.

### **3. Acefone Calls Your API**

```json
POST /api/acefone-dialplan
{
  "uuid": "call-uuid-123",
  "call_id": "call-id-456", 
  "call_to_number": "08065343250",
  "caller_id_number": "919876543210",
  "start_stamp": "2025-01-17T10:30:00Z"
}
```

### **4. Your API Routes the Call**

```typescript
// System looks up partner and finds their active orders
const partner = await findPartnerByPhone('919876543210');
const activeOrders = await findActiveOrdersByPartnerId(partner.id);
const selectedOrder = selectBestOrderToCall(activeOrders);

// Returns transfer response
return [{
  "transfer": {
    "type": "number",
    "data": [customerPhone],
    "ring_type": "order_by",
    "skip_active": true
  }
}];
```

### **5. Call Connected**

- Partner and customer are connected
- Both see DID number `08065343250`
- Call is logged in database

## 📊 **Call Logging**

All calls are now properly logged in the `call_logs` table with:

- **Call identifiers**: `call_id`, `uuid`
- **Participants**: `caller_number`, `called_number`
- **Routing info**: `partner_id`, `order_id`
- **Call details**: `status`, `duration`, `call_quality`
- **Timestamps**: `start_time`, `end_time`
- **Metadata**: Partner name, order number, customer name

## 🚨 **Troubleshooting**

### **Common Issues**

1. **"Your number is invalid"**
   - Check if DID number is correctly configured in Acefone
   - Verify API Dialplan is active
   - Check webhook URL is accessible

2. **Call not routing to customer**
   - Verify partner has active orders
   - Check partner phone number format
   - Ensure partner status is "active"

3. **Call logs not generating**
   - Check database connection
   - Verify call_logs table exists
   - Check API endpoint logs

### **Debug Steps**

1. **Check logs**: Look at server console for API calls
2. **Test endpoints**: Use test endpoints to verify functionality
3. **Verify database**: Check `call_logs` table for entries
4. **Check configuration**: Verify Acefone dashboard settings

## ✅ **Success Indicators**

- ✅ **Button**: Call Now button copies DID number
- ✅ **Database**: Call logs are being created
- ✅ **Routing**: Calls route to correct customers
- ✅ **Masking**: Both parties see DID number
- ✅ **Logging**: All calls are tracked

## 🎯 **Next Steps**

1. **Deploy to production** with proper environment variables
2. **Update Acefone dashboard** with production URLs
3. **Test with real calls** to verify end-to-end flow
4. **Monitor call logs** for system performance
5. **Train partners** on the new calling process

---

**The call masking system is now properly implemented and should work correctly!**
