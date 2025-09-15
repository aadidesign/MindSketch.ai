// userRoutes.js
import express from 'express';
import { 
    userCredits, 
    createOrder, 
    verifyPayment, 
    stripeWebhook,
    firebaseAuth
} from '../controllers/userController.js';
import authUser from '../middlewares/auth.js';

const userRouter = express.Router();

// Authentication routes
userRouter.post('/firebase-auth', firebaseAuth);

// Protected routes (require authentication)
userRouter.get('/credits', authUser, userCredits);
userRouter.post('/create-order', authUser, createOrder);
userRouter.post('/verify-payment', authUser, verifyPayment);

// Legacy webhook (can be removed if fully migrating to Razorpay)
userRouter.post('/webhook', stripeWebhook);

// Razorpay Webhook (for live mode monitoring)
userRouter.post('/razorpay-webhook', express.json(), (req, res) => {
    console.log('🔔 Razorpay Webhook received:', req.body);
    
    const { event, payload } = req.body;
    
    switch (event) {
        case 'payment.captured':
            console.log('✅ Payment captured:', payload.payment.entity.id);
            break;
        case 'payment.failed':
            console.log('❌ Payment failed:', payload.payment.entity.id);
            break;
        default:
            console.log('📝 Other event:', event);
    }
    
    res.json({ status: 'ok' });
});

export default userRouter;