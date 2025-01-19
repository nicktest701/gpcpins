import { useContext, useState } from "react";
import {
  Dialog,
  DialogContent,
  TextField,
  Stack,
} from "@mui/material";
import DOMPurify from "dompurify";
import { LoadingButton } from "@mui/lab";
import { useParams, useSearchParams } from "react-router-dom";
import CustomDialogTitle from "../../../components/dialogs/CustomDialogTitle";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { globalAlertType } from "../../../components/alert/alertType";
import { CustomContext } from "../../../context/providers/CustomProvider";
import { AuthContext } from "../../../context/providers/AuthProvider";
import { verifyPin } from "../../../config/validation";

import Swal from "sweetalert2";
import { updateAgentWalletPin } from "../../../api/agentAPI";

function ChangePin() {
  const { user } = useContext(AuthContext);
  const { customDispatch } = useContext(CustomContext);
  const queryClient = useQueryClient();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [pin, setPin] = useState("");
  const [pinErr, setPinErr] = useState("");

  //Change pin number
  const { mutateAsync: pinMutateAsync, isLoading: pinIsLoading } = useMutation({
    mutationFn: updateAgentWalletPin,
  });

  const handleChangePin = () => {
    if (pin.trim() === "") {
      setPinErr("Required!");
      return;
    }
    if (!verifyPin(pin)) {
      setPinErr("Invalid Pin! Should be 4-digit number.");
      return;
    }

    const sanitizedPin = DOMPurify.sanitize(pin?.trim());

    const data = {
      _id: id,
      pin: sanitizedPin,
      agentEmail: user?.email,
      isAdmin: true,
    };

    Swal.fire({
      title: "Updating Wallet Pin",
      text: `Procceed with changes?`,
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        pinMutateAsync(data, {
          onSettled: () => {
            queryClient.invalidateQueries(["agents"]);
            queryClient.invalidateQueries(["agent"]);
          },
          onSuccess: (data) => {
            customDispatch(globalAlertType("info", data));

            handleClose();
            setPin("");
          },
          onError: (error) => {
            customDispatch(globalAlertType("error", error));
          },
        });
      }
    });
  };

  const handleClose = () => {
    setSearchParams((params) => {
      params.delete("view_agent_pin");
      return params;
    });
  };

  return (
    <Dialog
      open={Boolean(searchParams.get("view_agent_pin"))}
      maxWidth="xs"
      fullWidth
    >
      <CustomDialogTitle title="Change Agent Pin" onClose={handleClose} />
      <DialogContent>
        <Stack spacing={2} py={2}>
          <TextField
            type="number"
            inputMode="number"
            variant="outlined"
            label="New Wallet Pin"
            fullWidth
            required
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            error={pinErr !== ""}
            helperText={pinErr}
            margin="dense"
          />

          <LoadingButton
            variant="contained"
            fullWidth
            disabled={pinIsLoading}
            loading={pinIsLoading}
            onClick={handleChangePin}
          >
            Change Pin
          </LoadingButton>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

export default ChangePin;
