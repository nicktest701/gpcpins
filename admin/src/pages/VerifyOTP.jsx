import { Mail } from "@mui/icons-material";
import {
  Container,
  Paper,
  Typography,
  Box,
  Stack,
  TextField,
  Button,
  alpha,
  useTheme,
} from "@mui/material";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import AnimatedContainer from "../components/animations/AnimatedContainer";
import { LoadingButton } from "@mui/lab";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../context/providers/AuthProvider";
import { useCustomContext } from "../context/providers/CustomProvider";
import { globalAlertType } from "../components/alert/alertType";
import { loginAdmin, verifyAdminOTP } from "../api/adminAPI";
import LoadingSpinner from "@/components/spinners/LoadingSpinner";

// Validation schema
const otpSchema = yup.object({
  otp: yup
    .string()
    .length(6, "Please enter a 6‑digit code")
    .required("Verification code is required"),
});

const VerifyOTP = () => {
  const theme = useTheme();
  const { customDispatch } = useCustomContext();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { state } = useLocation();

  const [seconds, setSeconds] = useState(60);
  const [error, setError] = useState("");
  const inputRefs = useRef([]);
  const [isResendLoading, setIsResendLoading] = useState(false);
  // Add this state inside the component
  const [isNavigating, setIsNavigating] = useState(false);

  // React Hook Form
  const {
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting, isValid, errors },
  } = useForm({
    resolver: yupResolver(otpSchema),
    defaultValues: { otp: "" },
    mode: "onChange",
  });

  const otpValue = watch("otp");

  // Auto‑submit when OTP is complete
  useEffect(() => {
    if (otpValue.length === 6) {
      handleSubmit(onSubmit)();
    }
  }, [otpValue]);

  // Timer
  useEffect(() => {
    if (seconds === 0) return;
    const interval = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  // Handle input change for each digit
  const handleChange = (index, value) => {
    // Allow only digits
    const digit = value.replace(/\D/g, "").slice(0, 1);
    if (!digit) return;

    const newOtp = otpValue.slice(0, index) + digit + otpValue.slice(index + 1);
    setValue("otp", newOtp, { shouldValidate: true });

    // Focus next input if not last
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (otpValue[index]) {
        // Remove current digit
        const newOtp = otpValue.slice(0, index) + otpValue.slice(index + 1);
        setValue("otp", newOtp, { shouldValidate: true });
      } else if (index > 0) {
        // Move focus to previous
        inputRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text");
    const digits = pasted.replace(/\D/g, "").slice(0, 6);
    if (digits.length === 6) {
      setValue("otp", digits, { shouldValidate: true });
      // Focus last input
      inputRefs.current[5]?.focus();
    }
  };

  // Mutation
  const { mutateAsync, isLoading } = useMutation({
    mutationFn: verifyAdminOTP,
  });

  // Modified onSubmit
  const onSubmit = async (data) => {
    setError("");
    const email = DOMPurify.sanitize(state.email);
    const token = DOMPurify.sanitize(data.otp);

    const user = {
      id: state.id,
      email,
      token,
      type: "email",
    };

    try {
      const result = await mutateAsync(user);
      login(result);
      setIsNavigating(true);

      setTimeout(() => {
        navigate(state?.path || "/");
      }, 2000);
      // Delay before navigation to show success and avoid flicker
      // await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (err) {
      setError(err.message || "Invalid verification code. Please try again.");
    } finally {
      setIsNavigating(false);
    }
  };

  const { mutateAsync: resendMutateAsync } = useMutation({
    mutationFn: loginAdmin,
  });

  const onResendOTP = async () => {
    setError("");
    setIsResendLoading(true);
    try {
      await resendMutateAsync({
        email: state?.email,
        password: state?.password,
      });
      customDispatch(globalAlertType("info", "Verification code sent!"));
      setSeconds(60);
    } catch (err) {
      setError("Failed to resend code. Please try again.");
    } finally {
      setIsResendLoading(false);
    }
  };

  // If no email in state, redirect to login
  if (!state?.email) return <Navigate to="/auth/login" />;

  return (
    <>
      <AnimatedContainer delay={0.1}>
        <Container
          maxWidth="sm"
          sx={{
            height: "90dvh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <Paper
            elevation={2}
            sx={{
              width: 400,
              maxWidth: "100%",
              p: 4,
              borderRadius: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
            }}
          >
            <Mail color="primary" sx={{ fontSize: 48 }} />
            <Typography variant="h5" fontWeight="bold" textAlign="center">
              Verify Email
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
            >
              A verification code has been sent to{" "}
              <strong>{state?.email}</strong>.
            </Typography>

            {/* OTP Input Fields */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 1,
                my: 2,
                width: "100%",
              }}
              onPaste={handlePaste}
            >
              {[...Array(6)].map((_, index) => (
                <TextField
                  key={index}
                  inputRef={(el) => (inputRefs.current[index] = el)}
                  value={otpValue[index] || ""}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onFocus={(e) => e.target.select()}
                  variant="outlined"
                  size="large"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  sx={{
                    width: 52,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      height: 60,
                      "& input": {
                        textAlign: "center",
                        fontSize: "1.5rem",
                        fontWeight: 600,
                        padding: 0,
                      },
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: errors.otp
                        ? theme.palette.error.main
                        : alpha(theme.palette.divider, 0.6),
                      borderWidth: errors.otp ? 2 : 1,
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: errors.otp
                        ? theme.palette.error.main
                        : theme.palette.primary.main,
                    },
                    "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: errors.otp
                        ? theme.palette.error.main
                        : theme.palette.primary.main,
                      borderWidth: 2,
                    },
                  }}
                  inputProps={{
                    maxLength: 1,
                    style: { textAlign: "center" },
                  }}
                />
              ))}
            </Box>

            {/* Error message */}
            {(errors.otp || error) && (
              <Typography
                variant="caption"
                color="error"
                textAlign="center"
                sx={{ mt: -1 }}
              >
                {errors.otp?.message || error}
              </Typography>
            )}

            {/* Hidden submit button for form */}
            <form onSubmit={handleSubmit(onSubmit)} style={{ display: "none" }}>
              <button type="submit" />
            </form>

            <LoadingButton
              variant="contained"
              fullWidth
              disabled={!isValid || isSubmitting || isLoading}
              loading={isSubmitting || isLoading}
              onClick={handleSubmit(onSubmit)}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.25)}`,
                "&:hover": {
                  boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.35)}`,
                },
              }}
            >
              Verify
            </LoadingButton>

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              spacing={1}
              sx={{ width: "100%" }}
            >
              <Button
                variant="text"
                size="small"
                disabled={seconds > 0 || isResendLoading || isLoading}
                onClick={onResendOTP}
                sx={{ textTransform: "none", fontWeight: 500 }}
              >
                Resend code
              </Button>
              {seconds > 0 && (
                <Typography variant="caption" color="text.secondary">
                  in {seconds}s
                </Typography>
              )}
            </Stack>

            <Typography variant="caption" color="text.disabled" sx={{ mt: 1 }}>
              Token expires in 15 minutes
            </Typography>
          </Paper>
        </Container>
      </AnimatedContainer>

      {isNavigating && <LoadingSpinner value="Redirecting" />}
    </>
  );
};

export default VerifyOTP;

// import { Mail } from "@mui/icons-material";
// import { Container, Paper, TextField, Typography } from "@mui/material";
// import { Navigate, useLocation, useNavigate } from "react-router-dom";
// import DOMPurify from "dompurify";
// import AnimatedContainer from "../components/animations/AnimatedContainer";
// import { LoadingButton } from "@mui/lab";
// import { useContext, useEffect, useState } from "react";
// import { verifyCode } from "../config/validation";
// import { useMutation } from "@tanstack/react-query";
// import {  useAuth } from "../context/providers/AuthProvider";
// import { CustomContext } from "../context/providers/CustomProvider";
// import { globalAlertType } from "../components/alert/alertType";
// import { loginAdmin, verifyAdminOTP } from "../api/adminAPI";

// function VerifyOTP() {
//   const { customDispatch } = useContext(CustomContext);
//   const navigate = useNavigate();
//   const [seconds, setSeconds] = useState(60);
//   const { login } = useAuth();
//   const { state } = useLocation();
//   const [err, setErr] = useState("");
//   const [token, setToken] = useState("");

//   useEffect(() => {
//     const interval = setInterval(() => {
//       if (seconds > 0) {
//         setSeconds((prev) => prev - 1);
//       } else {
//         clearInterval(interval);
//       }
//     }, 1000);
//     return () => clearInterval(interval);
//   }, [seconds]);

//   useEffect(() => {
//     if (token.length === 6) {
//       handleSubmit();
//     }
//   }, [token]);

//   const { mutateAsync, isLoading } = useMutation({
//     mutationFn: verifyAdminOTP,
//   });

//   const handleSubmit = () => {
//     if (token?.trim() === "") {
//       setErr("Required!");
//       return;
//     }
//     if (!verifyCode(token)) {
//       setErr("Invalid code! Try again");
//       return;
//     }

//     const email = DOMPurify.sanitize(state.email);
//     const tokent = DOMPurify.sanitize(token);

//     const user = {
//       id: state.id,
//       email: email,
//       token: tokent,
//       type: "email",
//     };

//     mutateAsync(user, {
//       onSuccess: (data) => {
//         login(data);
//         navigate(state?.path || "/");
//       },
//       onError: (error) => {
//         // console.log(error);
//         setErr(error);
//       },
//     });
//   };

//   const { mutateAsync: resendMutateAsync, isLoading: isResendLoading } =
//     useMutation({
//       mutationFn: loginAdmin,
//     });

//   const onResendOTP = () => {
//     setErr("");
//     resendMutateAsync(
//       { email: state?.email, password: state?.password },
//       {
//         onSuccess: () => {
//           customDispatch(globalAlertType("info", "Verification code sent!"));
//           setSeconds(60);
//         },

//         onError: () => {
//           setErr("An unknown error has occured!");
//         },
//       },
//     );
//   };

//   if (!state?.email) return <Navigate to="/auth/login" />;

//   return (
//     <AnimatedContainer delay={0.1}>
//       <Container
//         maxWidth="sm"
//         sx={{
//           height: "90dvh",
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "center",
//           justifyContent: "center",
//           gap: 2,
//         }}
//       >
//         <Paper
//           elevation={2}
//           sx={{
//             width: 320,
//             height: 420,
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//             justifyContent: "center",
//             gap: 2,
//             p: 2,
//           }}
//         >
//           <Mail color="primary" sx={{ width: 50, height: 50 }} />
//           <Typography textAlign="center" variant="h6">
//             Verify Email
//           </Typography>
//           <Typography textAlign="center" variant="body2">
//             A verification code has been sent to <b>{state?.email}</b>.
//           </Typography>
//           <TextField
//             type="number"
//             inputMode="numeric"
//             placeholder="Enter 6-digit code"
//             value={token}
//             onChange={(e) => {
//               setToken(e.target.value);
//             }}
//             error={Boolean(err)}
//             helperText={err}
//             margin="dense"
//             sx={{ textAlign: "center", width: 200 }}
//             // onPaste={handleSubmit}
//           />

//           {/* <OTPInput /> */}

//           <LoadingButton
//             // size="small"
//             variant="contained"
//             fullWidth
//             disabled={isLoading || isResendLoading}
//             loading={isLoading}
//             sx={{ width: 200, borderRadius: 0 }}
//             onClick={handleSubmit}
//           >
//             Verify
//           </LoadingButton>
//           <LoadingButton
//             loading={isResendLoading}
//             disabled={seconds > 0 || isLoading || isResendLoading}
//             onClick={onResendOTP}
//             size="small"
//           >
//             RESEND CODE{" "}
//             {seconds > 0 && (
//               <small
//                 style={{
//                   color: "#FFA48D",
//                   paddingLeft: "4px",
//                   paddingTop: "4px",
//                   textTransform: "lowercase",
//                 }}
//               >
//                 {" "}
//                 in {seconds}s
//               </small>
//             )}
//           </LoadingButton>

//           <small>Token expires in 15 minutes</small>
//         </Paper>
//       </Container>
//     </AnimatedContainer>
//   );
// }

// export default VerifyOTP;
