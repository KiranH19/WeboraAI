/**
 * Live preview page logic for template rendering and Razorpay billing checkout.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const sessionId = getQueryParam('sessionId');
  let selectedTemplate = getQueryParam('style') || 'coaching';
  let selectedPlan = 'starter';
  let sessionData = null;

  const iframe = document.getElementById('preview-iframe');
  const businessSummary = document.getElementById('business-summary');
  const browserAddress = document.getElementById('browser-address');
  const publishBtn = document.getElementById('publish-btn');
  
  // Dialog elements
  const successDialog = document.getElementById('success-dialog');
  const successSlug = document.getElementById('success-slug');
  const successLink = document.getElementById('success-link');
  const visitSiteBtn = document.getElementById('visit-site-btn');

  if (!sessionId) {
    alert('No generation session detected. Redirecting back to chat builder.');
    window.location.href = '/chat.html';
    return;
  }

  // 1. Fetch the temporary session data
  try {
    sessionData = await API.getGenerationSession(sessionId);
    businessSummary.textContent = `${sessionData.business_data.businessName} (${sessionData.business_data.businessCategory})`;
    
    // Set initial template state in sidebar from query param
    document.querySelectorAll('.template-option').forEach(el => {
      if (el.dataset.template === selectedTemplate) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    renderPreview();
  } catch (error) {
    console.error('Failed to load session details:', error);
    alert('Failed to load website draft: ' + error.message);
  }

  // 2. Setup sidebar listeners
  document.querySelectorAll('.template-option').forEach(option => {
    option.addEventListener('click', () => {
      document.querySelectorAll('.template-option').forEach(el => el.classList.remove('active'));
      option.classList.add('active');
      selectedTemplate = option.dataset.template;
      renderPreview();
    });
  });

  document.querySelectorAll('.plan-radio-option').forEach(option => {
    option.addEventListener('click', () => {
      document.querySelectorAll('.plan-radio-option').forEach(el => el.classList.remove('active'));
      option.classList.add('active');
      selectedPlan = option.dataset.plan;
    });
  });

  // 3. Renders the website HTML inside the iframe preview
  function renderPreview() {
    if (!sessionData) return;

    // Simulate database record fields needed by templates
    const mockRecord = {
      business_name: sessionData.business_data.businessName,
      phone: sessionData.business_data.phone,
      email: sessionData.business_data.email,
      address: sessionData.business_data.address,
      logo_url: sessionData.business_data.logoUrl,
      content_json: sessionData.generated_content
    };

    const previewHtml = TEMPLATES.render(mockRecord, selectedTemplate);
    iframe.srcdoc = previewHtml;

    // Update fake address bar
    const nameSlug = sessionData.business_data.businessName
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '');
    browserAddress.textContent = `http://webora.site/site/${nameSlug}`;
  }

  // 4. Handle verify and checkout button click
  publishBtn.addEventListener('click', async () => {
    if (!sessionData) return;

    publishBtn.textContent = 'Preparing Order...';
    publishBtn.disabled = true;

    try {
      // Create Razorpay Order
      const res = await API.createOrder(selectedPlan, sessionId);
      const order = res.razorpayOrder;

      // Check if operating in Mock Mode (fake local orders)
      if (order.id.startsWith('order_mock_')) {
        console.log('Operating in mock mode. Simulating successful checkout...');
        
        // Show simulated loading states
        publishBtn.textContent = 'Simulating Payment...';
        await new Promise(r => setTimeout(r, 1500));

        const mockVerifyPayload = {
          razorpay_order_id: order.id,
          razorpay_payment_id: 'pay_mock_' + Math.random().toString(36).substring(2, 10),
          razorpay_signature: 'sig_mock_' + Math.random().toString(36).substring(2, 10),
          sessionId: sessionId,
          plan: selectedPlan,
          template: selectedTemplate
        };

        const verifyResult = await API.verifyPayment(mockVerifyPayload);
        
        if (verifyResult.verified) {
          showSuccessDialog(verifyResult);
        } else {
          alert('Mock payment verification failed.');
        }

      } else {
        // Launch real Razorpay checkout modal
        const options = {
          key: res.key,
          amount: order.amount,
          currency: "INR",
          name: "Webora Builder",
          description: `Subscription setup fee for ${selectedPlan} plan`,
          order_id: order.id,
          handler: async function (response) {
            try {
              publishBtn.textContent = 'Verifying signature...';
              const verifyPayload = {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                sessionId: sessionId,
                plan: selectedPlan,
                template: selectedTemplate
              };

              const verifyResult = await API.verifyPayment(verifyPayload);
              if (verifyResult.verified) {
                showSuccessDialog(verifyResult);
              } else {
                alert('Signature verification failed on the server.');
              }
            } catch (err) {
              alert('Error during signature verification: ' + err.message);
            }
          },
          prefill: {
            name: sessionData.business_data.businessName,
            email: sessionData.business_data.email,
            contact: sessionData.business_data.phone
          },
          theme: {
            color: "#6e44ff"
          }
        };

        const rzp = new Razorpay(options);
        rzp.on('payment.failed', function (response) {
          alert(`Payment failed: ${response.error.description}`);
          publishBtn.textContent = 'Verify & Publish Site';
          publishBtn.disabled = false;
        });
        
        rzp.open();
      }

    } catch (err) {
      console.error('Order creation failed:', err);
      alert('Order creation failed: ' + err.message);
      publishBtn.textContent = 'Verify & Publish Site';
      publishBtn.disabled = false;
    }
  });

  // Displays success pop-up with links
  function showSuccessDialog(result) {
    successSlug.textContent = result.slug;
    successLink.href = result.publicUrl;
    successLink.textContent = `${window.location.origin}${result.publicUrl}`;
    visitSiteBtn.href = result.publicUrl;
    
    publishBtn.textContent = 'Published ✓';
    publishBtn.disabled = true;
    
    // Open Dialog
    successDialog.showModal();
  }
});
