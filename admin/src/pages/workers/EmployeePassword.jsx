import { LoadingButton } from "@mui/lab";
import {
  Alert,
  Box,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useContext } from "react";
import { useNavigate, Navigate, useLocation } from "react-router-dom";
import { putAdminPassword } from "../../api/adminAPI";
import { AuthContext } from "../../context/providers/AuthProvider";
import { passwordValidationSchema } from "../../config/validationSchema";
import { Formik } from "formik";
import { CustomContext } from "../../context/providers/CustomProvider";
import { globalAlertType } from "../../components/alert/alertType";
import { parseJwt } from "../../config/sessionHandler";

function EmployeePassword() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { login } = useContext(AuthContext);
  const { customDispatch } = useContext(CustomContext);

  const initValues = {
    password: "",
    confirmPassword: "",
  };

  const { mutate, isLoading } = useMutation({
    mutationFn: putAdminPassword,
  });

  const onSubmit = (values) => {
    values.id = state?.id;
    mutate(values, {
      onSuccess: (data) => {
        login(parseJwt(data?.acessToken));
        navigate("/auth/login");
      },

      onError: (error) => {
        customDispatch(globalAlertType("error", error));
      },
    });
  };

  if (!state?.id) {
    return <Navigate to="/auth/login" />;
  }

  return (
    <Box>
      <Alert variant="standard" severity="success">
        {state?.success}
      </Alert>
      <Container
        maxWidth="xs"
        sx={{
          height: "80svh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Formik
          initialValues={initValues}
          validationSchema={passwordValidationSchema}
          onSubmit={onSubmit}
        >
          {({ touched, values, errors, handleSubmit, handleChange }) => {
            return (
              <Stack spacing={3} width="100%">
                <Typography variant="h3" textAlign="center">
                  {state?.new ? "Generate New Password" : "Reset Password"}
                </Typography>

                <TextField
                  label="New Password"
                  type="password"
                  required
                  fullWidth
                  value={values.password}
                  onChange={handleChange("password")}
                  error={Boolean(touched.password && errors.password)}
                  helperText={touched.password && errors.password}
                />

                <TextField
                  label="Confirm New Password"
                  type="password"
                  required
                  fullWidth
                  value={values.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  error={Boolean(
                    touched.confirmPassword && errors.confirmPassword
                  )}
                  helperText={touched.confirmPassword && errors.confirmPassword}
                />

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <small>- Password must be at least 8 characters </small>
                  <small>- Password must start with an uppercase letter</small>

                  <small>
                    - Password must contain both numbers and alphabets
                  </small>
                </div>

                <LoadingButton
                  disabled={isLoading}
                  loading={isLoading}
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleSubmit}
                  sx={{ borderRadius: 0, py: 2 }}
                >
                  Confirm
                </LoadingButton>
              </Stack>
            );
          }}
        </Formik>
      </Container>
    </Box>
  );
}

export default EmployeePassword;
