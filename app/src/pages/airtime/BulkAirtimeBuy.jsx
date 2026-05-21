import { useContext, useState, useMemo } from "react";
import { Container, TextField, Typography, Stack, Paper } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useSearchParams,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Swal from "sweetalert2";
import { AuthContext } from "../../context/providers/AuthProvider";
import { CustomContext } from "../../context/providers/CustomProvider";
import { globalAlertType } from "../../components/alert/alertType";
import { currencyFormatter } from "../../constants";
import Back from "../../components/Back";
import VoucherPlaceHolderItem from "../../components/items/VoucherPlaceHolderItem";
import PaymentOption from "../../components/PaymentOption";
import { disableWallet, getNonUser } from "../../api/userAPI";
import { makeAirtimeTransaction } from "../../api/paymentAPI";
import { bulkAirtimeValidationSchema } from "../../config/validationSchema";

function BulkAirtimeBuy() {
  const queryClient = useQueryClient();
  const { customDispatch } = useContext(CustomContext);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useContext(AuthContext);
  const [failureCount, setFailCount] = useState(3);

  // Get wallet status (disabled state)
  const { data: disableWalletData } = useQuery({
    queryKey: ["disable-wallet"],
    queryFn: () => disableWallet(),
    enabled: failureCount === 0,
    initialData: { active: true, timeOut: null },
  });

  // Wallet disabled error message
  const walletDisabledError = useMemo(() => {
    if (disableWalletData?.active === false) {
      return `Wallet disabled due to multiple failed attempts. Try again after ${disableWalletData?.timeOut}`;
    }
    return "";
  }, [disableWalletData]);

  const pricingInfo = searchParams.get("info");
  const pricingList = useMemo(() => {
    if (pricingInfo) {
      try {
        return JSON.parse(pricingInfo);
      } catch (e) {
        return [];
      }
    }
    return [];
  }, [pricingInfo]);

  const totalAmount = useMemo(() => {
    return pricingList.reduce((sum, item) => sum + (item.price || 0), 0);
  }, [pricingList]);

  // Validate session storage amount matches total
  const sessionAmount = Number(sessionStorage.getItem("value-x"));
  const isValidAmount = sessionAmount === totalAmount && totalAmount > 0;

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    resolver: yupResolver(bulkAirtimeValidationSchema()),
    defaultValues: {
      email: user?.email || "",
      amount: sessionAmount,
      phonenumber: "",
      confirmPhonenumber: "",
      paymentMethod: "momo",
      mobilePartner: "",
      token: "",
    },
  });

 

  const paymentMethod = watch("paymentMethod");
  const token = watch("token");
  const mobilePartner = watch("mobilePartner");
  const phonenumber = watch("phonenumber");
  const confirmPhonenumber = watch("confirmPhonenumber");

  // Wallet balance check
  const walletBalance = user?.id
    ? queryClient.getQueryData(["wallet-balance", user?.id], { exact: true })
    : 0;
  const isInsufficientBalance =
    paymentMethod === "wallet" &&
    user?.id &&
    (Number(walletBalance) === 0 || Number(walletBalance) < totalAmount);

  // Payment mutation
  const paymentMutation = useMutation({
    mutationFn: makeAirtimeTransaction,
    onSuccess: (data) => {
      sessionStorage.removeItem("value-x");
      navigate("/confirm", {
        replace: true,
        state: {
          _id: data?.id,
          categoryType: "airtime",
          path: pathname,
          isWallet: paymentMethod === "wallet",
        },
      });
    },
    onError: async (error) => {
      if (error === "Invalid PIN!") {
        const newCount = failureCount - 1;
        setFailCount(newCount);
        if (newCount === 0) {
          setValue("token", "");
          customDispatch(
            globalAlertType(
              "error",
              `Wallet disabled. Please use mobile money or contact support.`,
            ),
          );
        } else {
          setValue("token", "");
          customDispatch(
            globalAlertType(
              "error",
              `${error} ${newCount} attempt(s) left. Wallet will be disabled after ${
                newCount - 1
              } more attempt(s).`,
            ),
          );
        }
      } else {
        customDispatch(globalAlertType("error", error));
      }
    },
  });

  // Guest user check mutation
  const guestMutation = useMutation({
    mutationFn: getNonUser,
    onSuccess: () => {
      // After guest check, proceed with payment
      handlePaymentSubmit();
    },
    onError: () => {
      customDispatch(
        globalAlertType("error", "Failed to verify user. Please try again."),
      );
    },
  });

  // Payment submission logic
  const handlePaymentSubmit = (payload) => {
    paymentMutation.mutate(payload);
  };

  const onSubmit = (values) => {
   

    // Validate wallet balance
    if (paymentMethod === "wallet" && isInsufficientBalance) {
      customDispatch(
        globalAlertType(
          "error",
          "Insufficient wallet balance. Please fund your wallet or use mobile money.",
        ),
      );
      return;
    }

    Swal.fire({
      title: "Processing",
      text: `Proceed with payment?`,
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        const payload = {
          type: "Bulk",
          service: "airtime",
          amount: totalAmount,
          recipient: "", // not used for bulk
          phonenumber: values.phonenumber || user?.phonenumber,
          provider: values.mobilePartner,
          email: values.email || user?.email,
          isWallet: paymentMethod === "wallet",
          bulk: true,
          pricing: pricingList, // send the list
        };

        if (paymentMethod === "wallet") {
          payload.token = token;
        }

        // If user not logged in, run guest check first
        if (!user?.id) {
          guestMutation.mutate({});
        } else {
          paymentMutation.mutate(payload);
        }
      }
    });
  };

  // Redirect if invalid
  if (!pricingInfo || pricingList.length === 0 || !isValidAmount) {
    return (
      <Navigate to="/airtime?link=c458dd2cf0e7223a51319f98cc8e2c8ea27d6dc66e048cd1b4434f6aae90fc2a" />
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Back />
      <Typography variant="h4" gutterBottom>
        Payment Information
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Verify your payment details to complete the transaction.
      </Typography>

      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        {/* Pricing summary */}
        <Stack
          sx={{
            bgcolor: "action.hover",
            p: 2,
            borderRadius: 1,
            mb: 3,
          }}
        >
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Recipients ({pricingList.length})
          </Typography>
          {pricingList.map((item) => (
            <VoucherPlaceHolderItem
              key={item.id}
              title={`${item.type} (${item.recipient})`}
              value={currencyFormatter(item.price)}
            />
          ))}
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
            <Typography variant="body2" fontWeight="bold">
              Total Amount:
            </Typography>
            <Typography variant="body1" fontWeight="bold" color="primary.main">
              {currencyFormatter(totalAmount)}
            </Typography>
          </Stack>
        </Stack>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={3}>
            {/* Email */}
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="email"
                  label="Email Address"
                  required
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              )}
            />

            {/* Payment options */}
            <PaymentOption
              showMomo
              showWallet={user?.id}
              setPaymentMethod={(value) => setValue("paymentMethod", value)}
              value={paymentMethod}
              error={!!errors.paymentMethod}
              helperText={errors.paymentMethod?.message || walletDisabledError}
              mobileMoneyDetails={{
                mobilePartner,
                setMobilePartner: (val) => setValue("mobilePartner", val),
                mobilePartnerErr: !!errors.mobilePartner,
                mobilePartnerHelperText: errors.mobilePartner?.message,
                phonenumber,
                setPhonenumber: (val) => setValue("phonenumber", val),
                phonenumberErr: !!errors.phonenumber,
                phonenumberHelperText: errors.phonenumber?.message,
                confirmPhonenumber,
                setConfirmPhonenumber: (val) =>
                  setValue("confirmPhonenumber", val),
                confirmPhonenumberErr: !!errors.confirmPhonenumber,
                confirmPhonenumberHelperText:
                  errors.confirmPhonenumber?.message,
              }}
              walletDetails={{
                token,
                setToken: (val) => setValue("token", val),
                tokenErr: !!errors.token,
                tokenHelperText: errors.token?.message,
              }}
            />

            <LoadingButton
              type="submit"
              variant="contained"
              size="large"
              loading={
                isSubmitting ||
                paymentMutation.isLoading ||
                guestMutation.isLoading
              }
              disabled={
                paymentMethod === "" ||
                (paymentMethod === "wallet" && isInsufficientBalance)
              }
              fullWidth
            >
              Confirm Details
            </LoadingButton>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}

export default BulkAirtimeBuy;
