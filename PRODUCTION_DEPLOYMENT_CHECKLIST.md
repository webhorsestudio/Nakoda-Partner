# 🚀 Production Deployment Checklist for Razorpay Integration

## Pre-Deployment Checklist

### 1. **Environment Configuration** ✅
- [ ] **Production Razorpay Keys**: Replace test keys with live keys
  ```env
  RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
  RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
  NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
  ```
- [ ] **Webhook Secret**: Configure webhook secret for signature verification
  ```env
  RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
  ```
- [ ] **Security Keys**: Ensure all security keys are configured
  ```env
  JWT_SECRET=your_jwt_secret
  ENCRYPTION_KEY=your_encryption_key
  ```
- [ ] **Database**: Production Supabase instance configured
- [ ] **Environment Variables**: All required variables set in production

### 2. **Razorpay Dashboard Configuration** ✅
- [ ] **Business Verification**: Complete Razorpay business verification
- [ ] **Bank Account**: Add and verify bank account details
- [ ] **Webhook URL**: Configure webhook endpoint
  ```
  https://yourdomain.com/api/razorpay/webhook
  ```
- [ ] **Webhook Events**: Enable required events
  - `payment.captured`
  - `payment.failed`
  - `order.paid`
  - `refund.created`
  - `refund.processed`
- [ ] **Payment Methods**: Enable required payment methods
- [ ] **Settlement**: Configure settlement preferences

### 3. **Security Measures** ✅
- [ ] **Rate Limiting**: Configure production rate limits
- [ ] **IP Whitelisting**: Set up allowed IPs (if required)
- [ ] **SSL Certificate**: Ensure HTTPS is enabled
- [ ] **CORS**: Configure CORS for production domains
- [ ] **Input Validation**: All inputs properly sanitized
- [ ] **Signature Verification**: Webhook signature verification enabled

### 4. **Database Setup** ✅
- [ ] **Production Database**: Supabase production instance
- [ ] **Migrations**: All database migrations applied
- [ ] **Indexes**: Performance indexes created
- [ ] **RLS Policies**: Row Level Security policies configured
- [ ] **Backup**: Database backup strategy in place
- [ ] **Monitoring**: Database performance monitoring enabled

### 5. **Testing** ✅
- [ ] **Production Tests**: Run production readiness tests
  ```bash
  curl https://yourdomain.com/api/production-tests
  ```
- [ ] **Payment Flow**: Test complete payment flow
- [ ] **Webhook Testing**: Test webhook endpoint
- [ ] **Error Handling**: Test error scenarios
- [ ] **Security Tests**: Run security validation tests

## Deployment Steps

### 1. **Code Deployment**
```bash
# Build production version
npm run build

# Deploy to production server
npm run deploy

# Verify deployment
curl https://yourdomain.com/api/health
```

### 2. **Environment Setup**
```bash
# Set production environment variables
export NODE_ENV=production
export RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
export RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
# ... other variables
```

### 3. **Database Migration**
```bash
# Run database migrations
npm run migrate:production

# Verify database schema
npm run db:verify
```

### 4. **Webhook Configuration**
1. Log into Razorpay Dashboard
2. Go to **Settings** → **Webhooks**
3. Add webhook URL: `https://yourdomain.com/api/razorpay/webhook`
4. Enable required events
5. Test webhook delivery

## Post-Deployment Verification

### 1. **Health Checks** ✅
- [ ] **API Health**: Check API endpoints are responding
  ```bash
  curl https://yourdomain.com/api/health
  ```
- [ ] **Database Connection**: Verify database connectivity
- [ ] **Razorpay Connection**: Test Razorpay API connection
  ```bash
  curl https://yourdomain.com/api/razorpay/test
  ```

### 2. **Payment Testing** ✅
- [ ] **Small Amount Test**: Process a small payment (₹1-10)
- [ ] **Payment Success**: Verify successful payment flow
- [ ] **Payment Failure**: Test payment failure handling
- [ ] **Webhook Delivery**: Verify webhook events are received
- [ ] **Wallet Update**: Confirm wallet balance updates correctly

### 3. **Monitoring Setup** ✅
- [ ] **Error Monitoring**: Error monitoring system active
- [ ] **Transaction Monitoring**: Transaction logging enabled
- [ ] **Alert System**: Alert notifications configured
- [ ] **Performance Monitoring**: Performance metrics collection
- [ ] **Log Aggregation**: Centralized logging setup

### 4. **Security Verification** ✅
- [ ] **Rate Limiting**: Test rate limiting functionality
- [ ] **Input Validation**: Verify input sanitization
- [ ] **Signature Verification**: Test webhook signature verification
- [ ] **Access Control**: Verify authentication and authorization
- [ ] **Data Encryption**: Confirm sensitive data encryption

## Production Monitoring

### 1. **Key Metrics to Monitor**
- **Payment Success Rate**: Should be > 95%
- **Response Time**: API response time < 2 seconds
- **Error Rate**: Error rate < 1%
- **Webhook Delivery**: Webhook success rate > 99%
- **Database Performance**: Query response time < 500ms

### 2. **Alert Thresholds**
- **High Error Rate**: > 5% error rate in 15 minutes
- **Payment Failures**: > 10 failures in 30 minutes
- **Webhook Failures**: > 5 failures in 10 minutes
- **Database Errors**: > 3 errors in 5 minutes
- **Response Time**: > 5 seconds average response time

### 3. **Daily Checks**
- [ ] Review error logs
- [ ] Check transaction volumes
- [ ] Verify webhook deliveries
- [ ] Monitor system performance
- [ ] Review security logs

## Rollback Plan

### 1. **Emergency Rollback**
```bash
# Revert to previous version
git revert <commit-hash>

# Redeploy previous version
npm run deploy:rollback

# Restore database (if needed)
npm run db:rollback
```

### 2. **Partial Rollback**
- Disable new features via feature flags
- Revert specific components
- Maintain core functionality

## Maintenance Tasks

### 1. **Daily Tasks**
- [ ] Monitor error logs
- [ ] Check transaction volumes
- [ ] Verify webhook deliveries
- [ ] Review security alerts

### 2. **Weekly Tasks**
- [ ] Review performance metrics
- [ ] Check database performance
- [ ] Update security patches
- [ ] Review transaction reports

### 3. **Monthly Tasks**
- [ ] Security audit
- [ ] Performance optimization
- [ ] Database maintenance
- [ ] Backup verification

## Emergency Contacts

### 1. **Technical Team**
- **Lead Developer**: [Contact Info]
- **DevOps Engineer**: [Contact Info]
- **Database Administrator**: [Contact Info]

### 2. **Business Team**
- **Product Manager**: [Contact Info]
- **Business Owner**: [Contact Info]
- **Customer Support**: [Contact Info]

### 3. **External Services**
- **Razorpay Support**: support@razorpay.com
- **Supabase Support**: [Support Contact]
- **Hosting Provider**: [Support Contact]

## Documentation

### 1. **API Documentation**
- [ ] API endpoints documented
- [ ] Request/response examples
- [ ] Error codes documented
- [ ] Authentication guide

### 2. **Operational Documentation**
- [ ] Deployment procedures
- [ ] Monitoring setup
- [ ] Troubleshooting guide
- [ ] Emergency procedures

### 3. **User Documentation**
- [ ] User guides
- [ ] FAQ
- [ ] Support contact information

## Success Criteria

### 1. **Technical Success**
- ✅ All tests passing
- ✅ Error rate < 1%
- ✅ Response time < 2 seconds
- ✅ 99.9% uptime

### 2. **Business Success**
- ✅ Payment processing working
- ✅ Wallet functionality operational
- ✅ User experience smooth
- ✅ Revenue tracking accurate

### 3. **Security Success**
- ✅ No security vulnerabilities
- ✅ Data protection compliant
- ✅ Access controls working
- ✅ Audit trail complete

---

## 🎯 **Final Checklist**

Before going live, ensure:

1. **All pre-deployment items completed** ✅
2. **Production tests passing** ✅
3. **Webhook endpoint configured** ✅
4. **Monitoring systems active** ✅
5. **Emergency procedures documented** ✅
6. **Team trained on new system** ✅
7. **Rollback plan ready** ✅

**Status**: Ready for Production Deployment 🚀

---

*Last Updated: [Current Date]*
*Version: 1.0*
*Environment: Production*
