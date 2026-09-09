'use strict';

const { DEFAULT_THEME, mergeTheme } = require('./config');
const components = require('./components');
const layout = require('./layout');
const templates = require('./templates');
const utils = require('./utils');

/**
 * ---------------------------------------------------------------------
 * Legacy-compatible API
 * ---------------------------------------------------------------------
 * Same function names and argument order as the original mailText.js, so
 * existing `require('./mailText').thankYouText(id)` call sites keep working
 * unchanged. Each one now returns brand-consistent, escaped, dark-mode-ready
 * markup built from the shared components instead of its own copy-pasted
 * table soup. Returns a plain HTML string, exactly like before.
 */
const legacy = {
  /** Bare wrapper around arbitrary HTML — was `mailText(htmlText)`. */
  mailText: (htmlText) => templates.genericNotice(null, { bodyHtml: htmlText, title: 'Document' }).html,

  /** Branded card wrapper around arbitrary HTML — was `mailTextShell(stuff)`. */
  mailTextShell: (stuff) => templates.brandedShell(null, { bodyHtml: stuff, title: DEFAULT_THEME.company.name }).html,

  /** Receipt resend with a download link — was `resendMailText(id, downloadLink)`. */
  resendMailText: (id, downloadLink) => templates.receiptResend(null, { id, downloadLink }).html,

  /** Purchase thank-you with transaction ID — was `thankYouText(id)`. */
  thankYouText: (id) =>
    templates.purchaseConfirmation(null, {
      id,
      attachmentNote: '📎 Voucher attached below',
      message: 'We truly appreciate your trust and business. A digital copy of your voucher/ticket is attached to this email — keep it safe!',
    }).html,

  /** Purchase thank-you with a custom message — was `ecgText(id, message)`. */
  ecgText: (id, message) => templates.purchaseConfirmation(null, { id, message }).html,
};

module.exports = {
  // New, richer API
  theme: DEFAULT_THEME,
  mergeTheme,
  components,
  layout,
  templates,
  utils,

  // Drop-in replacements for the old module's top-level exports
  ...legacy,
};
