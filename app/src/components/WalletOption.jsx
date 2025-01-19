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
} from "@mui/material";
import { ArrowDropDownRounded } from "@mui/icons-material";
import { currencyFormatter } from "../constants";
import { useQuery } from "@tanstack/react-query";
import { getWalletBalance } from "../api/userAPI";
import { AuthContext } from "../context/providers/AuthProvider";


function WalletOption() {
  const { user } = useContext(AuthContext);
  const [expand, setExpand] = useState(false);

  const walletBalance = useQuery({
    queryKey: ["wallet-balance"],
    queryFn: () => getWalletBalance(user?.id),
    enabled: !!user?.id,
    initialData: 0,
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
        <Typography variant="caption">
          Make payment with the available balance in your wallet.
        </Typography>
      </AccordionDetails>
    </Accordion>
  );
}

export default WalletOption;
