// userRoutes.js
import express from 'express';
import { 
    registerUser, 
    loginUser, 
    userCredits, 
    createOrder, 
    verifyPayment, 
    stripeWebhook 
} from '../controllers/userController.js';
import authUser from '../middlewares/auth.js';

const userRouter = express.Router();

// Authentication routes
userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);

// Protected routes (require authentication)
userRouter.get('/credits', authUser, userCredits);
userRouter.post('/create-order', authUser, createOrder);
userRouter.post('/verify-payment', authUser, verifyPayment);

// Legacy webhook (can be removed if fully migrating to Razorpay)
userRouter.post('/webhook', stripeWebhook);

export default userRouter;