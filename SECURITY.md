# Security Policy for PrivacyPolicyGen

## Overview

PrivacyPolicyGen is a legal document generator that creates privacy policies, terms of service, and related documents. Due to the legal nature of the output, **security and document integrity are critical**. This document outlines the security measures implemented and provides guidance for maintaining security.

---

## Table of Contents

1. [Security Architecture](#security-architecture)
2. [XSS Prevention](#xss-prevention)
3. [Input Validation](#input-validation)
4. [Output Sanitization](#output-sanitization)
5. [Content Security Policy](#content-security-policy)
6. [Third-Party Dependencies](#third-party-dependencies)
7. [Admin Panel Security](#admin-panel-security)
8. [Email/Form Security](#emailform-security)
9. [Legal Document Integrity](#legal-document-integrity)
10. [Production Deployment Checklist](#production-deployment-checklist)
11. [Reporting Vulnerabilities](#reporting-vulnerabilities)

---

## Security Architecture

### Threat Model

As a legal document generator, the primary threats include:

1. **XSS in Generated Documents**: Malicious scripts injected into privacy policies could execute when users view/share them
2. **Content Tampering**: Legal documents must maintain integrity and not be modifiable by attackers
3. **Data Exfiltration**: User business information (company names, emails, websites) must be protected
4. **PDF/HTML Injection**: Malicious content in exported documents
5. **Admin Panel Compromise**: Unauthorized access to usage statistics and configuration

### Defense Layers

```
[User Input] --> [Input Validation] --> [Sanitization] --> [Policy Generation] --> [Output Sanitization] --> [Export]
                      |                      |                     |                      |
                      v                      v                     v                      v
               Reject Invalid        Escape HTML           Use Safe Data          Clean Output
```

---

## XSS Prevention

### Critical Functions

The following sanitization functions are implemented in `app.js`:

#### `escapeHtml(text)`
Escapes HTML entities to prevent XSS:
```javascript
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
```

#### `sanitizeUrl(url)`
Validates and sanitizes URLs, blocking dangerous protocols:
```javascript
// Blocks: javascript:, data:, vbscript:, file:
// Ensures: Only http:// or https:// URLs
// Auto-adds: https:// for valid domains
```

#### `sanitizeEmail(email)`
Validates email format and prevents header injection:
```javascript
// Blocks: Newlines (\r\n) that could enable header injection
// Validates: Standard email format
// Limits: Special characters that could cause issues
```

#### `sanitizeCompanyName(name)`
Sanitizes company/business names:
```javascript
// Removes: HTML tags
// Limits: Length to 200 characters
// Escapes: HTML entities
```

### Usage in Policy Generation

All user inputs appearing in generated documents use `getSafeFormData()`:
```javascript
function getSafeFormData() {
    return {
        companyName: sanitizeCompanyName(formData.companyName),
        websiteUrl: sanitizeUrl(formData.websiteUrl),
        contactEmail: sanitizeEmail(formData.contactEmail)
    };
}
```

---

## Input Validation

### Form Field Validation

Step 1 validation includes:

| Field | Validation Rules |
|-------|-----------------|
| Company Name | Required, max 200 characters, HTML stripped |
| Website URL | Required, valid http/https, blocks javascript: protocol |
| Contact Email | Required, valid format, blocks header injection characters |

### URL Protocol Blocking

The following URL protocols are explicitly blocked:
- `javascript:` - Prevents XSS execution
- `data:` - Prevents data URL injection
- `vbscript:` - Prevents legacy script execution
- `file:` - Prevents local file access

### Validation Function

```javascript
function isValidUrl(url) {
    // Block dangerous protocols
    const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
    // Must be http/https or valid domain pattern
}
```

---

## Output Sanitization

### Generated Policy HTML

All policy sections use escaped/sanitized data:
- Company names are HTML-escaped
- URLs are validated and escaped
- Email addresses are validated for format and injection

### Export Formats

#### PDF Export
- Uses html2pdf.js library with SRI verification
- Content is sanitized before conversion
- No script execution in PDF output

#### HTML Export
- Generates clean, static HTML
- No inline JavaScript in exported files
- Proper HTML entity encoding

#### TXT Export
- Plain text output, no HTML interpretation
- Safe for any text editor

#### Copy to Clipboard
- Uses sanitized text content
- No HTML in clipboard data

---

## Content Security Policy

### Main Application CSP

```
default-src 'self';
script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cdnjs.cloudflare.com https://js.stripe.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.tailwindcss.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data: https:;
connect-src 'self' https://formspree.io https://api.stripe.com;
frame-src https://js.stripe.com;
object-src 'none';
base-uri 'self';
form-action 'self' https://formspree.io;
upgrade-insecure-requests;
```

### Admin Panel CSP (Stricter)

```
default-src 'self';
script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cdn.jsdelivr.net;
style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com;
img-src 'self' data:;
connect-src 'self';
object-src 'none';
base-uri 'self';
form-action 'self';
```

### Additional Security Headers

```html
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta http-equiv="X-Frame-Options" content="SAMEORIGIN">
<meta name="referrer" content="strict-origin-when-cross-origin">
```

---

## Third-Party Dependencies

### CDN Resources with SRI

| Resource | SRI Hash |
|----------|----------|
| html2pdf.js 0.10.1 | `sha512-GsLlZN/3F2ErC5ifS5QtgpiJtWd43JWSuIgh7mbzZ8zBps+dvLusV+eNQATqgA/HdeKFVgA5v3S/cIrLF7QnIg==` |
| Chart.js 4.4.1 | `sha256-+8CGmDcQkFLQAgvPaIBJrqpnS5wwfhkpKpzOLlHjLvQ=` |

### Production Recommendations

For production deployment:

1. **Self-host Tailwind CSS**: Build locally instead of using CDN
2. **Pin all versions**: Never use `@latest` tags
3. **Verify SRI hashes**: Check hashes match official sources
4. **Regular updates**: Monitor for security advisories

---

## Admin Panel Security

### Authentication

- Password-based authentication (stored in localStorage)
- Session management with timestamp validation
- 4-hour session expiration

### Rate Limiting

```javascript
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
```

After 5 failed attempts, the account is locked for 15 minutes.

### Password Requirements

- Minimum 8 characters
- Must contain at least one letter and one number
- Common weak passwords are blocked

### First-Time Security

Default password `admin123` triggers a warning on first login. Users are prompted to change it immediately.

### Admin Panel Headers

- `X-Frame-Options: DENY` (prevents embedding)
- `Cache-Control: no-cache, no-store` (prevents caching)
- `Referrer: no-referrer` (no referrer leakage)

---

## Email/Form Security

### Newsletter/Waitlist Forms

Email validation includes:
- Format validation using strict regex
- Header injection prevention (blocks `\r` and `\n`)
- Length limits (max 254 characters)
- HTML escaping before storage

### Formspree Integration

- HTTPS-only communication
- Form action restricted in CSP
- No sensitive data in form submissions

### Rate Limiting (Client-Side)

- Waitlist limited to 1000 entries per browser
- Duplicate email prevention

---

## Legal Document Integrity

### Critical Considerations

As this generates **legal documents**, special care is taken:

1. **No Dynamic Content**: Generated policies contain no JavaScript
2. **Static Output**: All exports are static HTML/PDF/TXT
3. **Consistent Formatting**: Output format is predictable and verifiable
4. **Date Stamps**: Policies include generation date for versioning
5. **No External Dependencies**: Exported documents are self-contained

### Document Tampering Prevention

- Generated HTML uses inline styles only
- No external CSS/JS references in exports
- PDF output is rendered client-side (no server modification possible)

---

## Production Deployment Checklist

### Before Going Live

- [ ] Change default admin password
- [ ] Replace Tailwind CDN with production build
- [ ] Configure server-side security headers (in addition to meta tags)
- [ ] Set up HTTPS with valid SSL certificate
- [ ] Configure server-side rate limiting
- [ ] Enable logging and monitoring
- [ ] Test all XSS prevention measures
- [ ] Verify SRI hashes for all CDN resources
- [ ] Remove or protect admin.html from public access
- [ ] Set up Content Security Policy reporting

### Server-Side Headers (Recommended)

Add these headers via your web server (nginx/Apache) or hosting platform:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### Stripe Integration

When enabling Stripe payments:
- [ ] Use live keys only in production
- [ ] Never log or store Stripe keys client-side
- [ ] Configure Stripe webhook signature verification
- [ ] Use Stripe Checkout (redirect) not inline forms

---

## Reporting Vulnerabilities

### Responsible Disclosure

If you discover a security vulnerability in PrivacyPolicyGen:

1. **Do not** publicly disclose the issue
2. Email security concerns to the maintainer
3. Include detailed reproduction steps
4. Allow reasonable time for fixes before disclosure

### What to Report

- XSS vulnerabilities in policy generation
- Authentication bypasses
- Data exposure issues
- Content injection in exports
- CSP bypasses

### Out of Scope

- Self-XSS (user must attack themselves)
- Issues requiring physical access
- Social engineering attacks
- Denial of service

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | January 2026 | Initial security implementation |

---

## Contact

For security concerns, contact the repository maintainer.

---

*This security policy applies to PrivacyPolicyGen and its associated files. Regular security audits are recommended for production deployments.*
