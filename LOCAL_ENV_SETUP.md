# Local Development Environment Setup

## Issue Found
The Global Sync service is failing locally because **Bitrix24 environment variables are not set**.

## Solution
Create a `.env.local` file in your project root with the following variables:

```bash
# Bitrix24 API Configuration
BITRIX24_DOMAIN=yourcompany.bitrix24.com
BITRIX24_WEBHOOK_ID=your_webhook_id
BITRIX24_WEBHOOK_SECRET=your_webhook_secret

# Supabase Configuration (these should already be set)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## How to Get Bitrix24 Credentials

1. **Go to your Bitrix24 portal**
2. **Navigate to**: Applications → Development → Webhooks
3. **Create a new webhook** with these permissions:
   - `crm` (CRM access)
   - `crm.deal` (Deal access)
4. **Copy the webhook URL** - it will look like:
   ```
   https://yourcompany.bitrix24.com/rest/123/abc123def456/
   ```
5. **Extract the components**:
   - `BITRIX24_DOMAIN`: `yourcompany.bitrix24.com`
   - `BITRIX24_WEBHOOK_ID`: `123`
   - `BITRIX24_WEBHOOK_SECRET`: `abc123def456`

## After Setting Up

1. **Create the `.env.local` file** with your actual credentials
2. **Restart the development server**:
   ```bash
   npm run dev
   ```
3. **Test the Global Sync**:
   ```bash
   curl "http://localhost:3000/api/orders/global-sync-quick"
   ```

## Expected Results

After setting up the environment variables, you should see:
- ✅ **Global Sync Status**: "Running (every 5 minutes)"
- ✅ **Last sync**: Recent timestamp
- ✅ **No retry errors**

## Security Note

- **Never commit** `.env.local` to git
- **Keep credentials secure**
- **Use different credentials** for development vs production
