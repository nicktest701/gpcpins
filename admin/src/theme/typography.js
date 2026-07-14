// ----------------------------------------------------------------------
// Typography System – Modern & Responsive
// ----------------------------------------------------------------------

export function remToPx(value) {
  return Math.round(parseFloat(value) * 16);
}

export function pxToRem(value) {
  // Using 16 as base (standard browser default)
  return `${value / 16}rem`;
}

export function responsiveFontSizes({ sm, md, lg }) {
  return {
    '@media (min-width:600px)': {
      fontSize: pxToRem(sm),
    },
    '@media (min-width:900px)': {
      fontSize: pxToRem(md),
    },
    '@media (min-width:1200px)': {
      fontSize: pxToRem(lg),
    },
  };
}

// ----------------------------------------------------------------------

const FONT_PRIMARY = '"Figtree", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
// const FONT_SECONDARY = 'CircularStd, sans-serif'; // (optional)

const typography = {
  fontFamily: FONT_PRIMARY,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightSemiBold: 600,
  fontWeightBold: 700,

  // Headings – responsive, with subtle letter-spacing for elegance
  h1: {
    fontWeight: 700,
    lineHeight: 1.25,
    fontSize: pxToRem(36),
    letterSpacing: '-0.02em',
    ...responsiveFontSizes({ sm: 40, md: 48, lg: 56 }),
  },
  h2: {
    fontWeight: 700,
    lineHeight: 1.3,
    fontSize: pxToRem(28),
    letterSpacing: '-0.01em',
    ...responsiveFontSizes({ sm: 32, md: 36, lg: 40 }),
  },
  h3: {
    fontWeight: 700,
    lineHeight: 1.35,
    fontSize: pxToRem(22),
    letterSpacing: '0.01em',
    ...responsiveFontSizes({ sm: 24, md: 28, lg: 32 }),
  },
  h4: {
    fontWeight: 700,
    lineHeight: 1.4,
    fontSize: pxToRem(18),
    letterSpacing: '0.01em',
    ...responsiveFontSizes({ sm: 20, md: 22, lg: 24 }),
  },
  h5: {
    fontWeight: 600,
    lineHeight: 1.4,
    fontSize: pxToRem(16),
    letterSpacing: '0.01em',
    ...responsiveFontSizes({ sm: 17, md: 18, lg: 20 }),
  },
  h6: {
    fontWeight: 600,
    lineHeight: 1.45,
    fontSize: pxToRem(14),
    letterSpacing: '0.01em',
    ...responsiveFontSizes({ sm: 15, md: 16, lg: 16 }),
  },

  // Body & supporting text
  subtitle1: {
    fontWeight: 600,
    lineHeight: 1.5,
    fontSize: pxToRem(16),
  },
  subtitle2: {
    fontWeight: 600,
    lineHeight: 1.5,
    fontSize: pxToRem(14),
  },
  body1: {
    fontWeight: 400,
    lineHeight: 1.6,
    fontSize: pxToRem(16),
  },
  body2: {
    fontWeight: 400,
    lineHeight: 1.6,
    fontSize: pxToRem(14),
  },
  caption: {
    fontWeight: 400,
    lineHeight: 1.5,
    fontSize: pxToRem(12),
  },
  overline: {
    fontWeight: 700,
    lineHeight: 1.5,
    fontSize: pxToRem(12),
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  button: {
    fontWeight: 400,
    lineHeight: 1.5,
    fontSize: pxToRem(14),
    textTransform: 'none', // overridden by theme if needed
    letterSpacing: '0.02em',
  },
};

export default typography;
