/**
 * Standard templates library for Webora generated sites.
 * Each template takes the website details and returns a complete HTML document.
 */

const TEMPLATES = {
  // Helpers
  renderHeader(data, activeClass) {
    const logoHtml = data.logo_url 
      ? `<img src="${data.logo_url}" alt="${data.business_name}" class="t-logo-img">`
      : `<span class="t-logo-text">${data.business_name}</span>`;

    return `
      <nav class="t-nav">
        <a href="#" class="t-logo">${logoHtml}</a>
        <ul class="t-nav-links">
          <li><a href="#about">About</a></li>
          <li><a href="#services">Services</a></li>
          <li><a href="#faq">FAQ</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>
    `;
  },

  renderServices(services) {
    return services.map(s => `
      <div class="t-card">
        <h3>${s.title}</h3>
        <p>${s.description}</p>
      </div>
    `).join('');
  },

  renderFaqs(faq) {
    return faq.map((f, i) => `
      <details class="t-faq-item" ${i === 0 ? 'open' : ''}>
        <summary>${f.question}</summary>
        <div class="t-faq-content">
          <p>${f.answer}</p>
        </div>
      </details>
    `).join('');
  },

  renderContactForm(data) {
    return `
      <div class="t-contact-container">
        <div>
          <h3>Get In Touch</h3>
          <p style="margin-bottom: 2rem; color: #666;">We would love to hear from you. Fill out the form or reach us directly.</p>
          <ul class="t-info-list">
            <li class="t-info-item">
              <div class="t-info-icon">📞</div>
              <div>
                <strong>Phone</strong>
                <div style="color: #666;">${data.phone}</div>
              </div>
            </li>
            <li class="t-info-item">
              <div class="t-info-icon">✉️</div>
              <div>
                <strong>Email</strong>
                <div style="color: #666;">${data.email}</div>
              </div>
            </li>
            <li class="t-info-item">
              <div class="t-info-icon">📍</div>
              <div>
                <strong>Address</strong>
                <div style="color: #666;">${data.address}</div>
              </div>
            </li>
          </ul>
        </div>
        <form class="t-form" onsubmit="submitContactForm(event, '${data.id || ''}')">
          <div class="t-form-group">
            <label for="name">Full Name</label>
            <input type="text" id="name" name="name" required placeholder="John Doe">
          </div>
          <div class="t-form-group">
            <label for="email">Email Address</label>
            <input type="email" id="email" name="email" required placeholder="john@example.com">
          </div>
          <div class="t-form-group">
            <label for="phone">Phone Number</label>
            <input type="tel" id="phone" name="phone" required placeholder="9999999999">
          </div>
          <div class="t-form-group">
            <label for="message">Message</label>
            <textarea id="message" name="message" rows="4" required placeholder="How can we help you?"></textarea>
          </div>
          <button type="submit" class="t-submit-btn">Send Message</button>
        </form>
      </div>
    `;
  },

  renderWhatsAppButton(phone) {
    const formattedPhone = phone.replace(/[^0-9]/g, '');
    return `
      <a href="https://wa.me/${formattedPhone}" class="t-whatsapp-float" target="_blank" aria-label="Chat on WhatsApp">
        <svg class="t-whatsapp-icon" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.458L0 24zm6.59-4.846c1.6.95 3.498 1.448 5.418 1.451 5.905 0 10.71-4.803 10.713-10.704.002-2.859-1.109-5.547-3.127-7.567C17.606 1.309 14.912.19 12.03.19c-5.894 0-10.697 4.803-10.7 10.705-.001 1.93.501 3.81 1.456 5.419L1.77 20.894l4.877-1.74zM17.41 14.81c-.32-.16-1.89-.93-2.185-1.04-.294-.11-.51-.16-.724.16-.215.32-.83 1.04-1.018 1.25-.19.215-.377.24-.696.08-3.176-1.588-4.52-2.73-5.28-4.043-.198-.343-.02-.528.15-.698.152-.152.32-.373.48-.56.16-.188.216-.32.32-.533.107-.215.054-.4-.027-.56-.08-.16-.724-1.74-.993-2.39-.26-.628-.53-.54-.724-.55-.188-.01-.403-.01-.617-.01s-.56.08-.854.4c-.294.32-1.127 1.1-1.127 2.68 0 1.58 1.15 3.11 1.31 3.32.16.215 2.26 3.45 5.474 4.84.764.33 1.36.527 1.824.673.768.243 1.467.21 2.019.127.616-.093 1.89-.773 2.158-1.482.267-.71.267-1.32.187-1.45-.08-.13-.294-.21-.615-.37z"/>
        </svg>
      </a>
    `;
  },

  renderDocumentWrapper(data, activeClass, bodyContent) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.content_json.seoTitle || data.business_name}</title>
        <meta name="description" content="${data.content_json.seoDescription || ''}">
        <link rel="stylesheet" href="/css/templates.css">
        <script>
          // Form submission helper for dynamic website
          async function submitContactForm(event, websiteId) {
            event.preventDefault();
            const form = event.target;
            const btn = form.querySelector('button');
            const originalText = btn.textContent;
            btn.textContent = 'Sending...';
            btn.disabled = true;

            const payload = {
              websiteId: websiteId || '${data.id || ''}',
              name: form.name.value,
              email: form.email.value,
              phone: form.phone.value,
              message: form.message.value
            };

            try {
              if (!payload.websiteId) {
                // If in sandbox preview mode
                setTimeout(() => {
                  alert('Thank you! [Demo Mode] Message captured successfully.');
                  form.reset();
                  btn.textContent = originalText;
                  btn.disabled = false;
                }, 1000);
                return;
              }

              const response = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
              });

              const resData = await response.json();
              if (!response.ok) throw new Error(resData.error || 'Failed');
              
              alert('Your contact message was sent successfully!');
              form.reset();
            } catch(err) {
              alert('Error submitting form: ' + err.message);
            } finally {
              btn.textContent = originalText;
              btn.disabled = false;
            }
          }
        </script>
      </head>
      <body class="template-body ${activeClass}">
        ${this.renderHeader(data, activeClass)}
        ${bodyContent}
        <footer class="t-footer">
          <div class="t-container">
            <p>&copy; ${new Date().getFullYear()} ${data.business_name}. All rights reserved.</p>
            <p style="font-size: 0.8rem; margin-top: 0.5rem; opacity: 0.6;">Powered by <a href="/" target="_blank" style="text-decoration: underline; color: inherit;">Webora</a></p>
          </div>
        </footer>
        ${this.renderWhatsAppButton(data.phone)}
      </body>
      </html>
    `;
  },

  // 1. Coaching Institute Template
  coaching(data) {
    const c = data.content_json;
    const bodyContent = `
      <header class="t-hero">
        <div class="t-container">
          <h1>${c.heroTitle}</h1>
          <p>${c.heroSubtitle}</p>
          <a href="#contact" class="t-submit-btn" style="text-decoration: none; display: inline-block;">Enroll Now / Contact Us</a>
        </div>
      </header>

      <section id="about" class="t-section" style="background-color: var(--t-bg-light);">
        <div class="t-container t-flex-split">
          <div style="flex: 1.2;">
            <h2 class="t-section-title" style="text-align: left; padding-bottom: 0.5rem; margin-bottom: 1.5rem;">${c.aboutTitle}</h2>
            <p>${c.aboutDescription}</p>
          </div>
          <div style="flex: 0.8; text-align: center; font-size: 5rem; background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.02);">
            🎓
          </div>
        </div>
      </section>

      <section id="services" class="t-section">
        <div class="t-container">
          <h2 class="t-section-title">Academic Courses & Programs</h2>
          <div class="t-grid-3">
            ${this.renderServices(c.services)}
          </div>
        </div>
      </section>

      <section id="faq" class="t-section" style="background-color: var(--t-bg-light);">
        <div class="t-container" style="max-width: 800px;">
          <h2 class="t-section-title">Frequently Asked Questions</h2>
          <div class="t-faq-list">
            ${this.renderFaqs(c.faq)}
          </div>
        </div>
      </section>

      <section id="contact" class="t-section">
        <div class="t-container">
          <h2 class="t-section-title">${c.ctaTitle || 'Admissions Enquiry'}</h2>
          <p style="text-align: center; margin-bottom: 3rem; max-width: 600px; margin-left: auto; margin-right: auto;">${c.ctaText || 'Get in touch with our counselors today.'}</p>
          ${this.renderContactForm(data)}
        </div>
      </section>
    `;
    return this.renderDocumentWrapper(data, 't-coaching', bodyContent);
  },

  // 2. Clinic/Diagnostic Lab Template
  clinic(data) {
    const c = data.content_json;
    const bodyContent = `
      <header class="t-hero">
        <div class="t-container t-flex-split">
          <div style="flex: 1.2;">
            <span style="background: rgba(0,128,128,0.1); color: var(--t-primary); padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.85rem; font-weight: 700; text-transform: uppercase; margin-bottom: 1rem; display: inline-block;">Medical Excellence</span>
            <h1>${c.heroTitle}</h1>
            <p>${c.heroSubtitle}</p>
            <a href="#contact" class="t-hero-btn" style="text-decoration: none;">Book Appointment</a>
          </div>
          <div style="flex: 0.8; text-align: center; font-size: 6rem;">
            🏥
          </div>
        </div>
      </header>

      <section id="about" class="t-section">
        <div class="t-container" style="max-width: 900px; text-align: center;">
          <h2 class="t-section-title">${c.aboutTitle}</h2>
          <p style="font-size: 1.15rem; color: #555;">${c.aboutDescription}</p>
        </div>
      </section>

      <section id="services" class="t-section" style="background-color: var(--t-bg-light);">
        <div class="t-container">
          <h2 class="t-section-title">Diagnostic & Care Services</h2>
          <div class="t-grid-3">
            ${this.renderServices(c.services)}
          </div>
        </div>
      </section>

      <section id="faq" class="t-section">
        <div class="t-container" style="max-width: 800px;">
          <h2 class="t-section-title">Patient Resources / FAQ</h2>
          <div class="t-faq-list">
            ${this.renderFaqs(c.faq)}
          </div>
        </div>
      </section>

      <section id="contact" class="t-section" style="background-color: var(--t-bg-light);">
        <div class="t-container">
          <h2 class="t-section-title">${c.ctaTitle || 'Schedule an Appointment'}</h2>
          <p style="text-align: center; margin-bottom: 3rem;">${c.ctaText || 'Get in touch with us.'}</p>
          ${this.renderContactForm(data)}
        </div>
      </section>
    `;
    return this.renderDocumentWrapper(data, 't-clinic', bodyContent);
  },

  // 3. Gym/Fitness Template
  gym(data) {
    const c = data.content_json;
    const bodyContent = `
      <header class="t-hero">
        <div class="t-container">
          <h1 style="text-transform: uppercase; font-style: italic;">${c.heroTitle}</h1>
          <p style="font-size: 1.3rem;">${c.heroSubtitle}</p>
          <a href="#contact" class="t-submit-btn" style="text-decoration: none; display: inline-block; border-radius: 0; padding: 1.2rem 2.5rem; text-transform: uppercase; font-style: italic;">Claim Free Pass</a>
        </div>
      </header>

      <section id="about" class="t-section">
        <div class="t-container t-flex-split">
          <div style="flex: 1.2;">
            <h2 class="t-section-title" style="text-align: left; padding-bottom: 0.5rem; margin-bottom: 1.5rem; text-transform: uppercase;">${c.aboutTitle}</h2>
            <p>${c.aboutDescription}</p>
          </div>
          <div style="flex: 0.8; text-align: center; font-size: 6.5rem; color: var(--t-primary);">
            💪
          </div>
        </div>
      </section>

      <section id="services" class="t-section" style="background-color: #1a1a1a;">
        <div class="t-container">
          <h2 class="t-section-title" style="text-transform: uppercase;">Training Programs</h2>
          <div class="t-grid-3">
            ${this.renderServices(c.services)}
          </div>
        </div>
      </section>

      <section id="faq" class="t-section">
        <div class="t-container" style="max-width: 800px;">
          <h2 class="t-section-title" style="text-transform: uppercase;">FAQs</h2>
          <div class="t-faq-list">
            ${this.renderFaqs(c.faq)}
          </div>
        </div>
      </section>

      <section id="contact" class="t-section" style="background-color: #1a1a1a;">
        <div class="t-container">
          <h2 class="t-section-title" style="text-transform: uppercase;">${c.ctaTitle || 'Join the Gym'}</h2>
          <p style="text-align: center; margin-bottom: 3rem; color: #aaa;">${c.ctaText || 'Get in touch.'}</p>
          ${this.renderContactForm(data)}
        </div>
      </section>
    `;
    return this.renderDocumentWrapper(data, 't-gym', bodyContent);
  },

  // 4. Restaurant/Cafe Template
  restaurant(data) {
    const c = data.content_json;
    const bodyContent = `
      <header class="t-hero">
        <div class="t-container">
          <h1 style="font-family: 'Outfit', serif; font-weight: 700; font-style: italic;">${c.heroTitle}</h1>
          <p style="font-style: italic; color: #444;">${c.heroSubtitle}</p>
          <a href="#contact" class="t-submit-btn" style="text-decoration: none; display: inline-block; border-radius: 30px;">Reserve Table</a>
        </div>
      </header>

      <section id="about" class="t-section" style="background: #fffdf9;">
        <div class="t-container t-flex-split">
          <div style="flex: 1.2;">
            <h2 class="t-section-title" style="text-align: left; padding-bottom: 0.5rem; margin-bottom: 1.5rem;">${c.aboutTitle}</h2>
            <p>${c.aboutDescription}</p>
          </div>
          <div style="flex: 0.8; text-align: center; font-size: 6rem;">
            🍳
          </div>
        </div>
      </section>

      <section id="services" class="t-section">
        <div class="t-container">
          <h2 class="t-section-title" style="font-family: 'Outfit', serif;">Our Special Menu / Offerings</h2>
          <div class="t-grid-3">
            ${this.renderServices(c.services)}
          </div>
        </div>
      </section>

      <section id="faq" class="t-section" style="background: #fffdf9;">
        <div class="t-container" style="max-width: 800px;">
          <h2 class="t-section-title">Cozy Enquiries</h2>
          <div class="t-faq-list">
            ${this.renderFaqs(c.faq)}
          </div>
        </div>
      </section>

      <section id="contact" class="t-section">
        <div class="t-container">
          <h2 class="t-section-title">${c.ctaTitle || 'Visit or Call Us'}</h2>
          <p style="text-align: center; margin-bottom: 3rem;">${c.ctaText || 'Get in touch.'}</p>
          ${this.renderContactForm(data)}
        </div>
      </section>
    `;
    return this.renderDocumentWrapper(data, 't-restaurant', bodyContent);
  },

  // 5. Business/Agency Template
  agency(data) {
    const c = data.content_json;
    const bodyContent = `
      <header class="t-hero">
        <div class="t-container t-flex-split">
          <div style="flex: 1.2;">
            <span style="background: linear-gradient(90deg, var(--t-primary), var(--t-secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block; margin-bottom: 1rem;">Future Ready Partner</span>
            <h1>${c.heroTitle}</h1>
            <p>${c.heroSubtitle}</p>
            <a href="#contact" class="t-submit-btn" style="text-decoration: none; display: inline-block;">Schedule Consultation</a>
          </div>
          <div style="flex: 0.8; text-align: center; font-size: 6rem;">
            🚀
          </div>
        </div>
      </header>

      <section id="about" class="t-section">
        <div class="t-container" style="max-width: 900px; text-align: center;">
          <h2 class="t-section-title">${c.aboutTitle}</h2>
          <p style="font-size: 1.15rem; color: #475569;">${c.aboutDescription}</p>
        </div>
      </section>

      <section id="services" class="t-section" style="background-color: var(--t-bg-light);">
        <div class="t-container">
          <h2 class="t-section-title">Solutions We Deliver</h2>
          <div class="t-grid-3">
            ${this.renderServices(c.services)}
          </div>
        </div>
      </section>

      <section id="faq" class="t-section">
        <div class="t-container" style="max-width: 800px;">
          <h2 class="t-section-title">Frequently Asked Questions</h2>
          <div class="t-faq-list">
            ${this.renderFaqs(c.faq)}
          </div>
        </div>
      </section>

      <section id="contact" class="t-section" style="background-color: var(--t-bg-light);">
        <div class="t-container">
          <h2 class="t-section-title">${c.ctaTitle || 'Elevate Your Business'}</h2>
          <p style="text-align: center; margin-bottom: 3rem; color: #475569;">${c.ctaText || 'Get in touch.'}</p>
          ${this.renderContactForm(data)}
        </div>
      </section>
    `;
    return this.renderDocumentWrapper(data, 't-agency', bodyContent);
  },

  // Master Render Route
  render(data, templateName) {
    const templateFn = this[templateName] || this.agency;
    return templateFn.call(this, data);
  }
};
