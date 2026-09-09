// src/components/modals/ResetPasswordModal.jsx
import { useState } from "react";
import {
  Button,
  Stack,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { Visibility, VisibilityOff, LockReset } from "@mui/icons-material";
import { passwordValidationSchema } from "../../config/validationSchema";
import { resetEmployeePassword } from "@/api/employeeAPI";
import { useCustomContext } from "../../context/providers/CustomProvider";
import { globalAlertType } from "../../components/alert/alertType";
import DialogContainer from "../../components/dialogs/DialogContainer";

const ResetPasswordModal = ({ employeeId, isNew = false }) => {
  const { customDispatch } = useCustomContext();
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(passwordValidationSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const mutation = useMutation({
    mutationFn: resetEmployeePassword,
    onSuccess: (data) => {
      customDispatch(globalAlertType("success", data || "Password reset successful!"));
      handleClose();
    },
    onError: (error) => {
      customDispatch(globalAlertType("error", error));
    },
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    reset();
  };

  const onSubmit = (values) => {
    mutation.mutate({
      id: employeeId,
      password: values.password,
    });
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<LockReset />}
        onClick={handleOpen}
        size="small"
      >
        {isNew ? "Set Password" : "Reset Password"}
      </Button>

      <DialogContainer
        open={open}
        onClose={handleClose}
        title={isNew ? "Set New Password" : "Reset Password"}
        subtitle={
          isNew
            ? "Create a strong password for this employee."
            : "Enter a new password for this employee."
        }
        onConfirm={handleSubmit(onSubmit)}
        loading={mutation.isPending || isSubmitting}
        confirmText={isNew ? "Set Password" : "Reset"}
        maxWidth="xs"
      >
        <Stack spacing={2}>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type={showPassword ? "text" : "password"}
                label="New Password"
                fullWidth
                required
                error={!!errors.password}
                helperText={errors.password?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type={showConfirmPassword ? "text" : "password"}
                label="Confirm Password"
                fullWidth
                required
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          <Stack spacing={0.5} sx={{ pl: 1 }}>
            <Typography variant="caption" color="text.secondary">
              • Password must be at least 8 characters
            </Typography>
            <Typography variant="caption" color="text.secondary">
              • Must start with an uppercase letter
            </Typography>
            <Typography variant="caption" color="text.secondary">
              • Must contain both numbers and letters
            </Typography>
            <Typography variant="caption" color="warning.main" fontWeight="500">
              • Must contain at least one special character (!@#$%^&* etc.)
            </Typography>
          </Stack>
        </Stack>
      </DialogContainer>
    </>
  );
};

export default ResetPasswordModal;

// // src/components/modals/ResetPasswordModal.jsx
// import { useState } from "react";
// import {
//   Button,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Stack,
//   TextField,
//   Typography,
//   IconButton,
//   InputAdornment,
// } from "@mui/material";
// import { LoadingButton } from "@mui/lab";
// import { useForm, Controller } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import { useMutation } from "@tanstack/react-query";
// import { Visibility, VisibilityOff, LockReset } from "@mui/icons-material";
// import { passwordValidationSchema } from "../../config/validationSchema";
// import { resetEmployeePassword } from "@/api/employeeAPI";
// import { useCustomContext } from "../../context/providers/CustomProvider";
// import { globalAlertType } from "../../components/alert/alertType";

// const ResetPasswordModal = ({ employeeId, isNew = false }) => {
//   const { customDispatch } = useCustomContext();
//   const [open, setOpen] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   const {
//     control,
//     handleSubmit,
//     reset,
//     formState: { errors, isSubmitting },
//   } = useForm({
//     resolver: yupResolver(passwordValidationSchema),
//     defaultValues: {
//       password: "",
//       confirmPassword: "",
//     },
//   });

//   const mutation = useMutation({
//     mutationFn: resetEmployeePassword,
//     onSuccess: (data) => {
//       customDispatch(globalAlertType("success", data || "Password reset successful!"));
//       handleClose();
//     },
//     onError: (error) => {
//       customDispatch(globalAlertType("error", error));
//     },
//   });

//   const handleOpen = () => setOpen(true);
//   const handleClose = () => {
//     setOpen(false);
//     reset();
//   };

//   const onSubmit = (values) => {
//     mutation.mutate({
//       id: employeeId,
//       password: values.password,
//     });
//   };

//   return (
//     <>
//       <Button
//         variant="outlined"
//         startIcon={<LockReset />}
//         onClick={handleOpen}
//         size="small"
//       >
//         {isNew ? "Set Password" : "Reset Password"}
//       </Button>

//       <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
//         <DialogTitle>
//           {isNew ? "Set New Password" : "Reset Password"}
//         </DialogTitle>
//         <form onSubmit={handleSubmit(onSubmit)}>
//           <DialogContent>
//             <Stack spacing={2}>
//               <Typography variant="body2" color="text.secondary">
//                 {isNew
//                   ? "Create a strong password for this employee."
//                   : "Enter a new password for this employee."}
//               </Typography>

//               <Controller
//                 name="password"
//                 control={control}
//                 render={({ field }) => (
//                   <TextField
//                     {...field}
//                     type={showPassword ? "text" : "password"}
//                     label="New Password"
//                     fullWidth
//                     required
//                     error={!!errors.password}
//                     helperText={errors.password?.message}
//                     InputProps={{
//                       endAdornment: (
//                         <InputAdornment position="end">
//                           <IconButton
//                             onClick={() => setShowPassword(!showPassword)}
//                             edge="end"
//                           >
//                             {showPassword ? <VisibilityOff /> : <Visibility />}
//                           </IconButton>
//                         </InputAdornment>
//                       ),
//                     }}
//                   />
//                 )}
//               />

//               <Controller
//                 name="confirmPassword"
//                 control={control}
//                 render={({ field }) => (
//                   <TextField
//                     {...field}
//                     type={showConfirmPassword ? "text" : "password"}
//                     label="Confirm Password"
//                     fullWidth
//                     required
//                     error={!!errors.confirmPassword}
//                     helperText={errors.confirmPassword?.message}
//                     InputProps={{
//                       endAdornment: (
//                         <InputAdornment position="end">
//                           <IconButton
//                             onClick={() =>
//                               setShowConfirmPassword(!showConfirmPassword)
//                             }
//                             edge="end"
//                           >
//                             {showConfirmPassword ? (
//                               <VisibilityOff />
//                             ) : (
//                               <Visibility />
//                             )}
//                           </IconButton>
//                         </InputAdornment>
//                       ),
//                     }}
//                   />
//                 )}
//               />

//               <Stack spacing={0.5} sx={{ pl: 1 }}>
//                 <Typography variant="caption" color="text.secondary">
//                   • Password must be at least 8 characters
//                 </Typography>
//                 <Typography variant="caption" color="text.secondary">
//                   • Must start with an uppercase letter
//                 </Typography>
//                 <Typography variant="caption" color="text.secondary">
//                   • Must contain both numbers and letters
//                 </Typography>
//               </Stack>
//             </Stack>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={handleClose}>Cancel</Button>
//             <LoadingButton
//               type="submit"
//               variant="contained"
//               loading={mutation.isPending || isSubmitting}
//             >
//               {isNew ? "Set Password" : "Reset"}
//             </LoadingButton>
//           </DialogActions>
//         </form>
//       </Dialog>
//     </>
//   );
// };

// export default ResetPasswordModal;