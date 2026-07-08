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
  Stepper,
  Step,
  StepLabel,
  Divider,
  Grid,
  Box,
  alpha,
  useTheme,
  Skeleton,
  Chip,
} from "@mui/material";
import {
  VerifiedRounded,
  Close as CloseIcon,
  ElectricBolt as ElectricBoltIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  AccountBalance as AccountIcon,
  Receipt as ReceiptIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import DOMPurify from "dompurify";
import _ from "lodash";

import { AuthContext } from "../../../context/providers/AuthProvider";
import { CustomContext } from "../../../context/providers/CustomProvider";
import Transition from "../../../components/Transition";
import { prepaidMeterValidationSchema } from "@/config/validationSchema";
import { getMeterByNumber, postMeter } from "@/api/meterAPI";
import { globalAlertType } from "../../../components/alert/alertType";
import Swal from "sweetalert2";

// ------------------------------------------------------------
// Reusable Detail Row for the verification card
// ------------------------------------------------------------
const DetailRow = ({ icon: Icon, label, value }) => {
  const theme = useTheme();
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.5}
      sx={{
        py: 0.5,
        borderBottom: `1px solid ${theme.palette.divider}`,
        "&:last-of-type": { borderBottom: "none" },
      }}
    >
      {/* {Icon && (
        <Box
          sx={{
            color: "primary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 32,
            height: 32,
            borderRadius: "50%",
            bgcolor: alpha(theme.palette.primary.main, 0.08),
          }}
        >
          <Icon fontSize="small" />
        </Box>
      )} */}
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ minWidth: 120, fontWeight: 500, fontSize: 12 }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        fontWeight="medium"
        sx={{ flex: 1, fontSize: 12 }}
      >
        {value || "N/A"}
      </Typography>
    </Stack>
  );
};

// ------------------------------------------------------------
// Modern AddMeter Dialog
// ------------------------------------------------------------
function AddMeter() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { user } = useContext(AuthContext);
  const {
    customState: { addMeter },
    customDispatch,
  } = useContext(CustomContext);

  const [verifiedNumber, setVerifiedNumber] = useState(null);

  // Form
  const { control, handleSubmit, reset, watch } = useForm({
    resolver: yupResolver(prepaidMeterValidationSchema),
    mode: "onChange",
    defaultValues: {
      number: "",
      name: "",
    },
  });
  const watchedName = watch("name");

  // Meter verification
  const {
    data: meter,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["meter-verification", verifiedNumber],
    queryFn: () => getMeterByNumber(verifiedNumber, watchedName),
    enabled: !!verifiedNumber,
    retry: 1,
    staleTime: 0,
  });

  // Save meter
  const saveMutation = useMutation({
    mutationFn: postMeter,
    onSuccess: (message) => {
      customDispatch(
        globalAlertType("success", message || "Meter added successfully."),
      );
      queryClient.invalidateQueries({ queryKey: ["meter"] });
      handleClose();
    },
    onError: (err) => {
      customDispatch(globalAlertType("error", err || "Failed to save meter."));
    },
  });

  // Actions
  const handleClose = useCallback(() => {
    reset();
    setVerifiedNumber(null);
    customDispatch({
      type: "openAddMeter",
      payload: { open: false, details: {} },
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

  const addMeterHandler = useCallback(async () => {
    if (!meter) return;

    const result = await Swal.fire({
      title: "Confirm Add Meter",
      text: `Are you sure you want to add meter ${verifiedNumber}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, add it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
    });

    if (result.isConfirmed) {
      saveMutation.mutate({
        user_id: user?.id,
        number: DOMPurify.sanitize(verifiedNumber),
        name: DOMPurify.sanitize(meter.name?.toUpperCase()),
        address: DOMPurify.sanitize(meter.address?.toUpperCase()),
        type: meter.type?.toUpperCase(),
      });
    }
  }, [meter, saveMutation, user?.id, verifiedNumber]);

  const currentStep = verifiedNumber ? 1 : 0;

  // -------------------- Render --------------------
  return (
    <Dialog
      open={addMeter.open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Transition}
      PaperProps={{
        elevation: 8,
        sx: {
          borderRadius: 4,
          overflow: "hidden",
          background: theme.palette.background.paper,
          backdropFilter: "blur(4px)",
          boxShadow: `0 20px 60px ${alpha(theme.palette.common.black, 0.15)}`,
        },
      }}
    >
      {/* ---------- Header ---------- */}
      <Box
        sx={{
          p: 3,
          pb: 1.5,
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.06,
          )} 0%, ${alpha(theme.palette.secondary.main, 0.04)} 100%)`,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                bgcolor: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "common.white",
              }}
            >
              <ElectricBoltIcon fontSize="small" />
            </Box>
            <Typography variant="h6" fontWeight="700" letterSpacing={-0.5}>
              New {_.capitalize(addMeter?.type)} Meter
            </Typography>
          </Stack>
          <Button
            onClick={handleClose}
            size="small"
            sx={{
              minWidth: 0,
              width: 36,
              height: 36,
              borderRadius: "50%",
              color: "text.secondary",
              bgcolor: alpha(theme.palette.common.black, 0.04),
              "&:hover": { bgcolor: alpha(theme.palette.common.black, 0.08) },
            }}
          >
            <CloseIcon fontSize="small" />
          </Button>
        </Stack>
      </Box>

      <DialogContent sx={{ p: 3, pt: 2.5 }}>
        {/* ---------- Stepper ---------- */}
        <Stepper
          activeStep={currentStep}
          sx={{
            mb: 4,
            "& .MuiStepIcon-root": {
              color: theme.palette.grey[300],
              "&.Mui-completed": {
                color: theme.palette.success.main,
              },
              "&.Mui-active": {
                color: theme.palette.primary.main,
              },
            },
            "& .MuiStepLabel-label": {
              fontWeight: 500,
              "&.Mui-active": { fontWeight: 700 },
              "&.Mui-completed": { fontWeight: 600 },
            },
          }}
        >
          <Step>
            <StepLabel>Verify Meter</StepLabel>
          </Step>
          <Step>
            <StepLabel>Save Meter</StepLabel>
          </Step>
        </Stepper>

        {/* ---------- STEP 1: Verification Form ---------- */}
        {!verifiedNumber && (
          <form onSubmit={handleSubmit(onVerify)}>
            <Stack spacing={3}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
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
                    InputProps={{
                      startAdornment: (
                        <ReceiptIcon
                          fontSize="small"
                          sx={{ color: "text.secondary", mr: 1 }}
                        />
                      ),
                    }}
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
                    placeholder="e.g. JANE DOE"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    onChange={(e) =>
                      field.onChange(e.target.value.toUpperCase())
                    }
                    inputProps={{ style: { textTransform: "uppercase" } }}
                    InputProps={{
                      startAdornment: (
                        <PersonIcon
                          fontSize="small"
                          sx={{ color: "text.secondary", mr: 1 }}
                        />
                      ),
                    }}
                  />
                )}
              />
            </Stack>
          </form>
        )}

        {/* ---------- STEP 2: Verification Result ---------- */}
        {verifiedNumber && (
          <Stack spacing={3}>
            {/* Loading */}
            {isLoading && (
              <Stack spacing={2.5} sx={{ mt: 1 }}>
                {[...Array(4)].map((_, i) => (
                  <Stack
                    key={i}
                    direction="row"
                    alignItems="center"
                    spacing={2}
                  >
                    <Skeleton variant="circular" width={32} height={32} />
                    <Skeleton variant="text" width={120} height={24} />
                    <Skeleton variant="text" width="60%" height={24} />
                  </Stack>
                ))}
              </Stack>
            )}

            {/* Error */}
            {isError && !isLoading && (
              <Alert
                severity="error"
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  borderWidth: 2,
                  alignItems: "flex-start",
                  "& .MuiAlert-icon": { mt: 0.5 },
                }}
                action={
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => refetch()}
                    sx={{ fontWeight: 600, textTransform: "none" }}
                  >
                    Retry
                  </Button>
                }
              >
                <Typography variant="body2" fontWeight={500}>
                  {error?.message || "Unable to verify meter."}
                </Typography>
              </Alert>
            )}

            {/* Success - Meter found */}
            {!isLoading && !isError && meter && (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                  bgcolor: alpha(theme.palette.success.light, 0.08),
                  backdropFilter: "blur(2px)",
                }}
              >
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <VerifiedRounded color="success" />
                    <Typography fontWeight={700} color="success.main">
                      Meter Verified
                    </Typography>
                    <Chip
                      label={meter.type?.toUpperCase()}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ ml: "auto", fontWeight: 600 }}
                    />
                  </Stack>

                  <Divider />

                  <Stack spacing={0.5}>
                    <DetailRow
                      icon={ReceiptIcon}
                      label="Meter Number"
                      value={verifiedNumber}
                    />
                    <DetailRow
                      icon={PersonIcon}
                      label="Name"
                      value={meter.name}
                    />
                    <DetailRow
                      icon={ElectricBoltIcon}
                      label="Type"
                      value={meter.type}
                    />
                    <DetailRow
                      icon={HomeIcon}
                      label="Address"
                      value={meter.address}
                    />
                  </Stack>
                </Stack>
              </Paper>
            )}

            {/* Not found */}
            {!isLoading && !isError && !meter && (
              <Alert
                severity="warning"
                variant="outlined"
                sx={{ borderRadius: 3, borderWidth: 2 }}
              >
                Meter not found. Please verify the meter number.
              </Alert>
            )}
          </Stack>
        )}
      </DialogContent>

      {/* ---------- Actions ---------- */}
      <DialogActions
        sx={{
          p: 3,
          pt: 0,
          gap: 1.5,
          borderTop: `1px solid ${theme.palette.divider}`,
          bgcolor: alpha(theme.palette.background.default, 0.4),
        }}
      >
        {!verifiedNumber ? (
          <LoadingButton
            fullWidth
            variant="contained"
            size="large"
            onClick={handleSubmit(onVerify)}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
              boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.25)}`,
              "&:hover": {
                boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.35)}`,
              },
            }}
          >
            Verify Meter
          </LoadingButton>
        ) : (
          <>
            <Button
              fullWidth
              variant="outlined"
              color="inherit"
              onClick={goBack}
              startIcon={<ArrowBackIcon />}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
            >
              Back
            </Button>
            <LoadingButton
              fullWidth
              variant="contained"
              color="primary"
              onClick={addMeterHandler}
              loading={saveMutation.isPending}
              disabled={!meter || isLoading}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
                boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.25)}`,
                "&:hover": {
                  boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.35)}`,
                },
              }}
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

// import { useContext, useState, useCallback } from "react";

// import {
//   Dialog,
//   DialogContent,
//   DialogActions,
//   Stack,
//   TextField,
//   Alert,
//   Button,
//   Paper,
//   Typography,
//   CircularProgress,
//   Stepper,
//   Step,
//   StepLabel,
//   Divider,
//   Grid,
// } from "@mui/material";

// import { VerifiedRounded } from "@mui/icons-material";

// import { LoadingButton } from "@mui/lab";

// import { useForm, Controller } from "react-hook-form";

// import { yupResolver } from "@hookform/resolvers/yup";

// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// import DOMPurify from "dompurify";
// import _ from "lodash";

// import { AuthContext } from "../../../context/providers/AuthProvider";
// import { CustomContext } from "../../../context/providers/CustomProvider";

// import Transition from "../../../components/Transition";
// import CustomDialogTitle from "../../../components/dialogs/CustomDialogTitle";

// import { prepaidMeterValidationSchema } from "@/config/validationSchema";

// import { getMeterByNumber, postMeter } from "@/api/meterAPI";

// import { globalAlertType } from "../../../components/alert/alertType";

// function AddMeter() {
//   const queryClient = useQueryClient();

//   const { user } = useContext(AuthContext);

//   const {
//     customState: { addMeter },
//     customDispatch,
//   } = useContext(CustomContext);

//   const [verifiedNumber, setVerifiedNumber] = useState(null);

//   /*
//    |--------------------------------------------------------------------------
//    | Form
//    |--------------------------------------------------------------------------
//    */

//   const { control, handleSubmit, reset, watch } = useForm({
//     resolver: yupResolver(prepaidMeterValidationSchema),

//     mode: "onChange",
//     defaultValues: {
//       number: "",
//       name: "",
//     },
//   });

//   const watechedName = watch("name");

//   /*
//    |--------------------------------------------------------------------------
//    | Meter Verification
//    |--------------------------------------------------------------------------
//    */

//   const {
//     data: meter,
//     isLoading,
//     isError,
//     error,
//     refetch,
//   } = useQuery({
//     queryKey: ["meter-verification", verifiedNumber],
//     queryFn: () => getMeterByNumber(verifiedNumber, watechedName),
//     enabled: !!verifiedNumber,
//     retry: 1,
//     staleTime: 0,
//   });

//   /*
//    |--------------------------------------------------------------------------
//    | Save Meter
//    |--------------------------------------------------------------------------
//    */

//   const saveMutation = useMutation({
//     mutationFn: postMeter,

//     onSuccess: (message) => {
//       customDispatch(
//         globalAlertType("success", message || "Meter added successfully."),
//       );

//       queryClient.invalidateQueries({
//         queryKey: ["meter"],
//       });

//       handleClose();
//     },

//     onError: (err) => {
//       customDispatch(globalAlertType("error", err || "Failed to save meter."));
//     },
//   });

//   /*
//    |--------------------------------------------------------------------------
//    | Actions
//    |--------------------------------------------------------------------------
//    */

//   const handleClose = useCallback(() => {
//     reset();

//     setVerifiedNumber(null);

//     customDispatch({
//       type: "openAddMeter",
//       payload: {
//         open: false,
//         details: {},
//       },
//     });
//   }, [customDispatch, reset]);

//   const goBack = useCallback(() => {
//     setVerifiedNumber(null);
//   }, []);

//   const onVerify = async (values) => {
//     const meterNumber = values.number.trim().toUpperCase();

//     setVerifiedNumber(meterNumber);

//     await refetch();
//   };

//   const addMeterHandler = useCallback(() => {
//     // console.log(meter)
//     if (!meter) return;

//     saveMutation.mutate({
//       user_id: user?.id,
//       number: DOMPurify.sanitize(meter.number?.toUpperCase()),
//       name: DOMPurify.sanitize(meter.name?.toUpperCase()),
//       address: DOMPurify.sanitize(meter.address?.toUpperCase()),
//       type: meter.type?.toUpperCase(),
//     });
//   }, [meter, saveMutation, user?.id]);

//   const currentStep = verifiedNumber ? 1 : 0;

//   return (
//     <Dialog
//       open={addMeter.open}
//       onClose={handleClose}
//       maxWidth="sm"
//       fullWidth
//       TransitionComponent={Transition}
//       PaperProps={{
//         sx: {
//           borderRadius: 4,
//           overflow: "hidden",
//         },
//       }}
//     >
//       <CustomDialogTitle
//         title={`New ${_.capitalize(addMeter?.type)} Meter`}
//         onClose={handleClose}
//       />

//       <DialogContent
//         sx={{
//           p: 3,
//         }}
//       >
//         {/* Stepper */}

//         <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
//           <Step>
//             <StepLabel>Verify Meter</StepLabel>
//           </Step>

//           <Step>
//             <StepLabel>Save Meter</StepLabel>
//           </Step>
//         </Stepper>

//         {/* STEP 1 */}

//         {!verifiedNumber && (
//           <form onSubmit={handleSubmit(onVerify)}>
//             <Stack spacing={3}>
//               <Typography variant="body2" color="text.secondary">
//                 Enter the meter ID to verify the account details before saving.
//               </Typography>

//               <Controller
//                 name="number"
//                 control={control}
//                 render={({ field, fieldState }) => (
//                   <TextField
//                     {...field}
//                     label="Meter ID"
//                     placeholder="e.g. Q788798766"
//                     fullWidth
//                     autoFocus
//                     error={!!fieldState.error}
//                     helperText={fieldState.error?.message}
//                     onChange={(e) =>
//                       field.onChange(e.target.value.toUpperCase())
//                     }
//                   />
//                 )}
//               />
//               <Controller
//                 name="name"
//                 control={control}
//                 render={({ field, fieldState }) => (
//                   <TextField
//                     {...field}
//                     label="Meter Name (Optional)"
//                     placeholder="e.g. Jane Doe"
//                     fullWidth
//                     error={!!fieldState.error}
//                     helperText={fieldState.error?.message}
//                     onChange={(e) =>
//                       field.onChange(e.target.value.toUpperCase())
//                     }
//                     inputProps={{ style: { textTransform: "uppercase" } }}
//                   />
//                 )}
//               />

//               {/* <Controller
//                 name="confirmNumber"
//                 control={control}
//                 render={({ field, fieldState }) => (
//                   <TextField
//                     {...field}
//                     label="Confirm Meter ID"
//                     placeholder="e.g. Q788798766"
//                     fullWidth
//                     error={!!fieldState.error}
//                     helperText={fieldState.error?.message}
//                     onChange={(e) =>
//                       field.onChange(e.target.value.toUpperCase())
//                     }
//                   />
//                 )}
//               /> */}
//             </Stack>
//           </form>
//         )}

//         {/* STEP 2 */}

//         {verifiedNumber && (
//           <Stack spacing={3}>
//             {isLoading && (
//               <Stack spacing={2} alignItems="center" py={4}>
//                 <CircularProgress />

//                 <Typography variant="body2" color="text.secondary">
//                   Verifying meter details...
//                 </Typography>
//               </Stack>
//             )}

//             {isError && (
//               <Alert
//                 severity="error"
//                 action={
//                   <Button
//                     color="inherit"
//                     size="small"
//                     onClick={() => refetch()}
//                   >
//                     Retry
//                   </Button>
//                 }
//               >
//                 {error?.message || "Unable to verify meter."}
//               </Alert>
//             )}

//             {!isLoading && !isError && meter && (
//               <Paper
//                 elevation={0}
//                 sx={{
//                   p: 3,
//                   borderRadius: 3,
//                   border: "1px solid",

//                   borderColor: "success.light",

//                   bgcolor: "success.50",
//                 }}
//               >
//                 <Stack spacing={3}>
//                   <Stack direction="row" spacing={1} alignItems="center">
//                     <VerifiedRounded color="success" />

//                     <Typography fontWeight={700} color="success.main">
//                       Meter Verified
//                     </Typography>
//                   </Stack>

//                   <Divider />

//                   <Grid container spacing={2}>
//                     <Grid item xs={5}>
//                       <Typography fontWeight={600}>Meter Number</Typography>
//                     </Grid>

//                     <Grid item xs={7}>
//                       {meter.number}
//                     </Grid>

//                     <Grid item xs={5}>
//                       <Typography fontWeight={600}>Name</Typography>
//                     </Grid>

//                     <Grid item xs={7}>
//                       {meter.name}
//                     </Grid>

//                     <Grid item xs={5}>
//                       <Typography fontWeight={600}>Type</Typography>
//                     </Grid>

//                     <Grid item xs={7}>
//                       {meter.type}
//                     </Grid>

//                     <Grid item xs={5}>
//                       <Typography fontWeight={600}>Address</Typography>
//                     </Grid>

//                     <Grid item xs={7}>
//                       {meter.address}
//                     </Grid>
//                   </Grid>
//                 </Stack>
//               </Paper>
//             )}

//             {!isLoading && !isError && !meter && (
//               <Alert severity="warning">
//                 Meter not found. Please verify the meter number.
//               </Alert>
//             )}
//           </Stack>
//         )}
//       </DialogContent>

//       <DialogActions
//         sx={{
//           p: 3,
//           pt: 0,
//           gap: 1,
//         }}
//       >
//         {!verifiedNumber ? (
//           <LoadingButton
//             fullWidth
//             variant="contained"
//             size="large"
//             onClick={handleSubmit(onVerify)}
//           >
//             Verify Meter
//           </LoadingButton>
//         ) : (
//           <>
//             <Button fullWidth variant="ghost" onClick={goBack}>
//               Back
//             </Button>

//             <LoadingButton
//               fullWidth
//               variant="contained"
//               color="primary"
//               onClick={addMeterHandler}
//               loading={saveMutation.isPending}
//               disabled={!meter || isLoading}
//             >
//               Save Meter
//             </LoadingButton>
//           </>
//         )}
//       </DialogActions>
//     </Dialog>
//   );
// }

// export default AddMeter;
