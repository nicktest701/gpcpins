// WalletOption.jsx

import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  FormControlLabel,
  FormLabel,
  Radio,
  Skeleton,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";

import { useQuery } from "@tanstack/react-query";
import { useFormContext, useWatch } from "react-hook-form";
import MobileWalletIcon from "@/assets/icons/MobileWallet";
import { currencyFormatter } from "../constants";
import { useAuth } from "../context/providers/AuthProvider";
import { useCustomContext } from "../context/providers/CustomProvider";
import { getWalletBalance, getWalletStatus } from "../api/walletAPI";

function WalletOption() {
  const theme = useTheme();

  const { user } = useAuth();
  const { walletBalance: wallet } = useCustomContext();

  const {
    control,
    register,
    setValue,
    formState: { errors },
  } = useFormContext();

  const paymentMethod = useWatch({
    control,
    name: "paymentMethod",
  });

  const [expanded, setExpanded] = useState(paymentMethod === "wallet");

  useEffect(() => {
    setExpanded(paymentMethod === "wallet");
  }, [paymentMethod]);

  const walletBalance = useQuery({
    queryKey: ["wallet-balance", user?.id],
    queryFn: () => getWalletBalance(user?.id),
    enabled: !!user?.id,
    staleTime: 1000 * 60,
    initialData: wallet,
  });

  const walletStatus = useQuery({
    queryKey: ["wallet-status", user?.id],
    queryFn: () => getWalletStatus(),
    enabled: !!user?.id,
    staleTime: 1000 * 30,
  });

  const handleSelect = () => {
    setValue("paymentMethod", "wallet", {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <Accordion
      expanded={expanded}
      onChange={() => setExpanded((prev) => !prev)}
      disableGutters
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        overflow: "hidden",
      }}
    >
      <AccordionSummary
        sx={{
          backgroundColor:
            paymentMethod === "wallet" ? "whitesmoke" : "background.default",
        }}
        onClick={handleSelect}
      >
        <FormControlLabel
          sx={{ pointerEvents: "none", width: "100%", pl: 1 }}
          control={
            <Stack
              justifyContent="space-between"
              alignItems="center"
              direction="row"
              width="100%"
            >
              <Stack alignItems="center" direction="row">
                <MobileWalletIcon width={64} height={64} />
                <div>
                  <Typography variant="body2">Wallet</Typography>
                  {/* {!expanded && (
                    <Typography fontWeight={700}>
                      {currencyFormatter(walletBalance.data)}
                    </Typography>
                  )} */}
                </div>
              </Stack>
              <Radio
                size="small"
                checked={paymentMethod === "wallet"}
                onClick={handleSelect}
                value="wallet"
                sx={{ pointerEvents: "all" }}
              />
            </Stack>
          }
        />
      </AccordionSummary>

      <AccordionDetails>
        {walletBalance.isLoading || walletStatus.isLoading ? (
          <Stack spacing={1}>
            <Skeleton height={30} />
            <Skeleton height={30} />
          </Stack>
        ) : (
          <>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <FormLabel>Balance</FormLabel>

              <Typography fontWeight={700}>
                {currencyFormatter(walletBalance.data)}
              </Typography>
            </Stack>
            <Typography variant="caption" gutterBottom>
              Make payment with the available balance in your wallet.
            </Typography>

            {walletStatus.data?.active === false ? (
              <Typography variant="caption" color="error">
                Wallet temporarily disabled. Try again after{" "}
                {walletStatus.data?.timeOut}.
              </Typography>
            ) : (
              <Stack spacing={1} mt={2}>
                <Typography variant="body2" fontWeight={600}>
                  Wallet PIN
                </Typography>

                <TextField
                  size="small"
                  type="password"
                  placeholder="Enter 4-digit pin"
                  inputMode="numeric"
                  autoComplete="current-password"
                  {...register("token")}
                  error={!!errors.token}
                  disabled={
                    // Number(walletBalance.data) === 0 ||
                    walletStatus.data?.active === false
                  }
                  helperText={errors.token?.message}
                  sx={{
                    maxWidth: 150,
                    "& .MuiOutlinedInput-root": {
                      transition: theme.transitions.create([
                        "border-color",
                        "box-shadow",
                      ]),
                    },
                  }}
                />
              </Stack>
            )}
          </>
        )}
      </AccordionDetails>
    </Accordion>
  );
}

export default WalletOption;
