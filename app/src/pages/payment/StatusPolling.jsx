import React from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  LinearProgress,
  alpha,
  useTheme,
  Fade,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  Refresh,
  ArrowForward,
  ContentCopy,
  ReceiptLong,
  Check,
  PhoneAndroid,
  AccountBalanceWallet,
} from "@mui/icons-material";
import { globalAlertType } from "@/components/alert/alertType";
import { useCustomContext } from "../../context/providers/CustomProvider";
import { useStatusPolling } from "../../hooks/useStatusPolling";
import MomoGuide from "../../components/momo-guide";
import { useNavigate } from "react-router-dom";

/**
 * Builds the status -> presentation map.
 * "idle" and "pending" are intentionally the same entry so a first-render
 * edge case never flashes a different UI than the normal waiting state.
 */
const getStatusConfig = (isWallet) => {
  const waitingIcon = isWallet ? (
    <AccountBalanceWallet sx={{ fontSize: 56 }} />
  ) : (
    <PhoneAndroid sx={{ fontSize: 56 }} />
  );

  const waiting = {
    icon: waitingIcon,
    label: isWallet ? "Processing your payment" : "Confirm on your phone",
    progressColor: isWallet ? "primary" : "warning",
  };

  return {
    idle: waiting,
    pending: waiting,
    processing: {
      icon: waitingIcon,
      label: isWallet ? "Finalizing your payment" : "Confirm on your phone",
      progressColor: "info",
    },
    success: {
      icon: <CheckCircle sx={{ fontSize: 56, color: "success.main" }} />,
      label: "Payment Completed!",
      progressColor: "success",
    },
    failed: {
      icon: <Cancel sx={{ fontSize: 56, color: "error.main" }} />,
      label: "Payment Failed",
      progressColor: "error",
    },
    timeout: {
      icon: <Cancel sx={{ fontSize: 56, color: "warning.main" }} />,
      label: "Payment Timeout",
      progressColor: "warning",
    },
  };
};

const WORKING_STATUSES = new Set(["idle", "pending", "processing"]);

/**
 * Generic payment-polling / real-time-confirmation screen.
 *
 * Not tied to any one payment type — pass `checkStatusFn` for the specific
 * API you're polling (prepaid electricity, wallet top-up, bill payment,
 * etc.), and it'll also pick up live confirmations from your socket
 * provider automatically via `useCustomContext()`.
 *
 * @param {object} props
 * @param {string} props.paymentId
 * @param {string} [props.transactionId]
 * @param {() => void} [props.onClose]
 * @param {number} [props.interval]
 * @param {number} [props.maxAttempts]
 * @param {boolean} [props.isWallet] Renders wallet-specific copy/icon and skips the MoMo prompt guide.
 * @param {(paymentId:string, transactionId?:string) => Promise<{status:string}>} props.checkStatusFn
 *   Required. The API call used to poll status for this specific payment type.
 * @param {string} [props.successMessage] Toast message shown on success.
 * @param {(data:any) => void} [props.onSuccess] Extra success callback (fires after the built-in toast).
 * @param {(data:any) => void} [props.onFailure] Extra failure callback.
 * @param {(payload:any, ids:{paymentId:string, transactionId?:string}) => boolean} [props.matchSocketStatus]
 *   Override how an inbound socket payload is matched to this payment (see hook docs).
 */
const StatusPolling = ({
  paymentId,
  transactionId,
  onClose,
  interval = 3000,
  maxAttempts = 15,
  isWallet = false,
  checkStatusFn,
  successMessage = "Payment completed successfully!",
  onSuccess,
  onFailure,
  matchSocketStatus,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { customDispatch, paymentStatus, resetPaymentStatus } =
    useCustomContext();
  const [copied, setCopied] = React.useState(false);

  //   if (process.env.NODE_ENV !== "production" && typeof checkStatusFn !== "function") {
  //     // eslint-disable-next-line no-console
  //     console.error("<StatusPolling>: `checkStatusFn` prop is required.");
  //   }

  const handlePollSuccess = (data) => {
    customDispatch(globalAlertType("success", successMessage));
    onSuccess?.(data);
  };

  const handlePollFailure = (data) => {
    onFailure?.(data);
  };

  const handlePollTimeout = () => {
    customDispatch(
      globalAlertType(
        "warning",
        "Transaction is processing slow. Please verify your transaction history later.",
      ),
    );
    onClose?.();
  };

  const { status, attempts, error, retry, rawData } = useStatusPolling({
    paymentId,
    transactionId,
    checkStatusFn,
    interval,
    maxAttempts,
    onSuccess: handlePollSuccess,
    onFailure: handlePollFailure,
    onTimeout: handlePollTimeout,
    // Live confirmations pushed over the socket short-circuit polling the
    // moment they arrive, instead of waiting for the next scheduled tick.
    socketStatus: paymentStatus,
    resetSocketStatus: resetPaymentStatus,
    matchSocketStatus,
  });

  const statusConfig = React.useMemo(
    () => getStatusConfig(isWallet),
    [isWallet],
  );
  const config = statusConfig[status] || statusConfig.pending;
  const isWorking = WORKING_STATUSES.has(status);

  const calculatedProgress = Math.min(
    Math.round((attempts / maxAttempts) * 100),
    95,
  );

  const receiptDetails = rawData?.paymentResponseDetails;
  const token = receiptDetails?.rechargeToken;

  const handleCopyToken = async () => {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      customDispatch(
        globalAlertType(
          "error",
          "Couldn't copy token — please copy it manually.",
        ),
      );
    }
  };

  return (
    <Fade in timeout={400}>
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: theme.zIndex.modal,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: alpha(theme.palette.background.default, 0.96),
          backdropFilter: "blur(16px)",
          p: 2,
        }}
      >
        <Paper
          elevation={0}
          role="status"
          aria-live="polite"
          sx={{
            p: 2.5,
            width: "100%",
            maxWidth: 380,
            borderRadius: 1.2,
            textAlign: "center",
            background: theme.palette.background.paper,
            boxShadow: `0 24px 64px ${alpha(theme.palette.common.black, 0.12)}`,
            maxHeight: "92vh",
            overflowY: "auto",
          }}
        >
          {/* Header Status Ring */}
          <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: "50%",
                bgcolor: alpha(
                  theme.palette[config.progressColor]?.main ||
                    theme.palette.primary.main,
                  0.08,
                ),
                color: theme.palette[config.progressColor]?.main,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: isWorking ? "pulse 2s infinite ease-in-out" : "none",
                "@keyframes pulse": {
                  "0%": {
                    transform: "scale(0.96)",
                    boxShadow: "0 0 0 0 rgba(237, 108, 2, 0.2)",
                  },
                  "70%": {
                    transform: "scale(1)",
                    boxShadow: "0 0 0 12px rgba(237, 108, 2, 0)",
                  },
                  "100%": {
                    transform: "scale(0.96)",
                    boxShadow: "0 0 0 0 rgba(237, 108, 2, 0)",
                  },
                },
              }}
            >
              {config.icon}
            </Box>
          </Box>

          <Typography
            variant="h5"
            fontWeight="700"
            sx={{ mb: status === "success" ? 1 : 2, letterSpacing: "-0.5px" }}
          >
            {config.label}
          </Typography>

          {/* Success State: Receipt Display */}
          {status === "success" && receiptDetails && (
            <Fade in timeout={500}>
              <Box sx={{ mt: 2, textAlign: "left" }}>
                {token && (
                  <Box
                    sx={{
                      p: 1,
                      bgcolor: alpha(theme.palette.success.main, 0.06),
                      borderRadius: 1.2,
                      border: `1px dashed ${theme.palette.success.main}`,
                      textAlign: "center",
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight="600"
                      sx={{ textTransform: "uppercase", letterSpacing: "1px" }}
                    >
                      Meter Recharge Token
                    </Typography>

                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="center"
                      spacing={1}
                      sx={{ mt: 1 }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight="800"
                        color="success.dark"
                        sx={{ letterSpacing: "2px", fontFamily: "monospace" }}
                      >
                        {token.replace(/(.{4})/g, "$1 ").trim()}
                      </Typography>
                      <Tooltip title={copied ? "Copied!" : "Copy Token"}>
                        <IconButton
                          onClick={handleCopyToken}
                          color="success"
                          size="small"
                          aria-label="Copy recharge token"
                        >
                          {copied ? (
                            <Check fontSize="small" />
                          ) : (
                            <ContentCopy fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>
                )}

                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  fontWeight="700"
                  sx={{ mb: 1, px: 0.5 }}
                >
                  Transaction Overview
                </Typography>

                <Paper
                  variant="outlined"
                  sx={{
                    p: 1,
                    borderRadius: 1.2,
                    bgcolor: alpha(theme.palette.background.default, 0.4),
                    mb: 3,
                  }}
                >
                  <Stack spacing={1}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      spacing={3}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Receipt Number
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight="600"
                        color="text.primary"
                      >
                        {receiptDetails.reciept}
                      </Typography>
                    </Stack>

                    <Divider sx={{ borderStyle: "dashed" }} />

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      spacing={5.5}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Paid Amount
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight="700"
                        color="text.primary"
                      >
                        {new Intl.NumberFormat("en-GH", {
                          style: "currency",
                          currency: "GHS",
                        }).format(receiptDetails.amount)}
                      </Typography>
                    </Stack>

                    {isWallet && (
                      <>
                        <Divider sx={{ borderStyle: "dashed" }} />
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          spacing={3}
                        >
                          <Typography variant="body2" color="text.secondary">
                            Paid From
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight="600"
                            color="text.primary"
                          >
                            Wallet Balance
                          </Typography>
                        </Stack>
                      </>
                    )}
                  </Stack>
                </Paper>

                {receiptDetails.receiptUrl && (
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<ReceiptLong />}
                    fullWidth
                    href={receiptDetails.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      borderRadius: 1.2,
                      textTransform: "none",
                      fontWeight: 600,
                      mb: 2,
                    }}
                  >
                    Download Receipt
                  </Button>
                )}
              </Box>
            </Fade>
          )}

          {/* Error / Timeout messages */}
          {status === "failed" && error && (
            <Typography variant="body2" color="error" sx={{ mb: 2.5, px: 1 }}>
              {error}
            </Typography>
          )}

          {status === "timeout" && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2.5, px: 1 }}
            >
              {isWallet
                ? "This is taking longer than expected. Please check your wallet transaction history in a few minutes."
                : "The transaction is taking longer than expected. Please verify your bank/wallet balances or check back in a few minutes."}
            </Typography>
          )}

          {/* Progress Bar */}
          {isWorking && (
            <Box sx={{ width: "100%", my: 3.5 }}>
              <LinearProgress
                variant={
                  status === "processing" ? "indeterminate" : "determinate"
                }
                value={status === "processing" ? undefined : calculatedProgress}
                color={config.progressColor}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          )}

          {/* Waiting-state guidance — different copy/UI for wallet vs MoMo */}
          {isWorking && (
            <>
              <Box
                sx={{
                  width: "100%",
                  bgcolor: alpha(
                    theme.palette[config.progressColor]?.main ||
                      theme.palette.primary.main,
                    0.08,
                  ),
                  borderRadius: "14px",
                  p: "16px 18px",
                  boxSizing: "border-box",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    textAlign: "center",
                    fontWeight: 500,
                  }}
                >
                  {isWallet
                    ? "We're confirming your payment from your wallet balance. This usually only takes a few seconds — no action is needed from you."
                    : "A prompt has been sent to your mobile phone. Enter your Mobile Money PIN to complete the payment."}
                </Typography>
              </Box>
              {!isWallet && <MomoGuide mobilePartner="mtn-gh" />}
            </>
          )}

          {/* Action Buttons */}
          {(status === "failed" || status === "timeout") && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<Refresh />}
              onClick={retry}
              fullWidth
              sx={{
                borderRadius: 1.2,
                textTransform: "none",
                fontWeight: 600,
                mb: 2,
              }}
            >
              Retry Check
            </Button>
          )}

          {status === "success" && (
            <Button
              variant="contained"
              color="primary"
              endIcon={<ArrowForward />}
              fullWidth
              sx={{
                borderRadius: 1.2,
                textTransform: "none",
                fontWeight: 600,
                mb: 2,
                color: "#fff",
              }}
              onClick={() => {
                onClose?.();
                navigate("/electricity");
              }}
            >
              Continue
            </Button>
          )}
        </Paper>
      </Box>
    </Fade>
  );
};

export default StatusPolling;
