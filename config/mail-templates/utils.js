'use strict';

/**
 * Escape a value for safe interpolation into HTML markup.
 *
 * The original templates interpolated ids/messages/names directly into
 * HTML strings with no escaping — fine while every value came from your
 * own backend, but a real risk the moment any of it (a customer name, a
 * free-text note) can be influenced by user input. Every template in this
 * module escapes untrusted text through here before it reaches markup.
 */
function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Marks a string as pre-sanitized HTML so components can insert it verbatim
 * (e.g. a message body you've already built out of safe pieces). Use this
 * deliberately and rarely — everything else should go through escapeHtml.
 */
function rawHtml(value) {
  return { __rawHtml: true, value: String(value ?? '') };
}

function resolveHtml(value) {
  if (value && typeof value === 'object' && value.__rawHtml) return value.value;
  return escapeHtml(value);
}

/** Only allow http(s)/mailto links into href/src attributes. */
function safeUrl(url, fallback = '#') {
  if (typeof url !== 'string') return fallback;
  if (/^(https?:|mailto:)/i.test(url.trim())) return url;
  return fallback;
}

/** Very small HTML-to-text reducer for the multipart/alternative text part. */
function htmlToPlainText(html) {
  return String(html || '')
    .replace(/<div style="display:none[\s\S]*?<\/div>/gi, '') // hidden preheader block
    .replace(/<\s*(br|\/tr|\/p|\/div|\/h[1-6])\s*\/?>/gi, '\n')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function formatCurrency(amount, currency = 'GHS', locale = 'en-GH') {
  const value = Number(amount) || 0;
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

function currentYear() {
  return new Date().getFullYear();
}

module.exports = { escapeHtml, rawHtml, resolveHtml, safeUrl, htmlToPlainText, formatCurrency, currentYear };
