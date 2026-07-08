import { useContext } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Dialog,
  DialogContent,
  Stack,
  TextField,
  InputAdornment,
  Typography,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { globalAlertType } from "../../components/alert/alertType";
import { CustomContext, useCustomContext } from "../../context/providers/CustomProvider";
import { sendWalletTopUp } from "../../api/walletAPI";
import MobilePartner from "../../components/MobilePartner";
import CustomDialogTitle from "../../components/dialogs/CustomDialogTitle";
import { topUpSchema } from "../../config/validationSchema";

// Form values interface

// Yup validation schema

function TopUpRequest() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { customDispatch } = useCustomContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const open = Boolean(searchParams.get("add-money"));

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({
    resolver: yupResolver(topUpSchema),
    defaultValues: {
      mobilePartner: "",
      phoneNumber: "",
      amount: 1,
    },
  });

  // Mutation for submitting top-up request
  const { mutateAsync, isPending } = useMutation({
    mutationFn: sendWalletTopUp,
    onError: (error) => {
      customDispatch(
        globalAlertType("error", error?.message || "An error occurred."),
      );
    },
    onSuccess: (data) => {
      console.log("Top-up request response:", data);
      if (data) {
        navigate(`/confirm`, {
          replace: true,
          state: {
            id: data?.paymentId,
            categoryType: "wallet",
            path: pathname,
            isWallet: true,
          },
        });
        // handleClose();
      }
    },
  });

  const onSubmit = async (data) => {
    const payload = {
      amount: data.amount,
      mobilePartner: data.mobilePartner,
      phoneNumber: data.phoneNumber,
    };
    
    try {
      await mutateAsync(payload);
    } catch (error) {
      customDispatch(
        globalAlertType("error", "Failed to send request. Please try again."),
      );
    }
  };

  const handleClose = () => {
    setSearchParams((params) => {
      params.delete("add-money");
      return params;
    });
    reset(); // Reset form when dialog closes
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <CustomDialogTitle
        title="Wallet Top-Up"
        subtitle="Fill in the details to top-up wallet via Mobile Money."
        onClose={handleClose}
      />

      <DialogContent sx={{ p: 2 }}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={2}>
            {/* Mobile Partner (custom component with Controller) */}
            <Controller
              name="mobilePartner"
              control={control}
              render={({ field, fieldState }) => (
                <MobilePartner
                  size="small"
                  value={field.value}
                  setValue={field.onChange}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />

            {/* Phone Number */}
            <Controller
              name="phoneNumber"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  type="tel"
                  inputMode="tel"
                  variant="outlined"
                  label="Mobile Money Number"
                  fullWidth
                  required
                  size="small"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />

            <Typography
              variant="caption"
              fontStyle="italic"
              color="secondary"
              paragraph
            >
              Enter the amount you want to top up.
            </Typography>

            {/* Amount */}
            <Controller
              name="amount"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  type="number"
                  inputMode="numeric"
                  placeholder="Amount"
                  label="Top Up Amount"
                  size="small"
                  fullWidth
                  required
                  autoFocus
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">GH¢</InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">p</InputAdornment>
                    ),
                  }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  onChange={(e) => field.onChange(e.target.valueAsNumber || "")}
                  value={field.value || ""}
                />
              )}
            />

            <LoadingButton
              type="submit"
              variant="contained"
              loading={isPending || isSubmitting}
              disabled={isPending || isSubmitting}
              fullWidth
              color="secondary"
              size="large"
            >
              Top Up Now
            </LoadingButton>
          </Stack>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default TopUpRequest;
