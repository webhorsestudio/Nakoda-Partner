# 🚀 Razorpay Integration Setup Guide

## 📋 **Overview**
This guide will help you set up Razorpay payment gateway integration for the Nakoda Partner wallet system.

## 🔑 **1. Get Razorpay Credentials**

### **Step 1: Create Razorpay Account**
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up for a new account or log in
3. Complete the verification process

### **Step 2: Get API Keys**
1. Go to **Settings** → **API Keys**
2. Generate **Test Keys** (for development)
3. Copy your **Key ID** and **Key Secret**

### **Step 3: Environment Variables**
Add these to your `.env.local` file:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx

# Optional: Webhook Secret (for production)
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxx
```

## 🧪 **2. Test the Integration**

### **Test API Endpoint**
Visit: `http://localhost:3000/api/razorpay/test`

This will:
- ✅ Check if credentials are configured
- ✅ Test Razorpay API connection
- ✅ Create a test order
- ✅ Return connection status

## 💳 **3. Payment Flow**

### **Frontend Flow:**
1. User clicks "Add Money" button
2. `AddAmountModal` opens
3. User enters amount and clicks "Add Money"
4. `useRazorpay` hook is called
5. Razorpay checkout opens
6. User completes payment
7. Payment is verified on server
8. Wallet balance is updated
9. Success toast notification appears

### **Backend Flow:**
1. **Create Order** (`/api/razorpay/create-order`)
   - Validates partner authentication
   - Creates Razorpay order
   - Returns order details
   
2. **Verify Payment** (`/api/razorpay/verify-payment`)
   - Verifies payment signature
   - Updates wallet balance
   - Logs transaction

## 🔧 **4. API Endpoints**

### **Create Order**
- **URL**: `/api/razorpay/create-order`
- **Method**: `POST`
- **Auth**: Required (Partner token)
- **Body**: `{ amount: number, customerInfo?: object }`

### **Verify Payment**
- **URL**: `/api/razorpay/verify-payment`
- **Method**: `POST`
- **Auth**: Required (Partner token)
- **Body**: `{ razorpay_order_id, razorpay_payment_id, razorpay_signature, partnerId, amount }`

## 🎯 **5. Features**

- ✅ **Secure Payment Processing**: Signature verification
- ✅ **Real-time Wallet Updates**: Instant balance updates
- ✅ **Transaction Logging**: Complete audit trail
- ✅ **Error Handling**: Comprehensive error management
- ✅ **Toast Notifications**: User-friendly feedback
- ✅ **TypeScript Support**: Full type safety

## 🚀 **6. Production Deployment**

1. **Switch to Production Keys**:
   - Replace test keys with live keys
   - Update environment variables

2. **Configure Webhooks** (Optional):
   - Set up webhook endpoints
   - Configure webhook secret

3. **Monitor Transactions**:
   - Check Razorpay dashboard
   - Monitor application logs

## 📞 **7. Support**

- **Razorpay Documentation**: [https://razorpay.com/docs/](https://razorpay.com/docs/)
- **Razorpay Support**: [https://razorpay.com/support/](https://razorpay.com/support/)