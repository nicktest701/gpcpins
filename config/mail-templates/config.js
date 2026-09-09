'use strict';

/**
 * Default brand theme.
 *
 * Every template accepts an optional `theme` override (deep-merged over
 * this default) so the same templates can be reused across brands/products
 * without touching template code — e.g. a white-labeled sender, a seasonal
 * accent color, or a staging environment with a different logo.
 */
const DEFAULT_THEME = {
  company: {
    name: 'Gab Powerful Consult',
    url: 'https://www.gpcpins.com',
    logoUrl: 'https://www.gpcpins.com/logo.png',
    address: "Menhyia - Opposite St. Anne's International School, Ashtown, Kumasi, Ghana",
    phone: '0322036582',
    supportEmail: 'support@gpcpins.com',
  },

  links: {
    privacyPolicy: 'https://www.gpcpins.com/privacy-policy',
    terms: 'https://www.gpcpins.com/terms-and-conditions',
    viewOnline: 'https://www.gpcpins.com',
    unsubscribe: null, // set per-send when sending marketing mail
  },

  social: {
    facebook: 'https://www.gpcpins.com',
    twitter: 'https://www.gpcpins.com',
    instagram: 'https://www.gpcpins.com',
    youtube: 'https://www.gpcpins.com',
  },

  socialIcons: {
    facebook: 'https://www.gpcpins.com/images/social/facebook.png',
    twitter: 'https://www.gpcpins.com/images/social/twitter.png',
    instagram: 'https://www.gpcpins.com/images/social/instagram.png',
    youtube: 'https://www.gpcpins.com/images/social/youtube.png',
  },

  appLinks: {
    appStore: { url: 'https://www.gpcpins.com', imageUrl: 'https://www.gpcpins.com/images/social/appstore.png' },
    playStore: { url: 'https://www.gpcpins.com', imageUrl: 'https://www.gpcpins.com/images/social/playstore.png' },
  },

  fonts: {
    // Google Fonts <link> href. Set to null to skip loading a web font
    // (recommended fallback-only mode for the strictest email clients).
    googleFontsHref: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap',
    family: "'Poppins', arial, 'helvetica neue', helvetica, sans-serif",
  },

  colors: {
    bg: '#f4f7fb',
    card: '#ffffff',
    cardMuted: '#F8FAFE',
    cardMuted2: '#F0F4F9',
    border: '#E4EAF0',
    border2: '#E9EDF2',
    textPrimary: '#1A2C3E',
    textHeading: '#0B2B3B',
    textSecondary: '#2C4A5E',
    textMuted: '#6A8DAA',
    textFooter: '#4F6F8F',
    label: '#5F7F9C',
    brand: '#1F2B44',
    brandContrast: '#ffffff',
    accent: '#1E6F5C',
    link: '#1F2B44',
    danger: '#B3261E',
    dangerBg: '#FDEDEC',
    success: '#1E6F5C',
    successBg: '#EAF7F1',
  },

  dark: {
    bg: '#121826',
    card: '#1E2636',
    cardMuted: '#1A212F',
    footerBg: '#131A26',
    border: '#2E3A4A',
    textPrimary: '#EFF3F8',
    textSecondary: '#B9C7D9',
    link: '#8AB4F8',
    button: '#2D3A5E',
  },

  // Master switch — set false to ship a light-only email for clients/brands
  // that don't want dark-mode overrides.
  darkModeEnabled: true,
};

/**
 * Shallow-deep merge of a partial theme onto the default theme.
 * Only merges one level of nested objects (colors, dark, company, ...),
 * which covers every override shape this module needs.
 */
function mergeTheme(overrides) {
  if (!overrides) return DEFAULT_THEME;
  const merged = { ...DEFAULT_THEME };
  for (const key of Object.keys(overrides)) {
    const base = DEFAULT_THEME[key];
    const value = overrides[key];
    if (base && typeof base === 'object' && !Array.isArray(base) && value && typeof value === 'object') {
      merged[key] = { ...base, ...value };
    } else {
      merged[key] = value;
    }
  }
  return merged;
}

module.exports = { DEFAULT_THEME, mergeTheme };
