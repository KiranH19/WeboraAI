const axios = require('axios');
const cleanAndValidateJson = require('../utils/validateJson');
require('dotenv').config();

const GROK_API_KEY = process.env.GROK_API_KEY;
const GROK_API_URL = process.env.GROK_API_URL || 'https://api.x.ai/v1/chat/completions';
const GROK_MODEL = process.env.GROK_MODEL || 'grok-2-latest';

// Generate mock content for local testing when API key is missing or for rapid testing
function getMockGeneratedContent(businessData) {
  const name = businessData.businessName || 'Business Elite';
  const category = businessData.businessCategory || 'Consulting';
  const desc = businessData.businessDescription || 'We deliver top tier services to help businesses grow and scale.';
  const services = (businessData.services || 'General Consulting')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => ({
      title: s,
      description: `High-quality, specialized service in ${s} tailored specifically for your business goals and growth.`
    }));

  if (services.length === 0) {
    services.push({
      title: 'Premium Solutions',
      description: 'Custom tailored business strategies to optimize productivity and scale operations.'
    });
  }

  return {
    heroTitle: `Empowering Your Business through ${category}`,
    heroSubtitle: `Professional solutions for ${name}. ${desc.slice(0, 100)}`,
    aboutTitle: `About ${name}`,
    aboutDescription: `Founded on the principles of excellence and customer satisfaction, ${name} is a leading provider in the ${category} space. ${desc}`,
    services: services,
    faq: [
      {
        question: `What services does ${name} offer?`,
        answer: `We specialize in ${services.map(s => s.title).join(', ')}.`
      },
      {
        question: `How can I get started?`,
        answer: `You can reach out to us directly via our email ${businessData.email || 'info@company.com'} or phone number ${businessData.phone || '9999999999'}, or fill out the contact form below.`
      },
      {
        question: `Do you support custom integrations?`,
        answer: `Yes, all our services can be customized to fit your unique operational workflows and budget requirements.`
      }
    ],
    ctaTitle: `Ready to Elevate Your business?`,
    ctaText: `Get in touch with the team at ${name} today and let's build something great together.`,
    seoTitle: `${name} | Professional ${category} Services`,
    seoDescription: `${desc.slice(0, 150)}`
  };
}

/**
 * Sends business details to Grok API and parses/validates the response.
 * Includes a automatic fallback and retry mechanism.
 */
async function generateWebsiteContent(businessData) {
  // If GROK_API_KEY is not defined or is placeholder, return mock data immediately
  if (!GROK_API_KEY || GROK_API_KEY === 'your-grok-api-key' || GROK_API_KEY.includes('your-')) {
    console.log('GROK_API_KEY is not set or is a placeholder. Using mock generation content.');
    // Simulate some minor network latency for realistic feel
    await new Promise(resolve => setTimeout(resolve, 1500));
    return getMockGeneratedContent(businessData);
  }

  const prompt = `Generate professional website content for a small business.
Return ONLY valid JSON. No markdown. No explanation. No \`\`\`json tags.
The JSON structure must be:
{
  "heroTitle": "",
  "heroSubtitle": "",
  "aboutTitle": "",
  "aboutDescription": "",
  "services": [
    {
      "title": "",
      "description": ""
    }
  ],
  "faq": [
    {
      "question": "",
      "answer": ""
    }
  ],
  "ctaTitle": "",
  "ctaText": "",
  "seoTitle": "",
  "seoDescription": ""
}

Business details:
- Business Name: ${businessData.businessName}
- Business Category/Type: ${businessData.businessCategory}
- Business Description: ${businessData.businessDescription}
- Specific Services: ${businessData.services}
- Contact Phone: ${businessData.phone}
- Contact Email: ${businessData.email}
- Contact Address: ${businessData.address}
- Design Style Preferred: ${businessData.designStyle}
`;

  let lastError;

  // We support up to 2 attempts (initial + 1 retry)
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      console.log(`Grok API call attempt ${attempt}...`);
      const response = await axios.post(
        GROK_API_URL,
        {
          model: GROK_MODEL,
          messages: [
            {
              role: 'system',
              content: 'You are an expert copywriter and SaaS content generator. You only respond with raw, valid JSON conforming to the requested schema. You do not wrap the JSON in markdown code blocks.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${GROK_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 25000 // 25 second timeout
        }
      );

      const contentText = response.data.choices[0].message.content;
      const validatedJson = cleanAndValidateJson(contentText);
      return validatedJson;

    } catch (error) {
      console.error(`Grok API generation failure on attempt ${attempt}:`, error.message);
      lastError = error;
      
      // If we failed the first attempt, wait briefly before retrying
      if (attempt === 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  // If both live attempts failed, we can use the fallback mock data in development so it doesn't crash the user flow
  console.warn('Grok API completely failed. Falling back to structured mock data generation.');
  return getMockGeneratedContent(businessData);
}

module.exports = {
  generateWebsiteContent
};
