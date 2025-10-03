# GitHub Actions Global Sync Setup Guide
# This guide explains how to set up the GitHub Actions workflow for Global Order Sync

## 🚨 **Warning Resolution**

The warning you're seeing is because the workflow was using a placeholder URL (`https://yourdomain.com/api/orders/global-sync`) as a fallback. This has been fixed by:

1. **Removing the placeholder URL** from the workflow
2. **Adding proper secret validation** to ensure the URL is configured
3. **Providing clear setup instructions** when the secret is missing

## 🔧 **Setup Instructions**

### Step 1: Configure GitHub Secret

1. **Go to your GitHub repository**
2. **Click on "Settings"** tab
3. **Navigate to "Secrets and variables"** → **"Actions"**
4. **Click "New repository secret"**
5. **Fill in the details:**
   ```
   Name: GLOBAL_SYNC_URL
   Value: https://yourdomain.com/api/orders/global-sync
   ```
6. **Click "Add secret"**

### Step 2: Update the Secret Value

Replace `yourdomain.com` with your actual domain:
```
https://your-actual-domain.com/api/orders/global-sync
```

### Step 3: Test the Workflow

1. **Go to "Actions" tab** in your repository
2. **Find "Global Order Sync"** workflow
3. **Click "Run workflow"** to test manually
4. **Check the logs** to ensure it's working

## ✅ **What This Fixes**

### Before (Causing Warning):
```yaml
"${{ secrets.GLOBAL_SYNC_URL || 'https://yourdomain.com/api/orders/global-sync' }}"
```
- ❌ Uses placeholder URL as fallback
- ❌ GitHub Actions warns about invalid URL
- ❌ Workflow fails with 404 errors

### After (Fixed):
```yaml
# Check if secret is configured
if [ -z "${{ secrets.GLOBAL_SYNC_URL }}" ]; then
  echo "❌ GLOBAL_SYNC_URL secret is not set..."
  exit 1
fi

# Use only the configured secret
"${{ secrets.GLOBAL_SYNC_URL }}"
```
- ✅ Validates secret is configured
- ✅ No placeholder URLs
- ✅ Clear error messages if misconfigured
- ✅ No GitHub Actions warnings

## 🎯 **Benefits**

✅ **No More Warnings** - GitHub Actions won't show warnings  
✅ **Better Error Handling** - Clear messages when misconfigured  
✅ **Security** - No hardcoded URLs in the workflow  
✅ **Flexibility** - Easy to change URL without editing workflow  
✅ **Professional Setup** - Follows GitHub Actions best practices  

## 🔍 **Troubleshooting**

### Issue 1: "GLOBAL_SYNC_URL secret is not set"
**Solution:** Follow Step 1 above to configure the secret

### Issue 2: "HTTP 404" errors
**Solution:** 
1. Verify your domain is correct
2. Ensure your API endpoint is accessible
3. Test the URL manually: `curl -X POST https://yourdomain.com/api/orders/global-sync`

### Issue 3: "HTTP 500" errors
**Solution:**
1. Check your application logs
2. Verify Bitrix24 API credentials
3. Check database connectivity

## 📊 **Expected Workflow Behavior**

### Successful Run:
```
🔄 Starting global order sync...
Response: {"success":true,"message":"Global sync completed successfully",...}
HTTP Status: 200
✅ Global sync successful
🎉 Global sync completed successfully at [timestamp]
```

### Failed Run (Missing Secret):
```
🔄 Starting global order sync...
❌ GLOBAL_SYNC_URL secret is not set. Please configure it in repository settings.
Go to: Settings → Secrets and variables → Actions → New repository secret
Name: GLOBAL_SYNC_URL
Value: https://yourdomain.com/api/orders/global-sync
```

## 🚀 **Next Steps**

1. **Configure the secret** with your actual domain
2. **Test the workflow** manually
3. **Monitor the scheduled runs** (every 5 minutes)
4. **Check logs** for any issues

The warning should now be completely resolved! 🎉
