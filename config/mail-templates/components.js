'use strict';

const { escapeHtml, resolveHtml, safeUrl, formatCurrency } = require('./utils');

/** Logo + brand name header, centered above the main card. */
function header(theme) {
  const { company, colors } = theme;
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
    <tr>
      <td align="center" style="padding:10px 0 5px;">
        <a href="${safeUrl(company.url)}" target="_blank" style="text-decoration:none;">
          <img src="${safeUrl(company.logoUrl)}" width="70" height="70" alt="${escapeHtml(company.name)}" style="display:block; border-radius:18px; box-shadow:0 8px 18px rgba(0,0,0,0.05);">
        </a>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding-bottom:4px;">
        <span class="dark-text-primary" style="font-size:18px; font-weight:600; color:${colors.brand}; letter-spacing:-0.2px;">${escapeHtml(company.name)}</span>
      </td>
    </tr>
  </table>`;
}

/** Hero banner: emoji/icon, heading, short subtext. */
function hero(theme, { icon = '', title, subtitle } = {}) {
  const { colors } = theme;
  return `
  <tr>
    <td class="dark-card" style="padding:36px 28px 16px; text-align:center; background:linear-gradient(135deg, #FFFFFF 0%, #F9FBFE 100%);">
      ${icon ? `<div style="font-size:52px; margin-bottom:8px;">${icon}</div>` : ''}
      <h1 class="dark-text-primary" style="font-size:28px; font-weight:700; color:${colors.textHeading}; margin:0 0 6px; letter-spacing:-0.3px;">${escapeHtml(title)}</h1>
      ${subtitle ? `<p class="dark-text-secondary" style="font-size:15px; color:${colors.textSecondary}; line-height:1.5; margin:0;">${resolveHtml(subtitle)}</p>` : ''}
    </td>
  </tr>`;
}

/** Free-form body copy / dynamic message block. */
function bodyText(theme, content, { padding = '8px 28px 0' } = {}) {
  const { colors } = theme;
  return `
  <tr>
    <td style="padding:${padding};">
      <div class="dark-text-primary" style="font-size:15px; line-height:1.6; color:${colors.textPrimary};">
        ${resolveHtml(content)}
      </div>
    </td>
  </tr>`;
}

/** Rounded "note" box, e.g. a soft-background callout under the message. */
function noteBox(theme, content, { padding = '8px 28px 0' } = {}) {
  const { colors } = theme;
  return `
  <tr>
    <td style="padding:${padding};">
      <div class="dark-muted-bg" style="background:${colors.cardMuted}; border-radius:24px; padding:18px 20px; border:1px solid ${colors.border2}; font-size:15px; line-height:1.5; color:${colors.textPrimary};">
        ${resolveHtml(content)}
      </div>
    </td>
  </tr>`;
}

/** Prominent labeled value badge — used for transaction IDs, OTP codes, tokens. */
function infoBadge(theme, { label, value, hint, monospace = true } = {}) {
  const { colors } = theme;
  return `
  <tr>
    <td style="padding:16px 28px 12px;">
      <table width="100%" style="background:${colors.cardMuted2}; border-radius:26px; border:1px solid ${colors.border};">
        <tr>
          <td align="center" style="padding:22px 20px;">
            <span style="font-size:13px; font-weight:600; text-transform:uppercase; letter-spacing:1.2px; color:${colors.label};">${escapeHtml(label)}</span>
            <div style="font-size:32px; font-weight:800; color:${colors.textHeading}; margin-top:10px; word-break:break-all; background:${colors.card}; padding:10px 20px; border-radius:60px; display:inline-block; ${monospace ? "font-family:monospace;" : ''} letter-spacing:-0.2px;">
              ${escapeHtml(value)}
            </div>
            ${hint ? `<p style="font-size:12px; color:${colors.textMuted}; margin-top:14px;">${escapeHtml(hint)}</p>` : ''}
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

/** Primary call-to-action button, centered, with an optional caption below it. */
function ctaButton(theme, { label, url, caption } = {}) {
  const { colors } = theme;
  return `
  <tr>
    <td align="center" style="padding:12px 28px 30px;">
      <a href="${safeUrl(url)}" target="_blank" style="display:inline-block; background:${colors.brand}; color:${colors.brandContrast}; font-size:16px; font-weight:600; text-decoration:none; padding:14px 34px; border-radius:50px; box-shadow:0 6px 14px rgba(31,43,68,0.2); letter-spacing:0.3px;">${escapeHtml(label)}</a>
      ${caption ? `<p style="font-size:13px; color:${colors.textFooter}; margin-top:18px;">${escapeHtml(caption)}</p>` : ''}
    </td>
  </tr>`;
}

/** Small colored status/alert strip — success, warning, or danger tone. */
function alertBox(theme, { tone = 'success', text } = {}) {
  const { colors } = theme;
  const bg = tone === 'danger' ? colors.dangerBg : colors.successBg;
  const fg = tone === 'danger' ? colors.danger : colors.success;
  return `
  <tr>
    <td style="padding:4px 28px 4px;">
      <div style="background:${bg}; border-radius:18px; padding:10px 16px; display:inline-block;">
        <span style="font-size:13px; font-weight:500; color:${fg};">${resolveHtml(text)}</span>
      </div>
    </td>
  </tr>`;
}

function divider(theme) {
  return `
  <tr>
    <td style="padding:0 28px;">
      <hr class="dark-hr" style="border:0; height:1px; background:linear-gradient(to right, #E0E8F0, #ffffff); margin:5px 0 0;">
    </td>
  </tr>`;
}

/** Itemized order/invoice table with a running total row. */
function itemsTable(theme, { items = [], currency = 'GHS', locale = 'en-GH' } = {}) {
  const { colors } = theme;
  if (!items.length) return '';
  const rows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 0; border-bottom:1px solid ${colors.border}; font-size:14px; color:${colors.textPrimary};">
            ${escapeHtml(item.name)}${item.qty && item.qty > 1 ? ` <span style="color:${colors.textMuted};">× ${escapeHtml(item.qty)}</span>` : ''}
          </td>
          <td align="right" style="padding:10px 0; border-bottom:1px solid ${colors.border}; font-size:14px; color:${colors.textPrimary}; white-space:nowrap;">
            ${escapeHtml(formatCurrency(item.price, currency, locale))}
          </td>
        </tr>`
    )
    .join('');
  const total = items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 1), 0);
  return `
  <tr>
    <td style="padding:8px 28px 0;">
      <table width="100%" style="border-collapse:collapse;">
        ${rows}
        <tr>
          <td style="padding:14px 0 0; font-size:15px; font-weight:700; color:${colors.textHeading};">Total</td>
          <td align="right" style="padding:14px 0 0; font-size:15px; font-weight:700; color:${colors.textHeading};">${escapeHtml(formatCurrency(total, currency, locale))}</td>
        </tr>
      </table>
    </td>
  </tr>`;
}

function appBadges(theme) {
  const { appLinks } = theme;
  return `
  <tr>
    <td style="padding:22px 28px 12px;">
      <table width="100%">
        <tr><td align="center" style="padding-bottom:14px;">
          <span class="dark-text-secondary" style="font-size:14px; font-weight:500; color:${theme.colors.textSecondary};">📱 Get our app</span>
        </td></tr>
        <tr><td align="center">
          <table style="margin:0 auto;">
            <tr>
              <td style="padding:0 8px;"><a href="${safeUrl(appLinks.appStore.url)}" target="_blank"><img src="${safeUrl(appLinks.appStore.imageUrl)}" width="60" alt="App Store" style="display:block; border-radius:12px;"></a></td>
              <td style="padding:0 8px;"><a href="${safeUrl(appLinks.playStore.url)}" target="_blank"><img src="${safeUrl(appLinks.playStore.imageUrl)}" width="60" alt="Google Play" style="display:block; border-radius:12px;"></a></td>
            </tr>
          </table>
        </td></tr>
      </table>
    </td>
  </tr>`;
}

function socialIcons(theme) {
  const { social, socialIcons: icons } = theme;
  const entries = [
    ['Facebook', social.facebook, icons.facebook],
    ['Twitter', social.twitter, icons.twitter],
    ['Instagram', social.instagram, icons.instagram],
    ['YouTube', social.youtube, icons.youtube],
  ].filter(([, url]) => !!url);
  if (!entries.length) return '';
  return `
  <tr>
    <td align="center" style="padding:6px 28px 12px;">
      <table style="margin:0 auto;">
        <tr>
          ${entries
            .map(
              ([label, url, icon]) => `
          <td style="padding:0 10px;"><a href="${safeUrl(url)}" target="_blank"><img src="${safeUrl(icon)}" width="34" alt="${escapeHtml(label)}" style="display:block;"></a></td>`
            )
            .join('')}
        </tr>
      </table>
    </td>
  </tr>`;
}

/** Legal footer: links, address, phone, copyright, support contact, optional unsubscribe. */
function legalFooter(theme) {
  const { company, links, colors } = theme;
  const year = new Date().getFullYear();
  return `
  <tr>
    <td class="dark-footer-bg" style="background:${colors.cardMuted}; padding:24px 28px 32px; border-top:1px solid ${colors.border};">
      <table width="100%">
        <tr>
          <td align="center" class="dark-text-secondary" style="font-size:13px; color:${colors.textFooter}; line-height:1.6;">
            <a href="${safeUrl(links.privacyPolicy)}" target="_blank" style="color:${colors.link}; text-decoration:none; font-weight:500;">Privacy Policy</a> &nbsp;•&nbsp;
            <a href="${safeUrl(links.terms)}" target="_blank" style="color:${colors.link}; text-decoration:none; font-weight:500;">Terms of Service</a> &nbsp;•&nbsp;
            <a href="${safeUrl(links.viewOnline)}" target="_blank" style="color:${colors.link}; text-decoration:none; font-weight:500;">View Online</a>
            <br><br>
            ${escapeHtml(company.address)}<br>
            📞 ${escapeHtml(company.phone)}
            <br><br>
            © ${year} ${escapeHtml(company.name)} – All rights reserved.
            <br><br>
            <span style="font-size:11px;">Need help? <a href="mailto:${safeUrl('mailto:' + company.supportEmail)}" style="color:${colors.link}; text-decoration:none;">${escapeHtml(company.supportEmail)}</a></span>
            ${
              links.unsubscribe
                ? `<br><br><span style="font-size:11px;"><a href="${safeUrl(links.unsubscribe)}" style="color:${colors.textFooter}; text-decoration:underline;">Unsubscribe</a> from these emails</span>`
                : ''
            }
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

module.exports = {
  header,
  hero,
  bodyText,
  noteBox,
  infoBadge,
  ctaButton,
  alertBox,
  divider,
  itemsTable,
  appBadges,
  socialIcons,
  legalFooter,
};
