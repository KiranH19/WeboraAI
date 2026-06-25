/**
 * Public website renderer.
 * Fetches published site configurations by slug and renders inside the parent window.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const slug = getQueryParam('slug');
  const siteRoot = document.getElementById('site-root');

  if (!slug) {
    renderErrorState('Missing Slug Parameter', 'Please specify a website slug in the URL query string (e.g. ?slug=my-business).');
    return;
  }

  try {
    // Retrieve published site details from backend
    const website = await API.getWebsite(slug);

    if (!website) {
      renderErrorState('Website Not Found', `We couldn't find a published website matching slug "${slug}".`);
      return;
    }

    // Build website configuration object
    const websiteConfig = {
      id: website.id,
      business_name: website.business_name,
      phone: website.phone,
      email: website.email,
      address: website.address,
      logo_url: website.logo_url,
      content_json: website.content_json
    };

    // Render corresponding template HTML
    const renderedHtml = TEMPLATES.render(websiteConfig, website.template);

    // Overwrite the entire document tree with the template document structure
    document.open();
    document.write(renderedHtml);
    document.close();

  } catch (error) {
    console.error('Error rendering public site:', error);
    renderErrorState('Failed to Load Site', `An unexpected error occurred: ${error.message}`);
  }

  // Generates visual 404 page inside site-root
  function renderErrorState(title, message) {
    siteRoot.innerHTML = `
      <div style="font-family: 'Outfit', sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; text-align: center; padding: 2rem; background: #0f0d13; color: #f7fafc;">
        <span style="font-size: 5rem; margin-bottom: 1rem;">🔍</span>
        <h1 style="font-size: 2.2rem; margin-bottom: 1rem; color: #ff3e3e;">${title}</h1>
        <p style="color: #a0aec0; max-width: 500px; line-height: 1.6; margin-bottom: 2rem;">${message}</p>
        <a href="/" style="background: #6e44ff; color: white; padding: 0.8rem 1.8rem; border-radius: 30px; text-decoration: none; font-weight: 600; box-shadow: 0 4px 15px rgba(110,68,255,0.3);">Go to Webora Home</a>
      </div>
    `;
    document.title = `${title} | Webora`;
  }
});
