import { useRef, useEffect, useState, useContext } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Stack,
  Alert,

  TextField,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Mail, Phone } from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import { useMutation } from "@tanstack/react-query";
import { loginUser, verifyUserOTP } from "../api/userAPI";
import { useAuth } from "../context/providers/AuthProvider";
import { useCustomContext } from "../context/providers/CustomProvider";
import { globalAlertType } from "../components/alert/alertType";

// Yup validation schema
const otpSchema = yup.object({
  otp: yup
    .string()
    .required("Verification code is required")
    .length(6, "Must be exactly 6 digits")
    .matches(/^\d{6}$/, "Only digits allowed"),
});

// Single‑digit input component
const OTPInput = ({ value, onChange, onKeyDown, inputRef, autoFocus, error }) => (
  <TextField
    inputRef={inputRef}
    type="text"
    inputMode="numeric"
    autoFocus={autoFocus}
    value={value}
    onChange={onChange}
    onKeyDown={onKeyDown}
    error={!!error}
    variant="outlined"
    size="small"
    sx={{
      width: 48,
      "& .MuiInputBase-input": {
        textAlign: "center",
        fontSize: "1.5rem",
        fontWeight: 600,
        py: 1,
      },
      "& .MuiOutlinedInput-root": {
        borderRadius: 2,
        backgroundColor: "background.paper",
      },
    }}
    inputProps={{
      maxLength: 1,
      style: { textAlign: "center" },
    }}
  />
);

function VerifyOTP() {
  const { customDispatch } = useCustomContext();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { state } = useLocation();

  const [seconds, setSeconds] = useState(60);
  const [error, setError] = useState("");

  const inputRefs = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (seconds === 0) return;
    const interval = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  // React Hook Form
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    resolver: yupResolver(otpSchema),
    defaultValues: { otp: "" },
    mode: "onChange",
  });

  const otpValue = watch("otp");

  // Auto‑submit when 6 digits are entered
  useEffect(() => {
    if (otpValue?.length === 6 && isValid) {
      handleSubmit(onSubmit)();
    }
  }, [otpValue, isValid]);

  // Mutations
  const { mutateAsync: verifyMutate, isPending: isVerifying } = useMutation({
    mutationFn: verifyUserOTP,
  });

  const { mutateAsync: resendMutate, isPending: isResending } = useMutation({
    mutationFn: loginUser,
  });

  const onSubmit = async (data) => {
    const payload = {
      id: state?.id,
      email: DOMPurify.sanitize(state.email),
      type: state?.type,
      token: DOMPurify.sanitize(data.otp),
    };

    try {
      const result = await verifyMutate(payload);
      login(result);
      if (state?.register) {
        navigate("/user/started", {
          state: {
            phonenumber: state?.phonenumber || state?.email,
            google: false,
          },
        });
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err);
    }
  };

  const onResendOTP = async () => {
    setError("");
    try {
      await resendMutate({ email: state?.email, type: state?.type });
      customDispatch(globalAlertType("info", "Verification code resent!"));
      setSeconds(60);
    } catch {
      setError("Failed to resend code. Please try again.");
    }
  };

  // Handlers for digit inputs
  const handleDigitChange = (index, e) => {
    const val = e.target.value;
    // Only allow single digit
    if (!/^\d*$/.test(val)) return;
    const newOtp = otpValue.split("");
    newOtp[index] = val.slice(0, 1);
    const updated = newOtp.join("");
    setValue("otp", updated, { shouldValidate: true });
    // Auto‑focus next input if value is entered
    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpValue[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text");
    const digits = pasted.replace(/\D/g, "").slice(0, 6);
    if (digits.length === 6) {
      setValue("otp", digits, { shouldValidate: true });
      inputRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

  if (!state?.email) return <Navigate to="/" />;

  const isPhone = state?.type === "phone";
  const Icon = isPhone ? Phone : Mail;

  return (
    <Container
      maxWidth="xs"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          width: "100%",
          p: 4,
          borderRadius: 3,
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            bgcolor: "primary.light",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 2,
          }}
        >
          <Icon sx={{ fontSize: 32, color: "#fff" }} />
        </Box>

        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Verify {isPhone ? "Phone Number" : "Email Address"}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          A verification code has been sent to{" "}
          <Box component="strong" color="text.primary">
            {state?.email}
          </Box>
          . Please enter it below.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="otp"
            control={control}
            render={({ field }) => (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 1.5,
                  mb: 3,
                }}
                onPaste={handlePaste}
              >
                {[...Array(6)].map((_, index) => (
                  <OTPInput
                    key={index}
                    inputRef={(el) => (inputRefs.current[index] = el)}
                    value={field.value[index] || ""}
                    onChange={(e) => handleDigitChange(index, e)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    autoFocus={index === 0}
                    error={errors.otp}
                  />
                ))}
              </Box>
            )}
          />

          {errors.otp && (
            <Typography color="error" variant="caption" display="block" sx={{ mb: 2 }}>
              {errors.otp.message}
            </Typography>
          )}

          <LoadingButton
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            loading={isVerifying || isSubmitting}
            disabled={otpValue?.length !== 6}
            sx={{ mb: 2 }}
          >
            Verify
          </LoadingButton>
        </form>

        <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
          <Typography variant="body2" color="text.secondary">
            Didn’t receive the code?
          </Typography>
          <LoadingButton
            variant="text"
            size="small"
            onClick={onResendOTP}
            disabled={seconds > 0 || isResending}
            loading={isResending}
            sx={{ fontWeight: 600, textTransform: "none" }}
          >
            {seconds > 0 ? `Resend in ${seconds}s` : "Resend"}
          </LoadingButton>
        </Stack>

        <Typography variant="caption" color="text.disabled" sx={{ display: "block", mt: 2 }}>
          Token expires in 15 minutes
        </Typography>
      </Paper>
    </Container>
  );
}

export default VerifyOTP;
