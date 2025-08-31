# Login System Documentation

## 🚀 Overview

The Nakoda Partner platform features a robust, multi-role authentication system that supports **Admin Users** and **Partners** through OTP-based mobile verification. The system has been enhanced with comprehensive error handling, intelligent user selection, and graceful fallbacks for all edge cases.

## 🔐 Authentication Flow

### **1. Mobile Number Input**
- User enters mobile number on login page
- System validates mobile number format (10-digit Indian mobile)
- Mobile number is cleaned and sanitized for consistent processing

### **2. OTP Generation & Delivery**
- System generates secure 6-digit OTP
- OTP is stored securely in database with 10-minute expiry
- OTP is delivered via SMS using Fast2SMS DLT API
- Rate limiting prevents abuse (max 3 requests per minute)

### **3. OTP Validation**
- User enters received OTP
- System validates OTP against stored value
- Handles expired OTPs, max attempts, and missing OTPs gracefully

### **4. User Lookup & Authentication**
- System searches for user in both `admin_users` and `partners` tables
- Intelligent handling of duplicate mobile numbers
- Smart user selection based on status priority
- JWT token generation upon successful authentication

## 🏗️ System Architecture

### **Frontend Components**
```
src/
├── app/
│   ├── login/
│   │   └── page.tsx          # Main login page
│   └── partner/
│       └── page.tsx          # Partner dashboard
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx     # Login form component
│   │   └── OTPInput.tsx      # OTP input component
│   └── layout/
│       └── Header.tsx        # Navigation header
└── hooks/
    ├── useAuth.ts            # Authentication state management
    └── useOTP.ts             # OTP-related operations
```

### **Backend APIs**
```
src/app/api/
├── send-otp/                 # OTP generation and SMS delivery
├── validate-otp/             # OTP validation and user authentication
├── validate-admin/            # Admin-specific validation
├── validate-partner/          # Partner-specific validation
└── users/check-role/         # User role verification
```

### **Services & Utilities**
```
src/
├── services/
│   ├── otpService.ts         # OTP generation, storage, validation
│   ├── partnerService.ts     # Partner data operations
│   └── adminUserService.ts   # Admin user operations
├── utils/
│   ├── authUtils.ts          # JWT token generation
│   ├── validationUtils.ts    # Input validation and sanitization
│   └── mobileUtils.ts        # Mobile number formatting
└── lib/
    └── supabase.ts           # Database client configuration
```

## 📱 Mobile Number Handling

### **Supported Formats**
- **10-digit**: `9326499348`
- **With prefix**: `+91 9326499348`
- **International**: `+91-9326499348`

### **Cleaning & Sanitization**
```typescript
// Input: +91 9326499348
// Output: 9326499348 (for database operations)
export const cleanMobileNumber = (mobile: string): string => {
  return mobile.replace(/^\+91\s*/, '');
};
```

### **Validation Rules**
- Must be 10 digits
- Must start with 6, 7, 8, or 9 (Indian mobile format)
- Leading zeros are not allowed
- Special characters are stripped

## 🔑 OTP System

### **OTP Configuration**
```typescript
const OTP_CONFIG = {
  LENGTH: 6,                    // 6-digit OTP
  EXPIRY_MINUTES: 10,          // 10 minutes validity
  MAX_ATTEMPTS: 3,             // Max 3 attempts
  RATE_LIMIT_WINDOW: 60000,    // 1 minute rate limit
  RATE_LIMIT_MAX: 3            // Max 3 requests per minute
};
```

### **OTP Storage Schema**
```sql
CREATE TABLE otp_store (
  id SERIAL PRIMARY KEY,
  mobile VARCHAR(15) NOT NULL UNIQUE,
  otp VARCHAR(10) NOT NULL,
  expires_at BIGINT NOT NULL,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Security Features**
- **Unique constraint** on mobile number prevents duplicate OTPs
- **Automatic expiry** after 10 minutes
- **Attempt tracking** prevents brute force attacks
- **Rate limiting** prevents SMS abuse
- **Secure deletion** after successful validation

## 👥 User Lookup System

### **Multi-Table Search Strategy**
1. **Admin Users Table** (`admin_users`)
   - Search by `phone` field
   - Check for `Active` status
   - Verify admin role permissions

2. **Partners Table** (`partners`)
   - Search by `mobile` field
   - Check for `Active` or `Pending` status
   - Verify service type and verification status

### **Intelligent Duplicate Handling**
When multiple users exist with the same mobile number:

```typescript
// Priority-based selection
const activePartner = partners.find(p => p.status === 'Active' || p.status === 'active');
const pendingPartner = partners.find(p => p.status === 'Pending' || p.status === 'pending');
const selectedPartner = activePartner || pendingPartner || partners[0];
```

**Priority Order:**
1. **Active** users (highest priority)
2. **Pending** verification users
3. **First available** user (fallback)

### **Alternative Format Handling**
- **+91 prefix**: Tries both with and without country code
- **Format variations**: Handles different mobile number formats
- **Fuzzy matching**: LIKE search as last resort

## 🛡️ Error Handling & User Experience

### **OTP-Related Errors**
| Error Type | Message | Status Code | User Action |
|------------|---------|-------------|-------------|
| **Missing OTP** | "OTP expired or not found. Please request a new OTP." | 400 | Request new OTP |
| **Invalid OTP** | "Invalid OTP. X attempts remaining." | 400 | Re-enter OTP |
| **Max Attempts** | "Too many failed attempts. Please request a new OTP." | 429 | Wait and retry |
| **Rate Limited** | "Too many OTP requests. Please wait X minutes." | 429 | Wait before retry |

### **User Lookup Errors**
| Error Type | Message | Status Code | User Action |
|------------|---------|-------------|-------------|
| **Not Registered** | "Mobile number not registered. Please check and try again." | 404 | Verify mobile number |
| **Account Deactivated** | "Partner account is deactivated. Please contact administrator." | 403 | Contact support |
| **Admin Inactive** | "Account is deactivated. Please contact your system administrator." | 403 | Contact admin |

### **System Errors**
| Error Type | Message | Status Code | User Action |
|------------|---------|-------------|-------------|
| **Database Error** | "Failed to retrieve user information." | 500 | Try again later |
| **SMS Service Error** | "SMS service temporarily unavailable. Please try again later." | 503 | Wait and retry |
| **Internal Error** | "Internal server error. Please try again later." | 500 | Contact support |

## 🔐 JWT Token System

### **Token Generation**
```typescript
const token = generateJWTToken({
  userId: userData.id,
  email: userData.email,
  phone: userData.mobile || userData.phone,
  role: userType // 'admin' or 'partner'
});
```

### **Token Payload**
```json
{
  "userId": 123,
  "email": "user@example.com",
  "phone": "9326499348",
  "role": "partner",
  "iat": 1640995200,
  "exp": 1640998800
}
```

### **Token Security**
- **Secret key** stored in environment variables
- **Expiration time** configurable (default: 1 hour)
- **Role-based access** control
- **Secure storage** in HTTP-only cookies

## 📊 Database Schema

### **Admin Users Table**
```sql
CREATE TABLE admin_users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  role VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'Active',
  access_level VARCHAR(100) NOT NULL,
  last_login TIMESTAMP WITH TIME ZONE,
  permissions TEXT[] DEFAULT '{}',
  avatar VARCHAR(10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Partners Table**
```sql
CREATE TABLE partners (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  mobile VARCHAR(15) NOT NULL,
  status VARCHAR(20) DEFAULT 'Pending',
  service_type VARCHAR(100),
  verification_status VARCHAR(20) DEFAULT 'Pending',
  documents_verified BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_orders INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0.00,
  last_active TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🚨 Troubleshooting Guide

### **Common Issues & Solutions**

#### **Issue 1: OTP Not Received**
**Symptoms:**
- User doesn't receive SMS
- "OTP expired or not found" error

**Solutions:**
1. Check mobile number format
2. Verify SMS service configuration
3. Check rate limiting status
4. Verify OTP store table exists

**Debug Commands:**
```sql
-- Check OTP store contents
SELECT mobile, otp, expires_at, attempts 
FROM otp_store 
ORDER BY created_at DESC;

-- Check for expired OTPs
SELECT mobile, otp, 
  CASE WHEN expires_at < EXTRACT(EPOCH FROM NOW()) * 1000 
       THEN 'EXPIRED' ELSE 'VALID' END as status
FROM otp_store;
```

#### **Issue 2: User Not Found**
**Symptoms:**
- "Mobile number not registered" error
- User exists but can't login

**Solutions:**
1. Check user table for mobile number
2. Verify mobile number format consistency
3. Check for duplicate mobile numbers
4. Verify user status is active

**Debug Commands:**
```sql
-- Check for duplicate mobile numbers
SELECT mobile, COUNT(*) as count, 
       array_agg(name) as names,
       array_agg(status) as statuses
FROM partners 
GROUP BY mobile 
HAVING COUNT(*) > 1;

-- Check user by mobile
SELECT * FROM partners WHERE mobile = '9326499348';
SELECT * FROM admin_users WHERE phone = '9326499348';
```

#### **Issue 3: Authentication Failures**
**Symptoms:**
- Login succeeds but user can't access features
- JWT token issues
- Role verification failures

**Solutions:**
1. Verify JWT token generation
2. Check user role and permissions
3. Verify token expiration
4. Check middleware configuration

**Debug Commands:**
```sql
-- Check user permissions
SELECT id, name, role, status, permissions 
FROM admin_users 
WHERE phone = '9326499348';

-- Check partner verification
SELECT id, name, status, verification_status, documents_verified 
FROM partners 
WHERE mobile = '9326499348';
```

### **Performance Monitoring**

#### **Key Metrics to Track**
- **OTP delivery success rate**
- **Authentication success rate**
- **User lookup response time**
- **JWT token generation time**
- **Database query performance**

#### **Log Analysis**
```bash
# Search for authentication errors
grep "Authentication failed" /var/log/app.log

# Search for OTP validation errors
grep "OTP validation failed" /var/log/app.log

# Search for user lookup errors
grep "User not found" /var/log/app.log
```

## 🔧 Configuration

### **Environment Variables**
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=3600

# SMS Service Configuration
FAST2SMS_API_KEY=your_fast2sms_api_key
FAST2SMS_SENDER_ID=your_sender_id
FAST2SMS_TEMPLATE_ID=your_template_id

# OTP Configuration
OTP_LENGTH=6
OTP_EXPIRY_MINUTES=10
OTP_MAX_ATTEMPTS=3
OTP_RATE_LIMIT_WINDOW=60000
OTP_RATE_LIMIT_MAX=3
```

### **Database Configuration**
```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_otp_store_mobile ON otp_store(mobile);
CREATE INDEX IF NOT EXISTS idx_otp_store_expires ON otp_store(expires_at);
CREATE INDEX IF NOT EXISTS idx_partners_mobile ON partners(mobile);
CREATE INDEX IF NOT EXISTS idx_admin_users_phone ON admin_users(phone);

-- Add unique constraints
ALTER TABLE otp_store ADD CONSTRAINT otp_store_mobile_unique UNIQUE (mobile);
ALTER TABLE partners ADD CONSTRAINT partners_mobile_unique UNIQUE (mobile);
```

## 🚀 Best Practices

### **Security**
1. **Never log sensitive data** (OTPs, passwords, tokens)
2. **Use HTTPS** for all authentication requests
3. **Implement rate limiting** to prevent abuse
4. **Validate all inputs** before processing
5. **Use secure session management**

### **Performance**
1. **Index frequently queried fields** (mobile, email)
2. **Cache user data** when appropriate
3. **Optimize database queries** to avoid N+1 problems
4. **Use connection pooling** for database connections
5. **Monitor query performance** regularly

### **User Experience**
1. **Provide clear error messages** that guide user actions
2. **Implement progressive disclosure** for complex forms
3. **Use consistent validation** across all forms
4. **Provide helpful feedback** during authentication process
5. **Handle edge cases gracefully** without crashing

### **Maintenance**
1. **Regular cleanup** of expired OTPs
2. **Monitor system logs** for errors and performance issues
3. **Update dependencies** regularly for security patches
4. **Backup critical data** regularly
5. **Test authentication flow** after any changes

## 📝 API Reference

### **Send OTP**
```http
POST /api/send-otp
Content-Type: application/json

{
  "mobile": "9326499348"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully to your mobile number",
  "expiresIn": "10 minutes"
}
```

### **Validate OTP**
```http
POST /api/validate-otp
Content-Type: application/json

{
  "mobile": "9326499348",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Authentication successful",
  "user": {
    "id": 123,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9326499348",
    "role": "partner"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### **Check User Role**
```http
GET /api/users/check-role?mobile=9326499348&table=partners
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "name": "John Doe",
    "email": "john@example.com",
    "mobile": "9326499348",
    "status": "Active",
    "user_role": "partner",
    "source_table": "partners"
  }
}
```

## 🔄 Recent Updates & Fixes

### **PGRST116 Error Fixes**
- **Removed all `.single()` calls** that caused crashes
- **Implemented array-based queries** with intelligent selection
- **Added graceful error handling** for missing/multiple users
- **Fixed table reference issues** in OTP service

### **Enhanced Error Handling**
- **Specific error messages** for different failure scenarios
- **Appropriate HTTP status codes** for different error types
- **Comprehensive logging** for debugging
- **User-friendly error messages** with actionable instructions

### **Intelligent User Selection**
- **Priority-based selection** when duplicates exist
- **Status-aware filtering** (Active > Pending > Others)
- **Multiple format support** (+91 prefix, variations)
- **Graceful fallbacks** for all edge cases

## 📞 Support & Contact

### **Technical Support**
- **Email**: tech-support@nakoda.com
- **Phone**: +91-XXX-XXX-XXXX
- **Hours**: Monday-Friday, 9 AM - 6 PM IST

### **Documentation Updates**
- **Last Updated**: [Current Date]
- **Version**: 2.0.0
- **Maintainer**: Development Team

### **Bug Reports & Feature Requests**
- **GitHub Issues**: [Repository URL]
- **Internal Ticketing**: [Ticketing System URL]
- **Priority Levels**: Critical, High, Medium, Low

---

**Note**: This documentation is maintained by the development team and should be updated whenever significant changes are made to the authentication system. For the most up-to-date information, please refer to the source code and API documentation.
