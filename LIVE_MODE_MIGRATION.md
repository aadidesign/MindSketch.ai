# 🔴 RAZORPAY LIVE MODE MIGRATION GUIDE

## 📋 **Pre-Migration Checklist**

### ✅ **Razorpay Dashboard Requirements:**
1. **Complete KYC Verification**
   - Business documents uploaded
   - Bank account verified
   - PAN card verified
   - Approval received from Razorpay

2. **Live API Keys Generated**
   - Live Key ID (starts with `rzp_live_`)
   - Live Key Secret
   - Keys downloaded securely

3. **Payment Methods Enabled**
   - Cards (Domestic & International)
   - UPI payments
   - Net Banking
   - Wallets & EMI

---

## 🔧 **Code Changes Required**

### **Step 1: Update Environment Variables**

**Backend (server/.env):**
```bash
# Replace test keys with live keys
RAZORPAY_KEY_ID=rzp_live_YOUR_ACTUAL_LIVE_KEY_ID
RAZORPAY_KEY_SECRET=your_actual_live_key_secret

# Keep other variables same
MONGODB_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret
FIREBASE_PROJECT_ID=mindsketch11
```

**Frontend (client/.env):**
```bash
# Replace test key with live key
VITE_RAZORPAY_KEY_ID=rzp_live_YOUR_ACTUAL_LIVE_KEY_ID

# Keep other variables same
VITE_BACKEND_URL=http://localhost:4000
VITE_FIREBASE_API_KEY=your_firebase_key
# ... other Firebase config
```

### **Step 2: Update Domain URLs (Production)**

**When deploying to production, update these:**

**Backend URL (client/.env):**
```bash
VITE_BACKEND_URL=https://yourdomain.com
```

**Webhook URL in Razorpay Dashboard:**
```
https://yourdomain.com/api/users/webhook
```

---

## ⚠️ **Important Security Notes**

### **🔒 Environment Security:**
- ✅ Never commit live keys to version control
- ✅ Use environment variables only
- ✅ Restrict live key permissions in Razorpay dashboard
- ✅ Set up IP whitelisting if possible

### **🛡️ Production Security:**
- ✅ Enable HTTPS on your domain
- ✅ Set up proper CORS policies
- ✅ Implement rate limiting
- ✅ Add request validation

---

## 🧪 **Testing Live Mode**

### **Test with Small Amounts:**
```javascript
// Test orders (₹1 = 100 paise)
Basic: ₹1 (100 paise)
Advanced: ₹2 (200 paise)  
Business: ₹5 (500 paise)
```

### **Test Payment Methods:**
- ✅ Credit/Debit cards
- ✅ UPI payments
- ✅ Net banking
- ✅ Wallets

---

## 📊 **Live Mode Differences**

| Feature | Test Mode | Live Mode |
|---------|-----------|-----------|
| **Key Prefix** | `rzp_test_` | `rzp_live_` |
| **Real Money** | ❌ Fake | ✅ Real |
| **Webhook** | Optional | Recommended |
| **KYC** | Not required | ✅ Required |
| **Settlement** | No real money | ✅ Bank transfer |

---

## 🚀 **Deployment Checklist**

### **Before Going Live:**
- [ ] KYC approved by Razorpay
- [ ] Live keys generated and secured
- [ ] Test transactions successful
- [ ] Webhook configured
- [ ] HTTPS enabled
- [ ] Error handling tested
- [ ] Refund process documented

### **After Going Live:**
- [ ] Monitor first few transactions
- [ ] Check webhook delivery
- [ ] Verify settlements
- [ ] Test customer support flow

---

## 📞 **Support & Monitoring**

### **Razorpay Dashboard Monitoring:**
- Payment success rates
- Failed payment reasons
- Settlement schedules
- Customer disputes

### **Customer Support:**
- Payment confirmation emails
- Refund process
- Transaction IDs for tracking
- Clear error messages

---

## 🔥 **Emergency Rollback Plan**

If issues occur, quickly revert to test mode:

1. **Replace live keys with test keys**
2. **Update environment variables**
3. **Restart servers**
4. **Test payment flow**

Keep test keys backed up for emergencies!

---

**✅ Ready for Live Mode when you complete KYC and get live keys!**
