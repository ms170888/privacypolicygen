/**
 * Privacy Controls - User data management and transparency
 * PrivacyPolicyGen Edition
 */

const PrivacyControls = (function() {
    'use strict';

    const APP_NAME = 'PrivacyPolicyGen';
    const APP_PREFIX = 'privacypolicygen_';
    const PRIVACY_POLICY_URL = '/#privacy-policy';

    const DATA_CATEGORIES = [
        {
            name: 'Usage Tracking',
            description: 'Number of policies generated (for free tier limit)',
            key: 'usage'
        },
        {
            name: 'Last Generated Policy',
            description: 'Your most recently generated privacy policy',
            key: 'lastPolicy'
        },
        {
            name: 'Email Address',
            description: 'Email for checklist downloads (if provided)',
            key: 'email'
        },
        {
            name: 'Newsletter Subscribers',
            description: 'Subscribed email addresses (local cache)',
            key: 'subscribers'
        },
        {
            name: 'Pro Status',
            description: 'Whether you have a pro subscription',
            key: 'pro'
        }
    ];

    function createPrivacyUI() {
        const privacyBtn = document.createElement('button');
        privacyBtn.id = 'privacy-controls-btn';
        privacyBtn.className = 'fixed bottom-4 left-4 z-40 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors flex items-center gap-2 shadow-lg';
        privacyBtn.innerHTML = `
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
            <span class="hidden sm:inline">Your Data</span>
        `;
        privacyBtn.setAttribute('aria-label', 'Manage your data and privacy settings');
        privacyBtn.addEventListener('click', showPrivacyModal);
        document.body.appendChild(privacyBtn);

        const modalHTML = `
            <div id="privacy-modal" class="fixed inset-0 z-50 hidden" role="dialog" aria-labelledby="privacy-modal-title" aria-modal="true">
                <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" onclick="PrivacyControls.hideModal()"></div>
                <div class="absolute inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-md sm:w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                    <div class="p-6 border-b border-gray-100">
                        <div class="flex items-center justify-between">
                            <h2 id="privacy-modal-title" class="text-xl font-bold text-gray-900">Your Data & Privacy</h2>
                            <button onclick="PrivacyControls.hideModal()" class="p-2 text-gray-400 hover:text-gray-600 rounded-lg" aria-label="Close">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>
                        <p class="text-sm text-gray-500 mt-1">We practice what we preach! Here is what we store.</p>
                    </div>

                    <div class="flex-1 overflow-y-auto p-6 space-y-6">
                        <div>
                            <h3 class="text-sm font-semibold text-gray-700 mb-3">Data Stored Locally</h3>
                            <div id="privacy-data-list" class="space-y-2"></div>
                            <p class="text-xs text-gray-400 mt-3">
                                All data is stored locally in your browser. We do not send it to any server.
                            </p>
                        </div>

                        <div class="bg-gray-50 rounded-lg p-4">
                            <div class="flex items-center justify-between text-sm">
                                <span class="text-gray-600">Total storage used:</span>
                                <span id="privacy-storage-size" class="font-medium text-gray-900">Calculating...</span>
                            </div>
                        </div>

                        <div class="bg-green-50 border border-green-100 rounded-lg p-4">
                            <div class="flex items-start gap-3">
                                <svg class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                                </svg>
                                <div>
                                    <p class="text-sm font-medium text-green-800">Privacy First</p>
                                    <p class="text-xs text-green-700 mt-1">As a privacy policy generator, we take your privacy seriously. Data expires after 30 days.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="p-6 border-t border-gray-100 space-y-3">
                        <button onclick="PrivacyControls.clearAllData()" class="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                            Clear All My Data
                        </button>
                        <a href="${PRIVACY_POLICY_URL}" class="block w-full text-center text-sm text-gray-500 hover:text-gray-700 py-2">
                            View Full Privacy Policy
                        </a>
                    </div>
                </div>
            </div>
        `;

        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer.firstElementChild);
    }

    function showPrivacyModal() {
        const modal = document.getElementById('privacy-modal');
        if (!modal) return;
        updateDataList();
        updateStorageSize();
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function hidePrivacyModal() {
        const modal = document.getElementById('privacy-modal');
        if (!modal) return;
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    function updateDataList() {
        const listEl = document.getElementById('privacy-data-list');
        if (!listEl) return;

        let html = '';
        DATA_CATEGORIES.forEach(cat => {
            const value = localStorage.getItem(APP_PREFIX + cat.key);
            const hasData = value !== null;
            html += `
                <div class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div class="flex-1">
                        <p class="text-sm font-medium text-gray-900">${cat.name}</p>
                        <p class="text-xs text-gray-500">${cat.description}</p>
                    </div>
                    <span class="text-xs px-2 py-1 rounded-full ${hasData ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}">
                        ${hasData ? 'Stored' : 'Empty'}
                    </span>
                </div>
            `;
        });
        listEl.innerHTML = html;
    }

    function updateStorageSize() {
        const sizeEl = document.getElementById('privacy-storage-size');
        if (!sizeEl) return;

        let totalSize = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(APP_PREFIX)) {
                const value = localStorage.getItem(key);
                totalSize += (key.length + (value ? value.length : 0)) * 2;
            }
        }
        sizeEl.textContent = `${(totalSize / 1024).toFixed(2)} KB`;
    }

    function clearAllData() {
        if (!confirm('Are you sure you want to delete all your data?\n\nThis will remove:\n- Usage history\n- Saved policies\n- Email addresses\n\nThis action cannot be undone.')) {
            return;
        }

        if (typeof SecureStorage !== 'undefined' && SecureStorage.clearAll) {
            SecureStorage.clearAll();
        } else {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(APP_PREFIX)) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
        }

        updateDataList();
        updateStorageSize();
        showNotification('All your data has been cleared.');
        setTimeout(hidePrivacyModal, 1500);
    }

    function showNotification(message) {
        if (typeof showToast === 'function') {
            showToast(message);
            return;
        }
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-20 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg z-50 text-sm font-medium';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', createPrivacyUI);
        } else {
            createPrivacyUI();
        }
    }

    return {
        init: init,
        showModal: showPrivacyModal,
        hideModal: hidePrivacyModal,
        clearAllData: clearAllData,
        updateDataList: updateDataList
    };
})();

PrivacyControls.init();
