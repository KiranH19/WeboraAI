/**
 * Webora Shared Core Settings and Common Utilities
 */

const CONFIG = {
  // We make the API base URL relative so it seamlessly runs on both local environments and unified hostings
  API_BASE_URL: window.location.origin
};

/**
 * Extracts a query parameter from the current URL.
 * @param {string} param - Name of the parameter to fetch.
 * @returns {string|null} The value of the parameter or null.
 */
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

/**
 * Formats a number as INR currency.
 * @param {number} amount - Amount in INR.
 * @returns {string} Formatted currency string.
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Debounce helper to restrict rapid firing of event handlers.
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Global visual helpers: update copyright year
document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});
