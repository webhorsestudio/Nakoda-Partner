# UptimeRobot Setup Guide for Global Order Sync
# This guide walks you through setting up UptimeRobot to call your Global Sync API every 5 minutes

## 🚀 Step-by-Step Setup

### Step 1: Create UptimeRobot Account
1. Go to **https://uptimerobot.com/**
2. Click **"Sign Up"** (it's completely free)
3. Verify your email address
4. Log in to your dashboard

### Step 2: Add New Monitor
1. Click **"+ Add New Monitor"** button
2. Select **"HTTP(s)"** as Monitor Type
3. Fill in the following details:

```
Monitor Type: HTTP(s)
Friendly Name: Nakoda Global Order Sync
URL: https://yourdomain.com/api/orders/global-sync
Monitoring Interval: 5 minutes
Monitor Timeout: 30 seconds
```

### Step 3: Configure Advanced Settings
1. Click **"Advanced Settings"**
2. Set the following:

```
HTTP Method: POST
HTTP Headers: 
  Content-Type: application/json
  User-Agent: UptimeRobot-Global-Sync/1.0
```

### Step 4: Set Up Notifications (Optional)
1. Go to **"My Settings"** → **"Alert Contacts"**
2. Add your email address
3. Configure alert preferences:
   - **Down Alert**: Yes (when sync fails)
   - **Up Alert**: No (to avoid spam)
   - **Pause Alerts**: No

### Step 5: Save and Activate
1. Click **"Create Monitor"**
2. Your monitor will start running immediately
3. You'll see it in your dashboard with status "Up"

## 🔍 Monitoring Your Setup

### Dashboard View
- **Status**: Shows "Up" when working, "Down" when failing
- **Uptime**: Shows percentage of successful calls
- **Response Time**: Shows how long each call takes
- **Last Check**: Shows when the last call was made

### Expected Results
- **Status**: Should be "Up" (green)
- **Response Time**: Should be under 30 seconds
- **Uptime**: Should be 99%+ after running for a while

## 🧪 Testing Your Setup

### Test 1: Check Monitor Status
1. Go to your UptimeRobot dashboard
2. Look for "Nakoda Global Order Sync" monitor
3. Status should be "Up" (green circle)

### Test 2: Check Response Details
1. Click on your monitor name
2. Go to "Response" tab
3. You should see successful responses like:
```json
{
  "success": true,
  "message": "Global sync completed successfully",
  "data": {
    "created": 2,
    "updated": 1,
    "skipped": 0,
    "errors": 0,
    "lastSync": "2025-01-17T10:30:00.000Z"
  }
}
```

### Test 3: Manual Test
```bash
# Test your API directly
curl -X POST https://yourdomain.com/api/orders/global-sync

# Should return success response
```

## 📊 What UptimeRobot Does

✅ **Calls your API every 5 minutes**  
✅ **Sends POST requests to `/api/orders/global-sync`**  
✅ **Monitors response times and success rates**  
✅ **Sends alerts if sync fails**  
✅ **Provides detailed logs and statistics**  
✅ **Works 24/7 without any user interaction**  

## 🚨 Troubleshooting

### Issue 1: Monitor Shows "Down"
**Possible Causes:**
- API endpoint is not accessible
- Server is down
- Network issues

**Solutions:**
1. Check if your website is accessible
2. Test the API endpoint manually
3. Check server logs
4. Verify the URL is correct

### Issue 2: Monitor Shows "Up" but No Sync Happening
**Possible Causes:**
- API returns success but doesn't actually sync
- Bitrix24 API issues
- Database connection problems

**Solutions:**
1. Check your application logs
2. Test the sync manually
3. Verify Bitrix24 API credentials
4. Check database connectivity

### Issue 3: Getting Too Many Alerts
**Solutions:**
1. Go to monitor settings
2. Increase "Alert Threshold" to 2-3 failures
3. Disable "Up Alerts" to only get failure notifications

## 📈 Monitoring Best Practices

### 1. Check Dashboard Regularly
- Visit your UptimeRobot dashboard daily
- Look for any "Down" statuses
- Check response times for performance issues

### 2. Set Up Email Alerts
- Configure email notifications for failures
- Use a reliable email address
- Don't ignore alert emails

### 3. Monitor Response Times
- Normal response time: 5-15 seconds
- If consistently over 30 seconds, investigate
- Check for performance issues

### 4. Review Logs Periodically
- Check UptimeRobot response logs
- Look for error patterns
- Verify sync is working correctly

## 🎯 Success Indicators

Your setup is working correctly when you see:

✅ **Monitor Status**: "Up" (green)  
✅ **Uptime**: 99%+  
✅ **Response Time**: Under 30 seconds  
✅ **Last Check**: Recent timestamp  
✅ **Response**: Success JSON with sync data  
✅ **No Alert Emails**: (unless there are actual issues)  

## 🔄 What Happens Next

Once set up, UptimeRobot will:

1. **Call your API every 5 minutes**
2. **Trigger the Global Sync process**
3. **Fetch new orders from Bitrix24**
4. **Store them in your database**
5. **Send real-time updates to logged-in users**
6. **Continue working even when no users are online**

## 📞 Support

If you encounter issues:

1. **Check UptimeRobot Status Page**: https://status.uptimerobot.com/
2. **Review UptimeRobot Documentation**: https://uptimerobot.com/api/
3. **Test your API endpoint manually**
4. **Check your application logs**

---

## 🎉 You're All Set!

Once you complete this setup, your Global Order Sync will run **24/7 automatically**, ensuring orders are continuously synced from Bitrix24 even when no users are logged in!

The system will work independently of user authentication and provide reliable, continuous order synchronization for your Nakoda Partner platform.
