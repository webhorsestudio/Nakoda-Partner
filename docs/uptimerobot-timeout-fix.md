# UptimeRobot Timeout Fix Guide
# Complete solution for FUNCTION_INVOCATION_TIMEOUT errors

## 🚨 **Problem Identified**

**Issue**: UptimeRobot showing "Connection Timeout" with `FUNCTION_INVOCATION_TIMEOUT` error  
**Root Cause**: Global Sync process taking longer than 30 seconds to complete  
**Impact**: UptimeRobot marks monitor as "Down"  

---

## ✅ **Solutions Implemented**

### **1. Increased Vercel Timeout**
```json
// vercel.json
{
  "functions": {
    "src/app/api/orders/global-sync/route.ts": {
      "maxDuration": 60  // Increased from 30 to 60 seconds
    }
  }
}
```

### **2. Added Timeout Protection**
- **GET endpoint**: 45-second timeout with graceful fallback
- **POST endpoint**: 50-second timeout with error handling
- **Promise.race()**: Prevents hanging requests

### **3. Created Health Check Endpoint**
- **New endpoint**: `/api/orders/global-sync-health`
- **Purpose**: Fast status check without triggering sync
- **Response time**: < 1 second

---

## 🔧 **Immediate Actions Required**

### **Step 1: Update UptimeRobot Monitor**
1. **Go to UptimeRobot Dashboard**
2. **Edit your existing monitor**
3. **Change URL to**: `https://nakoda-partner.vercel.app/api/orders/global-sync-health`
4. **Keep other settings the same**
5. **Save changes**

### **Step 2: Wait for Deployment**
- **Vercel will deploy** the changes automatically
- **Wait 2-3 minutes** for deployment to complete
- **Test the new endpoint** manually

### **Step 3: Test New Endpoint**
```bash
# Test health check endpoint (fast)
curl https://nakoda-partner.vercel.app/api/orders/global-sync-health

# Expected response:
{
  "success": true,
  "message": "Global sync service is healthy",
  "data": {
    "status": { "isRunning": true, "lastSync": "..." },
    "stats": { "isRunning": true, "lastSync": "..." },
    "timestamp": "2025-01-17T10:30:00.000Z"
  }
}
```

---

## 🎯 **Two-Monitor Strategy (Recommended)**

### **Monitor 1: Health Check (Primary)**
```
Monitor Type: HTTP(s)
Friendly Name: Nakoda Global Sync Health
URL: https://nakoda-partner.vercel.app/api/orders/global-sync-health
Monitoring Interval: 5 minutes
Monitor Timeout: 10 seconds
```

### **Monitor 2: Full Sync (Secondary)**
```
Monitor Type: HTTP(s)
Friendly Name: Nakoda Global Sync Full
URL: https://nakoda-partner.vercel.app/api/orders/global-sync
Monitoring Interval: 15 minutes
Monitor Timeout: 60 seconds
```

**Benefits**:
- ✅ **Health Check**: Fast, reliable monitoring
- ✅ **Full Sync**: Actual sync testing
- ✅ **Redundancy**: Two different monitoring approaches
- ✅ **Free Tier**: Both monitors fit in free account

---

## 📊 **Expected Results**

### **Health Check Monitor**
- **Status**: "Up" (green)
- **Response Time**: < 1 second
- **Uptime**: 99%+
- **Purpose**: Service availability

### **Full Sync Monitor**
- **Status**: "Up" (green) or occasional "Down" (if sync takes too long)
- **Response Time**: 10-60 seconds
- **Purpose**: Actual sync functionality

---

## 🚨 **Troubleshooting**

### **Issue 1: Health Check Still Failing**
**Possible Causes**:
- Deployment not complete
- Server issues
- Network problems

**Solutions**:
1. Wait 5 minutes for deployment
2. Test endpoint manually
3. Check Vercel deployment logs

### **Issue 2: Full Sync Still Timing Out**
**Possible Causes**:
- Bitrix24 API slow response
- Database connection issues
- Large data volumes

**Solutions**:
1. Check Bitrix24 API status
2. Review database performance
3. Consider reducing sync frequency

### **Issue 3: Both Monitors Down**
**Possible Causes**:
- Server down
- DNS issues
- Vercel deployment failed

**Solutions**:
1. Check Vercel dashboard
2. Verify domain accessibility
3. Check deployment logs

---

## 📈 **Performance Optimization**

### **1. Sync Frequency Adjustment**
- **Health Check**: Every 5 minutes (fast)
- **Full Sync**: Every 15 minutes (thorough)
- **GitHub Actions**: Every 5 minutes (backup)

### **2. Timeout Settings**
- **Health Check**: 10 seconds timeout
- **Full Sync**: 60 seconds timeout
- **Vercel Function**: 60 seconds max duration

### **3. Error Handling**
- **Graceful timeouts**: Return status even if sync fails
- **Detailed logging**: Track performance metrics
- **Fallback responses**: Always return valid JSON

---

## 🎉 **Success Indicators**

Your setup is working correctly when:

✅ **Health Check Monitor**: "Up" status, < 1 second response  
✅ **Full Sync Monitor**: "Up" status, < 60 seconds response  
✅ **No Timeout Errors**: FUNCTION_INVOCATION_TIMEOUT resolved  
✅ **Orders Syncing**: Database shows new orders  
✅ **UptimeRobot Alerts**: No failure notifications  

---

## 🔄 **Next Steps**

1. **Update UptimeRobot** to use health check endpoint
2. **Wait for deployment** to complete
3. **Test both endpoints** manually
4. **Monitor for 24 hours** to ensure stability
5. **Set up second monitor** for full sync testing

---

## 💡 **Pro Tips**

### **1. Monitor Both Endpoints**
- **Health Check**: For service availability
- **Full Sync**: For actual functionality
- **Different intervals**: Optimize for each purpose

### **2. Use GitHub Actions as Backup**
- **Free tier**: 2000 minutes/month
- **Reliable**: Runs every 5 minutes
- **Redundancy**: Multiple sync sources

### **3. Monitor Performance**
- **Response times**: Track trends
- **Success rates**: Monitor reliability
- **Error patterns**: Identify issues early

---

## 🎯 **Quick Fix Summary**

**Problem**: UptimeRobot timeout due to slow sync  
**Solution**: Health check endpoint + timeout protection  
**Result**: Reliable 24/7 monitoring + actual sync testing  
**Cost**: $0 (free tier)  
**Setup Time**: 5 minutes  

Your Global Sync system will now work reliably with UptimeRobot! 🚀
