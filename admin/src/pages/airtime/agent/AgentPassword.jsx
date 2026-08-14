import { useContext, useState } from "react";
import {
  Stack,
  TextField,
  Box,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { useMutation } from "@tanstack/react-query";

import CustomTitle from "@/components/custom/CustomTitle";
import AnimatedContainer from "@/components/animations/AnimatedContainer";
import { passwordValidationSchema } from "@/config/validationSchema";
import { globalAlertType } from "@/components/alert/alertType";
import { CustomContext } from "@/context/providers/CustomProvider";
import { putAgentPassword } from "@/api/agentAPI";

function AgentPassword() {
  const { id } = useParams();
  const { customDispatch } = useContext(CustomContext);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // React Hook Form
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(passwordValidationSchema),
    defaultValues: {
      id,
      password: "",
      confirmPassword: "",
    },
  });

  const { mutate, isLoading } = useMutation({
    mutationFn: putAgentPassword,
    onSuccess: (data) => {
      customDispatch(globalAlertType("info", "Changes Saved"));
      reset();
    },
    onError: (error) => {
      customDispatch(globalAlertType("error", error));
    },
  });

  const onSubmit = (values) => {
    Swal.fire({
      title: "Update Password?",
      text: "Are you sure you want to change the agent's password?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "var(--primary)",
      cancelButtonColor: "var(--secondary)",
      confirmButtonText: "Yes, update",
    }).then((result) => {
      if (result.isConfirmed) {
        mutate(values);
      }
    });
  };

  return (
    <Box sx={{ bgcolor: "#fff", p: 2 }}>
      <CustomTitle
        titleVariant="h4"
        title="Password"
        subtitle="Reset or make changes to agents password"
      />

      <AnimatedContainer delay={0.4}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={2} paddingTop={2}>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  size="small"
                  type={showPassword ? "text" : "password"}
                  label="Password"
                  fullWidth
                  required
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword((prev) => !prev)}
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
                  size="small"
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
                          aria-label="toggle confirm password visibility"
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
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

            <ul style={{ paddingLeft: "16px" }}>
              <li>
                <small>Password must be at least 8 characters</small>
              </li>
              <li>
                <small>Password must start with an uppercase letter</small>
              </li>
              <li>
                <small>Password must contain both numbers and alphabets</small>
              </li>
            </ul>

            <LoadingButton
              type="submit"
              variant="contained"
              loading={isSubmitting || isLoading}
              sx={{
                alignSelf: "flex-start",
              }}
            >
              Update Password
            </LoadingButton>
          </Stack>
        </form>
      </AnimatedContainer>
    </Box>
  );
}

export default AgentPassword;