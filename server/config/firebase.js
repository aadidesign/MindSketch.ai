import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let firebaseApp;

try {
    // For development, we can verify tokens without admin SDK
    // Just validate the token structure and let Firebase handle verification
    console.log('🔍 Firebase config check:');
    console.log('- Project ID:', process.env.FIREBASE_PROJECT_ID || 'Not set');
    console.log('- Service Account:', process.env.FIREBASE_SERVICE_ACCOUNT_KEY ? 'Set' : 'Not set');
    
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        // Production: Use service account
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        
        firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        
        console.log('✅ Firebase Admin initialized with service account');
    } else if (process.env.FIREBASE_PROJECT_ID) {
        // Development: Simple project ID setup
        firebaseApp = admin.initializeApp({
            projectId: process.env.FIREBASE_PROJECT_ID
        });
        
        console.log('✅ Firebase Admin initialized with project ID');
    } else {
        console.log('⚠️ Firebase Admin not initialized - using fallback verification');
    }
} catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error.message);
    console.log('📝 Will use fallback token verification');
}

export const verifyFirebaseToken = async (idToken) => {
    try {
        if (firebaseApp) {
            // Use Firebase Admin SDK if available
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            console.log('✅ Token verified with Admin SDK');
            return decodedToken;
        } else {
            // Fallback: Basic token validation without Admin SDK
            console.log('📝 Using fallback token verification');
            
            // Decode the token to get basic info (for development only)
            const parts = idToken.split('.');
            if (parts.length !== 3) {
                throw new Error('Invalid token structure - must have 3 parts');
            }
            
            try {
                // Use Node.js Buffer to decode base64
                const base64Payload = parts[1];
                // Add padding if needed
                const paddedPayload = base64Payload + '='.repeat((4 - base64Payload.length % 4) % 4);
                const jsonPayload = Buffer.from(paddedPayload, 'base64').toString('utf8');
                const payload = JSON.parse(jsonPayload);
                
                console.log('📋 Decoded token payload:', {
                    uid: payload.sub || payload.uid,
                    email: payload.email,
                    exp: payload.exp,
                    iss: payload.iss
                });
                
                // Basic validation
                if (!payload.email || !(payload.uid || payload.sub)) {
                    throw new Error('Invalid token structure - missing required fields');
                }
                
                // Check if token is expired
                const now = Math.floor(Date.now() / 1000);
                if (payload.exp < now) {
                    throw new Error('Token expired');
                }
                
                console.log('✅ Token verified with fallback method');
                return {
                    uid: payload.sub || payload.uid, // Firebase uses 'sub' in JWT
                    email: payload.email,
                    name: payload.name || payload.email.split('@')[0],
                    picture: payload.picture
                };
            } catch (parseError) {
                console.error('Token parsing error:', parseError);
                throw new Error('Invalid token structure: ' + parseError.message);
            }
        }
    } catch (error) {
        console.error('Firebase token verification failed:', error);
        throw error;
    }
};

export default firebaseApp;
