'use strict';

const { escapeHtml } = require('./utils');

/**
 * Hidden preheader text — the snippet most mail clients show next to the
 * subject line in the inbox list. Padded with invisible whitespace so real
 * body text doesn't bleed into the preview.
 */
function preheader(text) {
  if (!text) return '';
  return `
  <div style="display:none; max-height:0; overflow:hidden; mso-hide:all; font-size:1px; line-height:1px; color:${''}#f4f7fb;">
    ${escapeHtml(text)}
    ${'&#847; '.repeat(60)}
  </div>`;
}

function darkModeStyles(theme) {
  if (!theme.darkModeEnabled) return '';
  const d = theme.dark;
  return `
    @media (prefers-color-scheme: dark) {
      body, .dark-wrapper { background-color:${d.bg} !important; }
      .dark-card { background-color:${d.card} !important; }
      .dark-muted-bg { background-color:${d.cardMuted} !important; border-color:${d.border} !important; }
      .dark-footer-bg { background-color:${d.footerBg} !important; }
      .dark-text-primary { color:${d.textPrimary} !important; }
      .dark-text-secondary { color:${d.textSecondary} !important; }
      .dark-border { border-color:${d.border} !important; }
      .dark-link, a { color:${d.link} !important; }
      .dark-button { background-color:${d.button} !important; box-shadow:none !important; }
      hr.dark-hr { background:${d.border} !important; }
    }`;
}

function baseStyles(theme) {
  const { colors, fonts } = theme;
  return `
    body, table, td, p, a { margin:0; padding:0; border:0; font-size:100%; }
    body { background-color:${colors.bg}; margin:0; padding:0; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; font-family:${fonts.family}; -webkit-font-smoothing:antialiased; }
    table { border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; }
    img { border:0; height:auto; line-height:100%; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; }
    p { font-family:${fonts.family}; line-height:1.6; color:${colors.textPrimary}; }
    @media only screen and (max-width: 600px) {
      .es-content, .es-content-body, .responsive-table { width:100% !important; }
      .mobile-padding { padding-left:20px !important; padding-right:20px !important; }
      .stack-cell { display:block !important; width:100% !important; text-align:center !important; }
    }
    ${darkModeStyles(theme)}
  `;
}

/**
 * Wrap a body fragment (a series of <tr> rows, typically built from
 * components.js) in the full HTML document: doctype, head/meta, fonts,
 * responsive + dark-mode CSS, and the centered 600px card frame.
 *
 * @param {object} theme   Resolved theme (see config.js:mergeTheme).
 * @param {object} opts
 * @param {string} opts.title       Document <title>.
 * @param {string} [opts.preheaderText]  Hidden inbox preview text.
 * @param {string} opts.bodyRows    Raw HTML `<tr>` rows for the main card.
 * @param {string} [opts.headerRows]  Raw HTML rows rendered above the card
 *                                    (defaults to the brand header).
 * @param {string} [opts.footerRows]  Raw HTML rows rendered below the card
 *                                    (defaults to nothing — pass legalFooter()
 *                                    rows plus appBadges/socialIcons yourself
 *                                    so each template controls its own footer).
 */
function shell(theme, { title = '', preheaderText = '', headerHtml = '', bodyRows = '', footerHtml = '' } = {}) {
  const { colors, fonts } = theme;
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en" style="font-family:${fonts.family};">
<head>
  <meta charset="UTF-8">
  <meta content="width=device-width, initial-scale=1" name="viewport">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta content="telephone=no" name="format-detection">
  <title>${escapeHtml(title)}</title>
  ${fonts.googleFontsHref ? `<link href="${fonts.googleFontsHref}" rel="stylesheet">` : ''}
  <style type="text/css">${baseStyles(theme)}</style>
</head>
<body style="margin:0; padding:0; background-color:${colors.bg}; font-family:${fonts.family};">
  ${preheader(preheaderText)}
  <center style="width:100%; table-layout:fixed;">
    <div class="dark-wrapper" style="max-width:600px; margin:0 auto; background-color:${colors.bg};">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; margin:0 auto; background-color:${colors.bg};">
        <tr>
          <td align="center" style="padding:30px 20px 20px;">
            ${headerHtml}
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${colors.card}; border-radius:32px; box-shadow:0 12px 28px rgba(0,0,0,0.04); overflow:hidden;" class="dark-card">
              ${bodyRows}
            </table>
            ${footerHtml}
          </td>
        </tr>
      </table>
    </div>
  </center>
</body>
</html>`;
}

/** Minimal shell for arbitrary already-built HTML (no card chrome), for
 * one-off internal notices or content that brings its own layout. */
function bareShell(theme, { title = '', bodyHtml = '' } = {}) {
  const { colors, fonts } = theme;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${fonts.googleFontsHref ? `<link href="${fonts.googleFontsHref}" rel="stylesheet">` : ''}
  <title>${escapeHtml(title)}</title>
  <style>
    *, *::after, *::before { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:${fonts.family}; background-color:${colors.card}; color:${colors.textPrimary}; font-size:15px; }
  </style>
</head>
<body style="padding:16px;">
  <div style="max-width:600px; margin:0 auto; padding:20px;">
    ${bodyHtml}
  </div>
</body>
</html>`;
}

module.exports = { shell, bareShell, preheader };
