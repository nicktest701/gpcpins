import {
  Stack,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useState, useContext } from "react";
import AnimatedContainer from "../../components/animations/AnimatedContainer";
import { Formik } from "formik";
import { passwordValidationSchema } from "../../config/validationSchema";
import { useMutation } from "@tanstack/react-query";
import { globalAlertType } from "../../components/alert/alertType";
import { CustomContext } from "../../context/providers/CustomProvider";
import { AuthContext } from "../../context/providers/AuthProvider";
import { putAgentPassword } from "../../api/agentAPI";

const Password = () => {
  const { customDispatch } = useContext(CustomContext);
  const { user, login } = useContext(AuthContext);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [oldPasswordErr, setOldPasswordErr] = useState("");

  const initialValues = {
    id: user?.id,
    oldPassword: "",
    password: "",
    confirmPassword: "",
  };

  const { mutate, isLoading } = useMutation({
    mutationFn: putAgentPassword,
  });

  const onSubmit = (values, options) => {
    setOldPasswordErr("");
    mutate(values, {
      onSuccess: () => {
        customDispatch(globalAlertType("info", "Password Updated!"));
        options.resetForm();
      },

      onError: (error) => {
        if (error === "Invalid Password!") {
          setOldPasswordErr(error);
        } else {
          customDispatch(globalAlertType("error", error));
        }
      },
    });
  };

  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);

  return (
    <AnimatedContainer delay={0.4}>
      <Typography variant="h5" sx={{ pt: 4 }}>
        Password
      </Typography>
      <Typography variant="caption" color="secondary.main" paragraph>
        Reset or make changes to your password
      </Typography>
      <Formik
        initialValues={initialValues}
        validationSchema={passwordValidationSchema}
        onSubmit={onSubmit}
      >
        {({ values, errors, touched, handleChange, handleSubmit }) => {
          return (
            <Stack spacing={2} paddingTop={2}>
              <TextField
                size="small"
                type={passwordVisible ? "text" : "password"}
                variant="outlined"
                label="Old Password"
                fullWidth
                required
                value={values?.oldPassword}
                onChange={handleChange("oldPassword")}
                error={
                  Boolean(touched?.oldPassword && errors?.oldPassword) ||
                  oldPasswordErr !== ""
                }
                helperText={
                  (touched?.oldPassword && errors?.oldPassword) ||
                  oldPasswordErr
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {" "}
                      <InputAdornment position="end">
                        <IconButton onClick={togglePasswordVisibility}>
                          {passwordVisible ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                size="small"
                type="password"
                variant="outlined"
                label="New Password"
                fullWidth
                required
                value={values?.password}
                onChange={handleChange("password")}
                error={Boolean(touched?.password && errors?.password)}
                helperText={touched?.password && errors?.password}
              />

              <TextField
                size="small"
                type="password"
                variant="outlined"
                label="Confirm New Password"
                fullWidth
                required
                value={values?.confirmPassword}
                onChange={handleChange("confirmPassword")}
                error={Boolean(
                  touched?.confirmPassword && errors?.confirmPassword
                )}
                helperText={touched?.confirmPassword && errors?.confirmPassword}
              />
              <ul style={{ paddingLeft: "16px" }}>
                <li>
                  <small>Password must be at least 8 characters</small>
                </li>
                <li>
                  <small>Password must start with an uppercase letter</small>
                </li>
                <li>
                  <small>
                    Password must contain both numbers and alphabets
                  </small>
                </li>
              </ul>

              <LoadingButton
                variant="contained"
                onClick={handleSubmit}
                loading={isLoading}
                sx={{ alignSelf: "flex-end" }}
              >
                {isLoading ? "Updating" : "Update Password"}
              </LoadingButton>
            </Stack>
          );
        }}
      </Formik>
    </AnimatedContainer>
  );
};

export default Password;
