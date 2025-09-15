// Updated userController.js with better error handling and debugging

import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { verifyFirebaseToken } from '../config/firebase.js';

dotenv.config();

// Debug Razorpay configuration
console.log('🔍 Razorpay Configuration Check:');
console.log('Key ID exists:', !!process.env.RAZORPAY_KEY_ID);
console.log('Key Secret exists:', !!process.env.RAZORPAY_KEY_SECRET);
console.log('Key ID preview:', process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID.substring(0, 10) + '...' : 'NOT SET');

// Check if in live mode or test mode
const isLiveMode = process.env.RAZORPAY_KEY_ID?.startsWith('rzp_live_');
console.log('🚀 Razorpay Mode:', isLiveMode ? '🔴 LIVE MODE' : '🧪 TEST MODE');
if (isLiveMode) {
    console.log('⚠️  LIVE MODE ACTIVE - Real payments will be processed!');
} else {
    console.log('💡 TEST MODE - Use test cards for payments');
}

// Initialize Razorpay with error handling
let razorpay;
try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        console.error('❌ RAZORPAY KEYS ARE MISSING!');
        console.error('Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file');
    } else {
        // Validate key format
        const keyId = process.env.RAZORPAY_KEY_ID;
        if (!keyId.startsWith('rzp_test_') && !keyId.startsWith('rzp_live_')) {
            console.error('❌ Invalid Razorpay Key ID format!');
            console.error('Key should start with rzp_test_ or rzp_live_');
        } else {
            razorpay = new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID,
                key_secret: process.env.RAZORPAY_KEY_SECRET,
            });
            console.log('✅ Razorpay initialized successfully');
            
            // Live mode warnings
            if (isLiveMode) {
                console.log('🔔 LIVE MODE REMINDERS:');
                console.log('   - Real money will be charged');
                console.log('   - Ensure KYC is approved');
                console.log('   - Monitor transactions closely');
                console.log('   - Have customer support ready');
            }
        }
    }
} catch (error) {
    console.error('❌ Razorpay initialization failed:', error);
}

// Server-side source of truth for plans
const PLANS = {
    Basic: { 
        id: 'Basic',
        price: 12, // in USD
        pricePaise: 1200, // in cents (12 * 100)
        credits: 100, 
        currency: 'USD', 
        description: 'Best for personal use.',
        popular: false
    },
    Advanced: { 
        id: 'Advanced',
        price: 60,
        pricePaise: 6000, // in cents (60 * 100)
        credits: 500, 
        currency: 'USD', 
        description: 'Best for business use.',
        popular: true
    },
    Business: { 
        id: 'Business',
        price: 300,
        pricePaise: 30000, // in cents (300 * 100)
        credits: 5000, 
        currency: 'USD', 
        description: 'Best for enterprise use.',
        popular: false
    }
};



// Firebase Authentication Handler
const firebaseAuth = async (req, res) => {
    try {
        const { firebaseToken, email, name, photoURL } = req.body;
        
        console.log('🔥 Firebase auth attempt for:', email);
        
        if (!firebaseToken) {
            return res.json({
                success: false,
                message: 'Firebase token is required'
            });
        }
        
        // Verify Firebase token
        const decodedToken = await verifyFirebaseToken(firebaseToken);
        
        if (!decodedToken) {
            return res.json({
                success: false,
                message: 'Invalid Firebase token'
            });
        }
        
        // Check if user exists
        let user = await userModel.findOne({ email: decodedToken.email });
        
        if (!user) {
            // Create new user
            const userData = {
                name: name || decodedToken.name || decodedToken.email.split('@')[0],
                email: decodedToken.email,
                firebaseUid: decodedToken.uid,
                photoURL: photoURL || decodedToken.picture,
                creditBalance: 5, // Give 5 free credits to new users
                authProvider: 'firebase'
            };
            
            const newUser = new userModel(userData);
            user = await newUser.save();
            
            console.log('✅ New Firebase user created:', user.email);
        } else {
            // Update existing user with Firebase info if needed
            if (!user.firebaseUid) {
                user.firebaseUid = decodedToken.uid;
                user.authProvider = 'firebase';
                await user.save();
            }
            console.log('✅ Existing user logged in:', user.email);
        }
        
        // Generate JWT token for our app
        const appToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        
        res.json({
            success: true,
            token: appToken,
            user: {
                name: user.name,
                email: user.email,
                id: user._id,
                photoURL: user.photoURL
            }
        });
        
    } catch (error) {
        console.error('❌ Firebase auth error:', error);
        res.json({ 
            success: false, 
            message: 'Firebase authentication failed: ' + error.message 
        });
    }
};

const userCredits = async (req, res) => {
    try {
        const userId = req.userId;
        console.log('📊 Fetching credits for user:', userId);
        
        const user = await userModel.findById(userId);
        
        if (!user) {
            return res.json({
                success: false, 
                message: 'User not found'
            });
        }

        // Check if user needs to purchase credits
        const needsCredits = user.creditBalance <= 0;
        const lowCredits = user.creditBalance <= 10;

        console.log('✅ Credits fetched:', { userId, credits: user.creditBalance });

        res.json({
            success: true, 
            credits: user.creditBalance, 
            user: {
                name: user.name,
                email: user.email,
                id: user._id
            },
            billing: {
                needsCredits,
                lowCredits,
                availablePlans: PLANS,
                canPurchase: true
            }
        });

    } catch (error) {
        console.error('❌ Credits fetch error:', error);
        res.json({ success: false, message: error.message });
    }
};

// Create Razorpay order with extensive debugging
export const createOrder = async (req, res) => {
    try {
        console.log('🚀 Create order request received');
        console.log('Headers:', req.headers);
        console.log('Body:', req.body);
        console.log('User ID from middleware:', req.userId);
        
        const userId = req.userId;
        const { planId } = req.body;

        // Validate authentication
        if (!userId) {
            console.error('❌ No user ID found');
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        // Validate plan
        if (!planId) {
            console.error('❌ No plan ID provided');
            return res.status(400).json({
                success: false,
                message: 'Plan ID is required'
            });
        }

        const plan = PLANS[planId];
        if (!plan) {
            console.error('❌ Invalid plan ID:', planId);
            console.log('Available plans:', Object.keys(PLANS));
            return res.status(400).json({
                success: false, 
                message: `Invalid plan selected. Available plans: ${Object.keys(PLANS).join(', ')}`
            });
        }

        console.log('✅ Plan validated:', plan);

        // Check if Razorpay is initialized
        if (!razorpay) {
            console.error('❌ Razorpay not initialized');
            return res.status(500).json({
                success: false,
                message: 'Payment gateway not configured. Please contact support.'
            });
        }

        // Create a short, unique receipt ID (max 40 chars)
        const timestamp = Date.now().toString();
        const shortUserId = userId.toString().slice(-8); // Last 8 chars of user ID
        const receipt = `rcpt_${shortUserId}_${timestamp.slice(-10)}`; // Max ~25 chars
        
        // Create Razorpay order
        const options = {
            amount: plan.pricePaise, // amount in smallest currency unit (cents for USD)
            currency: plan.currency,
            receipt: receipt,
            notes: {
                userId: userId,
                planId: planId,
                credits: plan.credits.toString(),
                userEmail: req.userEmail || 'unknown' // Add if available
            }
        };

        console.log('📦 Creating Razorpay order with options:', options);
        console.log('📋 Receipt ID length:', receipt.length, '- Receipt:', receipt);

        const order = await razorpay.orders.create(options);
        
        console.log('✅ Razorpay order created successfully:', {
            orderId: order.id,
            amount: order.amount,
            currency: order.currency
        });

        return res.json({ 
            success: true, 
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            planId: planId,
            credits: plan.credits,
            message: 'Order created successfully'
        });

    } catch (error) {
        console.error('❌ Create order error:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        
        // Handle specific Razorpay errors
        if (error.error && error.error.code) {
            return res.status(400).json({
                success: false,
                message: `Razorpay Error: ${error.error.description || error.error.code}`,
                errorCode: error.error.code
            });
        }
        
        return res.status(500).json({
            success: false, 
            message: 'Failed to create order: ' + error.message,
            errorType: error.name || 'UnknownError'
        });
    }
};

// Verify Razorpay payment with debugging
export const verifyPayment = async (req, res) => {
    try {
        console.log('🔍 Payment verification request received');
        console.log('Body:', req.body);
        
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const userId = req.userId;
        
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            console.error('❌ Missing payment details');
            return res.status(400).json({
                success: false,
                message: 'Missing payment details'
            });
        }

        // Verify the payment signature
        const text = razorpay_order_id + "|" + razorpay_payment_id;
        const signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(text)
            .digest('hex');

        console.log('🔐 Signature verification:', {
            generated: signature,
            received: razorpay_signature,
            match: signature === razorpay_signature
        });

        if (signature !== razorpay_signature) {
            console.error('❌ Invalid payment signature');
            return res.status(400).json({
                success: false, 
                message: 'Invalid payment signature'
            });
        }

        // Get order details to extract user info and credits
        const order = await razorpay.orders.fetch(razorpay_order_id);
        console.log('📦 Order details:', order);
        
        const orderUserId = order.notes.userId;
        const credits = parseInt(order.notes.credits);
        const planId = order.notes.planId;

        // Verify that the order belongs to the authenticated user
        if (orderUserId !== userId) {
            console.error('❌ Order user mismatch:', { orderUserId, userId });
            return res.status(403).json({
                success: false,
                message: 'Order does not belong to authenticated user'
            });
        }

        if (credits > 0) {
            // Add credits to user account
            const updatedUser = await userModel.findByIdAndUpdate(
                userId, 
                { $inc: { creditBalance: credits } },
                { new: true }
            );

            if (!updatedUser) {
                console.error('❌ User not found for credit update');
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            console.log('✅ Payment verified and credits added:', {
                userId,
                creditsAdded: credits,
                newBalance: updatedUser.creditBalance
            });

            return res.json({ 
                success: true, 
                message: 'Payment verified and credits added successfully',
                paymentId: razorpay_payment_id,
                orderId: razorpay_order_id,
                creditsAdded: credits,
                newBalance: updatedUser.creditBalance,
                planId: planId
            });
        } else {
            console.error('❌ Invalid credits amount:', credits);
            return res.status(400).json({
                success: false,
                message: 'Invalid credits amount'
            });
        }
    } catch (error) {
        console.error('❌ Payment verification error:', error);
        return res.status(500).json({
            success: false, 
            message: 'Payment verification failed: ' + error.message
        });
    }
};


// Legacy Stripe webhook (keep for backward compatibility if needed)
export const stripeWebhook = async (req, res) => {
    try {
        res.json({ 
            received: true, 
            message: 'Webhook received but Stripe is deprecated in favor of Razorpay' 
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

export { userCredits, firebaseAuth };