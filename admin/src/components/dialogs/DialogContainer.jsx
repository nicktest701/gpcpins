import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Button,
  alpha,
  Stack,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { Close } from "@mui/icons-material";
import PropTypes from "prop-types";

// Reusable scrollbar styles
export const scrollbarStyles = {
  "&::-webkit-scrollbar": {
    width: 6,
  },
  "&::-webkit-scrollbar-track": {
    background: "transparent",
  },
  "&::-webkit-scrollbar-thumb": {
    background: (theme) => alpha(theme.palette.primary.main, 0.4),
    borderRadius: 1.2,
    "&:hover": {
      background: (theme) => alpha(theme.palette.primary.main, 0.6),
    },
  },
};

const DialogContainer = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "md",
  fullWidth = true,
  loading = false,
  disabled = false,
  confirmText = "Save",
  cancelText = "Cancel",
  onConfirm,
  confirmColor = "primary",
  showConfirm = true,
  showCancel = true,
  paperSx = {},
  contentSx = {},
  actionsSx = {},
  titleSx = {},
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        elevation: 8,
        sx: {
          borderRadius: 1.2,
          maxHeight: "90vh",
          overflow: "hidden", // 1. Keeps the outer container bound to maxheight without a scrollbar
          bgcolor: "background.paper",
          boxShadow: (theme) =>
            `0 20px 60px ${alpha(theme.palette.common.black, 0.15)}`,
          // 2. Moved inside the sx object to target the Paper element correctly
          "&::-webkit-scrollbar": {
            display: "none",
          },
          scrollbarWidth: "none", // For Firefox compatibility

          ...paperSx,
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: "primary.main",
          color: "primary.contrastText",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          ...titleSx,
        }}
      >
        <Stack spacing={0.5}>
          <Typography variant="h6" component="span" fontWeight="bold">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {subtitle}
            </Typography>
          )}
        </Stack>
        <IconButton onClick={onClose} sx={{ color: "primary.contrastText" }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
     overflow: "auto",
        p: 3,
        // Custom scrollbar (WebKit)
        "&::-webkit-scrollbar": {
          width: 6,
        },
        "&::-webkit-scrollbar-track": {
          background: "transparent",
        },
        "&::-webkit-scrollbar-thumb": {
          background: (theme) => alpha(theme.palette.primary.main, 0.4),
          borderRadius: 1.2,
          "&:hover": {
            background: (theme) => alpha(theme.palette.primary.main, 0.6),
          },
        },
          ...contentSx,
        }}
      >
        {children}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1, ...actionsSx }}>
        {showCancel && (
          <Button onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
        )}
        {showConfirm && (
          <LoadingButton
            variant="contained"
            color={confirmColor}
            onClick={onConfirm}
            loading={loading}
            disabled={disabled}
          >
            {confirmText}
          </LoadingButton>
        )}
      </DialogActions>
    </Dialog>
  );
};

DialogContainer.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  children: PropTypes.node.isRequired,
  maxWidth: PropTypes.oneOf(["xs", "sm", "md", "lg", "xl", false]),
  fullWidth: PropTypes.bool,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  onConfirm: PropTypes.func,
  confirmColor: PropTypes.string,
  showConfirm: PropTypes.bool,
  showCancel: PropTypes.bool,
  paperSx: PropTypes.object,
  contentSx: PropTypes.object,
  actionsSx: PropTypes.object,
  titleSx: PropTypes.object,
};

export default DialogContainer;
