/**
 * API client to communicate with Webora backend routes.
 */
const API = {
  /**
   * Generates AI website content based on business answers.
   */
  async generateWebsite(businessData) {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessData })
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Content generation failed');
    return data;
  },

  /**
   * Fetches the temporary generation session details.
   */
  async getGenerationSession(id) {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/generate/session/${id}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Session not found');
    return data;
  },

  /**
   * Publishes the website after manual checks (unused if verification publishes automatically).
   */
  async publishWebsite(sessionId, template, plan, paymentId) {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/websites/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, template, plan, paymentId })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Publishing failed');
    return data;
  },

  /**
   * Fetches published website data by slug or ID.
   */
  async getWebsite(slug, id) {
    let url = `${CONFIG.API_BASE_URL}/api/websites?`;
    if (slug) url += `slug=${encodeURIComponent(slug)}`;
    else if (id) url += `id=${encodeURIComponent(id)}`;

    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Website not found');
    return data;
  },

  /**
   * Submits a customer inquiry lead for a published site.
   */
  async submitLead(websiteId, leadData) {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        websiteId,
        name: leadData.name,
        phone: leadData.phone,
        email: leadData.email,
        message: leadData.message
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Lead submission failed');
    return data;
  },

  /**
   * Creates a payment order via Razorpay on the backend.
   */
  async createOrder(plan, sessionId) {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, sessionId })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Order creation failed');
    return data;
  },

  /**
   * Verifies Razorpay payment signatures and auto-publishes.
   */
  async verifyPayment(paymentDetails) {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/payments/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentDetails)
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Payment signature verification failed');
    return data;
  },

  /**
   * Admin: Fetches list of all generated websites.
   */
  async adminGetWebsites() {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/admin/websites`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch websites');
    return data;
  },

  /**
   * Admin: Fetches list of all client leads.
   */
  async adminGetLeads() {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/admin/leads`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch leads');
    return data;
  },

  /**
   * Admin: Fetches system statistics.
   */
  async adminGetStats() {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/admin/stats`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch statistics');
    return data;
  }
};
