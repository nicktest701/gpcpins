import { LoadingButton } from "@mui/lab";
import {
  Alert,
  Avatar,
  Box,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import { useMutation } from "@tanstack/react-query";
import { Formik } from "formik";
import { IMAGES } from "../constants";
import { loginValidationSchema } from "../config/validationSchema";
import { loginAgent } from "../api/agentAPI";
import { AuthContext } from "../context/providers/AuthProvider";
import { useContext, useState } from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [passwordVisible, setPasswordVisible] = useState(false);

  const initValues = {
    email: "",
    password: "",
    token: "12",
  };

  const { mutate, isLoading, isError, error } = useMutation({
    mutationFn: loginAgent,
  });

  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);

  // mutationFn: loginAgent,
  const onSubmit = (values) => {
    const email = DOMPurify.sanitize(values.email?.toLowerCase());
    const password = DOMPurify.sanitize(values.password);

    const user = {
      email,
      password,
    };

    mutate(user, {
      onSuccess: (data) => {
        login(data?.accessToken);
        navigate("/");

        // navigate("/auth/code", {
        //   state: {
        //     email: values?.email,
        //     path: state?.path,
        //   },
        // });
      },
    });
  };

  const goHome = () => navigate("/");

  return (
    <div
      style={{
        backgroundColor: "var(--primary)",
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {isError && (
        <Alert
          variant="standard"
          severity={error ? "error" : "info"}
          sx={{ mb: 1, borderRadius: 0 }}
        >
          {error}
        </Alert>
      )}
      <Container
        maxWidth="xs"
        sx={{
          display: "grid",
          placeItems: "center",
          pt: 4,
          px: 4,
          // backgroundColor:
        }}
      >
        <Formik
          initialValues={initValues}
          validationSchema={loginValidationSchema}
          onSubmit={onSubmit}
        >
          {({ touched, values, errors, handleSubmit, handleChange }) => {
            return (
              <Stack
                spacing={1}
                flex={1}
                my="auto"
                width="100%"
                bgcolor="#fff"
                p={2}
              >
                <IconButton onClick={goHome}>
                  <Avatar
                    src={IMAGES.coat_of_arms}
                    sx={{ width: 80, height: 80 }}
                  />
                </IconButton>
                <Typography variant="h3" textAlign="center" paragraph>
                  Agent Portal
                </Typography>
                <Typography variant="h6">Log into your account</Typography>

                <TextField
                  label="Email Address/Phone Number"
                  size="small"
                  required
                  fullWidth
                  value={values.email}
                  onChange={handleChange("email")}
                  error={Boolean(touched.email && errors.email)}
                  helperText={touched.email && errors.email}
                />

                <TextField
                  label="Password"
                  type={passwordVisible ? "text" : "password"}
                  size="small"
                  required
                  fullWidth
                  value={values.password}
                  onChange={handleChange("password")}
                  error={Boolean(touched.password && errors.password)}
                  helperText={touched.password && errors.password}
                  margin="dense"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {" "}
                        <InputAdornment position="end">
                          <IconButton onClick={togglePasswordVisibility}>
                            {passwordVisible ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      </InputAdornment>
                    ),
                  }}
                />

                <LoadingButton
                  disabled={isLoading}
                  loading={isLoading}
                  variant="contained"
                  fullWidth
                  onClick={handleSubmit}
                >
                  Log In
                </LoadingButton>
              </Stack>
            );
          }}
        </Formik>
      </Container>
      <Container sx={{ py: 1, color: "#fff" }}>
        <Stack
          direction="row"
          justifyContent="center"
          spacing={1}
          alignItems="center"
        >
          <a
            href="https://www.gpcpins.com/"
            style={{ color: "#fff", textDecoration: "underline" }}
          >
            {" "}
            Home
          </a>
          <Divider orientation="vertical" flexItem />
          <a
            href="https://www.gpcpins.com/privacy-policy"
            style={{ color: "#fff", textDecoration: "underline" }}
          >
            Privacy Policy
          </a>
          <Divider orientation="vertical" flexItem />
          <a
            href="https://www.gpcpins.com/terms-and-conditions"
            style={{ color: "#fff", textDecoration: "underline" }}
          >
            Terms & Conditions
          </a>
        
        </Stack>
        <Divider flexItem />
        <Box
          display="flex"
          gap={1}
          flexWrap="wrap"
          justifyContent="center"
          py={2}
        >
          {/* <Mail fontSize="small" /> */}|{" "}
          <span > info@gpcpins.com</span>|
          <span> +233244012766</span>|<span> + 0322036582</span>|
        </Box>
        <Typography variant="body2" textAlign="center" paragraph pt={1}>
          Copyright &copy; {new Date().getFullYear()} | Gab Powerful Consult
        </Typography>
        {/* <Typography textAlign="center" variant="body2">
            Designed by ❤
            <a
              rel="noreferrer"
              target="_blank"
              href="https://nanaakwasi-8d50e.web.app/"
              style={{
                textDecoration: "underline",
                color: "#5CE0E6",
                marginLeft: "4px",
              }}
            >
              nanaakwasi.dev
            </a>
            {"  "}❤
          </Typography> */}
      </Container>
    </div>
  );
};

export default Login;
