/**
 * PrivacyPolicyGen - Accessibility Enhancements
 * This module adds ARIA attributes, keyboard navigation, and screen reader support
 */

(function() {
    'use strict';

    // ==========================================
    // Step Titles for Screen Readers
    // ==========================================
    const stepTitles = {
        1: 'Basic Information',
        2: 'Data Collection',
        3: 'Cookies and Tracking',
        4: 'Third-Party Services',
        5: 'Target Regions and Options'
    };

    // ==========================================
    // Initialize Accessibility Features
    // ==========================================
    function initAccessibility() {
        setupWizardARIA();
        setupFAQAccessibility();
        setupMobileMenuAccessibility();
        setupToastLiveRegion();
        setupKeyboardNavigation();
        setupFormAccessibility();
        setupProgressAnnouncements();
    }

    // ==========================================
    // Wizard ARIA Setup
    // ==========================================
    function setupWizardARIA() {
        const form = document.getElementById('policyForm');
        if (!form) return;

        // Add role to form container
        const formContainer = form.closest('.bg-gray-50');
        if (formContainer) {
            formContainer.setAttribute('role', 'region');
            formContainer.setAttribute('aria-label', 'Privacy Policy Generator Wizard');
        }

        // Setup each step with proper ARIA attributes
        for (let i = 1; i <= 5; i++) {
            const step = document.getElementById(`step${i}`);
            if (step) {
                step.setAttribute('role', 'tabpanel');
                step.setAttribute('aria-label', `Step ${i}: ${stepTitles[i]}`);
                step.setAttribute('id', `step${i}`);
            }
        }

        // Add live region for step announcements
        const liveRegion = document.createElement('div');
        liveRegion.id = 'stepAnnouncer';
        liveRegion.setAttribute('role', 'status');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        document.body.appendChild(liveRegion);

        // Progress bar accessibility
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            const progressContainer = progressBar.parentElement;
            progressContainer.setAttribute('role', 'progressbar');
            progressContainer.setAttribute('aria-valuemin', '0');
            progressContainer.setAttribute('aria-valuemax', '100');
            progressContainer.setAttribute('aria-label', 'Form progress');
            updateProgressARIA();
        }
    }

    // ==========================================
    // Update Progress ARIA
    // ==========================================
    function updateProgressARIA() {
        const progressBar = document.getElementById('progressBar');
        if (!progressBar) return;

        const progressContainer = progressBar.parentElement;
        const currentStep = parseInt(document.getElementById('currentStep')?.textContent) || 1;
        const progress = (currentStep / 5) * 100;

        progressContainer.setAttribute('aria-valuenow', Math.round(progress));
        progressContainer.setAttribute('aria-valuetext', `Step ${currentStep} of 5: ${stepTitles[currentStep]}, ${Math.round(progress)}% complete`);
    }

    // ==========================================
    // Announce Step Changes
    // ==========================================
    function announceStepChange(stepNumber) {
        const announcer = document.getElementById('stepAnnouncer');
        if (announcer) {
            announcer.textContent = `Now on step ${stepNumber} of 5: ${stepTitles[stepNumber]}`;
        }
        updateProgressARIA();
    }

    // ==========================================
    // FAQ Accessibility
    // ==========================================
    function setupFAQAccessibility() {
        const faqSection = document.getElementById('faq');
        if (!faqSection) return;

        const faqContainer = faqSection.querySelector('.space-y-4');
        if (faqContainer) {
            faqContainer.setAttribute('role', 'region');
            faqContainer.setAttribute('aria-label', 'Frequently Asked Questions');
        }

        // Setup each FAQ item
        document.querySelectorAll('.faq-toggle').forEach((button, index) => {
            const content = button.nextElementSibling;
            const questionId = `faq-question-${index}`;
            const answerId = `faq-answer-${index}`;

            button.setAttribute('id', questionId);
            button.setAttribute('aria-expanded', 'false');
            button.setAttribute('aria-controls', answerId);

            if (content) {
                content.setAttribute('id', answerId);
                content.setAttribute('role', 'region');
                content.setAttribute('aria-labelledby', questionId);
            }
        });
    }

    // ==========================================
    // Enhanced FAQ Toggle with ARIA
    // ==========================================
    window.toggleFaqAccessible = function(button) {
        const content = button.nextElementSibling;
        const isOpen = button.getAttribute('aria-expanded') === 'true';

        // Close all FAQs
        document.querySelectorAll('.faq-toggle').forEach(el => {
            el.setAttribute('aria-expanded', 'false');
            el.classList.remove('active');
        });
        document.querySelectorAll('.faq-content').forEach(el => {
            el.classList.remove('show');
            el.classList.add('hidden');
        });

        // Open clicked FAQ if it was closed
        if (!isOpen) {
            content.classList.remove('hidden');
            content.classList.add('show');
            button.classList.add('active');
            button.setAttribute('aria-expanded', 'true');
        }
    };

    // ==========================================
    // Mobile Menu Accessibility
    // ==========================================
    function setupMobileMenuAccessibility() {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileMenu = document.getElementById('mobileMenu');

        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
            mobileMenuBtn.setAttribute('aria-controls', 'mobileMenu');
            mobileMenuBtn.setAttribute('aria-label', 'Toggle navigation menu');

            mobileMenu.setAttribute('role', 'menu');
            mobileMenu.setAttribute('aria-labelledby', 'mobileMenuBtn');

            // Add menu item roles
            mobileMenu.querySelectorAll('a, button').forEach(item => {
                item.setAttribute('role', 'menuitem');
            });
        }
    }

    // ==========================================
    // Toast Live Region
    // ==========================================
    function setupToastLiveRegion() {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.setAttribute('role', 'alert');
            toast.setAttribute('aria-live', 'assertive');
            toast.setAttribute('aria-atomic', 'true');
        }
    }

    // ==========================================
    // Keyboard Navigation
    // ==========================================
    function setupKeyboardNavigation() {
        // Allow Enter/Space to trigger checkboxes when label is focused
        document.querySelectorAll('label:has(input[type="checkbox"]), label:has(input[type="radio"])').forEach(label => {
            label.setAttribute('tabindex', '0');
            label.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const input = this.querySelector('input');
                    if (input) {
                        input.click();
                        input.focus();
                    }
                }
            });
        });

        // FAQ keyboard navigation
        document.querySelectorAll('.faq-toggle').forEach(button => {
            button.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (typeof window.toggleFaqAccessible === 'function') {
                        window.toggleFaqAccessible(this);
                    } else if (typeof toggleFaq === 'function') {
                        toggleFaq(this);
                    }
                }
            });
        });

        // Arrow key navigation for form steps
        document.addEventListener('keydown', function(e) {
            const activeElement = document.activeElement;
            const form = document.getElementById('policyForm');

            if (!form || !form.contains(activeElement)) return;

            // Alt + Arrow keys for step navigation
            if (e.altKey) {
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    const nextBtn = document.getElementById('nextBtn');
                    const generateBtn = document.getElementById('generateBtn');
                    if (nextBtn && !nextBtn.classList.contains('hidden')) {
                        nextBtn.click();
                    } else if (generateBtn && !generateBtn.classList.contains('hidden')) {
                        generateBtn.click();
                    }
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prevBtn = document.getElementById('prevBtn');
                    if (prevBtn && !prevBtn.classList.contains('hidden')) {
                        prevBtn.click();
                    }
                }
            }
        });
    }

    // ==========================================
    // Form Accessibility Enhancements
    // ==========================================
    function setupFormAccessibility() {
        // Add required field indicators
        document.querySelectorAll('input[required]').forEach(input => {
            input.setAttribute('aria-required', 'true');
            const label = input.closest('div')?.querySelector('label');
            if (label && !label.textContent.includes('*')) {
                // Asterisk already in label text
            }
        });

        // Add descriptions for complex fields
        const businessTypeSelect = document.getElementById('businessType');
        if (businessTypeSelect) {
            businessTypeSelect.setAttribute('aria-describedby', 'businessTypeDesc');
            const desc = document.createElement('span');
            desc.id = 'businessTypeDesc';
            desc.className = 'sr-only';
            desc.textContent = 'Select the type of website or application you are creating a privacy policy for';
            businessTypeSelect.parentNode.appendChild(desc);
        }

        // Policy preview accessibility
        const policyPreview = document.getElementById('policyPreview');
        if (policyPreview) {
            policyPreview.setAttribute('role', 'region');
            policyPreview.setAttribute('aria-label', 'Privacy policy preview');
            policyPreview.setAttribute('tabindex', '0');
        }
    }

    // ==========================================
    // Progress Announcements
    // ==========================================
    function setupProgressAnnouncements() {
        // Override the original changeStep to add announcements
        const originalChangeStep = window.changeStep;
        if (typeof originalChangeStep === 'function') {
            window.changeStep = function(direction) {
                const result = originalChangeStep(direction);
                const currentStepEl = document.getElementById('currentStep');
                if (currentStepEl) {
                    const stepNum = parseInt(currentStepEl.textContent);
                    announceStepChange(stepNum);

                    // Focus the first interactive element in the new step
                    setTimeout(() => {
                        const step = document.getElementById(`step${stepNum}`);
                        if (step) {
                            const firstInput = step.querySelector('input, select, button, textarea');
                            if (firstInput) {
                                firstInput.focus();
                            }
                        }
                    }, 100);
                }
                return result;
            };
        }
    }

    // ==========================================
    // Expose Global Functions
    // ==========================================
    window.accessibilityUtils = {
        announceStepChange,
        updateProgressARIA
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAccessibility);
    } else {
        initAccessibility();
    }

})();
