import {
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  Stack,
  TextField,
} from "@mui/material";
import WalletOption from "./WalletOption";
import MobileMoneyOption from "./tabs/MobileMoneyOption";
function PaymentOption({
  showWallet,
  showMomo,
  setPaymentMethod,
  error,
  helperText,
  value,
  walletDetails,
  mobileMoneyDetails,
  fullNameDetails,
  emailDetails,
}) {
  return (
    <Box>
      <FormControl sx={{ width: "100%", py: 2 }}>
        <FormLabel sx={{ pb: 1 }}>Personal Details (optional)</FormLabel>
        <Stack spacing={2} pb={2}>
          <TextField
            size="small"
            placeholder="Enter your Name"
            label="Full Name"
            inputMode="text"
            fullWidth
            value={fullNameDetails?.fullName}
            onChange={(e) => fullNameDetails?.setFullName(e.target?.value)}
            error={fullNameDetails?.fullNameErr}
            helperText={fullNameDetails?.fullNameHelperText}
          />

          <TextField
            size="small"
            type="email"
            inputMode="email"
            label="Email Address"
            fullWidth
            value={emailDetails?.email}
            onChange={(e) => emailDetails?.setEmail(e.target?.value)}
            error={emailDetails?.emailErr}
            helperText={emailDetails?.emailHelperText}
          />
        </Stack>
      </FormControl>
      <FormControl sx={{ width: "100%", py: 2 }}>
        <FormLabel sx={{ pb: 1 }}>Select Payment Method</FormLabel>
        <RadioGroup
          value={value}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          {showMomo && (
            <MobileMoneyOption {...mobileMoneyDetails} value={value} />
          )}
          {showWallet && <WalletOption {...walletDetails} value={value} />}
        </RadioGroup>
        {error && <small style={{ color: "#B72136" }}>{helperText}</small>}
      </FormControl>
    </Box>
  );
}

export default PaymentOption;
