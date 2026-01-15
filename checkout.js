/**
 * PrivacyPolicyGen - Stripe Checkout Integration
 *
 * This file handles Pro upgrade payments via Stripe Checkout.
 * Replace the placeholder values with your actual Stripe keys and price IDs.
 */

// Stripe Configuration - REPLACE WITH YOUR ACTUAL VALUES
const STRIPE_CONFIG = {
    publishableKey: 'pk_live_YOUR_STRIPE_PUBLISHABLE_KEY',
    priceIds: {
        proMonthly: 'price_YOUR_PRO_MONTHLY_PRICE_ID',    // $15/month
        proAnnual: 'price_YOUR_PRO_ANNUAL_PRICE_ID',      // $120/year (save 33%)
        lifetime: 'price_YOUR_LIFETIME_PRICE_ID'          // $79 one-time
    },
    successUrl: window.location.origin + '/success.html',
    cancelUrl: window.location.origin + '/#pricing'
};

// Initialize Stripe
let stripe = null;

async function initStripe() {
    if (typeof Stripe !== 'undefined') {
        stripe = Stripe(STRIPE_CONFIG.publishableKey);
    } else {
        console.warn('Stripe.js not loaded. Add <script src="https://js.stripe.com/v3/"></script> to your HTML.');
    }
}

/**
 * Handle Pro upgrade button click
 * @param {string} plan - 'monthly', 'annual', or 'lifetime'
 */
async function handleProUpgrade(plan = 'lifetime') {
    // Track upgrade attempt
    trackEvent('upgrade_initiated', { plan });

    // For now, show coming soon modal since Stripe isn't configured
    if (STRIPE_CONFIG.publishableKey.includes('YOUR_STRIPE')) {
        showComingSoonModal(plan);
        return;
    }

    // Stripe is configured - proceed with checkout
    try {
        const priceId = plan === 'annual'
            ? STRIPE_CONFIG.priceIds.proAnnual
            : plan === 'lifetime'
            ? STRIPE_CONFIG.priceIds.lifetime
            : STRIPE_CONFIG.priceIds.proMonthly;

        const { error } = await stripe.redirectToCheckout({
            lineItems: [{ price: priceId, quantity: 1 }],
            mode: plan === 'lifetime' ? 'payment' : 'subscription',
            successUrl: STRIPE_CONFIG.successUrl,
            cancelUrl: STRIPE_CONFIG.cancelUrl
        });

        if (error) {
            console.error('Stripe checkout error:', error);
            showErrorModal('Payment failed. Please try again or contact support.');
        }
    } catch (err) {
        console.error('Checkout error:', err);
        showErrorModal('Something went wrong. Please try again.');
    }
}

/**
 * Show "Coming Soon" modal with email waitlist capture
 * Uses existing showUpgradeModal from app.js if available
 */
function showComingSoonModal(plan) {
    // Try to use existing modal from app.js
    if (typeof window.showUpgradeModal === 'function') {
        window.showUpgradeModal();
        trackEvent('upgrade_modal_shown', { plan, type: 'coming_soon' });
        return;
    }

    // Fallback: create modal
    let modal = document.getElementById('upgradeModal');

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'upgradeModal';
        modal.className = 'fixed inset-0 bg-black/60 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold text-gray-900">Pro Is Coming Soon!</h2>
                    <button onclick="closeUpgradeModal()" class="text-gray-400 hover:text-gray-600 p-1">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                <p class="text-gray-600 mb-6">Generate unlimited privacy policies, terms of service, and more. Join the waitlist and get lifetime access at a discount!</p>
                <form id="waitlistForm" onsubmit="submitWaitlist(event)" class="space-y-4">
                    <input type="email" id="waitlistEmail" required placeholder="your@email.com"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <button type="submit" class="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition">
                        Join the Waitlist
                    </button>
                </form>
                <p class="text-center text-sm text-gray-500 mt-4">Limited time: Get 25% off lifetime access!</p>
            </div>
        `;
        document.body.appendChild(modal);
    } else {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    }

    trackEvent('upgrade_modal_shown', { plan, type: 'coming_soon' });
}

/**
 * Close upgrade modal
 */
function closeUpgradeModal() {
    const modal = document.getElementById('upgradeModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }

    // Also try the app.js modal close
    const emailCapture = document.getElementById('emailCaptureModal');
    if (emailCapture) {
        emailCapture.classList.add('hidden');
    }
}

/**
 * Show error modal
 */
function showErrorModal(message) {
    alert(message);
}

/**
 * Check if user has Pro access
 */
function isPro() {
    const proStatus = localStorage.getItem('privacypolicygen_pro');
    if (proStatus) {
        try {
            const data = JSON.parse(proStatus);
            if (data.lifetime) return true;
            if (data.expiresAt && new Date(data.expiresAt) > new Date()) {
                return true;
            }
        } catch (e) {
            console.error('Error parsing pro status:', e);
        }
    }
    return false;
}

/**
 * Set Pro status after successful payment
 */
function setProStatus(data) {
    localStorage.setItem('privacypolicygen_pro', JSON.stringify({
        active: true,
        plan: data.plan || 'lifetime',
        lifetime: data.lifetime || (data.plan === 'lifetime'),
        expiresAt: data.expiresAt || null,
        activatedAt: new Date().toISOString()
    }));

    window.dispatchEvent(new CustomEvent('proStatusChanged', { detail: { isPro: true } }));
}

/**
 * Clear Pro status
 */
function clearProStatus() {
    localStorage.removeItem('privacypolicygen_pro');
    window.dispatchEvent(new CustomEvent('proStatusChanged', { detail: { isPro: false } }));
}

/**
 * Show upgrade modal for Pro-gated features
 */
function showUpgradeModalForFeature(feature) {
    showComingSoonModal('feature_gate');

    const modal = document.getElementById('upgradeModal');
    if (modal && feature) {
        const desc = modal.querySelector('p');
        if (desc) {
            desc.textContent = `Upgrade to Pro to ${feature}. Join the waitlist and get early access!`;
        }
    }

    trackEvent('upgrade_modal_shown', { feature, type: 'feature_gate' });
}

/**
 * Validate email format and prevent header injection
 * @param {string} email - The email to validate
 * @returns {boolean} - Whether the email is valid
 */
function isValidWaitlistEmail(email) {
    if (!email) return false;

    // Trim whitespace
    email = email.trim();

    // Check for header injection attempts (newlines, carriage returns)
    if (/[\r\n]/.test(email)) {
        console.warn('Security: Blocked email header injection attempt');
        return false;
    }

    // Check for excessive length (prevent abuse)
    if (email.length > 254) {
        return false;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@<>()[\]\\,;:]+@[^\s@<>()[\]\\,;:]+\.[^\s@<>()[\]\\,;:]+$/;
    return emailRegex.test(email);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtmlCheckout(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Submit email to waitlist
 */
async function submitWaitlist(event) {
    event.preventDefault();

    const emailInput = document.getElementById('waitlistEmail');
    const email = emailInput ? emailInput.value.trim() : '';

    // Validate email before storing
    if (!isValidWaitlistEmail(email)) {
        alert('Please enter a valid email address.');
        return false;
    }

    // Sanitize email for storage
    const sanitizedEmail = escapeHtmlCheckout(email);

    const waitlist = JSON.parse(localStorage.getItem('privacypolicygen_waitlist') || '[]');

    // Check for duplicates using sanitized email
    if (!waitlist.some(w => w.email === sanitizedEmail)) {
        waitlist.push({
            email: sanitizedEmail,
            source: 'upgrade_modal',
            timestamp: new Date().toISOString()
        });

        // Limit waitlist size to prevent localStorage abuse
        if (waitlist.length > 1000) {
            waitlist.shift(); // Remove oldest entry
        }

        localStorage.setItem('privacypolicygen_waitlist', JSON.stringify(waitlist));
    }

    trackEvent('waitlist_signup', { source: 'upgrade_modal' });

    // Show success message
    const form = document.getElementById('waitlistForm');
    if (form) {
        form.innerHTML = `
            <div class="text-center py-4">
                <svg class="w-16 h-16 mx-auto text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p class="text-xl font-semibold text-gray-900">You're on the list!</p>
                <p class="text-gray-600 mt-2">We'll email you when Pro launches with your 25% discount code.</p>
            </div>
        `;
    }

    return true;
}

/**
 * Simple event tracking
 */
function trackEvent(event, data = {}) {
    console.log('Track:', event, data);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initStripe);

// Export for use in other modules
window.PrivacyPolicyGenCheckout = {
    handleProUpgrade,
    isPro,
    setProStatus,
    clearProStatus,
    showUpgradeModal: showUpgradeModalForFeature,
    submitWaitlist: (e) => submitWaitlist(e)
};
