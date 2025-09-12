# Payment Gateway Testing Checklist

## ✅ **Pre-Test Verification (COMPLETED)**
- [x] All payment integration files exist
- [x] Environment variables configured (sandbox & production)
- [x] Signature generation logic working
- [x] Dependencies installed
- [x] Development server started

## 🧪 **Testing Steps**

### **Step 1: Access the Wallet Page**
1. Open browser and go to: `http://localhost:3000/partner/wallet`
2. Verify the wallet page loads correctly
3. Check that you can see current balance (if any)

### **Step 2: Test Add Amount Modal**
1. Click the "Add Amount" button
2. Verify the modal opens with:
   - Current balance display
   - Amount input field
   - Payment method selection (Credit Card, Debit Card, UPI, Net Banking)
   - Error handling display

### **Step 3: Test Payment Method Selection**
1. Try selecting different payment methods:
   - Credit Card
   - Debit Card  
   - UPI
   - Net Banking
2. Verify the UI updates correctly for each selection

### **Step 4: Test Amount Validation**
1. Try entering invalid amounts:
   - Negative amounts (should show error)
   - Zero amount (should show error)
   - Very large amounts (should show error)
2. Try entering valid amounts:
   - ₹1 (minimum)
   - ₹100 (normal)
   - ₹1000 (higher amount)

### **Step 5: Test Payment Initiation**
1. Enter a valid amount (e.g., ₹10)
2. Select a payment method
3. Click "Pay & Add to Wallet"
4. Verify:
   - Loading state appears
   - Redirect to Axis PG sandbox occurs
   - URL contains your merchant credentials

### **Step 6: Test Axis PG Sandbox**
1. On the Axis PG sandbox page:
   - Verify your merchant ID is displayed
   - Check the amount is correct
   - Test with sandbox card numbers:
     - **Visa**: 4111 1111 1111 1111
     - **Mastercard**: 5555 5555 5555 4444
     - **CVV**: Any 3 digits
     - **Expiry**: Any future date

### **Step 7: Test Payment Success**
1. Complete payment on Axis PG sandbox
2. Verify redirect back to your app
3. Check that:
   - Wallet balance is updated
   - Transaction appears in transaction history
   - Success message is displayed

### **Step 8: Test Payment Failure**
1. Try to fail a payment (use invalid card details)
2. Verify:
   - Error message is displayed
   - User is redirected back to wallet
   - No balance is added

### **Step 9: Test Callback Handling**
1. Check server logs for callback processing
2. Verify database updates:
   - `partners` table: `wallet_balance` updated
   - `wallet_transactions` table: New transaction record created

## 🔍 **What to Look For**

### **Success Indicators:**
- ✅ Modal opens and closes properly
- ✅ Payment methods are selectable
- ✅ Amount validation works
- ✅ Redirect to Axis PG occurs
- ✅ Payment completion updates wallet
- ✅ Transaction history shows new entry
- ✅ No console errors

### **Error Scenarios to Test:**
- ❌ Invalid amount input
- ❌ Network errors during payment
- ❌ Payment cancellation
- ❌ Invalid payment details
- ❌ Callback processing errors

## 📊 **Test Results Tracking**

| Test Case | Status | Notes |
|-----------|--------|-------|
| Modal Opening | ⏳ | |
| Payment Method Selection | ⏳ | |
| Amount Validation | ⏳ | |
| Payment Initiation | ⏳ | |
| Axis PG Redirect | ⏳ | |
| Payment Success | ⏳ | |
| Payment Failure | ⏳ | |
| Callback Processing | ⏳ | |
| Database Updates | ⏳ | |

## 🚨 **Common Issues & Solutions**

### **Issue: Modal doesn't open**
- **Solution**: Check if `AddAmountModal` component is properly imported

### **Issue: Payment redirect fails**
- **Solution**: Verify environment variables are loaded correctly

### **Issue: Callback not processed**
- **Solution**: Check if callback URL is accessible from Axis PG servers

### **Issue: Database not updated**
- **Solution**: Verify Supabase connection and table permissions

## 📝 **Test Data**

### **Sandbox Test Cards:**
- **Visa**: 4111 1111 1111 1111
- **Mastercard**: 5555 5555 5555 4444
- **RuPay**: 6070 0000 0000 0000
- **CVV**: 123 (any 3 digits)
- **Expiry**: 12/25 (any future date)

### **Test Amounts:**
- **Minimum**: ₹1
- **Normal**: ₹100
- **High**: ₹1000
- **Invalid**: -10, 0, 1000001

## 🎯 **Success Criteria**

The payment integration is successful when:
1. ✅ Users can initiate payments from the wallet
2. ✅ Payment flow works with Axis PG sandbox
3. ✅ Successful payments update wallet balance
4. ✅ Failed payments show appropriate errors
5. ✅ All transactions are recorded in database
6. ✅ No security vulnerabilities exist

## 📞 **Support**

If you encounter issues:
1. Check browser console for errors
2. Check server logs for API errors
3. Verify environment variables
4. Test with different payment methods
5. Check database connectivity

---

**Happy Testing! 🚀**
