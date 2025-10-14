# 🏢 Razorpay Business Verification Requirements

## Overview

To use Razorpay in **live/production mode**, you must complete the business verification process. This is mandatory for all businesses to comply with RBI (Reserve Bank of India) regulations and ensure secure payment processing.

## Required Documents

### 1. **Business Registration Documents**
- [ ] **Certificate of Incorporation** (for companies)
- [ ] **Partnership Deed** (for partnerships)
- [ ] **GST Registration Certificate**
- [ ] **PAN Card** (of the business)
- [ ] **Bank Account Details** (business account)

### 2. **Business Information**
- [ ] **Business Name** (as per registration)
- [ ] **Business Address** (registered address)
- [ ] **Business Type** (Private Limited, Partnership, etc.)
- [ ] **Nature of Business** (description of services)
- [ ] **Annual Turnover** (estimated)
- [ ] **Website URL** (if applicable)

### 3. **Authorized Person Details**
- [ ] **Name** (as per PAN/Aadhaar)
- [ ] **PAN Card** (of authorized person)
- [ ] **Aadhaar Card** (of authorized person)
- [ ] **Address Proof** (utility bill, bank statement)
- [ ] **Mobile Number** (verified)
- [ ] **Email Address** (verified)

### 4. **Bank Account Verification**
- [ ] **Bank Account Number**
- [ ] **IFSC Code**
- [ ] **Account Holder Name** (must match business name)
- [ ] **Bank Statement** (last 3 months)
- [ ] **Cancelled Cheque** (for verification)

## Verification Process Steps

### Step 1: **Account Setup**
1. Create Razorpay account
2. Complete basic profile information
3. Select business type and category
4. Provide business registration details

### Step 2: **Document Upload**
1. Upload all required documents
2. Ensure documents are clear and readable
3. Verify document details match business information
4. Submit for verification

### Step 3: **Business Verification**
1. Razorpay team reviews documents
2. May request additional information
3. Verification typically takes 2-7 business days
4. Receive approval notification

### Step 4: **Bank Account Verification**
1. Add bank account details
2. Upload bank statement
3. Provide cancelled cheque
4. Complete bank verification process

### Step 5: **Live Mode Activation**
1. Receive live API keys
2. Configure webhook endpoints
3. Test payment processing
4. Go live with production

## Business Categories

### 1. **E-commerce**
- Online retail stores
- Marketplace sellers
- Digital products
- Subscription services

### 2. **Services**
- Professional services
- Consulting services
- Educational services
- Healthcare services

### 3. **SaaS/Technology**
- Software as a Service
- Technology platforms
- Digital solutions
- API services

### 4. **Others**
- Non-profit organizations
- Educational institutions
- Government entities
- Special categories

## Compliance Requirements

### 1. **RBI Compliance**
- [ ] **Payment Aggregator License**: Razorpay holds the license
- [ ] **KYC Compliance**: Complete Know Your Customer process
- [ ] **AML Compliance**: Anti-Money Laundering measures
- [ ] **Data Security**: PCI DSS compliance

### 2. **Business Compliance**
- [ ] **GST Registration**: Required for most businesses
- [ ] **Tax Compliance**: Ensure tax obligations are met
- [ ] **Business License**: As per local regulations
- [ ] **Industry Certifications**: If applicable

### 3. **Data Protection**
- [ ] **Privacy Policy**: Clear privacy policy
- [ ] **Terms of Service**: Comprehensive terms
- [ ] **Data Handling**: Secure data processing
- [ ] **User Consent**: Proper consent mechanisms

## Verification Timeline

### **Standard Timeline**
- **Document Upload**: 1 day
- **Initial Review**: 2-3 business days
- **Additional Information**: 1-2 business days (if required)
- **Final Approval**: 1-2 business days
- **Total Time**: 5-7 business days

### **Expedited Timeline**
- **Priority Processing**: Available for select businesses
- **Faster Review**: 1-2 business days
- **Total Time**: 2-3 business days

## Common Issues and Solutions

### 1. **Document Issues**
- **Blurry Documents**: Ensure clear, high-resolution images
- **Expired Documents**: Use current, valid documents
- **Mismatched Names**: Ensure consistency across documents
- **Missing Information**: Complete all required fields

### 2. **Business Information Issues**
- **Incorrect Address**: Use registered business address
- **Wrong Business Type**: Select appropriate category
- **Missing Details**: Provide complete information
- **Inconsistent Data**: Ensure data consistency

### 3. **Bank Account Issues**
- **Wrong Account Type**: Use business account
- **Mismatched Names**: Account holder name must match business
- **Invalid IFSC**: Verify IFSC code
- **Insufficient Balance**: Maintain minimum balance

## Post-Verification Steps

### 1. **API Configuration**
```env
# Update environment variables with live keys
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
```

### 2. **Webhook Setup**
- Configure webhook URL in Razorpay dashboard
- Enable required webhook events
- Test webhook delivery

### 3. **Testing**
- Test payment processing with small amounts
- Verify webhook functionality
- Check error handling
- Validate transaction logging

### 4. **Monitoring**
- Set up transaction monitoring
- Configure alert systems
- Monitor error rates
- Track performance metrics

## Support and Resources

### 1. **Razorpay Support**
- **Email**: support@razorpay.com
- **Phone**: +91-80-4616-1600
- **Documentation**: https://razorpay.com/docs/
- **Status Page**: https://status.razorpay.com/

### 2. **Verification Support**
- **Verification Team**: verification@razorpay.com
- **Business Support**: business@razorpay.com
- **Technical Support**: tech@razorpay.com

### 3. **Documentation**
- **Integration Guide**: https://razorpay.com/docs/payment-gateway/
- **Webhook Guide**: https://razorpay.com/docs/webhooks/
- **API Reference**: https://razorpay.com/docs/api/

## Checklist for Verification

### **Pre-Verification**
- [ ] Gather all required documents
- [ ] Verify document validity and clarity
- [ ] Ensure business information accuracy
- [ ] Prepare bank account details
- [ ] Review compliance requirements

### **During Verification**
- [ ] Submit complete application
- [ ] Respond to additional requests promptly
- [ ] Maintain communication with Razorpay team
- [ ] Keep documents updated
- [ ] Monitor application status

### **Post-Verification**
- [ ] Receive live API keys
- [ ] Configure production environment
- [ ] Set up webhook endpoints
- [ ] Test payment processing
- [ ] Monitor system performance

## Success Tips

### 1. **Document Preparation**
- Use high-quality, clear images
- Ensure all information is visible
- Use proper file formats (PDF, JPG, PNG)
- Keep file sizes within limits

### 2. **Information Accuracy**
- Double-check all details
- Ensure consistency across documents
- Use official business information
- Verify contact details

### 3. **Communication**
- Respond promptly to requests
- Provide additional information when asked
- Maintain professional communication
- Keep contact information updated

---

## 🎯 **Next Steps**

1. **Gather Documents**: Collect all required documents
2. **Create Account**: Sign up for Razorpay account
3. **Submit Application**: Complete verification process
4. **Wait for Approval**: Monitor application status
5. **Go Live**: Configure production environment

**Estimated Time**: 5-7 business days
**Success Rate**: 95%+ with proper documentation

---

*Last Updated: [Current Date]*
*Version: 1.0*
*Status: Ready for Verification*
