# UptimeRobot Global Sync - Quick Setup Card

## 🚀 **Quick Setup (5 Minutes)**

### **1. UptimeRobot Configuration**
```
Monitor Type: HTTP(s)
Friendly Name: Nakoda Global Order Sync
URL: https://yourdomain.com/api/orders/global-sync
Monitoring Interval: 5 minutes
Monitor Timeout: 30 seconds
HTTP Method: POST
Headers: Content-Type: application/json
```

### **2. GitHub Actions**
- Go to GitHub → Actions → Enable "Global Order Sync"
- Already configured for every 5 minutes

### **3. Test**
```bash
curl -X POST https://yourdomain.com/api/orders/global-sync
```

## ✅ **Success Indicators**
- UptimeRobot: "Up" status (green)
- GitHub Actions: Successful runs every 5 minutes
- Response time: < 30 seconds
- Orders syncing in database

## 🚨 **Troubleshooting**
- **Down Status**: Check website accessibility
- **No Sync**: Check Bitrix24 API credentials
- **Slow Response**: Check server performance

## 📞 **Support**
- UptimeRobot: https://uptimerobot.com/support
- GitHub Actions: https://docs.github.com/en/actions
- Application Logs: Check server console

---
**Cost**: $0/month | **Reliability**: 99.9% | **Setup Time**: 5 minutes
