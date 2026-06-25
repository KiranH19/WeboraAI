const express = require('express');
const router = express.Router();
const razorpayService = require('./razorpayService');
const supabaseService = require('./supabaseService');
const slugify = require('./slugify');

/**
 * POST /api/payments/create-order
 * Creates a Razorpay order for the selected subscription plan.
 */
router.post('/create-order', async (req, res) => {
  try {
    const { plan, sessionId } = req.body;

    if (!plan || !sessionId) {
      return res.status(400).json({ error: 'Missing required parameters: plan or sessionId' });
    }

    // Pricing configuration
    let amount = 299; // Starter Default (₹299)
    if (plan === 'premium') {
      amount = 999; // Premium (₹999)
    }

    // Verify session exists
    const session = await supabaseService.getGenerationSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Generation session not found' });
    }

    const order = await razorpayService.createOrder(amount, sessionId);

    return res.status(200).json({ 
      razorpayOrder: order,
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder'
    });

  } catch (error) {
    console.error('Error creating payment order:', error);
    return res.status(500).json({
      error: 'Failed to create payment order',
      details: error.message
    });
  }
});

/**
 * POST /api/payments/verify
 * Verifies Razorpay signature and publishes the website upon successful payment.
 */
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, sessionId, plan, template } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !sessionId || !plan || !template) {
      return res.status(400).json({
        error: 'Missing required validation parameters: order_id, payment_id, signature, sessionId, plan, or template'
      });
    }

    // 1. Verify Razorpay Payment Signature
    const isVerified = razorpayService.verifyPayment(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isVerified) {
      console.warn(`Payment signature verification failed for order ${razorpay_order_id}`);
      return res.status(400).json({ verified: false, error: 'Payment verification failed' });
    }

    // 2. Retrieve session data
    const session = await supabaseService.getGenerationSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Generation session not found' });
    }

    const businessData = session.business_data;
    const baseSlug = slugify(businessData.businessName || 'my-business');
    let uniqueSlug = baseSlug;
    let isUnique = false;
    let attempts = 0;

    // Check slug uniqueness
    while (!isUnique && attempts < 10) {
      const existing = await supabaseService.getWebsiteBySlug(uniqueSlug);
      if (!existing) {
        isUnique = true;
      } else {
        attempts++;
        const suffix = Math.floor(1000 + Math.random() * 9000);
        uniqueSlug = `${baseSlug}-${suffix}`;
      }
    }

    // 3. Create the Website Record
    const websiteData = {
      business_name: businessData.businessName,
      slug: uniqueSlug,
      category: businessData.businessCategory,
      template: template,
      design_style: businessData.designStyle,
      content_json: session.generated_content,
      phone: businessData.phone,
      email: businessData.email,
      address: businessData.address,
      logo_url: businessData.logoUrl || null,
      plan: plan,
      payment_status: 'paid',
      status: 'published'
    };

    const website = await supabaseService.createWebsite(websiteData);

    // Calculate subscription plan amounts
    const amountInINR = plan === 'premium' ? 999 : 299;
    const amountInPaise = amountInINR * 100;

    // 4. Save Payment Record
    await supabaseService.createPaymentRecord({
      website_id: website.id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount: amountInPaise,
      currency: 'INR',
      status: 'verified'
    });

    // 5. Save Subscription Record
    const nextDueDate = new Date();
    nextDueDate.setMonth(nextDueDate.getMonth() + 1);

    await supabaseService.createSubscriptionRecord({
      website_id: website.id,
      plan: plan,
      amount: amountInPaise,
      billing_cycle: 'monthly',
      status: 'active',
      next_due_date: nextDueDate.toISOString().split('T')[0]
    });

    const publicUrl = `/site.html?slug=${website.slug}`;

    return res.status(200).json({
      verified: true,
      websiteId: website.id,
      slug: website.slug,
      publicUrl: publicUrl
    });

  } catch (error) {
    console.error('Error during payment verification:', error);
    return res.status(500).json({
      error: 'Failed to verify payment',
      details: error.message
    });
  }
});

module.exports = router;
