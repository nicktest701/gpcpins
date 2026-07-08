import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Typography,
  IconButton,
  Skeleton,
  Alert,
  Button,
  Paper,
  Divider,
  Box,
  Chip,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Close as CloseIcon,
  SearchOff as SearchOffIcon,
  ElectricBolt as ElectricBoltIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  GridOn as GridOnIcon,
  AccountBalance as AccountIcon,
} from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { useState } from "react";

// ------------------------------------------------------------
// Enhanced DetailRow with optional icon and subtle chip styling
// ------------------------------------------------------------
const DetailRow = ({ icon: Icon, label, value, chip = false }) => {
  const theme = useTheme();
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.5}
      sx={{
        py: 0.75,
        borderBottom: `1px solid ${theme.palette.divider}`,
        "&:last-of-type": { borderBottom: "none" },
      }}
    >
      {/* {Icon && (
        <Box
          sx={{
            color: "primary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 32,
            height: 32,
            borderRadius: "50%",
            bgcolor: alpha(theme.palette.primary.main, 0.08),
          }}
        >
          <Icon fontSize="small" />
        </Box>
      )} */}
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ minWidth: 130, fontWeight: 500 ,fontSize:12}}
      >
        {label}
      </Typography>
      {chip ? (
        <Chip
          label={value}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ fontWeight: 500 }}
        />
      ) : (
        <Typography variant="body2" fontWeight="medium" sx={{ flex: 1 ,fontSize:12}}>
          {value}
        </Typography>
      )}
    </Stack>
  );
};

// ------------------------------------------------------------
// Modern Meter Details Dialog
// ------------------------------------------------------------
const MeterDetailsDialog = ({
  open,
  onClose,
  meter,
  meterLoading,
  meterError,
  submittedNumber,
  refetchMeter,
  handleProceedToVerify,
}) => {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        elevation: 8,
        sx: {
          borderRadius: 4,
          overflow: "hidden",
          background: theme.palette.background.paper,
          backdropFilter: "blur(4px)",
          boxShadow: `0 20px 60px ${alpha(theme.palette.common.black, 0.15)}`,
        },
      }}
      TransitionProps={{ timeout: 300 }}
      // Optional: add a subtle scale/fade transition
    >
      {/* ---------- Enhanced Dialog Title ---------- */}
      <DialogTitle
        sx={{
          p: 3,
          pb: 1.5,
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.06,
          )} 0%, ${alpha(theme.palette.secondary.main, 0.04)} 100%)`,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 40,
                height: 40,
                // borderRadius: "50%",
                bgcolor: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "common.white",
              }}
            >
              <ElectricBoltIcon fontSize="small" />
            </Box>
            <Typography variant="h6" fontWeight="700" letterSpacing={-0.5}>
              Meter Details
            </Typography>
          </Stack>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: "text.secondary",
              bgcolor: alpha(theme.palette.common.black, 0.04),
              "&:hover": { bgcolor: alpha(theme.palette.common.black, 0.08) },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>

      {/* ---------- Dialog Content ---------- */}
      <DialogContent sx={{ p: 3, pt: 2.5,my:2 }}>
        {/* --- Loading State with shimmer skeletons --- */}
        {meterLoading && (
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {[...Array(6)].map((_, i) => (
              <Stack key={i} direction="row" alignItems="center" spacing={2}>
                {/* <Skeleton variant="circular" width={32} height={32} /> */}
                <Skeleton variant="text" width={130} height={24} />
                <Skeleton variant="text" width="60%" height={24} />
              </Stack>
            ))}
          </Stack>
        )}

        {/* --- Enhanced Error State --- */}
        {meterError && !meterLoading && (
          <Alert
            severity="error"
            variant="outlined"
            sx={{
              borderRadius: 3,
              borderWidth: 1,
              alignItems: "flex-start",
              "& .MuiAlert-icon": { mt: 0.5 },
            }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={refetchMeter}
                sx={{ fontWeight: 600, textTransform: "none" }}
              >
                Retry
              </Button>
            }
          >
            <Typography variant="body2" fontWeight={500}>
              {meterError?.message ||
                "Failed to fetch meter details. Please check the meter number."}
            </Typography>
          </Alert>
        )}

        {/* --- Meter Data Display --- */}
        {!meterLoading && !meterError && meter && (
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              // borderRadius: 3,
              bgcolor: 'whitesmoke',
              // borderColor: alpha(theme.palette.divider, 0.6),
              backdropFilter: "blur(2px)",
            }}
          >
            <Stack spacing={0.5}>
              <DetailRow
                icon={GridOnIcon}
                label="Meter Number"
                value={submittedNumber}
                chip
              />
              <DetailRow
                icon={PersonIcon}
                label="Meter Name"
                value={meter.name || "N/A"}
              />
              <DetailRow
                icon={ElectricBoltIcon}
                label="Type"
                value={meter.type === "prepaid" ? "Prepaid" : meter.type}
                chip
              />
              <DetailRow
                icon={AccountIcon}
                label="Provider"
                value={meter.provider_name || "N/A"}
              />
              <DetailRow
                icon={HomeIcon}
                label="Address"
                value={meter.address || "N/A"}
              />
              <DetailRow
                icon={AccountIcon}
                label="Account No."
                value={meter.account_number || "N/A"}
              />
            </Stack>
          </Paper>
        )}

        {/* --- Empty / Not Found State --- */}
        {!meterLoading && !meterError && !meter && (
          <Stack spacing={2} alignItems="center" py={5}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                bgcolor: alpha(theme.palette.warning.main, 0.08),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SearchOffIcon sx={{ fontSize: 48, color: "text.disabled" }} />
            </Box>
            <Typography variant="h6" fontWeight={600} color="text.primary">
              Meter Not Found
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Please verify the meter number and try again.
            </Typography>
          </Stack>
        )}
      </DialogContent>

      {/* ---------- Dialog Actions ---------- */}
      <DialogActions
        sx={{
          p: 3,
          pt: 0,
          gap: 1.5,
          borderTop: `1px solid ${theme.palette.divider}`,
          bgcolor: alpha(theme.palette.background.default, 0.4),
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          color="inherit"
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
        >
          Cancel
        </Button>
        <LoadingButton
          variant="contained"
          onClick={handleProceedToVerify}
          disabled={!meter || meterError}
          loading={meterLoading}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 700,
            px: 3,
            boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.25)}`,
            "&:hover": {
              boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.35)}`,
            },
          }}
        >
          Proceed to Buy
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default MeterDetailsDialog;
