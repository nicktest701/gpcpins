import { useEffect, useRef, useState } from "react";
import { IMAGES } from "../constants";
import { CustomContext } from "../context/providers/CustomProvider";
import { useContext } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CancelPayment, ConfirmPayment } from "../api/paymentAPI";
import { globalAlertType } from "../components/alert/alertType";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import GlobalSpinner from "../components/GlobalSpinner";
import MomoGuide from "../components/momo-guide";
import { useSocket } from "../context/providers/SocketProvider";
import { Container, Paper } from "@material-ui/core";
import { Alert, Typography } from "@mui/material";

/* ─── Inline styles ─────────────────────────────────────────────────── */
const S = {
  root: {
    minHeight: "100svh",
    display: "flex",
    flexDirection: "column",
    background:
      "linear-gradient(160deg, #f0f4ff 0%, #fafafa 60%, #f5f0ff 100%)",
    fontFamily: "'Outfit', 'Segoe UI', sans-serif",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 20px",
    gap: "0px",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "#ffffff",
    borderRadius: "24px",
    boxShadow: "0 4px 40px rgba(80,60,180,0.10), 0 1px 4px rgba(0,0,0,0.04)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  cardHeader: {
    width: "100%",
    background: "linear-gradient(135deg, #fabb7f 0%, #F78E2A 100%)",
    padding: "28px 24px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    position: "relative",
    overflow: "hidden",
  },
  headerDecor: {
    position: "absolute",
    top: "-30px",
    right: "-30px",
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.07)",
    pointerEvents: "none",
  },
  headerDecor2: {
    position: "absolute",
    bottom: "-40px",
    left: "-20px",
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.05)",
    pointerEvents: "none",
  },
  cardTitle: {
    margin: 0,
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: 500,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    opacity: 0.8,
  },
  cardAmount: {
    margin: 0,
    color: "#ffffff",
    fontSize: "32px",
    fontWeight: 700,
    letterSpacing: "-0.5px",
  },
  cardBody: {
    width: "100%",
    padding: "28px 28px 24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
    boxSizing: "border-box",
  },
  /* Pulse ring + image */
  imageWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100px",
    height: "100px",
    marginBottom: "4px",
  },
  pulseRing: {
    position: "absolute",
    inset: 0,
    borderRadius: "50%",
    border: "2.5px solid #fabb7f",
    animation: "pulse-ring 2s ease-out infinite",
    opacity: 0.6,
  },
  pulseRing2: {
    position: "absolute",
    inset: "-12px",
    borderRadius: "50%",
    border: "2px solid #fabb7f",
    animation: "pulse-ring 2s ease-out infinite 0.6s",
    opacity: 0.35,
  },
  pendingImg: {
    width: "100px",
    height: "100px",
    objectFit: "contain",
    animation: "gentle-bob 3s ease-in-out infinite",
    position: "relative",
    zIndex: 1,
    marginTop: "18px",
    marginLeft: "36px",
  },
  /* Status badge */
  statusBadge: (type) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 14px",
    borderRadius: "100px",
    fontSize: "13px",
    fontWeight: 600,
    background:
      type === "waiting"
        ? "#FFE16A"
        : type === "success"
          ? "#dcfce7"
          : "#fee2e2",
    color:
      type === "waiting"
        ? "#7A4F01"
        : type === "success"
          ? "#15803d"
          : "#b91c1c",
  }),
  dot: (type) => ({
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background:
      type === "waiting"
        ? "#F78E2A"
        : type === "success"
          ? "#16a34a"
          : "#dc2626",
    animation: type === "waiting" ? "blink 1.4s ease-in-out infinite" : "none",
  }),
  /* Instruction box */
  infoBox: {
    width: "100%",
    // background: "#f5f3ff",
    borderRadius: "14px",
    padding: "16px 18px",
    boxSizing: "border-box",
  },
  infoBoxTitle: {
    margin: "0 0 10px",
    fontSize: "13px",
    fontWeight: 700,
    // color: "#5b21b6",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  stepRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    marginBottom: "10px",
  },
  stepNum: {
    minWidth: "22px",
    height: "22px",
    borderRadius: "50%",
    background: "#F78E2A",
    color: "#fff",
    fontSize: "11px",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "1px",
    flexShrink: 0,
  },
  stepText: {
    fontSize: "13px",
    // color: "#4c1d95",
    lineHeight: 1.5,
    margin: 0,
  },
  highlight: {
    color: "#F78E2A",
    fontWeight: 700,
  },
  /* Spinner row */
  spinnerRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  spinnerLabel: {
    fontSize: "13px",
    color: "#6b7280",
    fontWeight: 500,
  },
  /* Buttons */
  btnCancel: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "1.5px solid #e9d5ff",
    background: "transparent",
    color: "#F78E2A",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.18s, transform 0.12s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  btnGoBack: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #4f46e5 0%, #F78E2A 100%)",
    color: "#fff",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "opacity 0.18s, transform 0.12s",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  /* Error state */
  errorHeading: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 700,
    color: "#b91c1c",
    textAlign: "center",
  },
  errorSubtext: {
    margin: 0,
    fontSize: "13px",
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 1.6,
  },
  reasonTag: {
    display: "inline",
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: "4px",
    padding: "1px 6px",
    fontWeight: 600,
    fontSize: "12px",
  },
  /* Success */
  successHeading: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 700,
    color: "#15803d",
    textAlign: "center",
  },
  divider: {
    width: "100%",
    height: "1px",
    background: "#f3f4f6",
    margin: "2px 0",
  },
  /* Footer */
  footer: {
    textAlign: "center",
    padding: "16px 20px",
    fontSize: "12px",
    color: "#9ca3af",
  },
};

/* ─── Mini spinner ───────────────────────────────────────────────────── */
function Spinner({ size = 20, color = "#F78E2A" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ animation: "spin 0.9s linear infinite", flexShrink: 0 }}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke={color}
        strokeOpacity="0.2"
        strokeWidth="3"
      />
      <path
        d="M12 3a9 9 0 0 1 9 9"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ─── Keyframes injection ────────────────────────────────────────────── */
const KEYFRAMES = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
@keyframes pulse-ring {
  0%   { transform: scale(1);   opacity: 0.6; }
  70%  { transform: scale(1.5); opacity: 0; }
  100% { transform: scale(1.5); opacity: 0; }
}
@keyframes gentle-bob {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-6px); }
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.2; }
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.payment-card { animation: fade-in 0.4s ease both; }
button:active { transform: scale(0.97) !important; }
`;

/* ─── Component ──────────────────────────────────────────────────────── */
function PaymentStatus() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { pathname, state } = useLocation();
  const { customDispatch } = useContext(CustomContext);
  const [cancelHover, setCancelHover] = useState(false);
  const styleRef = useRef(null);

  const [status, setStatus] = useState("pending");
  const [message, setMessage] = useState("Waiting for payment confirmation...");
  const [transaction, setTransaction] = useState(null);

  const txRef = state?.id || null;

  const { connected, joinPaymentRoom, leavePaymentRoom, onEvent, offEvent } =
    useSocket();

  // Redirect if no state (safety)
  useEffect(() => {
    if (!state?.id || !state?.categoryType) {
      navigate("/", { replace: true });
    }
  }, [state, navigate]);

  /* Inject keyframes once */
  useEffect(() => {
    if (!styleRef.current) {
      const el = document.createElement("style");
      el.textContent = KEYFRAMES;
      document.head.appendChild(el);
      styleRef.current = el;
    }
    return () => {
      if (styleRef.current) {
        document.head.removeChild(styleRef.current);
        styleRef.current = null;
      }
    };
  }, []);

  /* Block accidental navigation */
  useEffect(() => {
    const handler = (e) => {
      const msg = "Are you sure you want to leave?";
      e.returnValue = msg;
      return msg;
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  /*
  |--------------------------------------------------------------------------
  | JOIN PAYMENT ROOM
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!txRef) return;

    joinPaymentRoom(txRef);

    return () => {
      leavePaymentRoom(txRef);
    };
  }, [txRef]);

  /*
  |--------------------------------------------------------------------------
  | SOCKET SUCCESS LISTENER
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const handleSuccess = (payload) => {
      console.log("Payment Success:", payload);
      handlePaymentSuccess(payload);
    };

    onEvent("payment-success", handleSuccess);

    return () => {
      offEvent("payment-success", handleSuccess);
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | SOCKET FAILED LISTENER
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const handleFailed = (payload) => {
      console.log("Payment Failed:", payload);

      setStatus("failed");
      setMessage(payload.reason || "Payment failed.");
    };

    onEvent("payment-failed", handleFailed);

    return () => {
      offEvent("payment-failed", handleFailed);
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | FALLBACK POLLING WITH REACT QUERY
  |--------------------------------------------------------------------------
  */

  /* Polling query */
  const confirmPayment = useQuery({
    queryKey: ["confirm-payment", state?.id],
    queryFn: () => ConfirmPayment({ id: state?.id, type: state?.categoryType }),

    enabled: !!state?.id && !!state?.categoryType,
    refetchInterval: 15000,
    refetchIntervalInBackground: false,
    retry: 3,
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      if (data?.status === "completed") {
        handlePaymentSuccess(data);
      }

      if (data.status === "failed") {
        setStatus("failed");
        setMessage(data.message || "Payment failed.");
      }
    },
  });

  /* Confirm mutation */
  // const { mutateAsync, isLoading } = useMutation({
  //   mutationFn: ConfirmPayment,
  //   retry: false,
  //   onError: () =>
  //     customDispatch(globalAlertType("error", "Error confirming payment")),
  // });

  // const handleConfirmPayment = () => {
  //   mutateAsync(
  //     { id: state?.id, type: state?.categoryType, confirm: true },
  //     {
  //       onSuccess: (data) => {
  //         if (!data?.id) return;
  //         if (state?.isWallet) queryClient.getQueryData(["wallet-balance"]);
  //         customDispatch(globalAlertType("info", "Transaction Confirmed!"));
  //         const walletTypes = ["airtime", "prepaid", "bundle", "wallet"];
  //         if (walletTypes.includes(state?.categoryType)) {
  //           navigate("/payment/success", {
  //             replace: true,
  //             state: { path: state?.path },
  //           });
  //         } else {
  //           customDispatch({ type: "loadVouchers", payload: data });
  //           navigate("/checkout", {
  //             replace: true,
  //             state: {
  //               transactionId: data?.id,
  //               categoryType: data?.info?.categoryType,
  //               path: state?.path,
  //             },
  //           });
  //         }
  //       },
  //       onError: (err) => customDispatch(globalAlertType("error", err)),
  //     },
  //   );
  // };

  /* Cancel mutation */
  // const { mutateAsync: cancelMutate, isLoading: cancelLoading } = useMutation({
  //   mutationFn: CancelPayment,
  // });

  // const handleCancelPayment = () => {
  //   Swal.fire({
  //     title: "Cancel Payment?",
  //     text: "This action cannot be undone.",
  //     icon: "warning",
  //     showCancelButton: true,
  //     confirmButtonColor: "#F78E2A",
  //     cancelButtonText: "Keep waiting",
  //     confirmButtonText: "Yes, cancel",
  //   }).then(({ isConfirmed }) => {
  //     if (!isConfirmed) return;
  //     cancelMutate(
  //       { id: state?.id, type: state?.categoryType },
  //       {
  //         onSuccess: (data) => {
  //           customDispatch(globalAlertType("info", data));
  //           navigate("/");
  //         },
  //         onError: (err) => customDispatch(globalAlertType("error", err)),
  //       },
  //     );
  //   });
  // };

  const handlePaymentSuccess = (data) => {
    if (!data?.id) return;

    setStatus("success");
    setMessage("Payment successful.");
    setTransaction(data);

    if (state?.isWallet) queryClient.getQueryData(["wallet-balance"]);
    customDispatch(globalAlertType("info", "Transaction Confirmed!"));
    const walletTypes = ["airtime", "prepaid", "bundle", "wallet"];
    if (walletTypes.includes(state?.categoryType)) {
      setTimeout(() => {
        navigate("/payment/success", {
          replace: true,
          state: { path: state?.path },
        });
      }, 3000);
    } else {
      customDispatch({ type: "loadVouchers", payload: data });

      /*
        Redirect after delay
      */
      setTimeout(() => {
        navigate("/checkout", {
          replace: true,
          state: {
            transactionId: data?.id,
            categoryType: data?.info?.categoryType,
            path: state?.path,
          },
        });
      }, 3000);
    }
  };

  /* ── Derived state ── */
  const isCancelled =
    status === "failed" ||
    (confirmPayment.isError &&
      confirmPayment?.error === "Payment Cancelled!") ||
    confirmPayment?.failureReason === "Payment Cancelled!";

  const isSuccess =
    status === "success" || (!!confirmPayment.data && !isCancelled);

  const isPolling = confirmPayment.isLoading || status === "pending";

  const statusType = isCancelled ? "error" : isSuccess ? "success" : "waiting";

  if (!txRef) {
    return (
      <Container maxWidth="sm">
        <Paper
          sx={{
            p: 4,
            mt: 10,
            textAlign: "center",
          }}
        >
          <Alert severity="error">Invalid transaction reference.</Alert>
        </Paper>
      </Container>
    );
  }

  /* ─── Render ─── */
  return (
    <div style={S.root}>
      <style>{`
        .btn-cancel:hover { background: #f5f3ff !important; }
        .btn-goback:hover { opacity: 0.88; }
      `}</style>



      <main style={S.main}>
        <div className="payment-card">
          {/* ── Card header ── */}
          <div style={S.cardHeader}>
            <div style={S.headerDecor} />
            <div style={S.headerDecor2} />
            <p style={S.cardTitle}>Payment Confirmation</p>
            {state?.amount && (
              <p style={S.cardAmount}>
                {state?.currency ?? "GHS"} {parseFloat(state.amount).toFixed(2)}
              </p>
            )}
          </div>

          {/* ── Card body ── */}
          <div style={S.cardBody}>
            {connected}
            {/* Animated image */}
            <div style={S.imageWrap}>
              {statusType === "waiting" && (
                <>
                  <div style={S.pulseRing} />
                  <div style={S.pulseRing2} />
                </>
              )}
              <img
                src={IMAGES.pending}
                alt="Payment status"
                style={S.pendingImg}
              />
            </div>

            {/* Status badge */}
            <div style={S.statusBadge(statusType)}>
              <span style={S.dot(statusType)} />
              {statusType === "waiting" && "Waiting for confirmation"}
              {statusType === "success" && "Payment received!"}
              {statusType === "error" && "Payment cancelled"}
            </div>

            {/* ── Cancelled state ── */}
            {isCancelled && (
              <>
                <div style={S.divider} />
                <h2 style={S.errorHeading}>Payment was not completed</h2>
                <p style={S.errorSubtext}>
                  This may have been caused by{" "}
                  <span style={S.reasonTag}>insufficient funds</span>,{" "}
                  <span style={S.reasonTag}>processor error</span>, or exceeding
                  your <span style={S.reasonTag}>daily limit</span>. Please try
                  again.
                </p>
                <Link
                  to={pathname}
                  style={{ ...S.btnGoBack, textDecoration: "none" }}
                  className="btn-goback"
                >
                  Try Again
                </Link>
              </>
            )}

            {/* ── Success state ── */}
            {isSuccess && !isCancelled && (
              <>
                <div style={S.divider} />
                <h2 style={S.successHeading}>Payment done!</h2>
                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    color: "#6b7280",
                    textAlign: "center",
                  }}
                >
                  Your transaction is being finalized…
                </p>
                <Typography variant="body2">
                  Transaction ID: {transaction?.id}
                </Typography>
                <Typography variant="body2">
                  Date:{" "}
                  {transaction
                    ? new Date(transaction.createdAt).toLocaleString()
                    : ""}
                </Typography>
                <div style={S.spinnerRow}>
                  <Spinner size={18} />
                  <span style={S.spinnerLabel}>Confirming transaction</span>
                </div>
              </>
            )}

            {/* ── Polling / waiting state ── */}
            {isPolling && (
              <>
                <div style={S.divider} />

                {state?.isWallet ? (
                  /* Wallet processing */
                  <div style={S.spinnerRow}>
                    <Spinner size={20} />
                    <span style={S.spinnerLabel}>Processing payment…</span>
                  </div>
                ) : (
                  /* MoMo flow */
                  <>
                    <div style={S.infoBox}>
                      <p style={S.infoBoxTitle}>How to complete</p>
                      {[
                        <>
                          Check your phone for a{" "}
                          <span style={S.highlight}>MoMo prompt</span>
                        </>,
                        // <>Dial <span style={S.highlight}>*170#</span> if no prompt received</>,
                        <>
                          Approve &amp; enter your{" "}
                          <span style={S.highlight}>Mobile Money PIN</span>
                        </>,
                      ].map((text, i) => (
                        <div
                          key={i}
                          style={{
                            ...S.stepRow,
                            marginBottom: i === 2 ? 0 : "10px",
                          }}
                        >
                          <div style={S.stepNum}>{i + 1}</div>
                          <p style={S.stepText}>{text}</p>
                        </div>
                      ))}
                    </div>

                    <MomoGuide />

                    <div style={S.spinnerRow}>
                      <Spinner size={16} />
                      <span style={S.spinnerLabel}>
                        Waiting for payment confirmation…
                      </span>
                    </div>

                    {/* {!state?.isWallet && (
                      <button
                        style={{
                          ...S.btnCancel,
                          background: cancelHover ? "#f5f3ff" : "transparent",
                        }}
                        className="btn-cancel"
                        onClick={handleCancelPayment}
                        disabled={cancelLoading || isLoading}
                        onMouseEnter={() => setCancelHover(true)}
                        onMouseLeave={() => setCancelHover(false)}
                      >
                        {cancelLoading ? (
                          <>
                            <Spinner size={16} color="#F78E2A" /> Cancelling…
                          </>
                        ) : (
                          "Cancel payment"
                        )}
                      </button>
                    )} */}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={S.footer}>
        &copy; {new Date().getFullYear()} Gab Powerful Consult
      </footer>

      {/* {isLoading && <GlobalSpinner />} */}
    </div>
  );
}

export default PaymentStatus;
