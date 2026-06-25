/**
 * Cleans the input string of any markdown blocks and parses/validates the JSON object structure.
 * @param {string} rawString - Raw text response from Grok API.
 * @returns {object} The parsed and validated JSON object.
 * @throws {Error} If parsing or validation fails.
 */
function cleanAndValidateJson(rawString) {
  if (!rawString || typeof rawString !== 'string') {
    throw new Error('Input must be a non-empty string');
  }

  // Strip markdown code block wrappers if present (e.g. ```json ... ``` or ``` ... ```)
  let cleanString = rawString.trim();
  if (cleanString.startsWith('```')) {
    // Remove opening ```json or ```
    cleanString = cleanString.replace(/^```(?:json)?/i, '').trim();
    // Remove closing ```
    cleanString = cleanString.replace(/```$/, '').trim();
  }

  let parsedData;
  try {
    parsedData = JSON.parse(cleanString);
  } catch (error) {
    throw new Error(`Failed to parse response as JSON: ${error.message}. Raw: ${cleanString.slice(0, 100)}...`);
  }

  // Validate the required structure
  const requiredKeys = [
    'heroTitle',
    'heroSubtitle',
    'aboutTitle',
    'aboutDescription',
    'services',
    'faq',
    'ctaTitle',
    'ctaText',
    'seoTitle',
    'seoDescription'
  ];

  for (const key of requiredKeys) {
    if (!(key in parsedData)) {
      throw new Error(`Missing required key: "${key}"`);
    }
  }

  // Validate services array
  if (!Array.isArray(parsedData.services)) {
    throw new Error('"services" must be an array');
  }
  for (let i = 0; i < parsedData.services.length; i++) {
    const s = parsedData.services[i];
    if (!s.title || !s.description) {
      throw new Error(`Service at index ${i} is missing "title" or "description"`);
    }
  }

  // Validate faq array
  if (!Array.isArray(parsedData.faq)) {
    throw new Error('"faq" must be an array');
  }
  for (let i = 0; i < parsedData.faq.length; i++) {
    const f = parsedData.faq[i];
    if (!f.question || !f.answer) {
      throw new Error(`FAQ at index ${i} is missing "question" or "answer"`);
    }
  }

  return parsedData;
}

module.exports = cleanAndValidateJson;
