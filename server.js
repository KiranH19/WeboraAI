const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5050;

// Enable CORS
app.use(cors());

// Parse JSON and URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend files statically
app.use(express.static(path.join(__dirname, 'public')));

// Connect API Routes
const aiRoutes = require('./ai');
const websiteRoutes = require('./routes/websites');
const leadRoutes = require('./routes/leads');
const paymentRoutes = require('./routes/payments');
const adminRoutes = require('./routes/admin');

app.use('/api', aiRoutes); // handles /api/generate
app.use('/api/websites', websiteRoutes); // handles /api/websites/publish, /api/websites/
app.use('/api/leads', leadRoutes); // handles /api/leads
app.use('/api/payments', paymentRoutes); // handles /api/payments/create-order, /api/payments/verify
app.use('/api/admin', adminRoutes); // handles /api/admin/websites, /api/admin/leads, /api/admin/stats

// Fallback route: Serve landing page for any other route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start listening
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`Webora SaaS MVP server running on port ${PORT}`);
  console.log(`Access the landing page at: http://localhost:${PORT}`);
  console.log(`==================================================`);
});
