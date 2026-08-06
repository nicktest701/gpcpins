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

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormContext, useWatch } from "react-hook-form";
import MobileWalletIcon from "@/assets/icons/MobileWallet";
import { currencyFormatter } from "../constants";
import { useAuth } from "../context/providers/AuthProvider";
import { getWalletBalance, getWalletStatus } from "../api/walletAPI";

function WalletOption() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { user } = useAuth();

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

  const fetchedBalance = queryClient.getQueryData({
    queryKey: ["wallet-balance", user?.id],
  });
  const fetchedStatus = queryClient.getQueryData({
    queryKey: ["wallet-status", user?.id],
  });

  const walletBalance = useQuery({
    queryKey: ["wallet-balance", user?.id],
    queryFn: () => getWalletBalance(user?.id),
    enabled: !!user?.id,
    staleTime: 0,
    cacheTime: 1000 * 60, // 1 minute memory life
    initialData: fetchedBalance,
  });

  const walletStatus = useQuery({
    queryKey: ["wallet-status", user?.id],
    queryFn: () => getWalletStatus(),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 5,
    initialData: fetchedStatus,
  });

  useEffect(() => {
    setExpanded(paymentMethod === "wallet");
  }, [paymentMethod]);

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

            {walletStatus.data?.active === false ? (
              <Typography variant="caption" color="error">
                Wallet temporarily disabled. Try again after{" "}
                {walletStatus.data?.timeOut}.
              </Typography>
            ) : (
              <>
                <Typography variant="caption" gutterBottom>
                  Make payment with the available balance in your wallet.
                </Typography>
                <Stack spacing={1} mt={2} justifyContent='center' alignItems='center'>
                  <Typography variant="body2" fontWeight={600}>
                    Wallet PIN
                  </Typography>

                  <TextField
                    size="small"
                    type="password"
                    placeholder="••••"
                    inputMode="numeric"
                    autoComplete="current-password"
                    {...register("token")}
                    error={!!errors.token}
                    disabled={walletStatus.data?.active === false}
                    helperText={errors.token?.message}
                    inputProps={{
                      style: {
                        textAlign: "center",
                        fontSize:20
                      },
                    }}
                    sx={{
                      textAlign: "center",
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
              </>
            )}
          </>
        )}
      </AccordionDetails>
    </Accordion>
  );
}

export default WalletOption;
