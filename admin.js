const express = require('express');
const router = express.Router();
const supabaseService = require('../services/supabaseService');

/**
 * GET /api/admin/websites
 * Fetches all websites for the dashboard.
 */
router.get('/websites', async (req, res) => {
  try {
    const websites = await supabaseService.getAllWebsites();
    return res.status(200).json(websites);
  } catch (error) {
    console.error('Error fetching admin websites:', error);
    return res.status(500).json({ error: 'Failed to retrieve websites', details: error.message });
  }
});

/**
 * GET /api/admin/leads
 * Fetches all customer leads for the dashboard.
 */
router.get('/leads', async (req, res) => {
  try {
    const leads = await supabaseService.getAllLeads();
    return res.status(200).json(leads);
  } catch (error) {
    console.error('Error fetching admin leads:', error);
    return res.status(500).json({ error: 'Failed to retrieve leads', details: error.message });
  }
});

/**
 * GET /api/admin/stats
 * Fetches high level system KPIs and counts.
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await supabaseService.getStats();
    return res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return res.status(500).json({ error: 'Failed to retrieve stats', details: error.message });
  }
});

module.exports = router;
