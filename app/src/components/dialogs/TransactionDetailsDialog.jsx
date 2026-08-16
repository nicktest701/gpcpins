// src/components/dialogs/TransactionDetailsDialog.jsx
import { Close, DownloadRounded } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
//  Grid,
Paper,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import moment from "moment";
import { currencyFormatter } from "../../constants";


const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

// Modernized row layouts for metadata blocks
const DetailItem = ({ label, value }) => (
  <Item>

  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
    <Typography variant="caption" color="text.secondary" fontWeight={600} letterSpacing="0.05em">
      {label.toUpperCase()}
    </Typography>
    <Typography variant="body2" color="text.primary" fontWeight={500}>
      {value || "—"}
    </Typography>
  </Box>
  </Item>
);

const TransactionDetailsDialog = ({ open, onClose, transaction }) => {
  if (!transaction) return null;

  // console.log(transaction)

  const isAirtime = transaction.domain === "Airtime";
  const isPrepaid = transaction.domain === "Prepaid";
  const isBundle = transaction.domain === "Bundle";
  const isVoucher = ["Voucher", "Ticket"].includes(transaction.domain);

  // High-end, soft chip color variants mapping
  const getStatusChip = () => {
    const status = transaction.status?.toLowerCase();
    
    const config = {
      completed: { label: "Completed", color: "success" },
      pending: { label: "Pending", color: "warning" },
      refunded: { label: "Refunded", color: "secondary" },
      failed: { label: "Failed", color: "error" },
    }[status] || { label: transaction.status || "Unknown", color: "default" };

    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
        variant="soft" // Standard theme mapping for semi-transparent chip styles
        sx={{
          fontWeight: 700,
          fontSize: "0.75rem",
          borderRadius: 1.5,
          px: 0.5,
          ...(config.color !== "default" && {
            bgcolor: `${config.color}.lighter`,
            color: `${config.color}.dark`,
          }),
        }}
      />
    );
  };

  // Safe JSON extraction for recipient structures
  const renderAirtimeRecipients = () => {
    if (transaction.kind !== "bulk") return transaction.recipient;
    try {
      const parsed = JSON.parse(transaction.recipient || "[]");
      return (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
          {parsed.map((r, idx) => (
            <Chip
              key={idx}
              label={`${r.recipient} (${currencyFormatter(r.price)})`}
              variant="outlined"
              size="small"
              sx={{ borderColor: "grey.200", fontSize: "0.75rem" }}
            />
          ))}
        </Stack>
      );
    } catch {
      return transaction.recipient;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          boxShadow: "0px 16px 48px rgba(0, 0, 0, 0.08)",
        },
      }}
    >
      {/* Dialog Header */}
      <DialogTitle sx={{ p: 3, pb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" fontWeight={700} color="text.primary">
          Transaction Details
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: "text.secondary" }}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* Dialog Content Elements */}
      <DialogContent sx={{ px: 3, py: 1 }}>
        <Stack spacing={2}>
          
          {/* Main Transaction Highlight Section */}
          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: "grey.50",
              border: "1px solid",
              borderColor: "grey.100",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600} letterSpacing="0.05em">
                TOTAL AMOUNT
              </Typography>
              <Typography variant="h4" fontWeight={800} color="primary.main" sx={{ mt: 0.5 }}>
                {currencyFormatter(transaction.amount)}
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" alignItems="flex-end" gap={0.5}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                STATUS
              </Typography>
              {getStatusChip()}
            </Box>
          </Box>

          {/* Dynamic / Conditional Service Sections */}
          {(isAirtime || isPrepaid || isBundle || isVoucher) && (
            <Box sx={{  borderRadius: 3, border: "1px solid", borderColor: "grey.100" }}>
              <Grid container spacing={2}>
                {isAirtime && (
                  <>
                    <Grid xs={12}>
                      <DetailItem label="Airtime Architecture Type" value={transaction.kind} />
                    </Grid>
                    <Grid xs={12}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} letterSpacing="0.05em" display="block">
                        RECIPIENT(S)
                      </Typography>
                      {renderAirtimeRecipients()}
                    </Grid>
                  </>
                )}

                {isPrepaid && (
                  <Grid xs={12}>
                    <DetailItem label="Utility Meter Number" value={transaction.meter||transaction.meterId} />
                  </Grid>
                )}

                {isBundle && (
                  <>
                    <Grid size={6}>
                      <DetailItem label="Bundle Tier" value={transaction.kind} />
                    </Grid>
                    <Grid size={6}>
                      <DetailItem label="Allocated Volume" value={transaction.volume} />
                    </Grid>
                  </>
                )}

                {isVoucher && (
                  <Grid xs={12}>
                    <DetailItem label="Pass / Ticket Category" value={transaction.voucherType} />
                  </Grid>
                )}
              </Grid>
            </Box>
          )}

          {/* Core Audit Details Area */}
          <Box sx={{ px: 1 }}>
            <Grid container spacing={2.5}>
              <Grid xs={12} sm={6}>
                <DetailItem label="Transaction ID" value={transaction.id} />
              </Grid>
              <Grid xs={12} sm={6}>
                <DetailItem label="Processing Gateway" value={transaction.mode} />
              </Grid>
              <Grid xs={12} sm={6}>
                <DetailItem label="Timestamp Date" value={moment(transaction.createdAt).format("LLL")} />
              </Grid>
              <Grid xs={12} sm={6}>
                <DetailItem label="Platform Service" value={transaction.domain} />
              </Grid>
              <Grid xs={12} sm={6}>
                <DetailItem label="Client Email Address" value={transaction.email} />
              </Grid>
              <Grid xs={12} sm={6}>
                <DetailItem label="Contact Telephone" value={transaction.phonenumber} />
              </Grid>
            </Grid>
          </Box>
          
        </Stack>
      </DialogContent>

      {/* Dialog Footer Actions */}
      <DialogActions sx={{ p: 3, pt: 2, justifyContent: "space-between" }}>
        <Box>
          {transaction.downloadLink && (
            <Button
              component="a"
              href={transaction.downloadLink}
              target="_blank"
              rel="noopener noreferrer"
              variant="text"
              color="primary"
              size="small"
              startIcon={<DownloadRounded />}
              sx={{ fontWeight: 600, textTransform: "none" }}
            >
              Download PDF Receipt
            </Button>
          )}
        </Box>
        <Button
          onClick={onClose}
          variant="contained"
          color="inherit"
          disableElevation
          sx={{
            px: 3,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            bgcolor: "grey.100",
            color: "text.primary",
            "&:hover": { bgcolor: "grey.200" },
          }}
        >
          Close Panel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransactionDetailsDialog;
