import { alpha } from '@mui/material';

export default function Button(theme) {
  return {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
        sx: {
          borderRadius: 2, // consistent with dialog buttons
          paddingY: '8px',
          paddingX: 2,
          boxShadow: 'none',
          textTransform: 'uppercase', // keep brand style; change to 'none' if you prefer sentence case
        },
      },
      styleOverrides: {
        root: {
          borderRadius: 2,
          boxShadow: 'none',
          whiteSpace: 'nowrap',
          fontWeight: 600,
          letterSpacing: 0.3,
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        // ----- Size variants -----
        sizeSmall: {
          padding: '4px 12px',
          fontSize: '0.75rem',
          borderRadius: 1.5,
        },
        sizeMedium: {
          padding: '8px 20px',
          fontSize: '0.875rem',
        },
        sizeLarge: {
          padding: '12px 28px',
          fontSize: '1rem',
          borderRadius: 2,
        },
        // ----- Contained variants -----
        containedInherit: {
          color: theme.palette.grey[800],
          backgroundColor: theme.palette.grey[300],
          '&:hover': {
            backgroundColor: theme.palette.grey[400],
          },
        },
        containedPrimary: {
          // use secondary as primary (as per your original)
          backgroundColor: theme.palette.secondary.main,
          color: '#fff',
          boxShadow: `0 4px 12px ${alpha(theme.palette.secondary.main, 0.3)}`,
          '&:hover': {
            backgroundColor: theme.palette.secondary.dark,
            boxShadow: `0 8px 24px ${alpha(theme.palette.secondary.main, 0.4)}`,
          },
        },
        containedSecondary: {
          backgroundColor: theme.palette.primary.main,
          color: '#fff',
          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
          '&:hover': {
            backgroundColor: theme.palette.primary.dark,
            boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
          },
        },
        containedSuccess: {
          boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.3)}`,
          '&:hover': {
            boxShadow: `0 8px 24px ${alpha(theme.palette.success.main, 0.4)}`,
          },
        },
        containedError: {
          boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.3)}`,
          '&:hover': {
            boxShadow: `0 8px 24px ${alpha(theme.palette.error.main, 0.4)}`,
          },
        },
        containedInfo: {
          boxShadow: `0 4px 12px ${alpha(theme.palette.info.main, 0.3)}`,
          '&:hover': {
            boxShadow: `0 8px 24px ${alpha(theme.palette.info.main, 0.4)}`,
          },
        },
        // ----- Outlined variants -----
        outlinedInherit: {
          border: `1px solid ${alpha(theme.palette.grey[500], 0.32)}`,
          '&:hover': {
            backgroundColor: alpha(theme.palette.action.hover, 0.08),
            borderColor: theme.palette.grey[500],
          },
        },
        outlinedPrimary: {
          borderColor: theme.palette.primary.main,
          color: theme.palette.primary.main,
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
            borderColor: theme.palette.primary.dark,
          },
        },
        outlinedSecondary: {
          borderColor: theme.palette.secondary.main,
          color: theme.palette.secondary.main,
          '&:hover': {
            backgroundColor: alpha(theme.palette.secondary.main, 0.04),
            borderColor: theme.palette.secondary.dark,
          },
        },
        // ----- Text (ghost) variants -----
        textInherit: {
          color: theme.palette.text.primary,
          '&:hover': {
            backgroundColor: alpha(theme.palette.action.hover, 0.6),
          },
        },
        textPrimary: {
          color: theme.palette.primary.main,
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
          },
        },
        textSecondary: {
          color: theme.palette.secondary.main,
          '&:hover': {
            backgroundColor: alpha(theme.palette.secondary.main, 0.08),
          },
        },
        // ----- Custom: ghost alias (if you use variant="ghost") -----
        // Note: MUI doesn't have a built-in "ghost" variant, but you can either:
        // 1. Use variant="text" and let the above styles apply, or
        // 2. Add a custom variant via theme components (advanced).
        // For simplicity, we recommend using variant="text" in your code.
      },
    },
  };
}


// import { alpha } from '@mui/material';

// // ----------------------------------------------------------------------

// export default function Button(theme) {
//   return {
//     MuiButton: {
//       defaultProps: {
//         disableElevation: true,
//         sx: {
//           borderRadius: 1,
//           paddingY: '8px',
//           paddingX: 2,
//           boxShadow: 'none',
//           textTransform:'uppercase'
//         },
//       },
//       styleOverrides: {
//         root: {
//           borderRadius: 1,
//           boxShadow: 'none',
//           '&:hover': {
//             boxShadow: 'none',
//           },
//           whiteSpace: 'noWrap',
//         },
//         sizeLarge: {
//           py: '12px',
//           borderRadius: 1,
//         },
//         containedInherit: {
//           color: theme.palette.grey[800],
//           boxShadow: 'none',
//           '&:hover': {
//             backgroundColor: theme.palette.grey[400],
//           },
//         },
//         containedPrimary: {
//           backgroundColor: theme.palette.secondary.main,
//           borderRadius: 1,

//           color: '#fff',
//           '&:hover': {
//             backgroundColor: theme.palette.secondary.dark,
//           },
//         },
//         containedSecondary: {
//           boxShadow: 'none',
//         },
//         outlinedInherit: {
//           border: `1px solid ${alpha(theme.palette.grey[500], 0.32)}`,
//           '&:hover': {
//             backgroundColor: theme.palette.action.hover,
//           },
//         },
//         textInherit: {
//           '&:hover': {
//             backgroundColor: theme.palette.action.hover,
//           },
//         },
//       },
//     },
//   };
// }
