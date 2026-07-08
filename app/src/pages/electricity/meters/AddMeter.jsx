import { useContext, useState, useCallback } from "react";

import {
  Dialog,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  Alert,
  Button,
  Paper,
  Typography,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Grid,
} from "@mui/material";

import { VerifiedRounded } from "@mui/icons-material";

import { LoadingButton } from "@mui/lab";

import { useForm, Controller } from "react-hook-form";

import { yupResolver } from "@hookform/resolvers/yup";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import DOMPurify from "dompurify";
import _ from "lodash";

import { AuthContext } from "../../../context/providers/AuthProvider";
import { CustomContext } from "../../../context/providers/CustomProvider";

import Transition from "../../../components/Transition";
import CustomDialogTitle from "../../../components/dialogs/CustomDialogTitle";

import { prepaidMeterValidationSchema } from "@/config/validationSchema";

import { getMeterByNumber, postMeter } from "@/api/meterAPI";

import { globalAlertType } from "../../../components/alert/alertType";

function AddMeter() {
  const queryClient = useQueryClient();

  const { user } = useContext(AuthContext);

  const {
    customState: { addMeter },
    customDispatch,
  } = useContext(CustomContext);

  const [verifiedNumber, setVerifiedNumber] = useState(null);

  /*
   |--------------------------------------------------------------------------
   | Form
   |--------------------------------------------------------------------------
   */

  const { control, handleSubmit, reset, watch } = useForm({
    resolver: yupResolver(prepaidMeterValidationSchema),

    mode: "onChange",
    defaultValues: {
      number: "",
      name: "",
    },
  });

  const watechedName = watch("name");

  /*
   |--------------------------------------------------------------------------
   | Meter Verification
   |--------------------------------------------------------------------------
   */

  const {
    data: meter,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["meter-verification", verifiedNumber],
    queryFn: () => getMeterByNumber(verifiedNumber, watechedName),
    enabled: !!verifiedNumber,
    retry: 1,
    staleTime: 0,
  });

  /*
   |--------------------------------------------------------------------------
   | Save Meter
   |--------------------------------------------------------------------------
   */

  const saveMutation = useMutation({
    mutationFn: postMeter,

    onSuccess: (message) => {
      customDispatch(
        globalAlertType("success", message || "Meter added successfully."),
      );

      queryClient.invalidateQueries({
        queryKey: ["meter"],
      });

      handleClose();
    },

    onError: (err) => {
      customDispatch(globalAlertType("error", err || "Failed to save meter."));
    },
  });

  /*
   |--------------------------------------------------------------------------
   | Actions
   |--------------------------------------------------------------------------
   */

  const handleClose = useCallback(() => {
    reset();

    setVerifiedNumber(null);

    customDispatch({
      type: "openAddMeter",
      payload: {
        open: false,
        details: {},
      },
    });
  }, [customDispatch, reset]);

  const goBack = useCallback(() => {
    setVerifiedNumber(null);
  }, []);

  const onVerify = async (values) => {
    const meterNumber = values.number.trim().toUpperCase();

    setVerifiedNumber(meterNumber);

    await refetch();
  };

  const addMeterHandler = useCallback(() => {
    // console.log(meter)
    if (!meter) return;

    saveMutation.mutate({
      user_id: user?.id,
      number: DOMPurify.sanitize(meter.number?.toUpperCase()),
      name: DOMPurify.sanitize(meter.name?.toUpperCase()),
      address: DOMPurify.sanitize(meter.address?.toUpperCase()),
      type: meter.type?.toUpperCase(),
    });
  }, [meter, saveMutation, user?.id]);

  const currentStep = verifiedNumber ? 1 : 0;

  return (
    <Dialog
      open={addMeter.open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: "hidden",
        },
      }}
    >
      <CustomDialogTitle
        title={`New ${_.capitalize(addMeter?.type)} Meter`}
        onClose={handleClose}
      />

      <DialogContent
        sx={{
          p: 3,
        }}
      >
        {/* Stepper */}

        <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
          <Step>
            <StepLabel>Verify Meter</StepLabel>
          </Step>

          <Step>
            <StepLabel>Save Meter</StepLabel>
          </Step>
        </Stepper>

        {/* STEP 1 */}

        {!verifiedNumber && (
          <form onSubmit={handleSubmit(onVerify)}>
            <Stack spacing={3}>
              <Typography variant="body2" color="text.secondary">
                Enter the meter ID to verify the account details before saving.
              </Typography>

              <Controller
                name="number"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Meter ID"
                    placeholder="e.g. Q788798766"
                    fullWidth
                    autoFocus
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    onChange={(e) =>
                      field.onChange(e.target.value.toUpperCase())
                    }
                  />
                )}
              />
              <Controller
                name="name"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Meter Name (Optional)"
                    placeholder="e.g. Jane Doe"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    onChange={(e) =>
                      field.onChange(e.target.value.toUpperCase())
                    }
                    inputProps={{ style: { textTransform: "uppercase" } }}
                  />
                )}
              />

              {/* <Controller
                name="confirmNumber"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Confirm Meter ID"
                    placeholder="e.g. Q788798766"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    onChange={(e) =>
                      field.onChange(e.target.value.toUpperCase())
                    }
                  />
                )}
              /> */}
            </Stack>
          </form>
        )}

        {/* STEP 2 */}

        {verifiedNumber && (
          <Stack spacing={3}>
            {isFetching && (
              <Stack spacing={2} alignItems="center" py={4}>
                <CircularProgress />

                <Typography variant="body2" color="text.secondary">
                  Verifying meter details...
                </Typography>
              </Stack>
            )}

            {isError && (
              <Alert
                severity="error"
                action={
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => refetch()}
                  >
                    Retry
                  </Button>
                }
              >
                {error?.message || "Unable to verify meter."}
              </Alert>
            )}

            {!isFetching && !isError && meter && (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: "1px solid",

                  borderColor: "success.light",

                  bgcolor: "success.50",
                }}
              >
                <Stack spacing={3}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <VerifiedRounded color="success" />

                    <Typography fontWeight={700} color="success.main">
                      Meter Verified
                    </Typography>
                  </Stack>

                  <Divider />

                  <Grid container spacing={2}>
                    <Grid item xs={5}>
                      <Typography fontWeight={600}>Meter Number</Typography>
                    </Grid>

                    <Grid item xs={7}>
                      {meter.number}
                    </Grid>

                    <Grid item xs={5}>
                      <Typography fontWeight={600}>Name</Typography>
                    </Grid>

                    <Grid item xs={7}>
                      {meter.name}
                    </Grid>

                    <Grid item xs={5}>
                      <Typography fontWeight={600}>Type</Typography>
                    </Grid>

                    <Grid item xs={7}>
                      {meter.type}
                    </Grid>

                    <Grid item xs={5}>
                      <Typography fontWeight={600}>Address</Typography>
                    </Grid>

                    <Grid item xs={7}>
                      {meter.address}
                    </Grid>
                  </Grid>
                </Stack>
              </Paper>
            )}

            {!isFetching && !isError && !meter && (
              <Alert severity="warning">
                Meter not found. Please verify the meter number.
              </Alert>
            )}
          </Stack>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          p: 3,
          pt: 0,
          gap: 1,
        }}
      >
        {!verifiedNumber ? (
          <LoadingButton
            fullWidth
            variant="contained"
            size="large"
            onClick={handleSubmit(onVerify)}
          >
            Verify Meter
          </LoadingButton>
        ) : (
          <>
            <Button fullWidth variant="ghost" onClick={goBack}>
              Back
            </Button>

            <LoadingButton
              fullWidth
              variant="contained"
              color="primary"
              onClick={addMeterHandler}
              loading={saveMutation.isPending}
              disabled={!meter || isFetching}
            >
              Save Meter
            </LoadingButton>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default AddMeter;
