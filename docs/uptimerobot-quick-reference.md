# UptimeRobot Configuration Summary
# Quick reference for your Global Sync setup

## 📋 Configuration Details

**Monitor Type:** HTTP(s)  
**Friendly Name:** Nakoda Global Order Sync  
**URL:** `https://yourdomain.com/api/orders/global-sync`  
**Method:** POST  
**Interval:** 5 minutes  
**Timeout:** 30 seconds  

## 🔧 Headers Configuration

```
Content-Type: application/json
User-Agent: UptimeRobot-Global-Sync/1.0
```

## 📊 Expected Response

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
  },
  "timestamp": "2025-01-17T10:30:00.000Z"
}
```

## ✅ Success Indicators

- **Status:** Up (green)
- **Uptime:** 99%+
- **Response Time:** < 30 seconds
- **HTTP Status:** 200
- **No Alert Emails**

## 🚨 Alert Configuration

- **Down Alert:** Yes (when sync fails)
- **Up Alert:** No (to avoid spam)
- **Alert Threshold:** 1 failure
- **Pause Alerts:** No

## 🔗 Quick Links

- **UptimeRobot Dashboard:** https://uptimerobot.com/dashboard
- **Add New Monitor:** https://uptimerobot.com/addMonitor
- **Alert Contacts:** https://uptimerobot.com/mySettings
- **Status Page:** https://status.uptimerobot.com/

## 📞 Support

- **UptimeRobot Support:** https://uptimerobot.com/support
- **API Documentation:** https://uptimerobot.com/api/
- **Community Forum:** https://community.uptimerobot.com/
