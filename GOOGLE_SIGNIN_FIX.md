# 🔧 Google Sign-in Fix Guide

## Common Issues and Solutions

### 1. **Firebase Console Configuration**

**❌ Problem**: Google sign-in not properly configured in Firebase Console.

**✅ Solution**: Follow these steps:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`mindsketch11`)
3. Go to **Authentication** > **Sign-in method**
4. Click on **Google** provider
5. **Enable** the Google provider
6. Add your **project support email**
7. **Save** the configuration

### 2. **OAuth Configuration**

**❌ Problem**: OAuth consent screen not configured properly.

**✅ Solution**:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (`mindsketch11`)
3. Go to **APIs & Services** > **OAuth consent screen**
4. Configure the consent screen:
   - **App name**: MindSketch
   - **User support email**: Your email
   - **Developer contact email**: Your email
   - **Authorized domains**: Add your domain (e.g., `localhost`, `yourdomain.com`)

### 3. **Web Credentials Configuration**

**❌ Problem**: Web application not properly configured for OAuth.

**✅ Solution**:

1. In Google Cloud Console, go to **Credentials**
2. Find your **Web application** OAuth 2.0 client
3. Add **Authorized origins**:
   - `http://localhost:3000` (for development)
   - `http://localhost:5173` (for Vite dev server)
   - Your production domain
4. Add **Authorized redirect URIs**:
   - `http://localhost:3000/__/auth/handler`
   - `http://localhost:5173/__/auth/handler`
   - Your production domain auth handler

### 4. **Environment Variables Check**

Make sure your `client/.env` file has correct values:

```bash
VITE_FIREBASE_API_KEY="AIzaSyC832ufx-_Bu04Vc9eOlPd5Roo-QaL1f0c"
VITE_FIREBASE_AUTH_DOMAIN="mindsketch11.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="mindsketch11"
VITE_FIREBASE_STORAGE_BUCKET="mindsketch11.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="390059025239"
VITE_FIREBASE_APP_ID="1:390059025239:web:6fcaed47a1bb6ccc9b9412"
VITE_FIREBASE_MEASUREMENT_ID="G-PJJ2YHDG8B"
```

### 5. **Browser Issues**

**❌ Problem**: Pop-up blocked or browser restrictions.

**✅ Solutions**:

- **Allow pop-ups** in your browser for localhost/your domain
- **Clear browser cache** and cookies
- **Disable ad blockers** temporarily
- Try **incognito/private mode**
- Use **Chrome or Firefox** (better Firebase support)

### 6. **Development Server Issues**

**❌ Problem**: Vite dev server configuration.

**✅ Solution**: Make sure Vite is running on the correct port:

```bash
cd client
npm run dev
```

If running on a different port, update your Firebase/Google OAuth configuration accordingly.

### 7. **Firewall/Network Issues**

**❌ Problem**: Network restrictions blocking Google APIs.

**✅ Solutions**:

- Check if your firewall allows connections to:
  - `googleapis.com`
  - `firebase.googleapis.com`
  - `identitytoolkit.googleapis.com`
- Try from a different network if on corporate/restricted network

### 8. **Debug Steps**

Open browser console and check for specific errors:

```javascript
// Check Firebase config
console.log('Firebase config:', {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID
});

// Test Firebase auth
import { auth } from './src/config/firebase';
console.log('Firebase auth:', auth);
```

## Updated Code Features

✅ **Enhanced Error Handling**: Better error messages for different failure scenarios
✅ **Google Provider Configuration**: Proper scopes and parameters
✅ **Debug Logging**: Console logs to help identify issues
✅ **Fallback Handling**: Graceful handling of various error codes

## Testing Checklist

- [ ] Firebase project has Google authentication enabled
- [ ] OAuth consent screen is configured
- [ ] Web application has correct authorized origins
- [ ] Environment variables are set correctly
- [ ] Pop-ups are allowed in browser
- [ ] Dev server is running on correct port
- [ ] No firewall blocking Google APIs

## Common Error Messages and Fixes

| Error | Fix |
|-------|-----|
| `popup-blocked` | Allow pop-ups for your domain |
| `popup-closed-by-user` | User cancelled - normal behavior |
| `invalid-api-key` | Check your Firebase API key |
| `network-request-failed` | Check internet connection |
| `internal-error` | Try again, temporary Firebase issue |

After following these steps, Google Sign-in should work properly! 🎉
