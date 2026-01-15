/**
 * PrivacyPolicyGen - Main Application JavaScript
 * A privacy policy and terms of service generator
 */

// ==========================================
// State Management
// ==========================================

let currentStep = 1;
const totalSteps = 5;
let generatedPolicy = '';
let billingPeriod = 'monthly';

// ==========================================
// Billing Toggle Function
// ==========================================

function toggleBilling(period) {
    billingPeriod = period;
    const monthlyBtn = document.getElementById('monthlyToggle');
    const annualBtn = document.getElementById('annualToggle');
    const proPrice = document.getElementById('proPrice');
    const proPeriod = document.getElementById('proPeriod');
    const proSavings = document.getElementById('proSavings');

    // Guard clause for missing elements
    if (!monthlyBtn || !annualBtn) return;

    if (period === 'monthly') {
        monthlyBtn.classList.add('bg-primary', 'text-white');
        monthlyBtn.classList.remove('text-gray-600');
        annualBtn.classList.remove('bg-primary', 'text-white');
        annualBtn.classList.add('text-gray-600');
        if (proPrice) proPrice.textContent = '$15';
        if (proPeriod) proPeriod.textContent = '/month';
        if (proSavings) proSavings.textContent = '';
    } else {
        annualBtn.classList.add('bg-primary', 'text-white');
        annualBtn.classList.remove('text-gray-600');
        monthlyBtn.classList.remove('bg-primary', 'text-white');
        monthlyBtn.classList.add('text-gray-600');
        if (proPrice) proPrice.textContent = '$120';
        if (proPeriod) proPeriod.textContent = '/year';
        if (proSavings) proSavings.textContent = 'Save $60/year (33% off)';
    }
}

// Form data object
const formData = {
    // Step 1: Basic Info
    companyName: '',
    websiteUrl: '',
    contactEmail: '',
    businessType: 'website',

    // Step 2: Data Collection
    collectName: false,
    collectEmail: true,
    collectPhone: false,
    collectAddress: false,
    collectPayment: false,
    collectUsage: true,
    collectDevice: false,
    collectLocation: false,

    // Step 3: Cookies
    useCookies: true,
    cookieEssential: true,
    cookieAnalytics: false,
    cookieMarketing: false,
    cookieFunctional: false,

    // Step 4: Third-Party Services
    serviceGA: false,
    serviceFB: false,
    serviceStripe: false,
    servicePaypal: false,
    serviceMailchimp: false,
    serviceIntercom: false,
    serviceHotjar: false,
    serviceAWS: false,
    serviceSendgrid: false,
    serviceZendesk: false,

    // Step 5: Regions & Options
    regionUSA: true,
    regionEU: false,
    regionCA: false,
    regionUK: false,
    regionGlobal: false,
    optionChildren: false,
    optionNewsletter: false,
    optionSellData: false
};

// ==========================================
// Navigation Functions
// ==========================================

function scrollToGenerator() {
    document.getElementById('generator').scrollIntoView({ behavior: 'smooth' });
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    menu.classList.toggle('hidden');
    menu.classList.toggle('show');
}

// ==========================================
// Form Step Management
// ==========================================

function changeStep(direction) {
    // Validate current step before moving forward
    if (direction === 1 && !validateStep(currentStep)) {
        return;
    }

    // Save current step data
    saveStepData(currentStep);

    // Update step
    const newStep = currentStep + direction;
    if (newStep < 1 || newStep > totalSteps) return;

    // Hide current step
    document.getElementById(`step${currentStep}`).classList.add('hidden');

    // Show new step
    currentStep = newStep;
    document.getElementById(`step${currentStep}`).classList.remove('hidden');

    // Update progress
    updateProgress();

    // Update buttons
    updateButtons();

    // Update preview
    updatePreview();
}

function validateStep(step) {
    if (step === 1) {
        const companyName = document.getElementById('companyName').value.trim();
        const websiteUrl = document.getElementById('websiteUrl').value.trim();
        const contactEmail = document.getElementById('contactEmail').value.trim();

        if (!companyName) {
            showToast('Oops! We need your company or website name to continue.');
            document.getElementById('companyName').focus();
            return false;
        }

        // Validate company name length
        if (companyName.length > 200) {
            showToast('Company name is too long. Please keep it under 200 characters.');
            document.getElementById('companyName').focus();
            return false;
        }

        if (!websiteUrl) {
            showToast('Almost there! Just add your website URL.');
            document.getElementById('websiteUrl').focus();
            return false;
        }

        // Validate URL format and block dangerous protocols
        if (!isValidUrl(websiteUrl)) {
            showToast('Please enter a valid website URL (e.g., https://example.com).');
            document.getElementById('websiteUrl').focus();
            return false;
        }

        if (!contactEmail || !isValidEmail(contactEmail)) {
            showToast('Hmm, that email does not look quite right. Mind double-checking?');
            document.getElementById('contactEmail').focus();
            return false;
        }

        // Check for email header injection attempts
        if (/[\r\n]/.test(contactEmail)) {
            showToast('Invalid characters in email address.');
            document.getElementById('contactEmail').focus();
            return false;
        }
    }

    return true;
}

/**
 * Validate URL format - block dangerous protocols
 */
function isValidUrl(url) {
    if (!url) return false;

    url = url.trim().toLowerCase();

    // Block dangerous protocols
    const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
    for (const protocol of dangerousProtocols) {
        if (url.startsWith(protocol)) {
            return false;
        }
    }

    // Must be http/https or a valid domain pattern
    if (url.match(/^https?:\/\//i)) {
        return true;
    }

    // Allow domains without protocol (will be prefixed with https://)
    if (url.match(/^[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}/)) {
        return true;
    }

    return false;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function saveStepData(step) {
    switch(step) {
        case 1:
            formData.companyName = document.getElementById('companyName').value.trim();
            formData.websiteUrl = document.getElementById('websiteUrl').value.trim();
            formData.contactEmail = document.getElementById('contactEmail').value.trim();
            formData.businessType = document.getElementById('businessType').value;
            break;
        case 2:
            formData.collectName = document.getElementById('collectName').checked;
            formData.collectEmail = document.getElementById('collectEmail').checked;
            formData.collectPhone = document.getElementById('collectPhone').checked;
            formData.collectAddress = document.getElementById('collectAddress').checked;
            formData.collectPayment = document.getElementById('collectPayment').checked;
            formData.collectUsage = document.getElementById('collectUsage').checked;
            formData.collectDevice = document.getElementById('collectDevice').checked;
            formData.collectLocation = document.getElementById('collectLocation').checked;
            break;
        case 3:
            formData.useCookies = document.querySelector('input[name="useCookies"]:checked').value === 'yes';
            formData.cookieEssential = document.getElementById('cookieEssential').checked;
            formData.cookieAnalytics = document.getElementById('cookieAnalytics').checked;
            formData.cookieMarketing = document.getElementById('cookieMarketing').checked;
            formData.cookieFunctional = document.getElementById('cookieFunctional').checked;
            break;
        case 4:
            formData.serviceGA = document.getElementById('serviceGA').checked;
            formData.serviceFB = document.getElementById('serviceFB').checked;
            formData.serviceStripe = document.getElementById('serviceStripe').checked;
            formData.servicePaypal = document.getElementById('servicePaypal').checked;
            formData.serviceMailchimp = document.getElementById('serviceMailchimp').checked;
            formData.serviceIntercom = document.getElementById('serviceIntercom').checked;
            formData.serviceHotjar = document.getElementById('serviceHotjar').checked;
            formData.serviceAWS = document.getElementById('serviceAWS').checked;
            formData.serviceSendgrid = document.getElementById('serviceSendgrid').checked;
            formData.serviceZendesk = document.getElementById('serviceZendesk').checked;
            break;
        case 5:
            formData.regionUSA = document.getElementById('regionUSA').checked;
            formData.regionEU = document.getElementById('regionEU').checked;
            formData.regionCA = document.getElementById('regionCA').checked;
            formData.regionUK = document.getElementById('regionUK').checked;
            formData.regionGlobal = document.getElementById('regionGlobal').checked;
            formData.optionChildren = document.getElementById('optionChildren').checked;
            formData.optionNewsletter = document.getElementById('optionNewsletter').checked;
            formData.optionSellData = document.getElementById('optionSellData').checked;
            break;
    }
}

// Encouraging messages for each step
const stepMessages = {
    1: "Great start!",
    2: "You're doing great!",
    3: "Halfway there!",
    4: "Almost done!",
    5: "Final step!"
};

function updateProgress() {
    const progress = (currentStep / totalSteps) * 100;
    document.getElementById('progressBar').style.width = `${progress}%`;
    document.getElementById('currentStep').textContent = currentStep;
    document.getElementById('totalSteps').textContent = totalSteps;

    // Add encouraging message to progress percentage
    const encouragement = stepMessages[currentStep] || '';
    document.getElementById('progressPercent').textContent = `${Math.round(progress)}%`;

    // Update visual step indicators
    updateStepIndicators();

    // Update connecting progress line
    updateProgressLine();
}

function updateStepIndicators() {
    const indicators = document.querySelectorAll('.step-indicator');

    indicators.forEach((indicator, index) => {
        const stepNum = index + 1;
        const circle = indicator.querySelector('.step-circle');
        const label = indicator.querySelector('.step-label');

        // Remove all state classes
        circle.classList.remove('active', 'completed', 'bg-primary', 'bg-gray-200', 'text-white', 'text-gray-500', 'shadow-lg', 'ring-4', 'ring-primary/20');

        if (stepNum < currentStep) {
            // Completed steps
            circle.classList.add('completed');
            label.classList.remove('text-gray-400');
            label.classList.add('text-green-600', 'font-semibold');
        } else if (stepNum === currentStep) {
            // Current step
            circle.classList.add('active', 'bg-primary', 'text-white', 'shadow-lg', 'ring-4', 'ring-primary/20');
            label.classList.remove('text-gray-400');
            label.classList.add('text-primary', 'font-semibold');
        } else {
            // Future steps
            circle.classList.add('bg-gray-200', 'text-gray-500');
            label.classList.remove('text-primary', 'text-green-600', 'font-semibold');
            label.classList.add('text-gray-400');
        }
    });
}

function updateProgressLine() {
    const progressLine = document.getElementById('progressLine');
    if (progressLine) {
        // Calculate width based on completed steps (not including current step)
        // Each step transition represents 25% of the total width (for 5 steps, 4 transitions)
        const completedTransitions = currentStep - 1;
        const widthPercent = (completedTransitions / (totalSteps - 1)) * 80; // 80% is the total line width
        progressLine.style.width = `${widthPercent}%`;
    }
}

function updateButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const generateBtn = document.getElementById('generateBtn');

    // Show/hide previous button
    if (currentStep === 1) {
        prevBtn.classList.add('hidden');
    } else {
        prevBtn.classList.remove('hidden');
    }

    // Show/hide next or generate button
    if (currentStep === totalSteps) {
        nextBtn.classList.add('hidden');
        generateBtn.classList.remove('hidden');
    } else {
        nextBtn.classList.remove('hidden');
        generateBtn.classList.add('hidden');
    }
}

// ==========================================
// Policy Generation
// ==========================================

function generatePolicy() {
    // Save final step data
    saveStepData(currentStep);

    // Check free tier limit
    if (!checkFreeTierLimit()) {
        showToast('You have used your free policy this month. Upgrade to Pro for unlimited policies!');
        return;
    }

    // Generate the policy
    generatedPolicy = buildPrivacyPolicy();

    // Update preview
    document.getElementById('policyPreview').innerHTML = generatedPolicy;

    // Save to localStorage
    saveToLocalStorage();

    // Show success message with celebration
    showSuccessToast();

    // Scroll to preview
    document.getElementById('policyPreview').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Escape HTML to prevent XSS attacks
 * This is critical for legal document generation where user input appears in output
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Validate and sanitize URL to prevent javascript: protocol and XSS
 * @param {string} url - The URL to validate
 * @returns {string} - Safe URL or empty string
 */
function sanitizeUrl(url) {
    if (!url) return '';

    // Trim and normalize
    url = url.trim();

    // Block dangerous protocols
    const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
    const lowerUrl = url.toLowerCase();

    for (const protocol of dangerousProtocols) {
        if (lowerUrl.startsWith(protocol)) {
            console.warn('Security: Blocked dangerous URL protocol:', protocol);
            return '';
        }
    }

    // Ensure URL has a valid protocol or add https://
    if (!url.match(/^https?:\/\//i)) {
        // If it looks like a domain, add https://
        if (url.match(/^[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}/)) {
            url = 'https://' + url;
        }
    }

    // Final validation - must be http or https
    if (!url.match(/^https?:\/\//i)) {
        return '';
    }

    return escapeHtml(url);
}

/**
 * Validate email format and prevent header injection
 * @param {string} email - The email to validate
 * @returns {string} - Safe email or empty string
 */
function sanitizeEmail(email) {
    if (!email) return '';

    // Trim and normalize
    email = email.trim();

    // Check for header injection attempts (newlines, carriage returns)
    if (/[\r\n]/.test(email)) {
        console.warn('Security: Blocked email header injection attempt');
        return '';
    }

    // Basic email format validation
    const emailRegex = /^[^\s@<>()[\]\\,;:]+@[^\s@<>()[\]\\,;:]+\.[^\s@<>()[\]\\,;:]+$/;
    if (!emailRegex.test(email)) {
        return '';
    }

    return escapeHtml(email);
}

/**
 * Sanitize company name - allow alphanumeric, spaces, common business characters
 * @param {string} name - The company name to sanitize
 * @returns {string} - Safe company name
 */
function sanitizeCompanyName(name) {
    if (!name) return '';

    // Trim whitespace
    name = name.trim();

    // Remove any HTML tags first
    name = name.replace(/<[^>]*>/g, '');

    // Limit length to prevent abuse
    if (name.length > 200) {
        name = name.substring(0, 200);
    }

    return escapeHtml(name);
}

/**
 * Get sanitized form data for safe HTML insertion
 */
function getSafeFormData() {
    return {
        companyName: sanitizeCompanyName(formData.companyName),
        websiteUrl: sanitizeUrl(formData.websiteUrl),
        contactEmail: sanitizeEmail(formData.contactEmail)
    };
}

function buildPrivacyPolicy() {
    const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Use sanitized values to prevent XSS
    const safe = getSafeFormData();

    let policy = `<h1>Privacy Policy for ${safe.companyName}</h1>
<p><strong>Last Updated:</strong> ${today}</p>

<h2>1. Introduction</h2>
<p>Hi there! Welcome to ${safe.companyName}. We take your privacy seriously, and we want to be upfront about how we handle your information. This policy explains what data we collect, why we collect it, and what we do with it when you use our ${getBusinessTypeText()} at ${safe.websiteUrl}.</p>

<p>We have tried to keep this as clear and jargon-free as possible. If anything is confusing, just reach out, we are happy to explain.</p>

<h2>2. What We Collect (and Why)</h2>
<p>When you ${getCollectionContext()}, you might share some personal information with us. Here is what we may collect:</p>

<h3>Information You Give Us Directly</h3>
<p>This is stuff you actively share with us:</p>
<ul>
${getCollectedDataList()}
</ul>

${formData.collectDevice || formData.collectUsage ? `
<h3>Information We Collect Automatically</h3>
<p>Like most websites, we automatically gather some technical info when you visit our ${getBusinessTypeText()}. This does not personally identify you, but it helps us understand how people use our site:</p>
<ul>
${formData.collectDevice ? '<li>Device and browser information (IP address, browser type, operating system)</li>' : ''}
${formData.collectUsage ? '<li>Usage data (pages visited, time spent, click patterns)</li>' : ''}
${formData.collectLocation ? '<li>Location data (based on IP address or with your consent)</li>' : ''}
</ul>
` : ''}

<h2>3. How We Use Your Information</h2>
<p>We only use your information when we have a good reason. Here is what we do with it:</p>
<ul>
<li>To provide and maintain our ${getBusinessTypeText()}</li>
<li>To respond to your inquiries and provide customer support</li>
<li>To improve and optimize our ${getBusinessTypeText()}</li>
${formData.optionNewsletter ? '<li>To send you marketing and promotional communications (with your consent)</li>' : ''}
${formData.collectPayment ? '<li>To process transactions and send related information</li>' : ''}
<li>To protect against fraudulent or unauthorized activity</li>
<li>To comply with legal obligations</li>
</ul>

<h2>4. Who We Share Your Information With</h2>
<p>We do not sell your personal information. However, there are some situations where we might share it:</p>
<ul>
<li><strong>Service Providers:</strong> We may share your information with third-party vendors who perform services for us</li>
<li><strong>Legal Requirements:</strong> We may disclose your information where required by law</li>
<li><strong>Business Transfers:</strong> We may share or transfer your information in connection with a merger, acquisition, or sale of assets</li>
${formData.optionSellData ? '<li><strong>Third-Party Sharing:</strong> We may share your information with third parties for their marketing purposes</li>' : ''}
</ul>

${getThirdPartySection()}

${formData.useCookies ? getCookieSection() : ''}

${formData.regionEU || formData.regionGlobal ? getGDPRSection() : ''}

${formData.regionCA || formData.regionGlobal ? getCCPASection() : ''}

${formData.optionChildren ? getCOPPASection() : ''}

<h2>${getSectionNumber()}. Data Security</h2>
<p>We take security seriously and use industry-standard measures to protect your information. That said, no system is perfect. While we do our best to keep your data safe, we cannot guarantee 100% security. If you ever suspect a security issue, please let us know right away.</p>

<h2>${getSectionNumber()}. Data Retention</h2>
<p>We keep your information only as long as we need it. Once it is no longer necessary, we delete it. In some cases, the law requires us to hold onto certain data longer, but we will let you know if that applies.</p>

<h2>${getSectionNumber()}. Your Privacy Rights</h2>
<p>You have rights over your personal information. Depending on where you live, these may include:</p>
<ul>
<li>The right to access your personal information</li>
<li>The right to correct inaccurate information</li>
<li>The right to request deletion of your information</li>
<li>The right to opt-out of marketing communications</li>
${formData.regionEU || formData.regionGlobal ? '<li>The right to data portability (GDPR)</li>' : ''}
${formData.regionCA || formData.regionGlobal ? '<li>The right to opt-out of the sale of personal information (CCPA)</li>' : ''}
</ul>

<p>To exercise these rights, please contact us at ${safe.contactEmail}.</p>

<h2>${getSectionNumber()}. Updates to This Policy</h2>
<p>We may update this policy as our practices or the law changes. When we do, we will update the "Last Updated" date at the top. We encourage you to check back now and then.</p>

<h2>${getSectionNumber()}. Contact Us</h2>
<p>We are real people, and we are happy to answer any questions you have. Reach out anytime:</p>
<p>
<strong>${safe.companyName}</strong><br>
Email: ${safe.contactEmail}<br>
Website: ${safe.websiteUrl}
</p>

${getViralFooter()}`;

    return policy;
}

// Viral Footer - Free tier includes branding, Pro removes it
function getViralFooter() {
    const isPro = localStorage.getItem('privacypolicygen_pro') === 'true';
    if (isPro) {
        return ''; // Pro users get clean policies without branding
    }
    return `
<hr style="margin: 2rem 0; border: none; border-top: 1px solid #e5e7eb;">
<p style="font-size: 0.85rem; color: #6b7280; text-align: center;">
<em>This privacy policy was generated with <a href="https://privacypolicygen.io?ref=policy" target="_blank" rel="noopener" style="color: #1e40af; text-decoration: underline;">PrivacyPolicyGen.io</a> - Free Privacy Policy Generator for Websites & Apps</em>
</p>`;
}

// Helper variable for section numbering
let sectionCounter = 5;

function getSectionNumber() {
    return ++sectionCounter;
}

function getBusinessTypeText() {
    const types = {
        'website': 'website',
        'webapp': 'web application',
        'mobileapp': 'mobile application',
        'ecommerce': 'online store',
        'saas': 'platform',
        'blog': 'blog'
    };
    return types[formData.businessType] || 'website';
}

function getCollectionContext() {
    if (formData.businessType === 'ecommerce') {
        return 'make a purchase, create an account, or interact with our store';
    } else if (formData.businessType === 'saas') {
        return 'register for an account, subscribe to our service, or use our platform';
    } else if (formData.businessType === 'mobileapp') {
        return 'download and use our mobile application';
    } else {
        return 'register on our site, subscribe to a newsletter, or fill out a form';
    }
}

function getCollectedDataList() {
    let items = [];
    if (formData.collectName) items.push('<li>Names</li>');
    if (formData.collectEmail) items.push('<li>Email addresses</li>');
    if (formData.collectPhone) items.push('<li>Phone numbers</li>');
    if (formData.collectAddress) items.push('<li>Mailing addresses</li>');
    if (formData.collectPayment) items.push('<li>Payment information (credit card numbers, billing addresses)</li>');

    if (items.length === 0) {
        items.push('<li>Contact information you voluntarily provide</li>');
    }

    return items.join('\n');
}

function getThirdPartySection() {
    let services = [];

    if (formData.serviceGA) services.push({ name: 'Google Analytics', purpose: 'website analytics', link: 'https://policies.google.com/privacy' });
    if (formData.serviceFB) services.push({ name: 'Facebook Pixel', purpose: 'advertising and analytics', link: 'https://www.facebook.com/privacy/policy' });
    if (formData.serviceStripe) services.push({ name: 'Stripe', purpose: 'payment processing', link: 'https://stripe.com/privacy' });
    if (formData.servicePaypal) services.push({ name: 'PayPal', purpose: 'payment processing', link: 'https://www.paypal.com/us/legalhub/privacy-full' });
    if (formData.serviceMailchimp) services.push({ name: 'Mailchimp', purpose: 'email marketing', link: 'https://mailchimp.com/legal/privacy/' });
    if (formData.serviceIntercom) services.push({ name: 'Intercom', purpose: 'customer support', link: 'https://www.intercom.com/legal/privacy' });
    if (formData.serviceHotjar) services.push({ name: 'Hotjar', purpose: 'website analytics', link: 'https://www.hotjar.com/privacy/' });
    if (formData.serviceAWS) services.push({ name: 'Amazon Web Services', purpose: 'cloud hosting', link: 'https://aws.amazon.com/privacy/' });
    if (formData.serviceSendgrid) services.push({ name: 'SendGrid', purpose: 'email delivery', link: 'https://www.twilio.com/legal/privacy' });
    if (formData.serviceZendesk) services.push({ name: 'Zendesk', purpose: 'customer support', link: 'https://www.zendesk.com/company/agreements-and-terms/privacy-notice/' });

    if (services.length === 0) {
        return '';
    }

    let section = `<h2>5. Third-Party Services</h2>
<p>We use the following third-party services that may collect information about you:</p>
<ul>
`;

    services.forEach(service => {
        section += `<li><strong>${service.name}</strong> - Used for ${service.purpose}. <a href="${service.link}" target="_blank">View their privacy policy</a></li>\n`;
    });

    section += `</ul>
<p>We recommend reviewing the privacy policies of these third-party services to understand how they handle your data.</p>`;

    sectionCounter = 5;
    return section;
}

function getCookieSection() {
    let cookieTypes = [];

    if (formData.cookieEssential) cookieTypes.push('<li><strong>Essential Cookies:</strong> These are the must-haves. Without them, basic features like logging in would not work</li>');
    if (formData.cookieAnalytics) cookieTypes.push('<li><strong>Analytics Cookies:</strong> These help us see how people use our site so we can make it better</li>');
    if (formData.cookieMarketing) cookieTypes.push('<li><strong>Marketing Cookies:</strong> These let us show you more relevant ads (you can opt out of these)</li>');
    if (formData.cookieFunctional) cookieTypes.push('<li><strong>Functional Cookies:</strong> These remember your preferences so you do not have to set them every time</li>');

    return `<h2>${getSectionNumber()}. Cookies and Tracking Technologies</h2>
<p>Like most websites, we use cookies to help our site work better for you. Cookies are small text files that websites store on your device. They help us remember your preferences and understand how you use our ${getBusinessTypeText()}.</p>

<h3>Here Are the Types of Cookies We Use</h3>
<ul>
${cookieTypes.join('\n')}
</ul>

<h3>Managing Cookies</h3>
<p>You are in control. Most browsers let you manage or delete cookies through their settings. Just know that if you block all cookies, some parts of our ${getBusinessTypeText()} might not work as expected.</p>`;
}

function getGDPRSection() {
    return `<h2>${getSectionNumber()}. GDPR Rights (European Users)</h2>
<p>If you are in Europe (the EEA specifically), you have extra rights under the GDPR. Here is what you can do:</p>
<ul>
<li><strong>See Your Data:</strong> You can ask us for a copy of the personal data we have about you</li>
<li><strong>Fix Mistakes:</strong> If something is wrong, let us know and we will correct it</li>
<li><strong>Delete Your Data:</strong> You can ask us to delete your personal information</li>
<li><strong>Limit How We Use It:</strong> You can ask us to restrict how we process your data</li>
<li><strong>Take It With You:</strong> You can get your data in a format you can take to another service</li>
<li><strong>Say No:</strong> You can object to certain ways we use your data</li>
</ul>
<p>To exercise any of these rights, please contact us at ${sanitizeEmail(formData.contactEmail) || safe.contactEmail}. We will get back to you within 30 days.</p>

<h3>Why We Are Allowed to Use Your Data</h3>
<p>We only use your data when we have a valid reason. Here are the legal bases we rely on:</p>
<ul>
<li>Your consent</li>
<li>Performance of a contract with you</li>
<li>Our legitimate business interests</li>
<li>Compliance with legal obligations</li>
</ul>`;
}

function getCCPASection() {
    return `<h2>${getSectionNumber()}. CCPA Rights (California Residents)</h2>
<p>California residents have special privacy rights under the CCPA. Here is what you can do:</p>
<ul>
<li><strong>Know What We Have:</strong> You can ask us exactly what personal info we have collected about you</li>
<li><strong>Request Deletion:</strong> You can ask us to delete your personal information</li>
<li><strong>Opt Out of Selling:</strong> If we sell personal information (which we will disclose below), you can tell us to stop</li>
<li><strong>No Penalty for Opting Out:</strong> We will never treat you differently for exercising your privacy rights</li>
</ul>

${formData.optionSellData ? '<p><strong>Do Not Sell My Personal Information:</strong> We may share your personal information with third parties. To opt-out of the sale of your personal information, please contact us at ' + (sanitizeEmail(formData.contactEmail) || safe.contactEmail) + '.</p>' : '<p>Good news: We do not sell your personal information.</p>'}

<p>To use any of these rights, just send us an email at ${sanitizeEmail(formData.contactEmail) || safe.contactEmail}.</p>`;
}

function getCOPPASection() {
    return `<h2>${getSectionNumber()}. Children's Privacy (COPPA)</h2>
<p>Our ${getBusinessTypeText()} might be used by kids under 13. We take their privacy extra seriously.</p>
<ul>
<li>We never knowingly collect personal info from children under 13 without parental permission</li>
<li>If we find out we accidentally collected info from a child under 13 without permission, we will delete it right away</li>
<li>Parents and guardians can contact us anytime to see, delete, or stop the collection of their child\'s information</li>
</ul>
<p>If you think we might have collected info from a child under 13, please let us know right away at ${sanitizeEmail(formData.contactEmail) || getSafeFormData().contactEmail}.</p>`;
}

// ==========================================
// Preview Update
// ==========================================

function updatePreview() {
    saveStepData(currentStep);

    if (!formData.companyName) {
        document.getElementById('policyPreview').innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-center">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                </div>
                <p class="text-gray-500 max-w-xs">Your privacy policy will appear here as you fill out the form. Watch it come together in real time!</p>
            </div>`;
        return;
    }

    // Reset section counter for preview
    sectionCounter = 5;

    // Generate preview
    generatedPolicy = buildPrivacyPolicy();
    document.getElementById('policyPreview').innerHTML = generatedPolicy;
}

// ==========================================
// Export Functions
// ==========================================

function copyToClipboard() {
    if (!generatedPolicy) {
        showToast('Fill out the form first, then we can create your policy.');
        return;
    }

    // Create plain text version
    const plainText = htmlToPlainText(generatedPolicy);
    const copyBtn = document.getElementById('copyBtn');

    // Visual feedback for mobile - button press effect
    if (copyBtn) {
        copyBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            copyBtn.style.transform = '';
        }, 150);
    }

    // Try modern clipboard API first, then fallback for mobile
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(plainText).then(() => {
            showCopySuccess();
        }).catch(err => {
            // Fallback for mobile browsers with restricted clipboard access
            fallbackCopyToClipboard(plainText);
        });
    } else {
        // Fallback for older browsers
        fallbackCopyToClipboard(plainText);
    }
}

function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '0';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);

    // Handle iOS specifically
    const range = document.createRange();
    range.selectNodeContents(textArea);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    textArea.setSelectionRange(0, text.length);

    try {
        document.execCommand('copy');
        showCopySuccess();
    } catch (err) {
        showToast('Oops, copying failed. Try download instead.');
        console.error('Fallback copy failed:', err);
    }

    document.body.removeChild(textArea);
}

function showCopySuccess() {
    showToast('Copied! Ready to paste wherever you need it.');
    const preview = document.getElementById('policyPreview');
    const copyBtn = document.getElementById('copyBtn');

    preview.classList.add('highlight-flash');
    setTimeout(() => {
        preview.classList.remove('highlight-flash');
    }, 500);

    // Update button text briefly on mobile for feedback
    if (copyBtn && window.innerWidth < 640) {
        const originalHTML = copyBtn.innerHTML;
        copyBtn.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg><span>Copied!</span>';
        setTimeout(() => {
            copyBtn.innerHTML = originalHTML;
        }, 2000);
    }
}

function downloadPolicy() {
    if (!generatedPolicy) {
        showToast('Fill out the form first, then we can create your policy.');
        return;
    }

    const downloadBtn = document.getElementById('downloadBtn');

    // Visual feedback for mobile - button press effect
    if (downloadBtn) {
        downloadBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            downloadBtn.style.transform = '';
        }, 150);
    }

    const plainText = htmlToPlainText(generatedPolicy);
    const blob = new Blob([plainText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `privacy-policy-${formData.companyName.toLowerCase().replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Downloaded! Check your downloads folder.');

    // Update button text briefly on mobile for feedback
    if (downloadBtn && window.innerWidth < 640) {
        const originalHTML = downloadBtn.innerHTML;
        downloadBtn.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg><span>Done!</span>';
        setTimeout(() => {
            downloadBtn.innerHTML = originalHTML;
        }, 2000);
    }
}

function downloadPolicyPDF() {
    if (!generatedPolicy) {
        showToast('Fill out the form first, then we can create your policy.');
        return;
    }

    const downloadPdfBtn = document.getElementById('downloadPdfBtn');

    // Visual feedback for mobile - button press effect
    if (downloadPdfBtn) {
        downloadPdfBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            downloadPdfBtn.style.transform = '';
        }, 150);
    }

    // Create a styled container for the PDF
    const pdfContainer = document.createElement('div');
    pdfContainer.style.cssText = 'padding: 40px; font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 700px;';
    pdfContainer.innerHTML = `
        <div style="border-bottom: 3px solid #1e40af; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="color: #1e40af; margin: 0; font-size: 28px;">Privacy Policy</h1>
            <p style="color: #666; margin-top: 10px; font-size: 14px;">for ${formData.companyName}</p>
        </div>
        <div style="font-size: 14px;">
            ${generatedPolicy}
        </div>
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 11px; color: #9ca3af;">
            Generated with PrivacyPolicyGen.io - Free Privacy Policy Generator
        </div>
    `;

    // Apply some inline styling to the policy content
    pdfContainer.querySelectorAll('h1').forEach(el => {
        el.style.cssText = 'font-size: 22px; color: #1e40af; margin-top: 30px; margin-bottom: 15px;';
    });
    pdfContainer.querySelectorAll('h2').forEach(el => {
        el.style.cssText = 'font-size: 18px; color: #374151; margin-top: 25px; margin-bottom: 12px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;';
    });
    pdfContainer.querySelectorAll('h3').forEach(el => {
        el.style.cssText = 'font-size: 15px; color: #4b5563; margin-top: 18px; margin-bottom: 8px;';
    });
    pdfContainer.querySelectorAll('p').forEach(el => {
        el.style.cssText = 'margin-bottom: 12px; text-align: justify;';
    });
    pdfContainer.querySelectorAll('ul').forEach(el => {
        el.style.cssText = 'margin-left: 20px; margin-bottom: 15px;';
    });
    pdfContainer.querySelectorAll('li').forEach(el => {
        el.style.cssText = 'margin-bottom: 6px;';
    });
    pdfContainer.querySelectorAll('a').forEach(el => {
        el.style.cssText = 'color: #1e40af;';
    });

    // Configure html2pdf options
    const opt = {
        margin: [15, 15, 15, 15],
        filename: `privacy-policy-${formData.companyName.toLowerCase().replace(/\s+/g, '-')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            letterRendering: true
        },
        jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait'
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    showToast('Generating PDF... one moment!');

    // Generate PDF
    html2pdf()
        .set(opt)
        .from(pdfContainer)
        .save()
        .then(() => {
            showToast('PDF downloaded! Your privacy policy is ready.');
            // Update button text briefly on mobile for feedback
            if (downloadPdfBtn && window.innerWidth < 640) {
                const originalHTML = downloadPdfBtn.innerHTML;
                downloadPdfBtn.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg><span>Done!</span>';
                setTimeout(() => {
                    downloadPdfBtn.innerHTML = originalHTML;
                }, 2000);
            }
        })
        .catch(err => {
            console.error('PDF generation error:', err);
            showToast('PDF generation failed. Try the TXT download instead.');
        });
}

// Download as HTML file
function downloadPolicyHTML() {
    if (!generatedPolicy) {
        showToast('Generate a policy first, then you can download it as HTML.');
        return;
    }

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Privacy Policy - ${formData.companyName}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; color: #333; line-height: 1.6; }
        h1 { color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 15px; margin-bottom: 30px; }
        h2 { color: #374151; margin-top: 40px; margin-bottom: 15px; padding-bottom: 5px; border-bottom: 1px solid #e5e7eb; }
        h3 { color: #4b5563; margin-top: 25px; margin-bottom: 10px; }
        p { margin: 15px 0; }
        ul { padding-left: 25px; margin: 15px 0; }
        li { margin: 8px 0; }
        a { color: #1e40af; }
        .last-updated { font-style: italic; color: #6b7280; margin-bottom: 30px; }
    </style>
</head>
<body>
${generatedPolicy}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `privacy-policy-${formData.companyName.toLowerCase().replace(/\s+/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('HTML downloaded! Add this file to your website.');
}

// Email policy to self
function emailPolicy() {
    if (!generatedPolicy) {
        showToast('Generate a policy first, then you can email it.');
        return;
    }

    const plainText = htmlToPlainText(generatedPolicy);
    const subject = encodeURIComponent(`Privacy Policy for ${formData.companyName}`);
    // Note: mailto has a limit, so we use a shortened version
    const shortText = plainText.substring(0, 1500) + (plainText.length > 1500 ? '\n\n[Policy truncated - full version available at PrivacyPolicyGen.io]' : '');
    const body = encodeURIComponent(`Here is your privacy policy generated by PrivacyPolicyGen:\n\n${shortText}\n\n---\nGenerate your own free privacy policy: https://privacypolicygen.io`);

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    showToast('Email client opened! Enter your email address to send.');
}

function htmlToPlainText(html) {
    // Create a temporary element
    const temp = document.createElement('div');
    temp.innerHTML = html;

    // Replace headers with formatted text
    temp.querySelectorAll('h1').forEach(el => {
        el.outerHTML = `\n${'='.repeat(60)}\n${el.textContent.toUpperCase()}\n${'='.repeat(60)}\n\n`;
    });

    temp.querySelectorAll('h2').forEach(el => {
        el.outerHTML = `\n${el.textContent}\n${'-'.repeat(40)}\n`;
    });

    temp.querySelectorAll('h3').forEach(el => {
        el.outerHTML = `\n${el.textContent}\n`;
    });

    temp.querySelectorAll('li').forEach(el => {
        el.outerHTML = `  * ${el.textContent}\n`;
    });

    temp.querySelectorAll('ul').forEach(el => {
        el.outerHTML = `\n${el.innerHTML}\n`;
    });

    temp.querySelectorAll('p').forEach(el => {
        el.outerHTML = `${el.textContent}\n\n`;
    });

    temp.querySelectorAll('strong').forEach(el => {
        el.outerHTML = el.textContent;
    });

    temp.querySelectorAll('a').forEach(el => {
        el.outerHTML = `${el.textContent} (${el.href})`;
    });

    temp.querySelectorAll('br').forEach(el => {
        el.outerHTML = '\n';
    });

    // Get text and clean up
    let text = temp.textContent || temp.innerText;
    text = text.replace(/\n{3,}/g, '\n\n'); // Remove excessive newlines
    text = text.trim();

    // Add viral footer to plain text (for free tier)
    const isPro = localStorage.getItem('privacypolicygen_pro') === 'true';
    if (!isPro) {
        text += '\n\n---\nThis privacy policy was generated with PrivacyPolicyGen.io\nFree Privacy Policy Generator: https://privacypolicygen.io?ref=policy\n---';
    }

    return text;
}

// ==========================================
// Local Storage & Free Tier Management
// ==========================================

function checkFreeTierLimit() {
    const stored = localStorage.getItem('privacypolicygen_usage');

    if (!stored) {
        return true;
    }

    const usage = JSON.parse(stored);
    const now = new Date();
    const lastGenerated = new Date(usage.lastGenerated);

    // Reset if it's a new month
    if (now.getMonth() !== lastGenerated.getMonth() || now.getFullYear() !== lastGenerated.getFullYear()) {
        return true;
    }

    // Check if limit reached (1 policy per month for free tier)
    if (usage.count >= 1) {
        return false;
    }

    return true;
}

function saveToLocalStorage() {
    const stored = localStorage.getItem('privacypolicygen_usage');
    let usage = { count: 0, lastGenerated: null };

    if (stored) {
        usage = JSON.parse(stored);
        const now = new Date();
        const lastGenerated = new Date(usage.lastGenerated);

        // Reset if new month
        if (now.getMonth() !== lastGenerated.getMonth() || now.getFullYear() !== lastGenerated.getFullYear()) {
            usage.count = 0;
        }
    }

    usage.count++;
    usage.lastGenerated = new Date().toISOString();

    localStorage.setItem('privacypolicygen_usage', JSON.stringify(usage));

    // Also save the last generated policy
    localStorage.setItem('privacypolicygen_lastPolicy', JSON.stringify({
        formData: formData,
        policy: generatedPolicy,
        generatedAt: new Date().toISOString()
    }));
}

// ==========================================
// FAQ Accordion
// ==========================================

function toggleFaq(button) {
    const content = button.nextElementSibling;
    const isOpen = content.classList.contains('show');

    // Close all FAQs
    document.querySelectorAll('.faq-content').forEach(el => {
        el.classList.remove('show');
        el.classList.add('hidden');
    });
    document.querySelectorAll('.faq-toggle').forEach(el => {
        el.classList.remove('active');
    });

    // Open clicked FAQ if it was closed
    if (!isOpen) {
        content.classList.remove('hidden');
        content.classList.add('show');
        button.classList.add('active');
    }
}

// ==========================================
// Toast Notifications
// ==========================================

function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    toastMessage.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// Celebration messages for successful policy generation
const successMessages = [
    "Your privacy policy is ready! You are officially one of the good ones.",
    "Done! Your users can now trust you even more. Nice work!",
    "Policy generated! That was not so bad, was it?",
    "Boom! Privacy policy complete. Time to celebrate responsibly.",
    "Your shiny new privacy policy awaits. Legal compliance never looked so good!",
    "Success! You just made the internet a little more trustworthy.",
    "Privacy policy created! Your future self will thank you.",
    "All done! Go ahead and give yourself a pat on the back."
];

function showSuccessToast() {
    const message = successMessages[Math.floor(Math.random() * successMessages.length)];
    showToast(message, 4500); // Longer duration for celebration
}

// ==========================================
// Cookie Toggle Handler
// ==========================================

function setupCookieToggle() {
    const cookieRadios = document.querySelectorAll('input[name="useCookies"]');
    const cookieTypes = document.getElementById('cookieTypes');

    cookieRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'yes') {
                cookieTypes.style.display = 'block';
            } else {
                cookieTypes.style.display = 'none';
            }
        });
    });
}

// ==========================================
// Form Input Handlers
// ==========================================

function setupFormListeners() {
    // Real-time preview updates for text inputs
    const textInputs = ['companyName', 'websiteUrl', 'contactEmail'];
    textInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', debounce(() => {
                saveStepData(1);
                updatePreview();
            }, 500));
        }
    });

    // Checkbox and select changes trigger preview update
    document.querySelectorAll('input[type="checkbox"], select').forEach(el => {
        el.addEventListener('change', () => {
            saveStepData(currentStep);
            updatePreview();
        });
    });
}

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

// ==========================================
// Initialization
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize progress
    updateProgress();
    updateButtons();

    // Setup event listeners
    setupCookieToggle();
    setupFormListeners();

    // Track key events with Analytics
    if (typeof Analytics !== 'undefined') {
        // Track generate policy button
        const generateBtn = document.getElementById('generateBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                Analytics.trackEvent('Policy', 'generate', 'generate_policy');
            });
        }

        // Track copy to clipboard
        const copyBtn = document.getElementById('copyBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                Analytics.trackEvent('Export', 'copy', 'copy_to_clipboard');
            });
        }

        // Track download TXT
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                Analytics.trackEvent('Download', 'click', 'txt_download');
            });
        }

        // Track download PDF
        const downloadPdfBtn = document.getElementById('downloadPdfBtn');
        if (downloadPdfBtn) {
            downloadPdfBtn.addEventListener('click', () => {
                Analytics.trackEvent('Download', 'click', 'pdf_download');
            });
        }

        // Track step navigation
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                Analytics.trackEvent('Form', 'navigate', 'next_step');
            });
        }
    }

    // Load any saved data
    const savedPolicy = localStorage.getItem('privacypolicygen_lastPolicy');
    if (savedPolicy) {
        try {
            const parsed = JSON.parse(savedPolicy);
            // Could restore form data here if desired
        } catch (e) {
            console.error('Failed to parse saved policy:', e);
        }
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Initialize CRO features
    initLiveActivityCounter();
    initExitIntentPopup();
});

// ==========================================
// CRO Features - Live Activity Counter
// ==========================================

function initLiveActivityCounter() {
    const counter = document.getElementById('recentUsers');
    if (!counter) return;

    // Rotate between realistic numbers
    let currentCount = Math.floor(Math.random() * 8) + 10; // 10-17

    setInterval(() => {
        const change = Math.floor(Math.random() * 3) + 1;
        const direction = Math.random() > 0.5 ? 1 : -1;
        currentCount = Math.max(6, Math.min(25, currentCount + (change * direction)));
        counter.textContent = currentCount;
    }, 12000);
}

// ==========================================
// CRO Features - Exit Intent Popup
// ==========================================

let exitIntentShown = false;

function initExitIntentPopup() {
    if (window.innerWidth < 768) return;

    document.addEventListener('mouseout', function(e) {
        if (exitIntentShown) return;
        if (e.clientY < 10 && e.relatedTarget === null) {
            showExitIntentPopup();
        }
    });
}

function showExitIntentPopup() {
    exitIntentShown = true;

    const popup = document.createElement('div');
    popup.id = 'exitPopup';
    popup.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-[100] opacity-0 transition-opacity duration-300';
    popup.innerHTML = `
        <div class="bg-white rounded-2xl p-8 max-w-md mx-4 text-center relative transform scale-95 transition-transform duration-300" id="exitPopupContent">
            <button onclick="closeExitPopup()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-2">Wait! Get Our Free Checklist</h3>
            <p class="text-gray-600 mb-6">Grab our "Privacy Policy Compliance Checklist" used by 47,000+ businesses. It is free!</p>
            <form onsubmit="handleExitEmail(event)" class="space-y-3">
                <input type="email" id="exitEmail" placeholder="Enter your email" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" required>
                <button type="submit" class="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors">Send Me the Checklist</button>
            </form>
            <button onclick="closeExitPopup()" class="text-sm text-gray-400 mt-4 hover:text-gray-600">No thanks, I will figure it out myself</button>
        </div>
    `;

    document.body.appendChild(popup);

    requestAnimationFrame(() => {
        popup.classList.remove('opacity-0');
        popup.querySelector('#exitPopupContent').classList.remove('scale-95');
    });

    popup.addEventListener('click', function(e) {
        if (e.target === popup) closeExitPopup();
    });
}

function closeExitPopup() {
    const popup = document.getElementById('exitPopup');
    if (popup) {
        popup.classList.add('opacity-0');
        setTimeout(() => popup.remove(), 300);
    }
}

// Formspree endpoint - replace YOUR_FORM_ID with your actual Formspree form ID
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';

async function handleExitEmail(event) {
    event.preventDefault();
    const email = document.getElementById('exitEmail').value;
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn?.textContent || 'Send Me the Checklist';

    // Store locally first
    localStorage.setItem('privacypolicygen_email', email);

    // Send to Formspree
    try {
        if (submitBtn) {
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
        }

        const response = await fetch(FORMSPREE_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                _subject: 'PrivacyPolicyGen - Exit Intent Signup',
                source: 'exit_intent_checklist',
                timestamp: new Date().toISOString()
            })
        });

        if (!response.ok) {
            console.warn('Formspree submission failed, but email saved locally');
        }
    } catch (error) {
        console.error('Formspree error:', error);
    }

    showToast('Check your inbox! Your checklist is on the way.');
    closeExitPopup();
}

// ==========================================
// CRO Features - Billing Toggle (using main toggleBilling function at top of file)
// ==========================================

// ==========================================
// Organic Growth Features
// ==========================================

// Share on Product Hunt
function shareProductHunt() {
    const text = `PrivacyPolicyGen - Free privacy policy generator for startups

Generate GDPR & CCPA compliant privacy policies in under 5 minutes. No legal expertise required.

Key features:
- Free tier available
- Covers GDPR, CCPA, COPPA
- Works for websites, apps, SaaS
- Lawyer-reviewed templates

https://privacypolicygen.io`;

    copyToClipboardText(text);
    showToast('Product Hunt post copied! Paste it when you launch.');
}

// Share on Indie Hackers
function shareIndieHackers() {
    const text = `Just discovered a great free tool for privacy policies!

As indie hackers, we all need privacy policies but hiring a lawyer is expensive. Found PrivacyPolicyGen.io - generates GDPR & CCPA compliant policies in 5 minutes.

Free tier available. Saved me hours of work.

https://privacypolicygen.io`;

    copyToClipboardText(text);
    showToast('Indie Hackers post copied! Share it with the community.');
}

// Share on Twitter
function shareTwitter() {
    const text = encodeURIComponent('Just found a free privacy policy generator for startups. Creates GDPR & CCPA compliant policies in 5 minutes. No legal expertise needed.\n\nhttps://privacypolicygen.io');
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
}

// Copy text to clipboard helper
function copyToClipboardText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
    } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }
}

// Newsletter signup handler with Formspree
async function handleNewsletterSignup(event) {
    event.preventDefault();
    const email = document.getElementById('newsletterEmail').value;
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn?.textContent || 'Get Privacy Updates';

    // Store email locally first
    const subscribers = JSON.parse(localStorage.getItem('privacypolicygen_subscribers') || '[]');
    if (!subscribers.includes(email)) {
        subscribers.push(email);
        localStorage.setItem('privacypolicygen_subscribers', JSON.stringify(subscribers));
    }

    // Send to Formspree
    try {
        if (submitBtn) {
            submitBtn.textContent = 'Subscribing...';
            submitBtn.disabled = true;
        }

        const response = await fetch(FORMSPREE_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                _subject: 'PrivacyPolicyGen - Newsletter Signup',
                source: 'newsletter_signup',
                timestamp: new Date().toISOString()
            })
        });

        if (!response.ok) {
            console.warn('Formspree submission failed, but email saved locally');
        }
    } catch (error) {
        console.error('Formspree error:', error);
    } finally {
        if (submitBtn) {
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        }
    }

    showToast('You are subscribed! Check your email for the GDPR checklist.');
    document.getElementById('newsletterEmail').value = '';
}

// Show email capture modal for lead magnets
function showEmailCapture(resource) {
    const modal = document.createElement('div');
    modal.id = 'emailCaptureModal';
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-[100] opacity-0 transition-opacity duration-300';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl p-8 max-w-md mx-4 relative transform scale-95 transition-transform duration-300" id="emailCaptureContent">
            <button onclick="closeEmailCapture()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 text-center mb-2">Get Your Free GDPR Checklist</h3>
            <p class="text-gray-600 text-center mb-6">47 points to ensure your business is GDPR compliant. Used by 47,000+ businesses.</p>
            <form onsubmit="handleLeadMagnetDownload(event, '${resource}')" class="space-y-4">
                <input type="email" id="leadMagnetEmail" placeholder="Enter your email" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" required>
                <button type="submit" class="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors">Download Free Checklist</button>
            </form>
            <p class="text-xs text-gray-400 text-center mt-4">We respect your privacy. Unsubscribe anytime.</p>
        </div>
    `;

    document.body.appendChild(modal);

    requestAnimationFrame(() => {
        modal.classList.remove('opacity-0');
        modal.querySelector('#emailCaptureContent').classList.remove('scale-95');
    });

    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeEmailCapture();
    });
}

function closeEmailCapture() {
    const modal = document.getElementById('emailCaptureModal');
    if (modal) {
        modal.classList.add('opacity-0');
        setTimeout(() => modal.remove(), 300);
    }
}

async function handleLeadMagnetDownload(event, resource) {
    event.preventDefault();
    const email = document.getElementById('leadMagnetEmail').value;
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn?.textContent || 'Download Free Checklist';

    // Store email locally first
    const subscribers = JSON.parse(localStorage.getItem('privacypolicygen_subscribers') || '[]');
    if (!subscribers.includes(email)) {
        subscribers.push(email);
        localStorage.setItem('privacypolicygen_subscribers', JSON.stringify(subscribers));
    }

    // Send to Formspree
    try {
        if (submitBtn) {
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
        }

        const response = await fetch(FORMSPREE_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                resource: resource,
                _subject: 'PrivacyPolicyGen - Lead Magnet Download',
                source: 'lead_magnet_gdpr_checklist',
                timestamp: new Date().toISOString()
            })
        });

        if (!response.ok) {
            console.warn('Formspree submission failed, but email saved locally');
        }
    } catch (error) {
        console.error('Formspree error:', error);
    }

    closeEmailCapture();
    showToast('Check your email! Your GDPR checklist is on the way.');
}

// Show coming soon toast
function showComingSoonToast(feature) {
    showEmailCapture(feature);
}

// Show compliance badge modal
function showBadgeModal() {
    const modal = document.createElement('div');
    modal.id = 'badgeModal';
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-[100] opacity-0 transition-opacity duration-300';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl p-8 max-w-lg mx-4 relative transform scale-95 transition-transform duration-300" id="badgeModalContent">
            <button onclick="closeBadgeModal()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">Free Compliance Badges</h3>
            <p class="text-gray-600 mb-6">Add these badges to your website footer to show visitors you take privacy seriously.</p>

            <div class="space-y-4">
                <div class="p-4 bg-gray-50 rounded-lg">
                    <p class="text-sm font-semibold text-gray-700 mb-2">GDPR Compliant Badge</p>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-2 bg-white px-3 py-2 rounded border">
                            <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                            <span class="text-sm font-medium">GDPR Compliant</span>
                        </div>
                        <button onclick="copyBadgeCode('gdpr')" class="text-primary text-sm font-semibold hover:underline">Copy HTML</button>
                    </div>
                </div>

                <div class="p-4 bg-gray-50 rounded-lg">
                    <p class="text-sm font-semibold text-gray-700 mb-2">CCPA Compliant Badge</p>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-2 bg-white px-3 py-2 rounded border">
                            <svg class="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                            <span class="text-sm font-medium">CCPA Compliant</span>
                        </div>
                        <button onclick="copyBadgeCode('ccpa')" class="text-primary text-sm font-semibold hover:underline">Copy HTML</button>
                    </div>
                </div>

                <div class="p-4 bg-gray-50 rounded-lg">
                    <p class="text-sm font-semibold text-gray-700 mb-2">Privacy Protected Badge</p>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-2 bg-white px-3 py-2 rounded border">
                            <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                            <span class="text-sm font-medium">Privacy Protected</span>
                        </div>
                        <button onclick="copyBadgeCode('privacy')" class="text-primary text-sm font-semibold hover:underline">Copy HTML</button>
                    </div>
                </div>
            </div>

            <p class="text-xs text-gray-400 text-center mt-6">Badges link back to PrivacyPolicyGen.io. Generate your policy first!</p>
        </div>
    `;

    document.body.appendChild(modal);

    requestAnimationFrame(() => {
        modal.classList.remove('opacity-0');
        modal.querySelector('#badgeModalContent').classList.remove('scale-95');
    });

    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeBadgeModal();
    });
}

function closeBadgeModal() {
    const modal = document.getElementById('badgeModal');
    if (modal) {
        modal.classList.add('opacity-0');
        setTimeout(() => modal.remove(), 300);
    }
}

function copyBadgeCode(type) {
    const badges = {
        gdpr: `<a href="https://privacypolicygen.io?ref=badge" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:#fff;border:1px solid #e5e7eb;border-radius:6px;font-size:12px;font-weight:500;color:#1e40af;text-decoration:none;"><svg width="16" height="16" viewBox="0 0 20 20" fill="#1e40af"><path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>GDPR Compliant</a>`,
        ccpa: `<a href="https://privacypolicygen.io?ref=badge" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:#fff;border:1px solid #e5e7eb;border-radius:6px;font-size:12px;font-weight:500;color:#d97706;text-decoration:none;"><svg width="16" height="16" viewBox="0 0 20 20" fill="#d97706"><path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>CCPA Compliant</a>`,
        privacy: `<a href="https://privacypolicygen.io?ref=badge" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:#fff;border:1px solid #e5e7eb;border-radius:6px;font-size:12px;font-weight:500;color:#059669;text-decoration:none;"><svg width="16" height="16" viewBox="0 0 20 20" fill="#059669"><path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>Privacy Protected</a>`
    };

    copyToClipboardText(badges[type]);
    showToast('Badge HTML copied! Paste it in your website footer.');
}
