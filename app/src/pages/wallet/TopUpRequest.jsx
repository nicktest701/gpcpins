import { useContext, useState } from "react";
import {
  Dialog,
  DialogContent,
  Stack,
  TextField,
  InputAdornment,
  Typography,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useSearchParams } from "react-router-dom";
import CustomDialogTitle from "../../components/dialogs/CustomDialogTitle";
import { useMutation } from "@tanstack/react-query";
import { sendTopUpRequest } from "../../api/userAPI";
import { globalAlertType } from "../../components/alert/alertType";
import { CustomContext } from "../../context/providers/CustomProvider";

function TopUpRequest() {
  const { customDispatch } = useContext(CustomContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [amount, setAmount] = useState(1);
  const [amountErr, setAmountErr] = useState("");

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: sendTopUpRequest,
  });

  const handleSubmit = () => {
    if (amount === "") {
      setAmountErr("Required*");
      return;
    }
    if (amount < 1) {
      setAmountErr("Mininum Amount you can top up is GHS 1*");
      return;
    }

    mutateAsync(
      {
        amount: Number(amount),
      },
      {
        onSuccess: () => {
          customDispatch(globalAlertType("info", "Request Sent!"));
          handleClose();
        },
        onError: () => {
          customDispatch(globalAlertType("error", "An error has occurred!"));
        },
      }
    );
  };

  const handleClose = () => {
    setSearchParams((params) => {
      params.delete("add-money");
      return params;
    });
  };

  return (
    <Dialog
      open={Boolean(searchParams.get("add-money"))}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
    >
      <CustomDialogTitle
        title="Top up request"
        subtitle="Send a top up request"
        onClose={handleClose}
      />

      <DialogContent sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Typography
            variant="caption"
            fontStyle="italic"
            color="secondary"
            paragraph
          >
            Enter the amount you want to top up.
          </Typography>
          <TextField
            //  variant="filled"
            type="number"
            inputMode="numeric"
            placeholder="Amount"
            label="Top Up Amount"
            fullWidth
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">GH¢</InputAdornment>
              ),
              endAdornment: <InputAdornment position="end">p</InputAdornment>,
            }}
            value={amount}
            focused
            autoFocus
            onChange={(e) => setAmount(e.target.value)}
            error={Boolean(amountErr)}
            helperText={amountErr}
          />

          <LoadingButton
            type="submit"
            variant="contained"
            loading={isLoading}
            onClick={handleSubmit}
            fullWidth
            color="secondary"
            size='large'
          >
            Send Request
          </LoadingButton>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

export default TopUpRequest;
