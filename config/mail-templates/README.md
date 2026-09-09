# Email Templates

Reusable, production-ready HTML email templates. Replaces the old single
`mailText.js` file (one giant hardcoded string per email) with small
composable pieces:

```
config.js       Brand theme (colors, fonts, company/social/app links)
utils.js        HTML-escaping, plain-text generation, currency formatting
components.js   Reusable blocks: header, hero, CTA button, info badge, footer...
layout.js       The HTML shell: doctype/head, responsive + dark-mode CSS
templates.js    Full emails, built from components (new API)
index.js        Entry point — new API + legacy-compatible function names
```

## Quick start (new API)

```js
const mail = require('./email-templates');

const { html, text, subject } = mail.templates.purchaseConfirmation(null, {
  id: 'TXN-8842',
  ctaUrl: 'https://www.gpcpins.com/orders/8842',
  items: [
    { name: 'Premium Pin Pack', qty: 2, price: 25 },
    { name: 'Express Delivery', price: 10 },
  ],
});

// html  -> full email HTML (send as text/html)
// text  -> auto-generated plain-text fallback (send as text/plain)
// subject -> a sensible default subject line (override if you want)
```

Every template's first argument is a **theme override** — pass `null` to
use the default brand, or pass a partial theme to customize colors/company
info for a specific send without touching template code:

```js
mail.templates.welcome(
  { colors: { brand: '#7A2E8C' }, company: { name: 'Side Project Inc' } },
  { name: 'Ama', ctaUrl: 'https://example.com/onboarding' }
);
```

## Available templates

| Function | Use case |
|---|---|
| `templates.welcome` | New account / first login |
| `templates.otpVerification` | One-time passcodes / sign-in codes |
| `templates.passwordReset` | Password reset links |
| `templates.purchaseConfirmation` | Order/purchase confirmations, with optional itemized table |
| `templates.receiptResend` | Resending a receipt/voucher download link |
| `templates.notification` | General account alerts / status changes |
| `templates.brandedShell` | Full card chrome around your own HTML fragment |
| `templates.genericNotice` | Bare wrapper, no card chrome, around your own HTML |

All of them return `{ html, text, subject }`.

## Legacy API (drop-in replacement)

If you're migrating an existing codebase, `require('./email-templates')`
also exposes the **same five function names** as the old file, with the
same arguments, each still returning a plain HTML string:

```js
const { mailText, mailTextShell, resendMailText, thankYouText, ecgText } = require('./email-templates');

resendMailText(id, downloadLink); // -> html string, same as before
```

These are thin wrappers around the new templates, so you get the escaping,
dark-mode, and responsive fixes for free without changing call sites.

## Features added over the original

- **Reusable components** instead of five copy-pasted HTML files — one bug
  fix or design tweak now applies everywhere.
- **Theming** — brand colors, logo, company info, social links are config,
  not hardcoded strings baked into every template.
- **HTML-escaping** for every interpolated value (id, name, message) —
  the original inserted raw strings directly into markup.
- **Plain-text part** auto-generated for every template, for
  `multipart/alternative` sends (better deliverability/spam scoring).
- **Preheader text** support (the hidden inbox-preview snippet).
- **New templates**: welcome email, OTP/verification code, password reset,
  general notification — the original only covered purchase confirmations.
- **Itemized order table** component with automatic total calculation.
- **`safeUrl`** guard so only `http(s)`/`mailto` links land in `href`/`src`.
- Dark-mode and mobile-responsive CSS kept, consolidated into one place.

## Rendering a preview

```bash
node preview.js
```

writes sample `.html` files to `./preview-output/` for each template so you
can open them in a browser to sanity-check markup.
