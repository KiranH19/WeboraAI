const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const isMockDBMode = !supabaseUrl || supabaseUrl === 'your-supabase-project-url' || supabaseUrl.includes('your-');

let supabase = null;

if (!isMockDBMode) {
  try {
    supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('Supabase client initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error.message);
  }
} else {
  console.log('Supabase credentials not set or set to placeholder. Operating in LOCAL IN-MEMORY DB mode.');
}

// Local In-Memory DB Store for developer sandboxing without configurations
const localDb = {
  websites: [],
  leads: [],
  subscriptions: [],
  payments: [],
  generation_sessions: []
};

const supabaseService = {
  // Generation Sessions
  async createGenerationSession(businessData) {
    if (isMockDBMode || !supabase) {
      const session = {
        id: crypto.randomUUID(),
        business_data: businessData,
        generated_content: null,
        selected_template: null,
        created_at: new Date().toISOString()
      };
      localDb.generation_sessions.push(session);
      return session;
    }

    const { data, error } = await supabase
      .from('generation_sessions')
      .insert([{ business_data: businessData }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getGenerationSession(id) {
    if (isMockDBMode || !supabase) {
      const session = localDb.generation_sessions.find(s => s.id === id);
      if (!session) throw new Error('Generation session not found');
      return session;
    }

    const { data, error } = await supabase
      .from('generation_sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async updateGenerationSession(id, updateData) {
    if (isMockDBMode || !supabase) {
      const index = localDb.generation_sessions.findIndex(s => s.id === id);
      if (index === -1) throw new Error('Generation session not found');
      
      localDb.generation_sessions[index] = {
        ...localDb.generation_sessions[index],
        ...updateData
      };
      return localDb.generation_sessions[index];
    }

    const { data, error } = await supabase
      .from('generation_sessions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Websites
  async createWebsite(websiteData) {
    if (isMockDBMode || !supabase) {
      const website = {
        id: crypto.randomUUID(),
        ...websiteData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      localDb.websites.push(website);
      return website;
    }

    const { data, error } = await supabase
      .from('websites')
      .insert([websiteData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateWebsite(id, updateData) {
    if (isMockDBMode || !supabase) {
      const index = localDb.websites.findIndex(w => w.id === id);
      if (index === -1) throw new Error('Website not found');
      
      localDb.websites[index] = {
        ...localDb.websites[index],
        ...updateData,
        updated_at: new Date().toISOString()
      };
      return localDb.websites[index];
    }

    const { data, error } = await supabase
      .from('websites')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getWebsiteBySlug(slug) {
    if (isMockDBMode || !supabase) {
      const website = localDb.websites.find(w => w.slug === slug);
      return website || null;
    }

    const { data, error } = await supabase
      .from('websites')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw error;
    return data;
  },

  async getWebsiteById(id) {
    if (isMockDBMode || !supabase) {
      const website = localDb.websites.find(w => w.id === id);
      return website || null;
    }

    const { data, error } = await supabase
      .from('websites')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw error;
    return data;
  },

  // Leads
  async createLead(leadData) {
    if (isMockDBMode || !supabase) {
      const lead = {
        id: crypto.randomUUID(),
        ...leadData,
        created_at: new Date().toISOString()
      };
      localDb.leads.push(lead);
      return lead;
    }

    const { data, error } = await supabase
      .from('leads')
      .insert([leadData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getLeadsByWebsiteId(websiteId) {
    if (isMockDBMode || !supabase) {
      return localDb.leads.filter(l => l.website_id === websiteId);
    }

    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('website_id', websiteId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Payments & Subscriptions
  async createPaymentRecord(paymentData) {
    if (isMockDBMode || !supabase) {
      const payment = {
        id: crypto.randomUUID(),
        ...paymentData,
        created_at: new Date().toISOString()
      };
      localDb.payments.push(payment);
      return payment;
    }

    const { data, error } = await supabase
      .from('payments')
      .insert([paymentData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createSubscriptionRecord(subscriptionData) {
    if (isMockDBMode || !supabase) {
      const subscription = {
        id: crypto.randomUUID(),
        ...subscriptionData,
        created_at: new Date().toISOString()
      };
      localDb.subscriptions.push(subscription);
      return subscription;
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .insert([subscriptionData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Admin Features
  async getAllWebsites() {
    if (isMockDBMode || !supabase) {
      return [...localDb.websites].sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    }

    const { data, error } = await supabase
      .from('websites')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getAllLeads() {
    if (isMockDBMode || !supabase) {
      // Simulate references join by attaching website details
      return localDb.leads.map(l => {
        const website = localDb.websites.find(w => w.id === l.website_id);
        return {
          ...l,
          websites: website ? { business_name: website.business_name, slug: website.slug } : null
        };
      }).sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    }

    const { data, error } = await supabase
      .from('leads')
      .select('*, websites(business_name, slug)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getStats() {
    if (isMockDBMode || !supabase) {
      const totalWebsites = localDb.websites.length;
      const paidWebsites = localDb.websites.filter(w => w.payment_status === 'paid').length;
      const pendingWebsites = localDb.websites.filter(w => w.payment_status === 'pending').length;
      const totalLeads = localDb.leads.length;

      return {
        totalWebsites,
        totalLeads,
        paidWebsites,
        pendingWebsites
      };
    }

    const { data: websites, error: webError } = await supabase
      .from('websites')
      .select('payment_status, status');

    if (webError) throw webError;

    const { count: leadsCount, error: leadError } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true });

    if (leadError) throw leadError;

    const totalWebsites = websites.length;
    const paidWebsites = websites.filter(w => w.payment_status === 'paid').length;
    const pendingWebsites = websites.filter(w => w.payment_status === 'pending').length;

    return {
      totalWebsites,
      totalLeads: leadsCount || 0,
      paidWebsites,
      pendingWebsites
    };
  }
};

module.exports = supabaseService;
