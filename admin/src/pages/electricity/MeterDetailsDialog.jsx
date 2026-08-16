// components/dialogs/MeterDetailsDialog.jsx
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
  Chip,
  Divider,
  Button,
  Paper,
} from "@mui/material";
import { Close as CloseIcon, ElectricBolt, Person, Home, Receipt, AccountBalance } from "@mui/icons-material";
import PropTypes from "prop-types";

const DetailRow = ({ label, value }) => {
  const theme = useTheme();
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.5}
      sx={{
        py: 1,
        borderBottom: `1px solid ${theme.palette.divider}`,
        "&:last-of-type": { borderBottom: "none" },
      }}
    >
   
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120, fontWeight: 500 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight="medium" sx={{ flex: 1 }}>
        {value || "N/A"}
      </Typography>
    </Stack>
  );
};

const MeterDetailsDialog = ({ open, onClose, meter }) => {
  const theme = useTheme();
  if (!meter) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        elevation: 8,
        sx: {
          borderRadius: 1.2,
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
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, ${alpha(theme.palette.secondary.main, 0.04)} 100%)`,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 40,
                height: 40,
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

      <DialogContent sx={{ p: 3, py: 2.5,my:2 }}>
        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            borderRadius: 1.2,
            bgcolor: alpha(theme.palette.background.default, 0.6),
            borderColor: alpha(theme.palette.divider, 0.6),
          }}
        >
          <Stack spacing={0.5}>
            <DetailRow icon={Receipt} label="Meter Number" value={meter.number} />
            <DetailRow icon={Person} label="Name" value={meter.name} />
            <DetailRow icon={ElectricBolt} label="Type" value={meter.type} />
            <DetailRow icon={AccountBalance} label="Provider" value={meter.providerName} />
            <DetailRow icon={Home} label="Address" value={meter.address} />
            {meter.spn && <DetailRow icon={Receipt} label="SPN" value={meter.spn} />}
            <DetailRow icon={AccountBalance} label="Account Number" value={meter.account_number} />
            <DetailRow
              icon={ElectricBolt}
              label="Status"
              value={
                <Chip
                  label={meter.active ? "Active" : "Inactive"}
                  size="small"
                  color={meter.active ? "success" : "default"}
                  sx={{ fontWeight: 600 }}
                />
              }
            />
          </Stack>
        </Paper>
      </DialogContent>

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
          fullWidth
          sx={{ borderRadius: 1.2, textTransform: "none", fontWeight: 600 }}
        >
          Close
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