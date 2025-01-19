import {
  Container,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

import { useContext, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CustomContext } from "../../../context/providers/CustomProvider";
import CheckOutItem from "../../../components/items/CheckOutItem";
import CustomDialogTitle from "../../../components/dialogs/CustomDialogTitle";
import Transition from "../../../components/Transition";
import { LoadingButton } from "@mui/lab";
import { ArrowBackRounded } from "@mui/icons-material";
import { postMeter } from "../../../api/meterAPI";
import { globalAlertType } from "../../../components/alert/alertType";

function ConfirmAddMeter() {
  const queryClient = useQueryClient();

  const {
    customState: { verifyNewMeter },
    customDispatch,
  } = useContext(CustomContext);

  const [isLoading, setIsLoading] = useState(false);

  //close dialog
  const handleClose = () =>
    customDispatch({
      type: "openVerifyNewMeter",
      payload: {
        open: false,
        // details: {},
      },
    });

  //SAVE meter Information
  const { mutateAsync } = useMutation({
    mutationFn: postMeter,
  });

  const onSubmit = () => {
    setIsLoading(true);
    const meter = {
      ...verifyNewMeter?.details,
      type: "Prepaid",
    };

    mutateAsync(meter, {
      onSettled: () => {
        setIsLoading(false);
        queryClient.invalidateQueries(["meter"]);
      },
      onSuccess: (data) => {
        customDispatch(globalAlertType("info", data));
        handleClose();
      },
      onError: (error) => {
        // showBoundary(error);
        customDispatch(globalAlertType("error", error));
      },
    });
  };

  //GO BACK to add new meter
  const goBack = () => {
    customDispatch({
      type: "openAddMeter",
      payload: {
        open: true,
        type: verifyNewMeter.details?.type,
        details: verifyNewMeter.details,
      },
    });

    handleClose();
  };

  return (
    <Dialog
      open={verifyNewMeter.open}
      maxWidth="xs"
      fullWidth
      TransitionComponent={Transition}
    >
      <CustomDialogTitle
        title="Confirm Meter"
        onClose={handleClose}
      />
      <DialogContent>
        <IconButton onClick={goBack}>
          <ArrowBackRounded />
        </IconButton>
        <Stack
          justifyContent="center"
          alignItems="center"
          padding={2}
          spacing={2}
        >
          <Typography variant="caption" textAlign="center">
            Please check to make sure the Meter Information provided is correct.
          </Typography>
        </Stack>
        <Container
          sx={{
            borderRadius: 2,
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            padding: 3,
            display: "flex",
            flexDirection: "column",
            gap: 1,
            bgcolor: "secondary.main",
            color: "secondary.contrastText",
            marginY: 3,
          }}
        >
          <CheckOutItem
            color="secondary.contrastText"
            title="IMES Meter"
            value={verifyNewMeter?.details?.number}
          />
          {verifyNewMeter?.details?.spn && (
            <CheckOutItem
              color="secondary.contrastText"
              title="SPN Number"
              value={verifyNewMeter?.details?.spn}
            />
          )}
          {verifyNewMeter?.details?.name && (
            <CheckOutItem
              color="secondary.contrastText"
              title="Name"
              value={verifyNewMeter?.details?.name}
            />
          )}
          <CheckOutItem
            color="secondary.contrastText"
            title="Prepaid Type"
            value={verifyNewMeter?.details?.type}
          />
          <CheckOutItem
            color="secondary.contrastText"
            title="Location"
            value={verifyNewMeter?.details?.district}
          />
        </Container>

        <LoadingButton
          type="submit"
          loading={isLoading}
          variant="contained"
          fullWidth
          onClick={onSubmit}
        >
          Save Meter
        </LoadingButton>
      </DialogContent>
    </Dialog>
  );
}

export default ConfirmAddMeter;
