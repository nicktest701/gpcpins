// ----------------------------------------------------------------------

export default function Label(theme) {
  return {
    MuiBackdrop: {
      defaultProps: {
        sx: {
          color: theme.palette.primary.main,
        },
      },
    },
  };
}
