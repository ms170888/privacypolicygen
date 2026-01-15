/**
 * SecureStorage - Secure localStorage wrapper with encryption and expiration
 * PrivacyPolicyGen Edition
 *
 * Features:
 * - Base64 encoding with obfuscation (lightweight browser-compatible encryption)
 * - Data expiration (auto-delete after configurable days)
 * - Clear all app data functionality
 * - Privacy-focused design
 */

const SecureStorage = (function() {
    'use strict';

    const APP_PREFIX = 'privacypolicygen_';
    const DEFAULT_EXPIRY_DAYS = 30;
    const OBFUSCATION_KEY = 'PPG2025SecureKey';

    function obfuscate(text, key) {
        if (!text) return '';
        let result = '';
        for (let i = 0; i < text.length; i++) {
            result += String.fromCharCode(
                text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
            );
        }
        return result;
    }

    function encode(value) {
        try {
            const jsonString = JSON.stringify(value);
            const obfuscated = obfuscate(jsonString, OBFUSCATION_KEY);
            return btoa(unescape(encodeURIComponent(obfuscated)));
        } catch (e) {
            console.error('SecureStorage encode error:', e);
            return null;
        }
    }

    function decode(encoded) {
        try {
            const obfuscated = decodeURIComponent(escape(atob(encoded)));
            const jsonString = obfuscate(obfuscated, OBFUSCATION_KEY);
            return JSON.parse(jsonString);
        } catch (e) {
            console.error('SecureStorage decode error:', e);
            return null;
        }
    }

    function isExpired(expiryTimestamp) {
        if (!expiryTimestamp) return false;
        return Date.now() > expiryTimestamp;
    }

    function getExpiryTimestamp(days) {
        return Date.now() + (days * 24 * 60 * 60 * 1000);
    }

    function getAppKeys() {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(APP_PREFIX)) {
                keys.push(key);
            }
        }
        return keys;
    }

    function cleanupExpired() {
        const keys = getAppKeys();
        let cleaned = 0;

        keys.forEach(key => {
            try {
                const raw = localStorage.getItem(key);
                if (raw) {
                    const wrapper = JSON.parse(raw);
                    if (wrapper && wrapper.expiry && isExpired(wrapper.expiry)) {
                        localStorage.removeItem(key);
                        cleaned++;
                    }
                }
            } catch (e) {
                localStorage.removeItem(key);
                cleaned++;
            }
        });

        if (cleaned > 0) {
            console.log(`SecureStorage: Cleaned up ${cleaned} expired item(s)`);
        }
    }

    return {
        set: function(key, value, expiryDays = DEFAULT_EXPIRY_DAYS) {
            try {
                const encodedValue = encode(value);
                if (!encodedValue) return false;

                const wrapper = {
                    data: encodedValue,
                    expiry: getExpiryTimestamp(expiryDays),
                    created: Date.now()
                };

                localStorage.setItem(APP_PREFIX + key, JSON.stringify(wrapper));
                return true;
            } catch (e) {
                console.error('SecureStorage set error:', e);
                return false;
            }
        },

        get: function(key) {
            try {
                const raw = localStorage.getItem(APP_PREFIX + key);
                if (!raw) return null;

                const wrapper = JSON.parse(raw);

                if (wrapper.expiry && isExpired(wrapper.expiry)) {
                    localStorage.removeItem(APP_PREFIX + key);
                    return null;
                }

                return decode(wrapper.data);
            } catch (e) {
                console.error('SecureStorage get error:', e);
                return null;
            }
        },

        remove: function(key) {
            localStorage.removeItem(APP_PREFIX + key);
        },

        clearAll: function() {
            const keys = getAppKeys();
            keys.forEach(key => localStorage.removeItem(key));
            console.log(`SecureStorage: Cleared ${keys.length} item(s)`);
            return keys.length;
        },

        getStorageInfo: function() {
            const keys = getAppKeys();
            let totalSize = 0;
            const items = [];

            keys.forEach(key => {
                const raw = localStorage.getItem(key);
                const size = raw ? raw.length * 2 : 0;
                totalSize += size;
                items.push({
                    key: key.replace(APP_PREFIX, ''),
                    sizeBytes: size
                });
            });

            return {
                itemCount: keys.length,
                totalSizeBytes: totalSize,
                totalSizeKB: (totalSize / 1024).toFixed(2),
                items: items
            };
        },

        hasData: function() {
            return getAppKeys().length > 0;
        },

        migrateLegacy: function(legacyKey, newKey, expiryDays = DEFAULT_EXPIRY_DAYS) {
            const legacyValue = localStorage.getItem(legacyKey);
            if (legacyValue !== null) {
                try {
                    let value;
                    try {
                        value = JSON.parse(legacyValue);
                    } catch {
                        value = legacyValue;
                    }

                    this.set(newKey, value, expiryDays);
                    localStorage.removeItem(legacyKey);
                    console.log(`SecureStorage: Migrated '${legacyKey}' to secure storage`);
                    return true;
                } catch (e) {
                    console.error('SecureStorage migration error:', e);
                    return false;
                }
            }
            return false;
        },

        init: function() {
            cleanupExpired();

            // Migrate legacy PrivacyPolicyGen data
            const legacyKeys = [
                'privacypolicygen_usage',
                'privacypolicygen_lastPolicy',
                'privacypolicygen_pro',
                'privacypolicygen_email',
                'privacypolicygen_subscribers'
            ];

            legacyKeys.forEach(legacyKey => {
                if (localStorage.getItem(legacyKey) !== null) {
                    const newKey = legacyKey.replace('privacypolicygen_', '');
                    this.migrateLegacy(legacyKey, newKey);
                }
            });
        }
    };
})();

if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => SecureStorage.init());
    } else {
        SecureStorage.init();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecureStorage;
}
