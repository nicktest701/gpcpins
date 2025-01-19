import { Box, Stack, TextField, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import AnimatedContainer from "../../components/animations/AnimatedContainer";
import { Formik } from "formik";
import { passwordValidationSchema } from "../../config/validationSchema";
import { useMutation } from "@tanstack/react-query";
import { globalAlertType } from "../../components/alert/alertType";
import { useCustomData } from "../../context/providers/CustomProvider";
import { useAuth } from "../../context/providers/AuthProvider";
import { putVerifierPassword } from "../../api/verifierAPI";
import { useState } from "react";

const Password = () => {
  const { customDispatch } = useCustomData();
  const { user } = useAuth();
  const [oldPasswordErr, setOldPasswordErr] = useState("");

  const initialValues = {
    id: user?.id,
    oldPassword: "",
    password: "",
    confirmPassword: "",
  };

  const { mutate, isLoading } = useMutation({
    mutationFn: putVerifierPassword,
  });

  const onSubmit = (values, options) => {
    mutate(
      {
        id: values.id,
        oldPassword: values.oldPassword,
        password: values.password,
      },
      {
        onSuccess: () => {
          customDispatch(globalAlertType("info", "Password Updated"));
          options.resetForm();
        },

        onError: (error) => {
          if (error === "Invalid Password!") {
            setOldPasswordErr(error);
          } else {
            customDispatch(globalAlertType("error", error));
          }
        },
      }
    );
  };
  return (
    <AnimatedContainer delay={0.4}>
      <Box bgcolor="#fff" p={2}>
        <Typography variant="h4" sx={{ pt: 4 }}>
          Password
        </Typography>
        <Typography paragraph variant="caption" color="secondary.main">
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
                  type="password"
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
                />
                <TextField
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
                  helperText={
                    touched?.confirmPassword && errors?.confirmPassword
                  }
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
      </Box>
    </AnimatedContainer>
  );
};

export default Password;
