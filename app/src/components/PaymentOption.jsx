import { FormControl, FormLabel, RadioGroup } from "@mui/material";
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
}) {
  return (
    <FormControl sx={{ width: "100%", py: 2 }}>
      <FormLabel sx={{ pb: 1 }}>Select Payment Method</FormLabel>
      <RadioGroup
        value={value}
        onChange={(e) => setPaymentMethod(e.target.value)}
      >
        {showWallet  && <WalletOption {...walletDetails} value={value} />}
        {showMomo && <MobileMoneyOption {...mobileMoneyDetails} value={value} />}
      </RadioGroup>
      {error && <small style={{ color: "#B72136" }}>{helperText}</small>}
    </FormControl>
  );
}

export default PaymentOption;
