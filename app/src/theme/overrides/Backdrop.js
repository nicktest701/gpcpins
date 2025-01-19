import { alpha } from '@mui/material';

// ----------------------------------------------------------------------

export default function Backdrop(theme) {
  return {
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(theme.palette.grey[800], 0.8),
        },
        invisible: {
          background: 'transparent',
        },
      },
    },
  };
}
