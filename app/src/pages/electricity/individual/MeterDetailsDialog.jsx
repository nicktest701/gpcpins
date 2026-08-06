// MeterDetailsDialog.jsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Typography,
  IconButton,
  Box,
  alpha,
  useTheme,
  Button,
  Paper,
} from "@mui/material";
import {
  Close as CloseIcon,
  ElectricBolt,
  Person,
  Home,
  Receipt,
  AccountBalance,
} from "@mui/icons-material";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

// Reusable DetailRow (same as before)
const DetailRow = ({ label, value }) => {
  const theme = useTheme();
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.5}
      sx={{
        py: 0.5,
        borderBottom: `1px solid ${theme.palette.divider}`,
        "&:last-of-type": { borderBottom: "none" },
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ minWidth: 120, fontWeight: 500, fontSize: 12 }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        fontWeight="medium"
        sx={{ flex: 1, fontSize: 12 }}
      >
        {value || "N/A"}
      </Typography>
    </Stack>
  );
};

const MeterDetailsDialog = ({ open, onClose, meter }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  if (!meter) return null;

  const handleBuyPrepaid = () => {
    navigate(`/electricity/prepaid/${meter.number}/buy`, {
      state: {
        meterDetails: {
          number: meter.number,
          name: meter.name,
          address: meter.address,
          type: meter?.type,
          provider_name: meter?.provider_name,
        },
      },
    });

    onClose();
    // Optionally navigate to buy screen
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        elevation: 8,
        sx: {
          borderRadius: 4,
          overflow: "hidden",
          background: theme.palette.background.paper,
          boxShadow: `0 20px 60px ${alpha(theme.palette.common.black, 0.15)}`,
        },
      }}
    >
      <DialogTitle
        sx={{
          p: 3,
          pb: 1.5,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, ${alpha(
            theme.palette.secondary.main,
            0.04,
          )} 100%)`,
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
                width: 28,
                height: 28,
                borderRadius: "50%",
                bgcolor: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "common.white",
              }}
            >
              <ElectricBolt fontSize="small" />
            </Box>
            <Typography variant="h6" fontWeight="700" letterSpacing={-0.5}>
              {meter?.number || " Meter Details"}
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

      <DialogContent sx={{ p: 2, my: 1 }}>
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: "whitesmoke",
            // borderColor: alpha(theme.palette.divider, 0.6),
          }}
        >
          <Stack spacing={0.5}>
            <DetailRow
              icon={Receipt}
              label="Meter Number"
              value={meter.number}
            />
            <DetailRow icon={Person} label="Name" value={meter.name} />
            <DetailRow icon={ElectricBolt} label="Type" value={meter.type} />
            <DetailRow
              icon={AccountBalance}
              label="Provider"
              value={meter.provider_name}
            />
            <DetailRow icon={Home} label="Address" value={meter.address} />
            {meter.spn && (
              <DetailRow icon={Receipt} label="SPN" value={meter.spn} />
            )}
            <DetailRow
              icon={AccountBalance}
              label="Account Number"
              value={meter.account_number}
            />
          </Stack>
        </Paper>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          pt: 1,
          gap: 1.5,
          borderTop: `1px solid ${theme.palette.divider}`,
          bgcolor: alpha(theme.palette.background.default, 0.4),
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
           size="large"
          color="inherit"
          fullWidth
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
        >
          Close
        </Button>
        <Button
          variant="contained"
          fullWidth
          size="large"
          sx={{
            borderRadius: 2,
            textTransform: "none",
            // fontWeight: 700,
            boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.25)}`,
          }}
          onClick={handleBuyPrepaid}
        >
          Buy Units
        </Button>
      </DialogActions>
    </Dialog>
  );
};

MeterDetailsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  meter: PropTypes.object,
};

export default MeterDetailsDialog;
