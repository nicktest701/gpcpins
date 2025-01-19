import { alpha } from '@mui/material';

// ----------------------------------------------------------------------

export default function Button(theme) {
  return {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
        sx: {
          borderRadius: 1,
          paddingY: '12px',
          paddingX: 3,
          boxShadow: 'none',
        },
      },
      styleOverrides: {
        root: {
          borderRadius: 1,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
          whiteSpace: 'noWrap',
        },
        sizeLarge: {
          py: '16px',
        },
        containedInherit: {
          color: theme.palette.grey[800],
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: theme.palette.grey[400],
          },
        },
        containedPrimary: {
          backgroundColor: theme.palette.primary.main,

          color: '#fff',
          '&:hover': {
            backgroundColor: theme.palette.primary.dark,
          },
        },
        containedSecondary: {
          boxShadow: 'none',
        },
        outlinedInherit: {
          border: `1px solid ${alpha(theme.palette.grey[500], 0.32)}`,
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
        },
        textInherit: {
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
        },
      },
    },
  };
}
