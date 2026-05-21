import { useContext, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  TextField,
  Button,
  Stack,
  Avatar,
  Typography,
  CircularProgress,
  Alert,
  Paper,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import Swal from "sweetalert2";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CustomContext } from "@/context/providers/CustomProvider";
import { currencyFormatter, getCode } from "@/constants";
import { makeAirtimeTransaction } from "@/api/paymentAPI";
import { disableWallet, getNonUser, getWalletStatus } from "@/api/userAPI";
import { AuthContext } from "@/context/providers/AuthProvider";
import { verifyPin } from "@/config/validation";
import VoucherPlaceHolderItem from "../items/VoucherPlaceHolderItem";
import CustomDialogTitle from "../dialogs/CustomDialogTitle";
import { globalAlertType } from "@/components/alert/alertType";

function AirtimePaymentDetails() {
  const [searchParams] = useSearchParams();
  const { user } = useContext(AuthContext);
  const { customDispatch } = useContext(CustomContext);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [failureCount, setFailCount] = useState(3);

  const isWallet =
    searchParams.get("preload") === "3e6810ec81036d2f7088231351b3097b";
  const amount = sessionStorage.getItem("value-x");


  
  // Wallet status query
  const { data: walletStatus, isLoading: isLoadingWalletStatus } = useQuery({
    queryKey: ["wallet-status"],
    queryFn: () => getWalletStatus(),
    enabled: !!user?.id && isWallet,
  });

  // Payment mutation
  const paymentMutation = useMutation({
    mutationFn: makeAirtimeTransaction,
    onSuccess: (data) => {
      sessionStorage.removeItem("value-x");
      navigate("/confirm", {
        replace: true,
        state: {
          _id: data?.id,
          categoryType: searchParams.get("type") === "Bundle" ? "bundle" : "airtime",
          path: pathname,
          isWallet,
        },
      });
    },
    onError: async (error) => {
      if (error === "Invalid pin!") {
        const newCount = failureCount - 1;
        setFailCount(newCount);
        if (newCount > 0) {
          setPinError(`${error} ${newCount} attempt(s) left.`);
        } else {
          setPinError(`${error}. No attempts left. Wallet disabled.`);
          await disableWallet();
        }
      } else {
        customDispatch(globalAlertType("error", error));
      }
    },
  });

  // Guest user check mutation (for non‑logged‑in users)
  const guestMutation = useMutation({
    mutationFn: getNonUser,
    onSuccess: () => {
      // After guest check, proceed with payment
      handlePayment();
    },
    onError: () => {
      customDispatch(
        globalAlertType("error", "Failed to verify user. Please try again."),
      );
    },
  });

  const handlePayment = () => {
    // Validation
    if (isWallet) {
      if (!pin.trim()) {
        setPinError("Pin is required");
        return;
      }
      if (pin.trim().length !== 4 || !verifyPin(pin.trim())) {
        setPinError("Please enter a valid 4‑digit pin");
        return;
      }
    }

    const payload = {
      amount: sessionStorage.getItem("value-x"),
      recipient: searchParams.get("recipient"),
      phonenumber: searchParams.get("phonenumber") || user?.phonenumber,
      email: searchParams.get("email") || user?.email,
      provider: searchParams.get("provider"),
      type: searchParams.get("type"),
      service: searchParams.get("type")?.toLowerCase(),
      isWallet,
    };

    if (isWallet) {
      payload.token = pin.trim();
    }

    if (searchParams.get("type") === "Bundle") {
      payload.plan = {
        id: searchParams.get("plan_id"),
        name: searchParams.get("plan_name"),
        volume: searchParams.get("plan_volume"),
      };
    }

    // If user not logged in, run guest check first
    if (!user?.id) {
      guestMutation.mutate({});
    } else {
      paymentMutation.mutate(payload);
    }
  };

  const handleClose = () => {
    Swal.fire({
      title: "Cancel transaction?",
      text: "Are you sure you want to cancel?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        handleGoBack();
      }
    });
  };

  const handleGoBack = () => {
    customDispatch({ type: "set_Airtime_Bundle_Amount", payload: 0 });
    navigate("/airtime", { replace: true });
  };

  // Check if amount matches the one in URL (security check)
  const isValidAmount = Number(amount) === Number(searchParams.get("amount"));

  // If wallet disabled or wallet status indicates inactive, show disabled state
  const isWalletDisabled = isWallet && walletStatus && !walletStatus.active;

  return (
    <Dialog
      open={Boolean(searchParams.get("open-preview"))}
      maxWidth="xs"
      fullWidth
      onClose={handleClose}
    >
      {isWallet && isLoadingWalletStatus ? (
        <Stack justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress />
        </Stack>
      ) : isWalletDisabled ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom>
            Wallet Disabled
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Your wallet is currently disabled. Please contact support for
            assistance.
          </Typography>
          {walletStatus?.timeOut && (
            <Typography variant="caption">
              Try again in <strong>{walletStatus.timeOut}</strong> minutes.
            </Typography>
          )}
          <Button onClick={handleGoBack} sx={{ mt: 2 }}>
            Go Back
          </Button>
        </Paper>
      ) : (
        <>
          <CustomDialogTitle
            title="Payment Details"
            subtitle="Confirm your transaction"
            onClose={!paymentMutation.isLoading ? handleClose : undefined}
          />
          <DialogContent>
            <Stack spacing={2} sx={{ py: 1 }}>
              {/* Summary items */}
              <VoucherPlaceHolderItem
                title="Recipient Number"
                value={searchParams.get("recipient")}
              />
              {searchParams.get("plan_name") && (
                <VoucherPlaceHolderItem
                  title="Bundle"
                  value={`${searchParams.get("plan_name")} (${searchParams.get("plan_volume")})`}
                />
              )}
              <VoucherPlaceHolderItem
                title="Amount"
                value={currencyFormatter(amount)}
              />
              <VoucherPlaceHolderItem
                title="Payment Method"
                value={isWallet ? "Wallet" : "Mobile Money"}
              />
              {!isWallet && (
                <VoucherPlaceHolderItem
                  title="Mobile Money Number"
                  value={searchParams.get("phonenumber")}
                  img={
                    <Avatar
                      src={getCode(searchParams.get("phonenumber"))?.money}
                      variant="square"
                      sx={{ width: 40, height: 20 }}
                    />
                  }
                />
              )}

              {isWallet && (
                <>
                  <Typography variant="subtitle2" sx={{ mt: 1 }}>
                    Wallet Pin
                  </Typography>
                  <TextField
                    size="small"
                    type="password"
                    inputMode="numeric"
                    placeholder="Enter 4‑digit pin"
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value);
                      if (pinError) setPinError("");
                    }}
                    error={Boolean(pinError)}
                    helperText={pinError}
                    fullWidth
                  />
                </>
              )}

              {!isValidAmount && (
                <Alert severity="error" sx={{ my: 1 }}>
                  Amount mismatch. Please start over.
                </Alert>
              )}

              <LoadingButton
                variant="contained"
                onClick={handlePayment}
                loading={paymentMutation.isLoading || guestMutation.isLoading}
                disabled={!isValidAmount}
                fullWidth
                sx={{ mt: 2 }}
              >
                {paymentMutation.isLoading || guestMutation.isLoading
                  ? "Processing..."
                  : "Pay Now"}
              </LoadingButton>
            </Stack>
          </DialogContent>
        </>
      )}
    </Dialog>
  );
}

export default AirtimePaymentDetails;
