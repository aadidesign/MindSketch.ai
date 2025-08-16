import express from 'express';
import userAuth from '../middlewares/auth.js';
import { createCheckoutSession, verifyPayment } from '../controllers/billingController.js';

const billingRouter = express.Router();

// Create Razorpay order
billingRouter.post('/create-order', userAuth, createCheckoutSession);

// Verify payment after completion
billingRouter.post('/verify-payment', userAuth, verifyPayment);


export default billingRouter;


