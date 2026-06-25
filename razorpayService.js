const Razorpay = require('razorpay');
const crypto = require('crypto');
require('dotenv').config();

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

let razorpayInstance = null;
const isMockMode = !RAZORPAY_KEY_ID || RAZORPAY_KEY_ID === 'your-razorpay-key-id' || RAZORPAY_KEY_ID.includes('your-');

if (!isMockMode) {
  try {
    razorpayInstance = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET
    });
  } catch (error) {
    console.error('Error initializing Razorpay SDK:', error.message);
  }
} else {
  console.log('Razorpay credentials not set or set to placeholder. Operating in MOCK mode.');
}

const razorpayService = {
  /**
   * Creates a Razorpay order.
   * @param {number} amount - Amount in INR (e.g. 299)
   * @param {string} receipt - Receipt identifier (e.g. sessionId or websiteId)
   * @returns {Promise<object>} The created order object.
   */
  async createOrder(amount, receipt) {
    const amountInPaise = Math.round(amount * 100);

    if (isMockMode || !razorpayInstance) {
      console.log(`Razorpay Mock Order Created: Amount = ₹${amount} (${amountInPaise} paise), Receipt = ${receipt}`);
      return {
        id: `order_mock_${Math.random().toString(36).substring(2, 15)}`,
        amount: amountInPaise,
        currency: 'INR',
        receipt: receipt,
        status: 'created',
        notes: { mock: true }
      };
    }

    try {
      const order = await razorpayInstance.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: receipt,
        notes: {
          session_id: receipt
        }
      });
      return order;
    } catch (error) {
      console.error('Razorpay SDK Order Creation Failure:', error);
      throw new Error(`Razorpay order creation failed: ${error.message}`);
    }
  },

  /**
   * Verifies the payment signature sent from Razorpay checkout.
   */
  verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
    if (isMockMode) {
      console.log('Razorpay Mock Payment Verification triggered.');
      // Direct pass for mock orders or if the order was created by mock mode
      if (razorpayOrderId.startsWith('order_mock_') || razorpayOrderId === 'order_mock_test') {
        return true;
      }
      return true;
    }

    try {
      const generatedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(razorpayOrderId + '|' + razorpayPaymentId)
        .digest('hex');

      return generatedSignature === razorpaySignature;
    } catch (error) {
      console.error('Razorpay Signature Verification Error:', error.message);
      return false;
    }
  }
};

module.exports = razorpayService;
