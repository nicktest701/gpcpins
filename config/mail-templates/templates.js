'use strict';

const { mergeTheme } = require('./config');
const { shell, bareShell } = require('./layout');
const c = require('./components');
const { htmlToPlainText, rawHtml } = require('./utils');

/** Every template returns { html, text, subject } so callers can pull
 * whichever multipart parts their mailer needs, plus a sensible default
 * subject line they can use as-is or override. */
function buildResult(html, subject) {
  return { html, text: htmlToPlainText(html), subject };
}

/**
 * Generic wrapper for arbitrary pre-built HTML content — replacement for
 * the old bare `mailText(htmlText)` helper. Use when you already have a
 * content fragment and just need brand-consistent chrome around it.
 */
function genericNotice(rawTheme, { title = '', bodyHtml = '', preheaderText = '', subject } = {}) {
  const theme = mergeTheme(rawTheme);
  const html = bareShell(theme, { title, bodyHtml });
  return buildResult(html, subject || title);
}

/**
 * Branded card wrapper for a caller-supplied content fragment — replacement
 * for the old `mailTextShell(stuff)`. Gives you the header/card/footer
 * chrome while you control everything inside the card.
 */
function brandedShell(rawTheme, { title = '', preheaderText = '', bodyHtml = '', subject } = {}) {
  const theme = mergeTheme(rawTheme);
  const html = shell(theme, {
    title,
    preheaderText,
    headerHtml: c.header(theme),
    bodyRows: c.bodyText(theme, rawHtml(bodyHtml), { padding: '24px 28px 32px' }),
    footerHtml: [c.appBadges(theme), c.socialIcons(theme), c.legalFooter(theme)].join(''),
  });
  return buildResult(html, subject || title);
}

/**
 * Purchase / order confirmation with a reference ID, optional itemized
 * order table, and a CTA. Replacement for `thankYouText` / `ecgText`.
 */
function purchaseConfirmation(
  rawTheme,
  {
    heading = 'Thank You!',
    subheading = 'Your transaction was successful & confirmed.',
    icon = '🙏✨',
    message,
    idLabel = 'Transaction ID',
    id,
    items,
    currency = 'GHS',
    ctaLabel = 'Continue Shopping',
    ctaUrl,
    attachmentNote,
    preheaderText,
    subject,
  } = {}
) {
  const theme = mergeTheme(rawTheme);
  ctaUrl = ctaUrl || theme.company.url;
  const rows = [
    c.hero(theme, { icon, title: heading, subtitle: subheading }),
    message ? c.bodyText(theme, message) : '',
    attachmentNote ? c.alertBox(theme, { tone: 'success', text: attachmentNote }) : '',
    items && items.length ? c.itemsTable(theme, { items, currency }) : '',
    id ? c.infoBadge(theme, { label: idLabel, value: id, hint: 'Keep this ID for support & reference' }) : '',
    c.ctaButton(theme, { label: ctaLabel, url: ctaUrl, caption: 'We look forward to serving you again.' }),
    c.divider(theme),
  ]
    .filter(Boolean)
    .join('');

  const html = shell(theme, {
    title: heading,
    preheaderText: preheaderText || subheading,
    headerHtml: c.header(theme),
    bodyRows: rows,
    footerHtml: [c.appBadges(theme), c.socialIcons(theme), c.legalFooter(theme)].join(''),
  });
  return buildResult(html, subject || heading);
}

/**
 * Resend / receipt-download email: reference ID plus a download link.
 * Replacement for `resendMailText`.
 */
function receiptResend(
  rawTheme,
  { id, downloadLink, heading = 'Here is your receipt', message = 'Click below to download your receipt.', ctaLabel = 'Download Receipt', preheaderText, subject } = {}
) {
  const theme = mergeTheme(rawTheme);
  const rows = [
    c.hero(theme, { icon: '🧾', title: heading, subtitle: message }),
    id ? c.infoBadge(theme, { label: 'Transaction ID', value: id }) : '',
    c.ctaButton(theme, { label: ctaLabel, url: downloadLink }),
    c.divider(theme),
  ]
    .filter(Boolean)
    .join('');

  const html = shell(theme, {
    title: heading,
    preheaderText: preheaderText || message,
    headerHtml: c.header(theme),
    bodyRows: rows,
    footerHtml: [c.appBadges(theme), c.socialIcons(theme), c.legalFooter(theme)].join(''),
  });
  return buildResult(html, subject || heading);
}

/**
 * One-time-passcode / verification code email.
 */
function otpVerification(
  rawTheme,
  { code, expiresInMinutes = 10, heading = 'Verify your email', subheading = 'Use the code below to complete your sign-in.', preheaderText, subject } = {}
) {
  const theme = mergeTheme(rawTheme);
  const rows = [
    c.hero(theme, { icon: '🔐', title: heading, subtitle: subheading }),
    c.infoBadge(theme, { label: 'Verification code', value: code, hint: `Expires in ${expiresInMinutes} minutes` }),
    c.bodyText(theme, "If you didn't request this code, you can safely ignore this email.", { padding: '0 28px 28px' }),
  ].join('');

  const html = shell(theme, {
    title: heading,
    preheaderText: preheaderText || `Your verification code is ${code}`,
    headerHtml: c.header(theme),
    bodyRows: rows,
    footerHtml: c.legalFooter(theme),
  });
  return buildResult(html, subject || `${code} is your verification code`);
}

/**
 * Password reset email with a time-limited CTA link.
 */
function passwordReset(
  rawTheme,
  { resetUrl, expiresInMinutes = 30, heading = 'Reset your password', subheading = "We received a request to reset your account's password.", preheaderText, subject } = {}
) {
  const theme = mergeTheme(rawTheme);
  const rows = [
    c.hero(theme, { icon: '🔑', title: heading, subtitle: subheading }),
    c.ctaButton(theme, { label: 'Reset Password', url: resetUrl, caption: `This link expires in ${expiresInMinutes} minutes.` }),
    c.bodyText(theme, "If you didn't request a password reset, you can safely ignore this email — your password won't change.", {
      padding: '0 28px 28px',
    }),
  ].join('');

  const html = shell(theme, {
    title: heading,
    preheaderText: preheaderText || subheading,
    headerHtml: c.header(theme),
    bodyRows: rows,
    footerHtml: c.legalFooter(theme),
  });
  return buildResult(html, subject || heading);
}

/**
 * New-account / first-login welcome email.
 */
function welcome(
  rawTheme,
  { name, heading, subheading = "We're excited to have you on board.", ctaLabel = 'Get Started', ctaUrl, preheaderText, subject } = {}
) {
  const theme = mergeTheme(rawTheme);
  ctaUrl = ctaUrl || theme.company.url;
  heading = heading || `Welcome${name ? `, ${name}` : ''}!`;
  const rows = [
    c.hero(theme, { icon: '🎉', title: heading, subtitle: subheading }),
    c.ctaButton(theme, { label: ctaLabel, url: ctaUrl }),
    c.divider(theme),
  ].join('');

  const html = shell(theme, {
    title: heading,
    preheaderText: preheaderText || subheading,
    headerHtml: c.header(theme),
    bodyRows: rows,
    footerHtml: [c.appBadges(theme), c.socialIcons(theme), c.legalFooter(theme)].join(''),
  });
  return buildResult(html, subject || heading);
}

/**
 * General-purpose notification/alert email: heading, message, optional CTA.
 * Good default for account alerts, status changes, admin notices, etc.
 */
function notification(
  rawTheme,
  { heading, message, tone = 'success', ctaLabel, ctaUrl, icon = '🔔', preheaderText, subject } = {}
) {
  const theme = mergeTheme(rawTheme);
  const rows = [
    c.hero(theme, { icon, title: heading }),
    message ? c.bodyText(theme, message) : '',
    ctaLabel && ctaUrl ? c.ctaButton(theme, { label: ctaLabel, url: ctaUrl }) : '',
  ]
    .filter(Boolean)
    .join('');

  const html = shell(theme, {
    title: heading,
    preheaderText: preheaderText || (typeof message === 'string' ? message : ''),
    headerHtml: c.header(theme),
    bodyRows: rows,
    footerHtml: c.legalFooter(theme),
  });
  return buildResult(html, subject || heading);
}

module.exports = {
  genericNotice,
  brandedShell,
  purchaseConfirmation,
  receiptResend,
  otpVerification,
  passwordReset,
  welcome,
  notification,
};
