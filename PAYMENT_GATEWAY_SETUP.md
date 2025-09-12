# Payment Gateway Setup Guide

## Environment Variables Required

Add the following environment variables to your `.env.local` file:

```bash
# Axis Payment Gateway - Sandbox
AXIS_PG_SANDBOX_URL=https://sandbox-axispg.freecharge.in
AXIS_PG_SANDBOX_MERCHANT_ID=your_sandbox_merchant_id
AXIS_PG_SANDBOX_MERCHANT_KEY=your_sandbox_merchant_key

# Axis Payment Gateway - Production
AXIS_PG_PRODUCTION_URL=https://axispg.freecharge.in
AXIS_PG_PRODUCTION_MERCHANT_ID=your_production_merchant_id
AXIS_PG_PRODUCTION_MERCHANT_KEY=your_production_merchant_key

# App URL (for callbacks)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Features Implemented

### 1. Payment Gateway Integration
- ✅ **Checkout API** - Initiate payments with Axis PG
- ✅ **Transaction Status** - Check payment status
- ✅ **Refund API** - Process refunds
- ✅ **Callback Handling** - Process payment notifications

### 2. Payment Methods Supported
- ✅ **Credit Cards** (Visa, Mastercard, RuPay, Amex, Diners)
- ✅ **Debit Cards** (Visa, Mastercard, RuPay)
- ✅ **UPI** (Collect, Intent, QR, Static QR, SDK)
- ✅ **Net Banking** (50+ banks)
- ✅ **Wallets** (Freecharge, Paytm, Amazon Pay, etc.)

### 3. Security Features
- ✅ **Signature Generation** - SHA-256 hash with merchant key
- ✅ **JWT Encryption** - JWS + JWE for request/response encryption
- ✅ **Callback Verification** - Signature validation for webhooks
- ✅ **Input Validation** - Comprehensive validation for all fields

### 4. Wallet Integration
- ✅ **Add Amount** - Top up wallet via payment gateway
- ✅ **Transaction Recording** - Store payment transactions
- ✅ **Balance Updates** - Real-time wallet balance updates
- ✅ **Error Handling** - Comprehensive error management

## API Endpoints

### Payment Checkout
```
POST /api/payment/checkout
```
**Body:**
```json
{
  "amount": 1000,
  "customerInfo": {
    "customerName": "Partner Name",
    "customerEmailId": "partner@example.com",
    "customerMobileNo": "9999999999"
  }
}
```

### Transaction Status
```
POST /api/payment/status
```
**Body:**
```json
{
  "merchantTxnId": "TXN_1234567890_ABC123",
  "txnReferenceId": "optional_reference_id"
}
```

### Refund
```
POST /api/payment/refund
```
**Body:**
```json
{
  "txnReferenceId": "payment_reference_id",
  "refundAmount": 500,
  "refundType": "OFFLINE"
}
```

### Callback (Webhook)
```
POST /api/payment/callback
```
**Body:** (Axis PG sends this automatically)
```json
{
  "statusCode": "SPG-0000",
  "statusMessage": "SUCCESS",
  "merchantTxnId": "TXN_1234567890_ABC123",
  "txnReferenceId": "payment_reference_id",
  "amount": 1000,
  "currency": "INR",
  "signature": "generated_signature"
}
```

## Usage in Components

### AddAmountModal
The AddAmountModal now integrates with the payment gateway:

```tsx
import { usePayment } from '@/hooks/usePayment';

const { initiatePayment, isLoading, error } = usePayment();

const handlePayment = async () => {
  const result = await initiatePayment({
    amount: 1000,
    customerInfo: {
      customerName: 'Partner Name',
      customerEmailId: 'partner@example.com'
    }
  });
  
  if (result.success && result.redirectUrl) {
    window.location.href = result.redirectUrl;
  }
};
```

## Testing

### Sandbox Testing
1. Use sandbox credentials in development
2. Test with small amounts (₹1-₹10)
3. Use test card numbers provided by Axis PG
4. Verify callback handling

### Production Deployment
1. Update environment variables with production credentials
2. Ensure callback URL is accessible from Axis PG servers
3. Test with real payment methods
4. Monitor transaction logs

## Error Handling

The system handles all Axis PG error codes:
- **SPG-0000**: SUCCESS
- **SPG-0001**: FAILED
- **SPG-0002**: PENDING
- **SPG-0003**: Invalid merchant id
- **SPG-0004**: Signature absent
- **SPG-0005**: Invalid signature
- And 100+ other error codes

## Security Considerations

1. **Never expose merchant keys** in client-side code
2. **Always verify signatures** in callback handlers
3. **Use HTTPS** in production
4. **Validate all inputs** before processing
5. **Log all transactions** for audit purposes

## Next Steps

1. **Add your merchant credentials** to environment variables
2. **Test the integration** in sandbox mode
3. **Configure webhook URLs** with Axis PG
4. **Deploy to production** when ready
5. **Monitor transactions** and handle errors appropriately

## Support

For Axis PG specific issues, contact Axis PG support.
For integration issues, check the logs and error messages.
