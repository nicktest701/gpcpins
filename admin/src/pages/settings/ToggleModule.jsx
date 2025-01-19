import {
  Dialog,
  DialogActions,
  DialogContent,
  TextField,
  Typography,
} from "@mui/material";
import  { useContext, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import CustomDialogTitle from "../../components/dialogs/CustomDialogTitle";
import { LoadingButton } from "@mui/lab";
import Swal from "sweetalert2";
import { postModuleStatus } from "../../api/categoryAPI";
import { CustomContext } from "../../context/providers/CustomProvider";
import { globalAlertType } from "../../components/alert/alertType";

function ToggleModule() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { customDispatch } = useContext(CustomContext);
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();

  const handleClose = () => {
    setSearchParams((params) => {
      params.delete("toggle_module");
      params.delete("mode");
      return params;
    });
  };

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: postModuleStatus,
  });

  const handleSubmit = () => {
    const data = {
      active: false,
      message,
      title: searchParams.get("mode"),
    };

    Swal.fire({
      title: "Deactivating Module",
      text: `Do you wish to deactivate module?`,
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        mutateAsync(data, {
          onSettled: () => {
            queryClient.invalidateQueries(["module-status"]);
          },
          onSuccess: (data) => {
            customDispatch(globalAlertType("info", data));
            handleClose();
          },
          onError: (errorFF) => {
            customDispatch(globalAlertType("error", errorFF));
          },
        });
      }
    });
  };

  return (
    <Dialog
      open={Boolean(searchParams.get("toggle_module"))}
      maxWidth="sm"
      fullWidth
    >
      <CustomDialogTitle title=" Module Deactivation" onClose={handleClose} />
      <DialogContent sx={{ py: 6, px: 4 }}>
        <Typography variant="h4" paragraph>
          Message
        </Typography>
        <Typography paragraph>
          This message will be shown to customers anything they visit your
          website.
        </Typography>
        <TextField
          multiline
          rows={6}
          minRows={6}
          fullWidth
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <LoadingButton
          variant="contained"
          disabled={isLoading}
          loading={isLoading}
          onClick={handleSubmit}
        >
          Deactivate
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

export default ToggleModule;
