import Razorpay from 'razorpay';
import userModel from '../models/userModel.js';
import crypto from 'crypto';

// Debug: Check if Razorpay keys are loaded
console.log('=== RAZORPAY KEY DEBUG ===');
console.log('Razorpay Key ID loaded:', process.env.RAZORPAY_KEY_ID ? 'YES' : 'NO');
console.log('Razorpay Key Secret loaded:', process.env.RAZORPAY_KEY_SECRET ? 'YES' : 'NO');
console.log('Environment variables available:', Object.keys(process.env).filter(key => key.includes('RAZORPAY')));

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error('ERROR: RAZORPAY keys are not set!');
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Server-side source of truth for plans to prevent client tampering
const PLANS = {
  Basic: { pricePaise: 100000, credits: 100, currency: 'INR', name: 'Basic' }, // ₹1000
  Advanced: { pricePaise: 500000, credits: 500, currency: 'INR', name: 'Advanced' }, // ₹5000
  Business: { pricePaise: 2500000, credits: 5000, currency: 'INR', name: 'Business' } // ₹25000

};

export const createCheckoutSession = async (req, res) => {
  try {
    const userId = req.userId;
    const { planId } = req.body;

    const plan = PLANS[planId];
    if (!plan) {
      return res.status(400).json({ success: false, message: 'Invalid plan selected' });
    }


    const options = {
      amount: plan.pricePaise, // amount in paise
      currency: plan.currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: userId,
        planId: planId,
        credits: plan.credits.toString()
      }
    };

    const order = await razorpay.orders.create(options);

    return res.json({ 
      success: true, 
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      planId: planId,
      credits: plan.credits
    });
  } catch (error) {
    console.log('Razorpay order creation error:', error);

    return res.status(500).json({ success: false, message: error.message });
  }
};

0
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    // Verify the payment signature
    const text = razorpay_order_id + "|" + razorpay_payment_id;
    const signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    if (signature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // Get order details to extract user info and credits
    const order = await razorpay.orders.fetch(razorpay_order_id);
    const userId = order.notes.userId;
    const credits = parseInt(order.notes.credits);

    if (userId && credits > 0) {
      await userModel.findByIdAndUpdate(userId, { $inc: { creditBalance: credits } });
    }

    return res.json({ 
      success: true, 
      message: 'Payment verified and credits added',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id
    });
  } catch (error) {
    console.log('Payment verification error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default { createCheckoutSession, verifyPayment };



