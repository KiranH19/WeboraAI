/**
 * Chatbot logic for WhatsApp-like website generator chat builder.
 */

const QUESTIONS = [
  {
    key: 'businessName',
    prompt: "Hello! Welcome to Webora. Let's build your website together. What is your **Business Name**?",
    validate: (val) => val.trim().length >= 2 || "Business name must be at least 2 characters.",
    placeholder: "e.g. Apex Coding Academy"
  },
  {
    key: 'businessCategory',
    prompt: "Got it! What is your **Business Category**? (e.g. Coaching, Clinic, Gym, Restaurant, Agency, Spa, Retail)",
    validate: (val) => val.trim().length >= 2 || "Please provide a valid category.",
    placeholder: "e.g. Educational Coaching"
  },
  {
    key: 'businessDescription',
    prompt: "Awesome. Please enter a short **Description of your business** (what do you do and who do you serve)?",
    validate: (val) => val.trim().length >= 10 || "Please describe in at least 10 characters.",
    placeholder: "e.g. We offer high-quality math & science test prep for high schoolers."
  },
  {
    key: 'services',
    prompt: "List the **Core Services** or products you offer (separate with commas):",
    validate: (val) => val.trim().length >= 3 || "Please list at least one service.",
    placeholder: "e.g. Physics Tutoring, Chemistry Labs, Math Crash Course"
  },
  {
    key: 'phone',
    prompt: "What is your **Contact Phone Number**? (including country code, e.g. +91 99999 99999)",
    validate: (val) => {
      const clean = val.replace(/[^0-9+]/g, '');
      return clean.length >= 8 || "Please enter a valid phone number.";
    },
    placeholder: "e.g. +91 9876543210"
  },
  {
    key: 'email',
    prompt: "What is your **Contact Email Address**?",
    validate: (val) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(val.trim()) || "Please enter a valid email address.";
    },
    placeholder: "e.g. contact@academy.com"
  },
  {
    key: 'address',
    prompt: "Where is your business located? Please provide the **Full Address**:",
    validate: (val) => val.trim().length >= 5 || "Please enter a valid address details.",
    placeholder: "e.g. 102 Science Park, Sector 4, Bangalore"
  },
  {
    key: 'designStyle',
    prompt: "Choose a **Design Style** for your templates. Please type one of: **coaching**, **clinic**, **gym**, **restaurant**, or **agency**.",
    validate: (val) => {
      const choice = val.trim().toLowerCase();
      const valid = ['coaching', 'clinic', 'gym', 'restaurant', 'agency'];
      return valid.includes(choice) || "Please match one of the styles: coaching, clinic, gym, restaurant, agency.";
    },
    placeholder: "coaching / clinic / gym / restaurant / agency"
  },
  {
    key: 'logoUrl',
    prompt: "Optional: Paste a **Logo Image URL** (or type 'none' to skip):",
    validate: (val) => {
      const txt = val.trim().toLowerCase();
      if (txt === 'none' || txt === 'skip' || txt === '') return true;
      try {
        new URL(val.trim());
        return true;
      } catch (_) {
        return "Please enter a valid URL or type 'none'.";
      }
    },
    placeholder: "e.g. https://domain.com/logo.png"
  }
];

let currentStep = 0;
const collectedData = {};

const chatHistory = document.getElementById('chat-history');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const progressOverlay = document.getElementById('progress-overlay');

/**
 * Appends a message bubble into the chat window.
 */
function appendMessage(text, sender = 'bot', isHTML = false) {
  const wrapper = document.createElement('div');
  wrapper.className = `message-wrapper ${sender}`;

  const msgDiv = document.createElement('div');
  msgDiv.className = 'message';
  
  if (isHTML) {
    msgDiv.innerHTML = text;
  } else {
    // Basic bold markdown simulation (e.g. **bold**)
    let htmlText = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    msgDiv.innerHTML = htmlText;
  }

  const timeDiv = document.createElement('div');
  timeDiv.className = 'message-time';
  const now = new Date();
  timeDiv.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  msgDiv.appendChild(timeDiv);
  wrapper.appendChild(msgDiv);
  chatHistory.appendChild(wrapper);
  
  // Scroll to bottom
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

/**
 * Shows temporary typing dots bubble.
 */
function showTypingIndicator() {
  const wrapper = document.createElement('div');
  wrapper.className = 'message-wrapper bot typing-indicator-wrapper';

  const msgDiv = document.createElement('div');
  msgDiv.className = 'message';
  msgDiv.innerHTML = `
    <div class="typing-indicator">
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
    </div>
  `;

  wrapper.appendChild(msgDiv);
  chatHistory.appendChild(wrapper);
  chatHistory.scrollTop = chatHistory.scrollHeight;
  return wrapper;
}

/**
 * Executes a question step, with brief delays for conversational feel.
 */
function askNextQuestion() {
  if (currentStep < QUESTIONS.length) {
    const q = QUESTIONS[currentStep];
    const indicator = showTypingIndicator();
    
    // Set appropriate placeholder
    chatInput.placeholder = q.placeholder || "Type your reply...";
    
    setTimeout(() => {
      // Remove indicator
      indicator.remove();
      appendMessage(q.prompt, 'bot');
    }, 800);
  } else {
    finishChatFlow();
  }
}

/**
 * Submits the data to the backend AI API and handles redirect.
 */
async function finishChatFlow() {
  appendMessage("Splendid! We have collected all details. Initializing website copywriting layout via Grok API...", "bot");
  progressOverlay.style.display = 'flex';

  try {
    const result = await API.generateWebsite(collectedData);
    console.log('Website content generated successfully:', result);
    
    // Redirect to preview page
    window.location.href = `/preview.html?sessionId=${result.sessionId}&style=${encodeURIComponent(collectedData.designStyle)}`;
  } catch (err) {
    progressOverlay.style.display = 'none';
    appendMessage(`❌ **Error generating content:** ${err.message}. Please reload and try again.`, 'bot');
    console.error('Generation failure:', err);
  }
}

// Form submit event handler
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const userText = chatInput.value.trim();
  if (!userText) return;

  const currentQuestion = QUESTIONS[currentStep];

  // Validate user input
  const validationResult = currentQuestion.validate(userText);
  if (validationResult !== true) {
    appendMessage(validationResult, 'bot');
    // Highlight input as invalid using fallback class if selector fails
    chatInput.classList.add('user-invalid-fallback');
    return;
  }

  // Clear validation classes
  chatInput.classList.remove('user-invalid-fallback');

  // Record input
  collectedData[currentQuestion.key] = userText;
  appendMessage(userText, 'user');
  chatInput.value = '';

  // Advance
  currentStep++;
  askNextQuestion();
});

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  askNextQuestion();
});
