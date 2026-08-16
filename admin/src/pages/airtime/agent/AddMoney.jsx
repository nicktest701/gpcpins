import { useContext, useState } from "react";
import {
  Dialog,
  DialogContent,
  Container,
  TextField,
  InputAdornment,
  Input,
  InputLabel,
  Stack,
  Paper,
  Typography,
  Box,
  IconButton,
  Avatar,
  Alert,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useSearchParams, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Swal from "sweetalert2";
import { Close, CloudUpload } from "@mui/icons-material";
import CustomDialogTitle from "../../../components/dialogs/CustomDialogTitle";
import { addWalletValidationSchema } from "../../../config/validationSchema";
import { topUpWallet } from "../../../api/transactionAPI";
import { CustomContext } from "../../../context/providers/CustomProvider";
import { globalAlertType } from "../../../components/alert/alertType";

function AddMoney() {
  const { customDispatch } = useContext(CustomContext);
  const queryClient = useQueryClient();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  // State for file preview
  const [filePreview, setFilePreview] = useState(null);
  const [fileError, setFileError] = useState("");

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(addWalletValidationSchema()),
    defaultValues: {
      id,
      comment: "",
      amount: "",
      attachment: null,
      type: "agent",
    },
  });

  const attachment = watch("attachment");

  // Mutation for top-up
  const {
    mutateAsync,
    isLoading,
    reset: mutateReset,
  } = useMutation({
    mutationFn: topUpWallet,
    onSuccess: (data) => {
      customDispatch(globalAlertType("success", data));
      // handleClose();
      // Invalidate relevant queries
      queryClient.invalidateQueries(["agent_wallet_transactions", id]);
      queryClient.invalidateQueries(["agent", id]);
      setSearchParams((params) => {
        params.delete("add-money");
        return params;
      });
      reset();
      mutateReset();
    },
    onError: (error) => {
      customDispatch(globalAlertType("error", error));
    },
  });

  const handleClose = () => {
    Swal.fire({
      title: "Cancel Top-up",
      text: "Do you want to cancel loading the wallet?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, cancel",
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        mutateReset();
        reset();

        setSearchParams((params) => {
          params.delete("add-money");
          return params;
        });
      }
    });
  };

  // File change handler with preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setFilePreview(null);
      setValue("attachment", null);
      return;
    }

    // Validate file type (optional)
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
    ];
    if (!validTypes.includes(file.type)) {
      setFileError("Only images (JPEG, PNG) or PDF files are allowed.");
      setFilePreview(null);
      setValue("attachment", null);
      return;
    }

    setFileError("");

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setFilePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null); // PDF or other files
    }

    setValue("attachment", file);
  };

  const removeFile = () => {
    setFilePreview(null);
    setValue("attachment", null);
    // Reset file input
    const fileInput = document.getElementById("file-upload");
    if (fileInput) fileInput.value = "";
  };

  const onSubmit = (values) => {
    Swal.fire({
      title: "Confirm Top-up",
      text: `Proceed to top up wallet with ${values.amount} GHS?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, proceed",
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        // Create FormData for file upload if attachment exists
        // const formData = new FormData();
        // formData.append("id", values.id);
        // formData.append("comment", values.comment);
        // formData.append("amount", values.amount);
        // formData.append("type", values.type);
        // if (values.attachment) {
        //   formData.append("attachment", values.attachment);
        // }
        mutateAsync(values);
      }
    });
  };

  return (
    <Dialog
      open={Boolean(searchParams.get("add-money"))}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 1.2 },
      }}
    >
      <CustomDialogTitle
        title="Load Wallet"
        subtitle="Top up your wallet"
        onClose={handleClose}
      />

      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={3} sx={{ py: 2 }}>
            {/* Amount Field */}
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  label="Top Up Amount"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">GH¢</InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">p</InputAdornment>
                    ),
                  }}
                  error={!!errors.amount}
                  helperText={errors.amount?.message}
                  fullWidth
                  autoFocus
                />
              )}
            />

            {/* Comment Field */}
            <Controller
              name="comment"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Comment"
                  multiline
                  rows={2}
                  required
                  error={!!errors.comment}
                  helperText={errors.comment?.message}
                  fullWidth
                />
              )}
            />

            {/* Attachment Upload with Preview */}
            <Box>
              <InputLabel sx={{ mb: 1 }}>
                Add an Attachment (optional)
              </InputLabel>
              <Input
                id="file-upload"
                type="file"
                fullWidth
                onChange={handleFileChange}
                inputProps={{
                  accept: "image/jpeg,image/png,image/jpg,application/pdf",
                }}
                sx={{ mb: 1 }}
              />
              {fileError && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {fileError}
                </Alert>
              )}
              {attachment && (
                <Paper
                  variant="outlined"
                  sx={{
                    mt: 2,
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    bgcolor: "action.hover",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {filePreview ? (
                      <Avatar
                        src={filePreview}
                        variant="rounded"
                        sx={{ width: 60, height: 60, objectFit: "cover" }}
                      />
                    ) : (
                      <CloudUpload color="action" />
                    )}
                    <Typography variant="body2">{attachment.name}</Typography>
                  </Box>
                  <IconButton size="small" onClick={removeFile}>
                    <Close fontSize="small" />
                  </IconButton>
                </Paper>
              )}
            </Box>

            <LoadingButton
              type="submit"
              variant="contained"
              loading={isSubmitting || isLoading}
              fullWidth
              size="large"
              sx={{ mt: 1 }}
            >
              Load Wallet
            </LoadingButton>
          </Stack>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddMoney;

// import { useContext } from "react";
// import {
//   Dialog,
//   DialogContent,
//   Container,
//   TextField,
//   InputAdornment,
//   Input,
//   InputLabel,
//   Stack,
// } from "@mui/material";
// import { LoadingButton } from "@mui/lab";
// import { useSearchParams, useParams } from "react-router-dom";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import CustomDialogTitle from "../../../components/dialogs/CustomDialogTitle";
// import { Formik } from "formik";
// import Swal from "sweetalert2";
// import { addWalletValidationSchema } from "../../../config/validationSchema";
// import { topUpWallet } from "../../../api/transactionAPI";
// import { CustomContext } from "../../../context/providers/CustomProvider";
// import { globalAlertType } from "../../../components/alert/alertType";

// function AddMoney() {
//   const { customDispatch } = useContext(CustomContext);
//   const queryClient = useQueryClient();
//   const { id } = useParams();
//   const [searchParams, setSearchParams] = useSearchParams();

//   const handleClose = () => {
//     Swal.fire({
//       title: "Loading Wallet",
//       text: `Do you want to cancel loading of agent wallet?`,
//       showCancelButton: true,
//     }).then(({ isConfirmed }) => {
//       if (isConfirmed) {
//         setSearchParams((params) => {
//           params.delete("add-money");
//           return params;
//         });
//       }
//     });
//   };

//   const initiaValues = {
//     id,
//     comment: "",
//     amount: 0,
//     attachment: null,
//     type: "agent",
//   };

//   const { mutateAsync, isLoading } = useMutation({
//     mutationFn: topUpWallet,
//   });
//   const onSubmit = (values) => {
//     Swal.fire({
//       title: "Loading Wallet",
//       text: `Proceed with Top Up?`,
//       showCancelButton: true,
//     }).then(({ isConfirmed }) => {
//       if (isConfirmed) {
//         mutateAsync(values, {
//           onSettled: () => {
//             queryClient.invalidateQueries(["agent_wallet_transactions", id]);
//             queryClient.invalidateQueries(["agent", id]);
//           },
//           onSuccess: (data) => {
//             customDispatch(globalAlertType("success", data));
//             setSearchParams((params) => {
//               params.delete("add-money");
//               return params;
//             });
//           },
//           onError: (error) => {
//             customDispatch(globalAlertType("error", error));
//           },
//         });
//       }
//     });
//   };

//   return (
//     <Dialog
//       open={Boolean(searchParams.get("add-money"))}
//       onClose={handleClose}
//       maxWidth="sm"
//       fullWidth
//     >
//       <CustomDialogTitle
//         title="Load Wallet"
//         subtitle="Top up your wallet"
//         onClose={handleClose}
//       />

//       <Formik
//         initialValues={initiaValues}
//         onSubmit={onSubmit}
//         enableReinitialize={true}
//         validationSchema={addWalletValidationSchema}
//       >
//         {({
//           values,
//           errors,
//           touched,
//           setFieldValue,
//           handleChange,
//           handleBlur,
//           handleSubmit,
//         }) => {
//           return (
//             <DialogContent sx={{ px: 1 }}>
//               <Container
//                 sx={{
//                   py: 4,
//                   display: "flex",
//                   flexDirection: "column",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   gap: 2,
//                 }}
//               >
//                 <TextField
//                   type="number"
//                   inputMode="numeric"
//                   placeholder="Amount"
//                   label="Top Up Amount"
//                   fullWidth
//                   required
//                   InputProps={{
//                     startAdornment: (
//                       <InputAdornment position="start">GH¢</InputAdornment>
//                     ),
//                     endAdornment: (
//                       <InputAdornment position="end">p</InputAdornment>
//                     ),
//                   }}
//                   focused
//                   value={values.amount}
//                   onChange={handleChange("amount")}
//                   onBlur={handleBlur("amount")}
//                   error={Boolean(touched.amount && errors.amount)}
//                   helperText={errors.amount}
//                 />
//                 <TextField
//                   multiline
//                   variant="outlined"
//                   label="Comment"
//                   fullWidth
//                   required
//                   value={values.comment}
//                   handleBlur={handleBlur("comment")}
//                   onChange={handleChange("comment")}
//                   error={Boolean(touched.comment && errors.comment)}
//                   helperText={errors.comment}
//                   margin="dense"
//                 />
//                 <Stack pb={4} spacing={1} width="100%">
//                   <InputLabel sx={{ alignSelf: "flex-start" }}>
//                     Add An Attachment
//                   </InputLabel>
//                   <Input
//                     type="file"
//                     fullWidth
//                     onChange={(e) =>
//                       setFieldValue("attachment", e.target.files[0])
//                     }
//                   />
//                 </Stack>
//                 <LoadingButton
//                   type="submit"
//                   variant="contained"
//                   loading={isLoading}
//                   onClick={handleSubmit}
//                   fullWidth
//                   size="large"
//                 >
//                   Load Wallet
//                 </LoadingButton>
//               </Container>
//             </DialogContent>
//           );
//         }}
//       </Formik>
//     </Dialog>
//   );
// }

// export default AddMoney;
