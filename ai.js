const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { generateWebsiteContent } = require('./grokService');
const supabaseService = require('./supabaseService');

// Apply rate limiting specifically for content generation to prevent API abuse
const generateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // limit each IP to 15 requests per windowMs
  message: {
    error: 'Too many content generation requests from this IP. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * POST /api/generate
 * Generates copy for a small business website using Grok API and saves the session.
 */
router.post('/generate', generateLimiter, async (req, res) => {
  try {
    const { businessData } = req.body;

    if (!businessData) {
      return res.status(400).json({ error: 'Missing businessData in request body' });
    }

    // Validate minimum required fields
    const requiredFields = ['businessName', 'businessCategory', 'businessDescription', 'phone', 'email', 'address'];
    for (const field of requiredFields) {
      if (!businessData[field]) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }

    console.log(`Generating content for business: "${businessData.businessName}"`);

    // Call Grok API to generate copy
    const generatedContent = await generateWebsiteContent(businessData);

    // Save session in Supabase
    const session = await supabaseService.createGenerationSession(businessData);

    // Update the session with the generated content
    const updatedSession = await supabaseService.updateGenerationSession(session.id, {
      generated_content: generatedContent
    });

    return res.status(200).json({
      sessionId: updatedSession.id,
      generatedContent: updatedSession.generated_content
    });

  } catch (error) {
    console.error('Error generating website content:', error);
    return res.status(500).json({
      error: 'An error occurred during content generation',
      details: error.message
    });
  }
});

/**
 * GET /api/generate/session/:id
 * Fetches draft business details and generated content for previewing.
 */
router.get('/generate/session/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const session = await supabaseService.getGenerationSession(id);
    if (!session) {
      return res.status(404).json({ error: 'Generation session not found' });
    }
    return res.status(200).json(session);
  } catch (error) {
    console.error('Error fetching generation session:', error);
    return res.status(500).json({
      error: 'Failed to fetch generation session details',
      details: error.message
    });
  }
});

module.exports = router;
