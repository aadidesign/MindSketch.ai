// Updated BuyCredit component with better error handling and debugging

import { assets, plans } from "../assets/assets";
import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import axios from 'axios';
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function BuyCredit() {
  const { user, token, backendUrl, loadCreditsData } = useContext(AppContext);
  const [billingInfo, setBillingInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const navigate = useNavigate();

  // Debug logging
  useEffect(() => {
    console.log('🔍 BuyCredit Component Debug:');
    console.log('User:', user);
    console.log('Token exists:', !!token);
    console.log('Backend URL:', backendUrl);
    console.log('Razorpay Key ID:', import.meta.env.VITE_RAZORPAY_KEY_ID ? 'Set' : 'Not Set');
  }, [user, token, backendUrl]);

  useEffect(() => {
    const fetchBillingInfo = async () => {
      try {
        if (token) {
          console.log('📊 Fetching billing info...');
          const { data } = await axios.get(
            `${backendUrl}/api/users/credits`,
            { headers: { token } }
          );
          
          console.log('📊 Billing info response:', data);
          
          if (data.success && data.billing) {
            setBillingInfo(data.billing);
            console.log('✅ Billing info set:', data.billing);
          } else {
            console.error('❌ Failed to fetch billing info:', data.message);
          }
        }
      } catch (error) {
        console.error('❌ Error fetching billing info:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBillingInfo();
  }, [token, backendUrl]);

  // Check if Razorpay script is loaded
  const isRazorpayLoaded = () => {
    return typeof window !== 'undefined' && window.Razorpay;
  };

  // Load Razorpay script dynamically if not already loaded
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (isRazorpayLoaded()) {
        console.log('✅ Razorpay script already loaded');
        resolve(true);
        return;
      }

      console.log('📦 Loading Razorpay script...');
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        console.log('✅ Razorpay script loaded successfully');
        resolve(true);
      };
      script.onerror = () => {
        console.error('❌ Failed to load Razorpay script');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const purchase = async (planId) => {
    try {
      console.log('🛒 Purchase initiated for plan:', planId);
      
      if (!token) {
        alert('Please login first');
        return;
      }

      if (!user) {
        alert('User information not available');
        return;
      }

      // Validate Razorpay Key
      const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!razorpayKeyId) {
        console.error('❌ Razorpay Key ID not configured');
        alert('Payment configuration error. Please contact support.');
        return;
      }

      setPurchaseLoading(true);

      // Load Razorpay script if not already loaded
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert('Failed to load payment gateway. Please try again.');
        setPurchaseLoading(false);
        return;
      }

      console.log('📦 Creating order for plan:', planId);
      console.log('Request details:', {
        url: `${backendUrl}/api/users/create-order`,
        headers: { token },
        body: { planId }
      });

      // Create Razorpay order
      const { data } = await axios.post(
        `${backendUrl}/api/users/create-order`,
        { planId },
        { 
          headers: { token },
          timeout: 10000 // 10 second timeout
        }
      );
      
      console.log('📦 Order creation response:', data);
      
      if (data.success) {
        console.log('✅ Order created successfully:', {
          orderId: data.orderId,
          amount: data.amount,
          currency: data.currency
        });

        // Initialize Razorpay payment
        const options = {
          key: razorpayKeyId,
          amount: data.amount,
          currency: data.currency,
          name: 'MindSketch',
          description: `${data.planId} Credits - ${data.credits} credits`,
          order_id: data.orderId,
          handler: async function (response) {
            try {
              console.log('💳 Payment completed:', response);
              setPurchaseLoading(true);
              
              // Verify payment on backend
              const verifyData = await axios.post(
                `${backendUrl}/api/users/verify-payment`,
                {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                },
                { headers: { token } }
              );
              
              console.log('🔍 Payment verification response:', verifyData.data);
              
              if (verifyData.data.success) {
                console.log('✅ Payment verified successfully');
                
                // Set payment details for the popup
                setPaymentDetails({
                  credits: verifyData.data.creditsAdded,
                  planId: verifyData.data.planId,
                  paymentId: response.razorpay_payment_id,
                  newBalance: verifyData.data.newBalance
                });
                
                // Refresh credits data in context
                if (loadCreditsData) {
                  await loadCreditsData();
                }
                
                // Show the success popup
                setShowSuccessPopup(true);
              } else {
                console.error('❌ Payment verification failed:', verifyData.data.message);
                alert('Payment verification failed: ' + verifyData.data.message);
              }
            } catch (error) {
              console.error('❌ Payment verification error:', error);
              alert('Payment verification failed: ' + (error.response?.data?.message || error.message));
            } finally {
              setPurchaseLoading(false);
            }
          },
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
            contact: user?.phone || ''
          },
          notes: {
            address: 'MindSketch Office'
          },
          theme: {
            color: "#3399cc"
          },
          modal: {
            ondismiss: function() {
              console.log('💳 Payment modal dismissed');
              setPurchaseLoading(false);
            }
          }
        };

        console.log('💳 Initializing Razorpay with options:', {
          ...options,
          key: razorpayKeyId.substring(0, 10) + '...' // Don't log full key
        });

        const rzp = new window.Razorpay(options);
        
        rzp.on('payment.failed', function (response) {
          console.error('❌ Payment failed:', response.error);
          setPurchaseLoading(false);
          alert('Payment failed: ' + response.error.description);
        });

        rzp.open();
      } else {
        console.error('❌ Order creation failed:', data.message);
        alert('Failed to create order: ' + (data.message || 'Unknown error'));
        setPurchaseLoading(false);
      }
    } catch (err) {
      console.error('❌ Purchase error:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: err.config
      });
      
      let errorMessage = 'Unknown error occurred';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please check your internet connection and try again.';
      } else if (err.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      alert('Error: ' + errorMessage);
      setPurchaseLoading(false);
    }
  };

  const handleSuccessRedirect = () => {
    setShowSuccessPopup(false);
    setPaymentDetails(null);
    navigate("/result");
  };

  const handleStayHere = () => {
    setShowSuccessPopup(false);
    setPaymentDetails(null);
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div 
        initial={{ opacity: 0.2, y: 100 }}
        transition={{ duration: 1 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="min-h-[80vh] text-center pt-14 mb-10"
      >
        <button className="border border-gray-400 px-10 py-2 rounded-full mb-6">
          Our Plans
        </button>
        <h1 className="text-center text-3xl font-medium mb-6 sm:mb-10">
          Choose the Plan
        </h1>

        

        {billingInfo && billingInfo.needsCredits && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg max-w-md mx-auto">
            You have no credits left. Please purchase a plan to continue generating images.
          </div>
        )}

        {billingInfo && billingInfo.lowCredits && !billingInfo.needsCredits && (
          <div className="mb-6 p-4 bg-yellow-100 text-yellow-700 rounded-lg max-w-md mx-auto">
            You're running low on credits. Consider purchasing more to avoid interruptions.
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-6 text-left">
          {billingInfo?.availablePlans ? 
            Object.values(billingInfo.availablePlans).map((plan, index) => (
              <div 
                key={index} 
                className={`bg-white drop-shadow-sm border rounded-lg py-12 px-8 text-gray-600 hover:scale-105 transition-all duration-500 relative ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}
              >
                {plan.popular && (
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs absolute -top-2 left-1/2 transform -translate-x-1/2">
                    Most Popular
                  </span>
                )}
                <img width={40} src={assets.logo_icon} alt="" />
                <p className="mt-3 mb-1 font-semibold">{plan.id}</p>
                <p className="text-sm">{plan.description}</p>
                <p className="mt-6">
                  <span className="text-3xl font-medium">₹{plan.price}</span> / {plan.credits} credits
                </p>
                <button 
                  onClick={() => purchase(plan.id)} 
                  disabled={purchaseLoading}
                  className={`w-full mt-8 text-sm rounded-md py-2.5 min-w-52 transition-all ${
                    purchaseLoading 
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                      : 'bg-gray-800 text-white hover:bg-gray-700'
                  }`}
                >
                  {purchaseLoading ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </span>
                  ) : (
                    user ? 'Purchase' : 'Get Started'
                  )}
                </button>
              </div>
            ))
            :
            plans.map((item, index) => (
              <div key={index} className="bg-white drop-shadow-sm border rounded-lg py-12 px-8 text-gray-600 hover:scale-105 transition-all duration-500">
                <img width={40} src={assets.logo_icon} alt="" />
                <p className="mt-3 mb-1 font-semibold">{item.id}</p>
                <p className="text-sm">{item.desc}</p>
                <p className="mt-6">
                  <span className="text-3xl font-medium">₹{item.price}</span> / {item.credits} credits
                </p>
                <button 
                  onClick={() => purchase(item.id)} 
                  disabled={purchaseLoading}
                  className={`w-full mt-8 text-sm rounded-md py-2.5 min-w-52 transition-all ${
                    purchaseLoading 
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                      : 'bg-gray-800 text-white hover:bg-gray-700'
                  }`}
                >
                  {purchaseLoading ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </span>
                  ) : (
                    user ? 'Purchase' : 'Get Started'
                  )}
                </button>
              </div>
            ))
          }
        </div>
      </motion.div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-hidden"
        >
          {/* Animated Background */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600"
          />
          
          {/* Main Content Container */}
          <div className="relative h-full flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.3, rotateY: 180 }}
              animate={{ scale: 1, rotateY: 0 }}
              transition={{ 
                duration: 1.2, 
                type: "spring", 
                stiffness: 100,
                damping: 15
              }}
              className="bg-white/95 backdrop-blur-lg rounded-3xl p-12 max-w-2xl w-full text-center shadow-2xl border border-white/20"
            >
              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="relative mb-8"
              >
                <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto">
                  <svg
                    className="w-16 h-16 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </motion.div>

              {/* Success Title */}
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4"
              >
                Payment Successful! 🎉
              </motion.h1>

              {/* Credits Message */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="text-xl text-gray-700 mb-8"
              >
                {paymentDetails && (
                  <>
                    <span className="font-bold text-2xl text-green-600">
                      {paymentDetails.credits} credits
                    </span>{" "}
                    have been successfully added to your account!
                    <br />
                    <span className="text-sm text-gray-600">
                      New balance: {paymentDetails.newBalance} credits
                    </span>
                  </>
                )}
              </motion.p>

              {/* Payment Details Card */}
              {paymentDetails && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.4 }}
                  className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 mb-8 border border-gray-200"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-sm text-gray-600">Plan</p>
                        <p className="font-semibold text-gray-800">{paymentDetails.planId}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-sm text-gray-600">Payment ID</p>
                        <p className="font-semibold text-gray-800 text-sm">{paymentDetails.paymentId}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6 }}
                className="space-y-4"
              >
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleSuccessRedirect}
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-300"
                  >
                    Start Creating
                  </button>
                  <button
                    onClick={handleStayHere}
                    className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 transition-all duration-300"
                  >
                    Buy More Credits
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </>
  );
}

export default BuyCredit;