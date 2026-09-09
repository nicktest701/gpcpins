'use strict';

const fs = require('fs');
const path = require('path');
const mail = require('./index');

const outDir = path.join(__dirname, 'preview-output');
fs.mkdirSync(outDir, { recursive: true });

const samples = {
  'welcome.html': mail.templates.welcome(null, {
    name: 'Ama',
    ctaUrl: 'https://www.gpcpins.com/start',
  }).html,

  'otp.html': mail.templates.otpVerification(null, {
    code: '482913',
    expiresInMinutes: 10,
  }).html,

  'password-reset.html': mail.templates.passwordReset(null, {
    resetUrl: 'https://www.gpcpins.com/reset?token=abc123',
  }).html,

  'purchase-confirmation.html': mail.templates.purchaseConfirmation(null, {
    id: 'TXN-88421',
    attachmentNote: '📎 Voucher attached',
    message: 'We truly appreciate your trust and business. A digital copy of your <strong>voucher</strong> is attached to this email — keep it safe!',
    items: [
      { name: 'Premium Pin Pack', qty: 2, price: 25 },
      { name: 'Express Delivery', price: 10 },
    ],
    ctaUrl: 'https://www.gpcpins.com/orders/88421',
  }).html,

  'receipt-resend.html': mail.templates.receiptResend(null, {
    id: 'TXN-88421',
    downloadLink: 'https://www.gpcpins.com/receipts/88421.pdf',
  }).html,

  'notification.html': mail.templates.notification(null, {
    heading: 'Your account was updated',
    message: 'Your billing details were changed on Sep 8, 2026. If this wasn\'t you, contact support immediately.',
    tone: 'danger',
    ctaLabel: 'Review Account',
    ctaUrl: 'https://www.gpcpins.com/account',
  }).html,

  // Legacy API — should render identically in structure to the new templates
  'legacy-thankYouText.html': mail.thankYouText('TXN-LEGACY-1'),
  'legacy-resendMailText.html': mail.resendMailText('TXN-LEGACY-2', 'https://www.gpcpins.com/receipt.pdf'),
};

for (const [filename, html] of Object.entries(samples)) {
  fs.writeFileSync(path.join(outDir, filename), html, 'utf8');
  console.log('wrote', filename, `(${html.length} bytes)`);
}

console.log('\nDone. Open the files in preview-output/ in a browser to review.');
