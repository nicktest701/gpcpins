import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Stack,
  Typography,
  Button,
  TextField,
  Box,
  Chip,
  Divider,
  Paper,
  Alert,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  FormHelperText,
  useTheme,
  alpha,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  CheckCircle,
  Cancel,
  Receipt,
  Person,
  Phone,
  AttachMoney,
  AssignmentTurnedIn,
  Pending,
  WarningAmberRounded,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import { useCustomContext } from "../../context/providers/CustomProvider";
import CustomDialogTitle from "../../components/dialogs/CustomDialogTitle";
import { completeBulkAirtimePayment } from "../../api/paymentAPI";
import { globalAlertType } from "../../components/alert/alertType";
import { currencyFormatter } from "../../constants";

const STATUS_META = {
  pending: { label: "Pending", color: "warning", Icon: Pending },
  completed: { label: "Completed", color: "success", Icon: CheckCircle },
  failed: { label: "Failed", color: "error", Icon: Cancel },
};

const ProcessAirtimeTransaction = () => {
  const theme = useTheme();
  const [requestID, setRequestID] = useState("");
  const [requestIDErr, setRequestIDErr] = useState("");
  const [status, setStatus] = useState("pending");
  const [statusErr, setStatusErr] = useState("");
  const queryClient = useQueryClient();
  const {
    customState: { ecgTransactionInfoEdit: airtimeData },
    customDispatch,
  } = useCustomContext();

  // Set initial values when data changes
  useEffect(() => {
    if (airtimeData?.details) {
      const { orderId } = airtimeData.details;
      setRequestID(orderId || "");
      setStatus(airtimeData.details?.processingStatus || "pending");
    }
  }, [airtimeData]);

  // Warn before leaving if dialog is open
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const confirmationMessage = "Are you sure you want to leave?";
      e.returnValue = confirmationMessage;
      return confirmationMessage;
    };

    if (airtimeData.open) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [airtimeData.open]);

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: completeBulkAirtimePayment,
    onSuccess: () => {
      queryClient.invalidateQueries(["bulk-airtime-transactions"]);
      queryClient.invalidateQueries(["top-up-balance"]);
      customDispatch(
        globalAlertType("success", "Transaction processed successfully!"),
      );
      handleClose();
    },
    onError: (error) => {
      customDispatch(globalAlertType("error", error));
    },
  });

  const handleSubmit = () => {
    setRequestIDErr("");
    setStatusErr("");

    if (!requestID.trim()) {
      setRequestIDErr("Order ID is required");
      return;
    }

    if (!status || status === "pending") {
      setStatusErr("Select Completed or Failed to continue");
      return;
    }

    const isProcessed = airtimeData?.details?.isProcessed;

    const confirmText = isProcessed
      ? `You are about to reprocess this transaction as "${status}". Are you sure?`
      : `Proceed with marking this transaction as "${status}"? This action cannot be undone.`;

    Swal.fire({
      title: isProcessed ? "Reprocess Transaction" : "Process Transaction",
      text: confirmText,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: isProcessed ? "Yes, reprocess" : "Yes, process",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        const payload = {
          id: airtimeData.details.paymentId,
          orderId: requestID.trim(),
          status,
        };
        mutateAsync(payload);
      }
    });
  };

  const handleClose = () => {
    customDispatch({
      type: "viewEcgTransactionInfoEdit",
      payload: { open: false, details: {} },
    });
  };

  if (!airtimeData.open) return null;

  const { details } = airtimeData;
  const isProcessed = details?.isProcessed;
  const recipients = details?.recipient || [];
  const recipientsTotal = recipients.reduce(
    (sum, r) => sum + (Number(r.price) || 0),
    0,
  );
  const amountMismatch =
    details?.amount != null &&
    Math.abs(recipientsTotal - Number(details.amount)) > 0.01;

  const statusMeta = STATUS_META[status] || STATUS_META.pending;

  return (
    <Dialog
      open={airtimeData.open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 },
      }}
    >
      <CustomDialogTitle
        title="Process Airtime Transaction"
        subtitle="Review, confirm, and update transaction status"
        onClose={handleClose}
      />

      <DialogContent dividers>
        <Stack spacing={3}>
          {isProcessed && (
            <Alert severity="warning" icon={<WarningAmberRounded />}>
              This transaction has already been processed. Submitting again
              will overwrite its current status.
            </Alert>
          )}

          {/* Transaction Summary Card */}
          <Paper
            variant="outlined"
            sx={{ p: 2, borderRadius: 2, bgcolor: "background.default" }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Receipt color="primary" fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    Transaction ID:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {details?.id || "—"}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <AssignmentTurnedIn color="primary" fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    Order ID:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {details?.orderId || "—"}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <AttachMoney color="secondary" fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    Amount:
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    color="secondary.main"
                  >
                    {currencyFormatter(details?.amount)}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Current Status:
                  </Typography>
                  <Chip
                    label={statusMeta.label}
                    color={statusMeta.color}
                    size="small"
                    icon={<statusMeta.Icon />}
                  />
                </Stack>
              </Grid>
            </Grid>

            {isProcessed && (
              <>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Person fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Completed by:
                      </Typography>
                      <Typography variant="body2">
                        {details?.issuer || "N/A"}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="body2" color="text.secondary">
                        Completed on:
                      </Typography>
                      <Typography variant="body2">
                        {details?.updatedAt
                          ? moment(details.updatedAt).format("LLL")
                          : "N/A"}
                      </Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </>
            )}
          </Paper>

          {/* Recipients List */}
          <Box>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                Recipients ({recipients.length})
              </Typography>
              {amountMismatch && (
                <Chip
                  size="small"
                  color="warning"
                  variant="outlined"
                  label="Recipients total doesn't match amount"
                />
              )}
            </Stack>
            <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
              {recipients.length === 0 ? (
                <Box sx={{ py: 4, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    No recipients found for this transaction.
                  </Typography>
                </Box>
              ) : (
                <>
                  <Box sx={{ maxHeight: 300, overflow: "auto" }}>
                    {recipients.map((item) => (
                      <Stack
                        key={item.id}
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{
                          py: 1.5,
                          px: 2,
                          borderBottom: "1px solid",
                          borderColor: "divider",
                          "&:last-child": { borderBottom: "none" },
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={2}
                          alignItems="center"
                          sx={{ flex: 1, minWidth: 0 }}
                        >
                          <Phone color="action" fontSize="small" />
                          <Typography variant="body2" sx={{ minWidth: 100 }}>
                            {item.type}
                          </Typography>
                          <Typography variant="body2" fontWeight="medium" noWrap>
                            {item.recipient}
                          </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            color="secondary.main"
                          >
                            {currencyFormatter(item.price)}
                          </Typography>
                        </Stack>
                      </Stack>
                    ))}
                  </Box>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                      py: 1,
                      px: 2,
                      bgcolor: alpha(theme.palette.text.primary, 0.03),
                      borderTop: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Recipients total
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {currencyFormatter(recipientsTotal)}
                    </Typography>
                  </Stack>
                </>
              )}
            </Paper>
          </Box>

          {/* Order ID Input */}
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Order ID
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Enter order ID"
              value={requestID}
              onChange={(e) => {
                setRequestID(e.target.value);
                if (requestIDErr) setRequestIDErr("");
              }}
              error={!!requestIDErr}
              helperText={
                requestIDErr ||
                (isProcessed ? "Locked — this transaction is already processed" : " ")
              }
              InputProps={{
                readOnly: isProcessed,
                sx: isProcessed ? { bgcolor: "action.hover" } : {},
              }}
            />
          </Box>

          {/* Status Selection */}
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Set Transaction Status
            </Typography>
            <ToggleButtonGroup
              exclusive
              fullWidth
              value={status === "pending" ? null : status}
              onChange={(e, value) => {
                if (!value) return;
                setStatus(value);
                if (statusErr) setStatusErr("");
              }}
              disabled={isLoading}
            >
              <ToggleButton
                value="completed"
                sx={{
                  textTransform: "none",
                  gap: 1,
                  py: 1.25,
                  "&.Mui-selected": {
                    bgcolor: alpha(theme.palette.success.main, 0.12),
                    color: theme.palette.success.dark,
                    borderColor: theme.palette.success.main,
                    "&:hover": {
                      bgcolor: alpha(theme.palette.success.main, 0.18),
                    },
                  },
                }}
              >
                <CheckCircle fontSize="small" />
                Mark Completed
              </ToggleButton>
              <ToggleButton
                value="failed"
                sx={{
                  textTransform: "none",
                  gap: 1,
                  py: 1.25,
                  "&.Mui-selected": {
                    bgcolor: alpha(theme.palette.error.main, 0.12),
                    color: theme.palette.error.dark,
                    borderColor: theme.palette.error.main,
                    "&:hover": {
                      bgcolor: alpha(theme.palette.error.main, 0.18),
                    },
                  },
                }}
              >
                <Cancel fontSize="small" />
                Mark Failed
              </ToggleButton>
            </ToggleButtonGroup>
            {statusErr && <FormHelperText error>{statusErr}</FormHelperText>}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
        <LoadingButton
          loading={isLoading}
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={!requestID.trim() || status === "pending" || isLoading}
        >
          {isProcessed ? "Reprocess Transaction" : "Process Transaction"}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default ProcessAirtimeTransaction;