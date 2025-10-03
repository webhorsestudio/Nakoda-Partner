# UptimeRobot Free Account Setup Guide
# Complete setup for Global Order Sync using UptimeRobot free tier

## 🎯 **Free Account Setup (No Advanced Settings Needed)**

### **Step 1: Basic UptimeRobot Configuration**
1. Go to **https://uptimerobot.com/**
2. Login with your existing account
3. Click **"+ Add New Monitor"**
4. Configure as follows:

```
Monitor Type: HTTP(s)
Friendly Name: Nakoda Global Order Sync
URL: https://yourdomain.com/api/orders/global-sync
Monitoring Interval: 5 minutes
Monitor Timeout: 30 seconds
```

**That's it!** No Advanced Settings required.

### **Step 2: Why This Works Perfectly**

✅ **Your API endpoint handles GET requests** (UptimeRobot's default)  
✅ **GET requests trigger the same sync process** as POST requests  
✅ **No custom headers needed** for basic functionality  
✅ **Free account provides all necessary monitoring**  

### **Step 3: What Happens**

1. **UptimeRobot makes GET requests** every 5 minutes
2. **Your API endpoint receives the request**
3. **Global sync is triggered automatically**
4. **Orders are synced from Bitrix24**
5. **Success/failure is reported back to UptimeRobot**

---

## 🧪 **Testing Your Setup**

### **Test 1: Manual API Test**
```bash
# Test with GET request (UptimeRobot's default)
curl https://yourdomain.com/api/orders/global-sync

# Expected response:
{
  "success": true,
  "message": "Global sync completed successfully",
  "data": {
    "status": { "isRunning": true, "lastSync": "..." },
    "stats": { "isRunning": true, "lastSync": "..." },
    "syncResult": {
      "created": 2,
      "updated": 1,
      "skipped": 0,
      "errors": 0,
      "lastSync": "2025-01-17T10:30:00.000Z"
    },
    "timestamp": "2025-01-17T10:30:00.000Z"
  }
}
```

### **Test 2: UptimeRobot Monitor**
1. **Create the monitor** with basic settings
2. **Wait 5 minutes** for first check
3. **Check status** - should show "Up" (green)
4. **Review response** - should show success JSON

---

## 📊 **Monitoring Your Setup**

### **UptimeRobot Dashboard**
- **Status**: "Up" (green) = Working
- **Uptime**: Should be 99%+ after running
- **Response Time**: Should be under 30 seconds
- **Last Check**: Recent timestamp

### **Application Logs**
Look for these log messages:
```
🌍 Global Sync API: GET request received (UptimeRobot monitoring)
✅ Global Sync API: GET sync completed
```

---

## 🚨 **Troubleshooting**

### **Issue 1: Monitor Shows "Down"**
**Possible Causes:**
- Website is not accessible
- API endpoint has errors
- Server is down

**Solutions:**
1. Test website accessibility
2. Check API endpoint manually
3. Review server logs
4. Verify URL is correct

### **Issue 2: Monitor Shows "Up" but No Sync**
**Possible Causes:**
- API returns success but doesn't sync
- Bitrix24 API issues
- Database connection problems

**Solutions:**
1. Check application logs
2. Test sync manually
3. Verify Bitrix24 credentials
4. Check database connectivity

---

## ✅ **Success Indicators**

Your setup is working correctly when:

✅ **UptimeRobot Status**: "Up" (green)  
✅ **Response Time**: Under 30 seconds  
✅ **Uptime**: 99%+ after running  
✅ **Application Logs**: Show sync activity  
✅ **Database**: New orders appearing  
✅ **No Alert Emails**: (unless there are issues)  

---

## 🎉 **Benefits of This Approach**

✅ **Zero Cost** - Free UptimeRobot account  
✅ **No Configuration Complexity** - Basic settings only  
✅ **Same Functionality** - GET requests trigger sync  
✅ **Professional Monitoring** - Built-in health checks  
✅ **Reliable Operation** - 24/7 monitoring  

---

## 🔄 **What Happens Next**

Once set up:

1. **UptimeRobot calls your API every 5 minutes**
2. **GET requests trigger global sync**
3. **Orders are fetched from Bitrix24**
4. **Data is stored in your database**
5. **Real-time updates sent to users**
6. **System works 24/7 automatically**

---

## 💡 **Pro Tips**

### **1. Monitor Both Services**
- **UptimeRobot**: Primary monitoring
- **GitHub Actions**: Backup solution
- **Both run simultaneously** for redundancy

### **2. Check Logs Regularly**
- **UptimeRobot**: Dashboard status
- **Application**: Server logs
- **Database**: Order sync results

### **3. Test Periodically**
- **Manual API calls** to verify functionality
- **Check order sync** in database
- **Monitor response times**

---

## 🎯 **Quick Setup Checklist**

- [ ] Login to UptimeRobot
- [ ] Add HTTP(s) monitor
- [ ] Set URL to your API endpoint
- [ ] Set interval to 5 minutes
- [ ] Save and activate monitor
- [ ] Test manually
- [ ] Monitor for 24 hours
- [ ] Verify orders are syncing

**Total Setup Time**: 5 minutes  
**Cost**: $0/month  
**Reliability**: 99.9%  

You're all set for professional 24/7 Global Order Sync! 🚀
