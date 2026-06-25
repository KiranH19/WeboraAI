const express = require('express');
const router = express.Router();
const supabaseService = require('./supabaseService');

/**
 * POST /api/leads
 * Collects and stores customer inquiry leads submitted from generated public sites.
 */
router.post('/', async (req, res) => {
  try {
    const { websiteId, name, phone, email, message } = req.body;

    if (!websiteId || !name || !phone || !email || !message) {
      return res.status(400).json({ error: 'Missing required lead fields' });
    }

    // Verify website exists
    const website = await supabaseService.getWebsiteById(websiteId);
    if (!website) {
      return res.status(404).json({ error: 'Target website does not exist' });
    }

    // Insert lead
    await supabaseService.createLead({
      website_id: websiteId,
      name,
      phone,
      email,
      message
    });

    return res.status(200).json({ success: true, message: 'Inquiry submitted successfully' });

  } catch (error) {
    console.error('Error submitting lead:', error);
    return res.status(500).json({
      error: 'Failed to submit inquiry lead',
      details: error.message
    });
  }
});

module.exports = router;
