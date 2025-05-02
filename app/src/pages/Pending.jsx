import { useEffect } from "react";
import { IMAGES } from "../constants";
import { Stack, Typography, Box, CircularProgress } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { CustomContext } from "../context/providers/CustomProvider";
import { useContext } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CancelPayment, ConfirmPayment } from "../api/paymentAPI";
import { globalAlertType } from "../components/alert/alertType";
import { useLocation, useNavigate, Navigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import GlobalSpinner from "../components/GlobalSpinner";

function Pending() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { pathname, state } = useLocation();
  const { customDispatch } = useContext(CustomContext);

  const confirmPayment = useQuery({
    queryKey: ["confirm-payment", state?._id],
    queryFn: () =>
      ConfirmPayment({
        id: state?._id,
        type: state?.type,
      }),
    refetchIntervalInBackground: true,
    retry: true,
    enabled: !!state?._id && !!state?.type,
    onSuccess: (data) => {
      if (data && data?.status === "completed") {
        handleConfirmPayment();
      }
    },
  });

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const confirmationMessage = "Are you sure you want to leave?";
      e.returnValue = confirmationMessage; // For IE and Firefox prior to version 4
      return confirmationMessage; // For Safari and modern browsers
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: ConfirmPayment,
    retry: false,
    onError: () => {
      customDispatch(globalAlertType("error", "Error confirming payment"));
    },
  });

  const handleConfirmPayment = () => {
    mutateAsync(
      {
        id: state?._id,
        type: state?.type,
        confirm: true,
      },
      {
        onSuccess: (data) => {
          if (data?._id) {
            if (state?.isWallet) {
              queryClient.getQueryData(["wallet-balance"]);
            }

            customDispatch(globalAlertType("info", "Transaction Confirmed!"));
            if (["airtime", "prepaid", "bundle"].includes(state?.type)) {
              navigate("/payment/success", {
                replace: true,
                state: {
                  path: pathname,
                },
              });
            } else {
              customDispatch({ type: "loadVouchers", payload: data });
              navigate(`/checkout`, {
                replace: true,
                state: {
                  transactionId: data?._id,
                  type: data?.info.type,
                  path: pathname,
                },
              });
            }
          }
        },
        onError: (error) => {
          customDispatch(globalAlertType("error", error));
        },
      }
    );
  };

  // console.log(state);
  const {
    mutateAsync: cancelPaymentMutateAsync,
    isLoading: cancelPaymentIsLoading,
  } = useMutation({
    mutationFn: CancelPayment,
  });

  const handleCancelPayment = () => {
    Swal.fire({
      title: "Cancel Payment!",
      text: `Do you wish to proceed?`,
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        cancelPaymentMutateAsync(
          { id: state?._id, type: state?.type },
          {
            onSuccess: (data) => {
              customDispatch(globalAlertType("info", data));
              navigate("/");
            },
            onError: (error) => {
              customDispatch(globalAlertType("error", error));
            },
          }
        );
      }
    });
  };

  if (!state?._id) {
    return <Navigate to="/" />;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "8px",
        height: "100svh",
      }}
    >
      <Stack
        spacing={3}
        justifyContent="center"
        alignItems="center"
        textAlign="center"
        flexGrow={1}
      >
        <Typography variant="h3" color="secondary" paragraph>
          Payment Confirmation
        </Typography>
        <img
          className="shake-animation swing-animation"
          src={IMAGES.pending}
          style={{
            width: "120px",
            height: "120px",
            paddingLeft: "30px",
            marginBlock: "20px",
          }}
        />

        {(confirmPayment.isError &&
          confirmPayment?.error === "Payment Cancelled!") ||
        confirmPayment?.failureReason === "Payment Cancelled!" ? (
          <>
            <Typography
              variant="h6"
              color="secondary"
              textAlign="center"
              paragraph
            >
              Payment Cancelled!
            </Typography>
            <Typography
              variant="body2"
              color="secondary"
              textAlign="center"
              paragraph
            >
              This might be due to{" "}
              <b>
                <i>Insufficient funds in wallet</i>
              </b>
              ,
              <b>
                <i>error with payment processor</i>
              </b>{" "}
              or{" "}
              <b>
                <i>the specified amount is more than daily limit</i>
              </b>{" "}
              . Please try again later.
            </Typography>
            <Link
              style={{
                padding: "15px 100px",
                backgroundColor: "var(--secondary)",
                color: "#fff",
              }}
              to={pathname}
            >
              Go Back
            </Link>
          </>
        ) : (
          <>
            {confirmPayment.data && (
              <>
                <Typography
                  variant="h6"
                  color="secondary"
                  textAlign="center"
                  paragraph
                  // pb={4}
                >
                  Payment done!
                </Typography>

                {/* <LoadingButton
                  variant="contained"
                  loading={isLoading}
                  onClick={handleConfirmPayment}
                  sx={{ width: 300 }}
                >
                  Confirm Payment
                </LoadingButton> */}
              </>
            )}
          </>
        )}
        <>
          {confirmPayment?.isLoading && (
            <>
              {confirmPayment.failureReason !== "Payment Cancelled!" && (
                <>
                  {state?.isWallet ? (
                    <>
                      <Stack spacing={2} py={2} alignItems="center">
                        <CircularProgress size={30} />
                        <Typography variant="body2">Processing....</Typography>
                      </Stack>
                    </>
                  ) : (
                    <>
                      <Stack py={2}>
                        <Typography variant="body2">
                          A bill prompt has been sent to your mobile money
                          number.
                        </Typography>
                        <Typography variant="body2">
                          To complete the transaction,follow the prompt and
                          enter your
                          <span style={{ color: "var(--primary)" }}>
                            {" "}
                            MOBILE MONEY PIN.
                          </span>
                        </Typography>
                      </Stack>
                      <Stack spacing={2} alignItems="center">
                        <CircularProgress size={15} />
                        <Typography variant="body2" fontWeight="bold">
                          Waiting for Payment Confirmation...
                        </Typography>
                      </Stack>
                      {!state?.isWallet && (
                        <LoadingButton
                          color="secondary"
                          variant="contained"
                          loading={cancelPaymentIsLoading}
                          disabled={isLoading}
                          onClick={handleCancelPayment}
                          sx={{ width: 300 }}
                        >
                          Cancel
                        </LoadingButton>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </>
      </Stack>
      <Box sx={{ display: "grid", placeItems: "center", paddingY: 2 }}>
        <Typography variant="body2">
          Copyright &copy; {new Date().getFullYear()} | Gab Powerful Consult
        </Typography>
      </Box>
      {isLoading && <GlobalSpinner />}
    </div>
  );
}

export default Pending;
