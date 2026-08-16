import {
  Box,
  Stack,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  Paper,
  alpha,
  useTheme,
  Button,
  Divider,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useContext, useState } from "react";
import { Visibility, VisibilityOff, Lock, CheckCircle } from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { globalAlertType } from "../../components/alert/alertType";
import { useCustomContext } from "../../context/providers/CustomProvider";
import { useAuth } from "../../context/providers/AuthProvider";
import { resetAdminPassword } from "../../api/adminAPI";
import AnimatedContainer from "../../components/animations/AnimatedContainer";

// Enhanced validation schema
const passwordValidationSchema = yup.object({
  oldPassword: yup.string().required("Current password is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .matches(/^[A-Z]/, "Password must start with an uppercase letter")
    .matches(/[a-zA-Z]/, "Password must contain letters")
    .matches(/[0-9]/, "Password must contain at least one number")
    .required("New password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required("Please confirm your password"),
});

// Password strength indicator
const getPasswordStrength = (password) => {
  if (!password) return { label: "None", color: "default", score: 0 };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const strength = {
    0: { label: "Very Weak", color: "error.main", score: 0 },
    1: { label: "Weak", color: "error.light", score: 1 },
    2: { label: "Fair", color: "warning.main", score: 2 },
    3: { label: "Good", color: "info.main", score: 3 },
    4: { label: "Strong", color: "success.main", score: 4 },
    5: { label: "Very Strong", color: "success.dark", score: 5 },
  };
  return strength[score] || strength[0];
};

const Password = () => {
  const theme = useTheme();
  const { customDispatch } = useCustomContext();
  const { user } = useAuth();

  // Visibility states
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // React Hook Form
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    resolver: yupResolver(passwordValidationSchema),
    defaultValues: {
      oldPassword: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const passwordValue = watch("password");

  // Password strength
  const strength = getPasswordStrength(passwordValue);

  // Mutation
  const { mutate, isLoading } = useMutation({
    mutationFn: resetAdminPassword,
    onSuccess: () => {
      customDispatch(globalAlertType("success", "Password updated successfully"));
      reset();
    },
    onError: (error) => {
      if (error === "Invalid Password!") {
        customDispatch(globalAlertType("error", "Incorrect current password"));
      } else {
        customDispatch(globalAlertType("error", error || "Failed to update password"));
      }
    },
  });

  const onSubmit = (data) => {
    // SweetAlert confirmation
    Swal.fire({
      title: "Change Password?",
      text: "Are you sure you want to change your password?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: theme.palette.secondary.main,
      cancelButtonColor: theme.palette.grey[500],
      confirmButtonText: "Yes, change it",
    }).then((result) => {
      if (result.isConfirmed) {
        mutate({
          id: user?.id,
          oldPassword: data.oldPassword,
          password: data.password,
        });
      }
    });
  };

  return (
    <AnimatedContainer delay={0.4}>
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            p: { xs: 3, sm: 4 },
            borderRadius: 1.2,
            border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
            bgcolor: "background.paper",
          }}
        >
          <Stack spacing={0.5} sx={{ mb: 3 }}>
            <Typography variant="h5" fontWeight="bold">
              Change Password
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Update your password to keep your account secure
            </Typography>
          </Stack>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              {/* Current Password */}
              <Controller
                name="oldPassword"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type={showOldPassword ? "text" : "password"}
                    label="Current Password"
                    variant="outlined"
                    fullWidth
                    required
                    size="small"
                    error={!!errors.oldPassword}
                    helperText={errors.oldPassword?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle old password visibility"
                            onClick={() => setShowOldPassword(!showOldPassword)}
                            edge="end"
                            size="small"
                          >
                            {showOldPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />

              {/* New Password with strength indicator */}
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Box>
                    <TextField
                      {...field}
                      type={showNewPassword ? "text" : "password"}
                      label="New Password"
                      variant="outlined"
                      fullWidth
                      required
                      size="small"
                      error={!!errors.password}
                      helperText={errors.password?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock fontSize="small" color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle new password visibility"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              edge="end"
                              size="small"
                            >
                              {showNewPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    {/* Password strength bar */}
                    {passwordValue && passwordValue.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Box
                            sx={{
                              flex: 1,
                              height: 4,
                              borderRadius: 1.2,
                              bgcolor: alpha(theme.palette.grey[400], 0.3),
                              overflow: "hidden",
                            }}
                          >
                            <Box
                              sx={{
                                width: `${(strength.score / 5) * 100}%`,
                                height: "100%",
                                bgcolor: strength.color,
                                transition: "width 0.3s ease",
                                borderRadius: 1.2,
                              }}
                            />
                          </Box>
                          <Typography
                            variant="caption"
                            sx={{ color: strength.color, fontWeight: 600, minWidth: 70 }}
                          >
                            {strength.label}
                          </Typography>
                        </Stack>
                      </Box>
                    )}
                  </Box>
                )}
              />

              {/* Confirm Password */}
              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type={showConfirmPassword ? "text" : "password"}
                    label="Confirm New Password"
                    variant="outlined"
                    fullWidth
                    required
                    size="small"
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle confirm password visibility"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                            size="small"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />

              {/* Password Requirements */}
              <Box
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  p: 2,
                  borderRadius: 1.2,
                  border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
                }}
              >
                <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                  Password requirements:
                </Typography>
                <Box component="ul" sx={{ m: 0, pl: 2, listStyle: "none" }}>
                  <Requirement
                    met={passwordValue.length >= 8}
                    text="At least 8 characters"
                  />
                  <Requirement
                    met={/^[A-Z]/.test(passwordValue)}
                    text="Start with an uppercase letter (A-Z)"
                  />
                  <Requirement
                    met={/[a-zA-Z]/.test(passwordValue)}
                    text="Contain letters"
                  />
                  <Requirement
                    met={/[0-9]/.test(passwordValue)}
                    text="Contain at least one number"
                  />
                </Box>
              </Box>

              <Divider />

              {/* Actions */}
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={() => reset()}
                  disabled={isSubmitting || isLoading}
                  sx={{ borderRadius: 1.2, textTransform: "none" }}
                >
                  Reset
                </Button>
                <LoadingButton
                  type="submit"
                  variant="contained"
                  color="secondary"
                  loading={isSubmitting || isLoading}
                  disabled={!isValid || isSubmitting || isLoading}
                  sx={{
                    borderRadius: 1.2,
                    textTransform: "none",
                    fontWeight: 600,
                    boxShadow: `0 8px 24px ${alpha(theme.palette.secondary.main, 0.25)}`,
                    "&:hover": {
                      boxShadow: `0 12px 32px ${alpha(theme.palette.secondary.main, 0.35)}`,
                    },
                  }}
                >
                  Update Password
                </LoadingButton>
              </Stack>
            </Stack>
          </form>
        </Paper>
      </Box>
    </AnimatedContainer>
  );
};

// Helper component for password requirement list items
const Requirement = ({ met, text }) => {
  const theme = useTheme();
  return (
    <Box
      component="li"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        py: 0.25,
        color: met ? theme.palette.success.main : theme.palette.text.secondary,
        fontSize: "0.75rem",
      }}
    >
      <CheckCircle
        sx={{
          fontSize: 14,
          color: met ? theme.palette.success.main : theme.palette.grey[400],
          transition: "color 0.3s ease",
        }}
      />
      <Typography variant="caption" sx={{ color: met ? "text.primary" : "text.secondary" }}>
        {text}
      </Typography>
    </Box>
  );
};

export default Password;

