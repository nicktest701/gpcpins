import {
  Box,
  Stack,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  Paper,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useContext, useState } from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Formik } from "formik";
import * as Yup from "yup";
import { useMutation } from "@tanstack/react-query";
import { globalAlertType } from "../../components/alert/alertType";
import { CustomContext } from "../../context/providers/CustomProvider";
import { AuthContext } from "../../context/providers/AuthProvider";
import { resetAdminPassword } from "../../api/adminAPI";
import AnimatedContainer from "../../components/animations/AnimatedContainer";

// Enhanced validation schema
const passwordValidationSchema = Yup.object({
  oldPassword: Yup.string().required("Old password is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/^[A-Z]/, "Password must start with an uppercase letter")
    .matches(/[a-zA-Z]/, "Password must contain letters")
    .matches(/[0-9]/, "Password must contain at least one number")
    .required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Please confirm your password"),
});

const Password = () => {
  const { customDispatch } = useContext(CustomContext);
  const { user } = useContext(AuthContext);

  // Visibility states for each password field
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { mutate, isLoading } = useMutation({
    mutationFn: resetAdminPassword,
  });

  const initialValues = {
    id: user?.id,
    oldPassword: "",
    password: "",
    confirmPassword: "",
  };

  const onSubmit = (values, { resetForm, setFieldError }) => {
    mutate(values, {
      onSuccess: () => {
        customDispatch(
          globalAlertType("success", "Password updated successfully"),
        );
        resetForm();
        // Clear any old password error from previous attempts
        setFieldError("oldPassword", undefined);
      },
      onError: (error) => {
        if (error === "Invalid Password!") {
          setFieldError("oldPassword", "Incorrect old password");
        } else {
          customDispatch(
            globalAlertType("error", error || "Failed to update password"),
          );
        }
      },
    });
  };

  // Helper to render password field with toggle
  const renderPasswordField = (
    name,
    label,
    value,
    onChange,
    error,
    helperText,
    showState,
    setShowState,
  ) => (
    <TextField
      size="medium"
      type={showState ? "text" : "password"}
      variant="outlined"
      label={label}
      fullWidth
      required
      value={value}
      onChange={onChange}
      error={error}
      helperText={helperText}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              aria-label={`toggle ${label} visibility`}
              onClick={() => setShowState(!showState)}
              edge="end"
              size="small"
            >
              {showState ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );

  return (
    <AnimatedContainer delay={0.4}>
      <Box
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <Paper
          elevation={3}
          sx={{
            width: "100%",
            p: { xs: 2, sm: 4 },
            borderRadius: 3,
            bgcolor: "background.paper",
          }}
        >
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Change Password
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Update your password to keep your account secure
          </Typography>

          <Formik
            initialValues={initialValues}
            validationSchema={passwordValidationSchema}
            onSubmit={onSubmit}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleSubmit,
              setFieldError,
            }) => (
              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  {renderPasswordField(
                    "oldPassword",
                    "Current Password",
                    values.oldPassword,
                    handleChange("oldPassword"),
                    Boolean(touched.oldPassword && errors.oldPassword),
                    (touched.oldPassword && errors.oldPassword) || "",
                    showOldPassword,
                    setShowOldPassword,
                  )}

                  {renderPasswordField(
                    "password",
                    "New Password",
                    values.password,
                    handleChange("password"),
                    Boolean(touched.password && errors.password),
                    (touched.password && errors.password) || "",
                    showNewPassword,
                    setShowNewPassword,
                  )}

                  {renderPasswordField(
                    "confirmPassword",
                    "Confirm New Password",
                    values.confirmPassword,
                    handleChange("confirmPassword"),
                    Boolean(touched.confirmPassword && errors.confirmPassword),
                    (touched.confirmPassword && errors.confirmPassword) || "",
                    showConfirmPassword,
                    setShowConfirmPassword,
                  )}

                  <Box sx={{ bgcolor: "action.hover", p: 2, borderRadius: 2 }}>
                    <Typography
                      variant="subtitle2"
                      gutterBottom
                      fontWeight={600}
                    >
                      Password requirements:
                    </Typography>
                    <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
                      <li>
                        <Typography variant="caption">
                          At least 8 characters long
                        </Typography>
                      </li>
                      <li>
                        <Typography variant="caption">
                          Start with an uppercase letter (A-Z)
                        </Typography>
                      </li>
                      <li>
                        <Typography variant="caption">
                          Contain both letters and numbers
                        </Typography>
                      </li>
                      <li>
                        <Typography variant="caption">
                          No spaces or special characters required
                        </Typography>
                      </li>
                    </ul>
                  </Box>

                  <LoadingButton
                    type="submit"
                    variant="contained"
                    loading={isLoading}
                    disabled={isLoading}
                    sx={{ alignSelf: "flex-end", minWidth: 150 }}
                  >
                    {isLoading ? "Updating..." : "Update Password"}
                  </LoadingButton>
                </Stack>
              </form>
            )}
          </Formik>
        </Paper>
      </Box>
    </AnimatedContainer>
  );
};

export default Password;
