# Global Order Sync - Test and Setup Guide
# This file contains instructions for testing and setting up the cron job

## 🧪 Testing the Global Sync API

### 1. Test the API endpoint directly
```bash
# Test the basic endpoint
curl -X POST https://yourdomain.com/api/orders/global-sync

# Test with verbose output
curl -v -X POST https://yourdomain.com/api/orders/global-sync

# Test the monitoring endpoint
curl https://yourdomain.com/api/orders/global-sync-monitor
```

### 2. Test locally (if running development server)
```bash
# Test local endpoint
curl -X POST http://localhost:3000/api/orders/global-sync

# Test monitoring endpoint
curl http://localhost:3000/api/orders/global-sync-monitor
```

### 3. Test with the monitoring script
```bash
# Make script executable
chmod +x scripts/monitor-global-sync.sh

# Test sync health
./scripts/monitor-global-sync.sh health

# Test manual sync
./scripts/monitor-global-sync.sh test

# Show statistics
./scripts/monitor-global-sync.sh stats
```

## 🚀 Setup Instructions

### Option 1: Vercel Cron Jobs (Recommended for Vercel deployments)

1. **Deploy your application to Vercel**
2. **The `vercel.json` file is already configured**
3. **Cron jobs will automatically start running every 5 minutes**
4. **Check Vercel dashboard for cron job logs**

### Option 2: Server-Side Cron Job

1. **Upload the cron script to your server:**
   ```bash
   scp scripts/cron-global-sync.sh user@yourserver:/path/to/project/
   ```

2. **Make the script executable:**
   ```bash
   chmod +x /path/to/project/scripts/cron-global-sync.sh
   ```

3. **Update the API URL in the script:**
   ```bash
   sed -i 's/yourdomain.com/your-actual-domain.com/g' scripts/cron-global-sync.sh
   ```

4. **Add to crontab:**
   ```bash
   crontab -e
   # Add this line:
   */5 * * * * /path/to/project/scripts/cron-global-sync.sh
   ```

5. **Check if cron is working:**
   ```bash
   tail -f /var/log/nakoda-global-sync.log
   ```

### Option 3: External Service (UptimeRobot - Free)

1. **Go to https://uptimerobot.com/**
2. **Create a new monitor:**
   - Monitor Type: HTTP(s)
   - URL: `https://yourdomain.com/api/orders/global-sync`
   - Method: POST
   - Monitoring Interval: 5 minutes
3. **Save the monitor**

### Option 4: GitHub Actions (Free for public repos)

1. **The `.github/workflows/global-sync.yml` file is already created**
2. **Add your domain URL as a secret:**
   - Go to GitHub repo → Settings → Secrets
   - Add secret: `GLOBAL_SYNC_URL` = `https://yourdomain.com/api/orders/global-sync`
3. **The workflow will run automatically every 5 minutes**

## 🔍 Monitoring and Troubleshooting

### 1. Check if cron job is running
```bash
# Check crontab
crontab -l

# Check cron service status
systemctl status cron

# Check cron logs
tail -f /var/log/cron
```

### 2. Monitor sync logs
```bash
# Check sync logs
tail -f /var/log/nakoda-global-sync.log

# Check error logs
tail -f /var/log/nakoda-global-sync-error.log

# Use monitoring script
./scripts/monitor-global-sync.sh monitor
```

### 3. Test API response
```bash
# Test basic endpoint
curl -X POST https://yourdomain.com/api/orders/global-sync | jq '.'

# Test monitoring endpoint
curl https://yourdomain.com/api/orders/global-sync-monitor | jq '.'
```

### 4. Check Vercel cron logs
- Go to Vercel dashboard
- Navigate to your project
- Check "Functions" tab for cron job logs

## 🚨 Troubleshooting Common Issues

### Issue 1: Cron job not running
**Solution:**
```bash
# Check if cron service is running
systemctl status cron

# Restart cron service
systemctl restart cron

# Check crontab syntax
crontab -l
```

### Issue 2: API returns 500 error
**Solution:**
```bash
# Check application logs
# Check database connection
# Verify environment variables
```

### Issue 3: External service not calling API
**Solution:**
- Check service configuration
- Verify URL is correct
- Check if service is active
- Review service logs

### Issue 4: Vercel cron not working
**Solution:**
- Verify `vercel.json` is in root directory
- Check Vercel project settings
- Review Vercel function logs
- Ensure API endpoint is accessible

## 📊 Expected Results

### Successful Sync Response:
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

### Monitoring Response:
```json
{
  "success": true,
  "data": {
    "status": {
      "isRunning": true,
      "lastSync": "2025-01-17T10:30:00.000Z",
      "retryCount": 0
    },
    "health": {
      "timestamp": "2025-01-17T10:30:00.000Z",
      "server": {
        "nodeVersion": "v18.17.0",
        "platform": "linux",
        "uptime": "3600s"
      }
    }
  }
}
```

## ✅ Verification Checklist

- [ ] API endpoint responds with 200 status
- [ ] Cron job is scheduled and running
- [ ] Logs are being generated
- [ ] Orders are being synced from Bitrix24
- [ ] Monitoring endpoint shows healthy status
- [ ] External service (if used) is calling API
- [ ] No errors in logs
- [ ] Sync happens every 5 minutes

## 🎯 Next Steps

1. **Choose your preferred method** (Vercel cron, server cron, or external service)
2. **Set up the cron job** following the instructions above
3. **Test the setup** using the testing commands
4. **Monitor the logs** to ensure everything is working
5. **Set up alerts** if needed for production monitoring
