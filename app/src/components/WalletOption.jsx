import { useContext, useState } from "react";
import {
  Typography,
  Stack,
  FormControlLabel,
  Radio,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  FormLabel,
  TextField,
  useTheme,
  Skeleton,
} from "@mui/material";
import { ArrowDropDownRounded } from "@mui/icons-material";
import { currencyFormatter } from "../constants";
import { useQuery } from "@tanstack/react-query";

import { AuthContext } from "../context/providers/AuthProvider";
import { getWalletBalance, getWalletStatus } from "../api/walletAPI";

function WalletOption({ token, setToken, tokenErr, tokenHelperText, value }) {
  const theme = useTheme();

  const { user } = useContext(AuthContext);
  const [expand, setExpand] = useState(value === "wallet");

  const walletBalance = useQuery({
    queryKey: ["wallet-balance"],
    queryFn: () => getWalletBalance(user?.id),
    enabled: !!user?.id,
    initialData: 0,
  });

  // Get wallet status
  const { data, isLoading: isLoadingWalletStatus } = useQuery({
    queryKey: ["wallet-status"],
    queryFn: () => getWalletStatus(),
    enabled: !!user?.id,
  });

  return (
    <Accordion
      sx={{ width: "100%" }}
      expanded={expand}
      onChange={() => setExpand(!expand)}
    >
      <AccordionSummary
        sx={{ backgroundColor: "whitesmoke", px: 1 }}
        expandIcon={<ArrowDropDownRounded />}
      >
        <FormControlLabel
          label="Wallet"
          control={
            <Radio
              size="small"
              value="wallet"
              onClick={() => setExpand(!expand)}
              sx={{ width: "100%", pointerEvents: "all" }}
            />
          }
          onClick={() => setExpand(!expand)}
          sx={{ pointerEvents: "none" }}
        />
      </AccordionSummary>
      <AccordionDetails>
        {isLoadingWalletStatus || walletBalance.isLoading ? (
          <Stack direction="row" spacing={2} alignItems="center" p={1}>
            <Skeleton variant="circular" width={20} height={20} />
            <Skeleton variant="text" width="60%" />
          </Stack>
        ) : (
          <>
            <Stack
              width="100%"
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              p={1}
            >
              <FormLabel label="Wallet">Balance</FormLabel>
              <Typography fontWeight="bold">
                {currencyFormatter(walletBalance.data)}
              </Typography>
            </Stack>

            {data.active === false ? (
              <Typography variant="caption" color="error" sx={{ px: 1 }}>
                Wallet is temporarily disabled due to multiple failed attempts.
                Try again after {data.timeOut}.
              </Typography>
            ) : (
              <>
                <Typography variant="caption">
                  Make payment with the available balance in your wallet.
                </Typography>

                <Stack spacing={1} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Wallet Pin
                  </Typography>
                  <TextField
                    size="medium"
                    type="password"
                    inputMode="numeric"
                    placeholder="Enter 4-digit pin"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    error={tokenErr}
                    helperText={tokenHelperText}
                    sx={{
                      maxWidth: 200,
                      "& .MuiOutlinedInput-root": {
                        transition: theme.transitions.create([
                          "border-color",
                          "box-shadow",
                        ]),
                        "&:hover fieldset": {
                          borderColor: theme.palette.primary.main,
                        },
                        "&.Mui-focused fieldset": {
                          borderWidth: 2,
                          borderColor: theme.palette.primary.main,
                        },
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
