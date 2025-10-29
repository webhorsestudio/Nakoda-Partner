# Razorpay Webhook Setup Guide for Wallet Updates

## 📋 Overview

This guide explains how to configure Razorpay webhooks to automatically update wallet balances when payments are completed in the mobile WebView app. This solves the issue where wallet balances don't update after external UPI payments (Google Pay, PhonePe, etc.).

---

## 🔍 Problem Statement

**Issue**: When users make payments via external UPI apps (Google Pay, PhonePe) from the Flutter WebView app:

- ✅ Payment completes successfully in Google Pay
- ✅ Money is debited from user's bank account
- ✅ Razorpay receives the payment
- ❌ **Server database NOT updated** (wallet balance remains unchanged)
- ❌ User doesn't see updated balance in app

**Root Cause**: External UPI apps launched from WebView cannot return payment results to the WebView. The `/payment-callback` route is never called, so the server never knows about the payment.

**Solution**: Configure Razorpay webhooks to notify our server directly when payments are captured, bypassing the need for callback URLs.

---

## ✅ What's Already Implemented

### 1. Webhook Endpoint (`/api/razorpay/webhook`)

**Location**: `src/app/api/razorpay/webhook/route.ts`

**Features**:
- ✅ Signature verification (secure)
- ✅ Handles `payment.captured` events
- ✅ Checks for duplicate processing (idempotency)
- ✅ Updates wallet balance automatically
- ✅ Logs transactions to `wallet_transactions` table
- ✅ Checks both `order.notes.partner_id` and `payment.notes.partner_id`
- ✅ Falls back to Razorpay API if notes are missing
- ✅ Comprehensive error logging

**Supported Events**:
- `payment.captured` - Payment successfully captured
- `payment.failed` - Payment failed
- `order.paid` - Order marked as paid
- `refund.created` - Refund initiated
- `refund.processed` - Refund completed

### 2. Payment Verification API (`/api/razorpay/verify-payment-status`)

**Location**: `src/app/api/razorpay/verify-payment-status/route.ts`

**Features**:
- ✅ Actively checks Razorpay API for payment status
- ✅ Updates wallet if payment is captured but not processed
- ✅ Returns current wallet balance
- ✅ Can be polled by mobile app as a fallback

**Usage**: `GET /api/razorpay/verify-payment-status?order_id=order_XXXXX`

---

## 🔧 Setup Instructions

### Step 1: Configure Webhook in Razorpay Dashboard

1. **Login to Razorpay Dashboard**
   - Go to: https://dashboard.razorpay.com/
   - Navigate to: **Settings** → **Webhooks**

2. **Create New Webhook**
   - Click **"Add New Webhook"**
   - **Webhook URL**: 
     ```
     https://partner.nakodadcs.com/api/razorpay/webhook
     ```
   - **Events to Subscribe**: Select the following events:
     - ✅ `payment.captured` (REQUIRED for wallet updates)
     - ✅ `payment.failed` (Optional - for logging)
     - ✅ `order.paid` (Optional - for logging)
     - ✅ `refund.created` (Optional - if you need refund handling)
     - ✅ `refund.processed` (Optional - if you need refund handling)

3. **Save Webhook Secret**
   - After creating the webhook, Razorpay will generate a **Webhook Secret**
   - **Copy this secret immediately** - you won't be able to see it again!
   - It should look like: `whsec_xxxxxxxxxxxxxxxxxxxx`

4. **Add Secret to Environment Variables**
   - Add to your `.env.local` (development) or production environment:
     ```bash
     RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx
     ```
   - **Important**: This secret is used to verify webhook signatures for security

5. **Test Webhook**
   - Click **"Send Test Webhook"** in Razorpay dashboard
   - Check server logs to ensure webhook is received
   - Verify signature verification works

---

### Step 2: Verify Environment Variables

Ensure these are set in your production environment:

```bash
# Razorpay API Keys
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxxxxxxxxxx
```

---

### Step 3: Test Webhook Manually

Use this command to test the webhook endpoint:

```bash
curl -X POST https://partner.nakodadcs.com/api/razorpay/webhook \
  -H "Content-Type: application/json" \
  -H "x-razorpay-signature: test_signature" \
  -d '{
    "event": "payment.captured",
    "account_id": "acc_test123",
    "created_at": 1234567890,
    "contains": ["payment", "order"],
    "payload": {
      "payment": {
        "entity": {
          "id": "pay_test123",
          "order_id": "order_test123",
          "amount": 100,
          "currency": "INR",
          "status": "captured",
          "method": "upi",
          "notes": {
            "partner_id": "1"
          }
        }
      },
      "order": {
        "entity": {
          "id": "order_test123",
          "amount": 100,
          "currency": "INR",
          "receipt": "RCPT_123",
          "status": "paid",
          "notes": {
            "partner_id": "1"
          }
        }
      }
    }
  }'
```

**Note**: The signature won't verify (that's expected), but you should get a response indicating the endpoint is active.

---

### Step 4: Monitor Webhook Logs

1. **Check Razorpay Dashboard**
   - Go to **Settings** → **Webhooks**
   - Click on your webhook
   - Check **"Webhook Logs"** tab
   - Look for `payment.captured` events
   - Check HTTP response codes (should be 200)

2. **Check Server Logs**
   - Look for logs starting with: `💰 Payment captured:`
   - Check for: `✅ Wallet updated via webhook`
   - Watch for errors: `❌ Error processing payment captured webhook`

---

## 📱 Mobile App Integration

### Option 1: Let Webhook Handle Everything (Recommended)

**No code changes needed!** Once webhooks are configured:

1. User makes payment via external UPI app
2. Razorpay sends webhook to server
3. Server updates wallet automatically
4. Mobile app polls wallet balance (already implemented)
5. User sees updated balance

### Option 2: Poll Verification API (Fallback)

If webhooks are unreliable, the mobile app can poll the verification API:

```dart
// Poll this API every 3-5 seconds after payment
final response = await http.get(
  Uri.parse('https://partner.nakodadcs.com/api/razorpay/verify-payment-status?order_id=$orderId'),
  headers: {'Authorization': 'Bearer $authToken'},
);

final data = jsonDecode(response.body);
if (data['success'] == true && data['payment_status'] == 'captured') {
  // Payment verified! Wallet updated!
  // Show success dialog
  // Refresh wallet balance
  webViewController.loadUrl(urlRequest: URLRequest(url: Uri.parse('https://partner.nakodadcs.com/partner/wallet')));
}
```

This API will:
- Check if payment was already processed
- Query Razorpay API for actual payment status
- Update wallet if payment is captured but not processed
- Return updated wallet balance

---

## 🔒 Security Considerations

### Webhook Signature Verification

**CRITICAL**: Always verify webhook signatures to prevent fraud!

The webhook handler automatically verifies signatures using `RAZORPAY_WEBHOOK_SECRET`. Without this verification, anyone could send fake webhooks and add money to wallets!

**Current Implementation**:
```typescript
const expectedSignature = crypto
  .createHmac('sha256', webhookSecret)
  .update(body)
  .digest('hex');

if (!crypto.timingSafeEqual(expectedSignature, receivedSignature)) {
  return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
}
```

### Idempotency Check

The webhook handler checks for duplicate payments:

```typescript
// Check if payment already processed
const existing = await supabase
  .from('wallet_transactions')
  .select('id')
  .eq('reference_id', payment.id)
  .eq('reference_type', 'razorpay_payment')
  .single();

if (existing) {
  console.log('Payment already processed');
  return; // Don't process again
}
```

This prevents:
- Double-crediting wallets
- Duplicate transaction records
- Race conditions

---

## 🐛 Troubleshooting

### Issue 1: Webhook Not Received

**Symptoms**: Payment completes in Razorpay but webhook not received

**Check**:
1. ✅ Webhook URL is correct: `https://partner.nakodadcs.com/api/razorpay/webhook`
2. ✅ Webhook is enabled in Razorpay dashboard
3. ✅ Server is accessible from internet (not behind firewall)
4. ✅ Check Razorpay dashboard → Webhooks → Logs (look for failed deliveries)
5. ✅ Check server logs for incoming requests

**Solution**: 
- Verify webhook URL is publicly accessible
- Check firewall/network settings
- Ensure SSL certificate is valid

### Issue 2: Invalid Signature Error

**Symptoms**: Webhook received but signature verification fails

**Check**:
1. ✅ `RAZORPAY_WEBHOOK_SECRET` is set correctly in environment
2. ✅ Secret matches the one in Razorpay dashboard
3. ✅ No extra whitespace in secret

**Solution**:
- Copy webhook secret from Razorpay dashboard again
- Update `RAZORPAY_WEBHOOK_SECRET` in environment variables
- Restart server

### Issue 3: Partner ID Not Found

**Symptoms**: Webhook received but wallet not updated (error: "Partner ID not found")

**Check**:
1. ✅ Order creation includes `partner_id` in notes (already implemented)
2. ✅ Check webhook payload logs to see what notes are being sent

**Solution**:
- The webhook handler already checks both `order.notes.partner_id` and `payment.notes.partner_id`
- If still failing, it fetches order from Razorpay API as fallback
- Check server logs for detailed error messages

### Issue 4: Wallet Balance Not Updating

**Symptoms**: Webhook processed but wallet balance unchanged

**Check**:
1. ✅ Check server logs for: `✅ Wallet updated via webhook`
2. ✅ Verify database update in Supabase dashboard
3. ✅ Check for transaction in `wallet_transactions` table

**Solution**:
- Verify Supabase RLS policies allow updates
- Check `partners` table permissions
- Review server logs for specific errors

---

## 📊 Database Schema

The webhook creates records in these tables:

### `wallet_transactions` Table
- `partner_id`: Partner who made payment
- `transaction_type`: 'credit'
- `amount`: Amount in rupees
- `balance_before`: Balance before transaction
- `balance_after`: Balance after transaction
- `reference_id`: Razorpay payment ID (e.g., `pay_XXXXX`)
- `reference_type`: `'razorpay_payment'`
- `status`: `'completed'`
- `metadata`: JSON with payment details

### `partners` Table
- `wallet_balance`: Updated with new balance
- `last_transaction_at`: Timestamp of last transaction
- `wallet_updated_at`: Timestamp of wallet update

---

## ✅ Testing Checklist

Before going live, verify:

- [ ] Webhook endpoint returns 200 for test requests
- [ ] Webhook signature verification works
- [ ] `payment.captured` event updates wallet balance
- [ ] Duplicate payments are ignored (idempotency)
- [ ] Transaction records are created correctly
- [ ] Webhook logs are accessible in Razorpay dashboard
- [ ] Server logs show successful processing
- [ ] Mobile app detects balance updates
- [ ] Error handling works for invalid signatures
- [ ] Partner ID extraction works from order/payment notes

---

## 📞 Support

### Razorpay Support
- **Email**: support@razorpay.com
- **Phone**: +91-80-71174444
- **Documentation**: https://razorpay.com/docs/webhooks/

### Common Issues
1. **Webhook URL not HTTPS**: Razorpay requires HTTPS
2. **Server returns error**: Check logs and response codes
3. **Signature verification fails**: Ensure secret is correct
4. **Webhook not configured**: Enable in Razorpay dashboard

---

## 🎯 Success Criteria

When properly configured:

1. ✅ User makes payment in Google Pay from mobile app
2. ✅ Razorpay sends webhook to server within 5 seconds
3. ✅ Server processes webhook and updates database
4. ✅ Mobile app polls wallet and detects balance change
5. ✅ User sees updated balance within 10-30 seconds
6. ✅ Success dialog shows: "Payment Successful! ₹X added"

---

## 📝 Summary

**For Backend Team**:
1. Configure webhook in Razorpay dashboard
2. Add `RAZORPAY_WEBHOOK_SECRET` to environment variables
3. Test webhook endpoint
4. Monitor webhook logs

**For Mobile Team**:
1. No code changes needed! Webhook handles everything automatically
2. Optionally: Poll `/api/razorpay/verify-payment-status` as fallback
3. Continue polling wallet balance (already implemented)

**The webhook endpoint is already implemented and production-ready!** You just need to configure it in Razorpay dashboard and add the webhook secret to your environment variables.

---

**Last Updated**: 2024-01-XX  
**Status**: ✅ Ready for Production
