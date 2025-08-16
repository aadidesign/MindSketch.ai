// userModel.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    creditBalance: {
        type: Number,
        default: 5 // Give 5 free credits to new users
    },
    phone: {
        type: String,
        required: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    // Payment history for tracking
    paymentHistory: [{
        paymentId: String,
        orderId: String,
        amount: Number,
        credits: Number,
        planId: String,
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed'],
            default: 'pending'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

const userModel = mongoose.model('User', userSchema);

export default userModel;