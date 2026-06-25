const express = require('express');
const router = express.Router();
const supabaseService = require('./supabaseService');
const slugify = require('../utils/slugify');

/**
 * POST /api/websites/publish
 * Publishes a generated website after successful payment verification.
 */
router.post('/publish', async (req, res) => {
  try {
    const { sessionId, template, plan, paymentId } = req.body;

    if (!sessionId || !template || !plan) {
      return res.status(400).json({ error: 'Missing required parameters: sessionId, template, or plan' });
    }

    // Retrieve the session data
    const session = await supabaseService.getGenerationSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Generation session not found' });
    }

    if (!session.generated_content) {
      return res.status(400).json({ error: 'Session does not contain generated website content' });
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
        const suffix = Math.floor(1000 + Math.random() * 9000); // 4 digit random number
        uniqueSlug = `${baseSlug}-${suffix}`;
      }
    }

    // Prepare website data
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
      payment_status: 'paid', // Marked as paid since it's published
      status: 'published'
    };

    const website = await supabaseService.createWebsite(websiteData);

    // Calculate subscription next due date (1 month from now)
    const nextDueDate = new Date();
    nextDueDate.setMonth(nextDueDate.getMonth() + 1);

    // Determine plan amount in paise (₹299 setup for starter, ₹999 for premium)
    const setupAmount = plan === 'premium' ? 99900 : 29900;

    // Create a subscription record
    await supabaseService.createSubscriptionRecord({
      website_id: website.id,
      plan: plan,
      amount: setupAmount,
      billing_cycle: 'monthly',
      status: 'active',
      next_due_date: nextDueDate.toISOString().split('T')[0]
    });

    const publicUrl = `/site.html?slug=${website.slug}`;

    return res.status(200).json({
      websiteId: website.id,
      slug: website.slug,
      publicUrl: publicUrl
    });

  } catch (error) {
    console.error('Error publishing website:', error);
    return res.status(500).json({
      error: 'Failed to publish website',
      details: error.message
    });
  }
});

/**
 * GET /api/websites
 * Fetches website details by slug or id.
 */
router.get('/', async (req, res) => {
  try {
    const { slug, id } = req.query;

    if (!slug && !id) {
      return res.status(400).json({ error: 'Must provide either slug or id query parameter' });
    }

    let website = null;
    if (slug) {
      website = await supabaseService.getWebsiteBySlug(slug);
    } else {
      website = await supabaseService.getWebsiteById(id);
    }

    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }

    return res.status(200).json(website);

  } catch (error) {
    console.error('Error fetching website:', error);
    return res.status(500).json({
      error: 'Failed to fetch website details',
      details: error.message
    });
  }
});

module.exports = router;
