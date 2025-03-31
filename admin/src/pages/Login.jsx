import { LoadingButton } from "@mui/lab";
import {
  Alert,
  Container,
  Divider,
  Stack,
  TextField,
  Typography,
  Grid,
  InputAdornment,
  IconButton,
} from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import {
  useNavigate,
  useLocation,
  Link,
  useSearchParams,
} from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import DOMPurify from "dompurify";
import { useMutation } from "@tanstack/react-query";
import { Formik } from "formik";
import { IMAGES } from "../constants";
import { loginValidationSchema } from "../config/validationSchema";
import { loginAdmin } from "../api/adminAPI";
import { useState } from "react";

const Login = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [searchParams] = useSearchParams();
  const [passwordVisible, setPasswordVisible] = useState(false);

  const initValues = {
    email: "",
    password: "",
    token: "12",
  };

  const { mutate, isLoading, isError, error } = useMutation({
    mutationFn: loginAdmin,
  });

  const onSubmit = (values) => {
    const email = DOMPurify.sanitize(values.email);
    const password = DOMPurify.sanitize(values.password);

    const user = {
      email,
      password,
    };

    mutate(user, {
      onSuccess: () => {
        navigate("/auth/code", {
          state: {
            email: values?.email,
            password: values?.password,
            path: state?.path,
          },
        });
      },
    });
  };

  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);

  // const goHome = () => navigate("/");

  return (
    <Grid container sx={{ height: "100svh" }}>
      <CssBaseline />

      <Grid
        display={{ xs: "hidden", md: "flex" }}
        item
        xs={false}
        sm={4}
        md={7}
        sx={{
          display: { xs: "hidden", md: "flex" },
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "primary.main",
          //  background: `linear-gradient(to top right,transparent,transparent),url(${IMAGES.logo_login})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <img
          src={IMAGES.logo_white}
          alt="logo"
          title="logo"
          style={{ width: "100%" }}
        />
      </Grid>
      <Grid
        item
        xs={12}
        sm={8}
        md={5}
        sx={{
          bgcolor: "#fff",
        }}
      >
        {searchParams.get("e") !== null && (
          <Alert
            variant="filled"
            severity="error"
            sx={{ mb: 1, borderRadius: 0 }}
          >
            Session has expired! Sign in again.
          </Alert>
        )}
        {isError && (
          <Alert
            variant="filled"
            severity="error"
            sx={{ mb: 1, borderRadius: 0 }}
          >
            {error}
          </Alert>
        )}
        <Container
          maxWidth="xs"
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",

            p: 4,
            // backgroundColor:
            // clipPath: "polygon(0 0, 0% 100%, 100% 100%)",
            // bgcolor:'primary.main'
          }}
        >
          {/* <IconButton onClick={goHome}>
              <Avatar
                src={IMAGES.coat_of_arms}
                sx={{ width: 100, height: 100 }}
              />
            </IconButton> */}
          <Formik
            initialValues={initValues}
            validationSchema={loginValidationSchema}
            onSubmit={onSubmit}
          >
            {({ touched, values, errors, handleSubmit, handleChange }) => {
              return (
                <Stack
                  spacing={2}
                  width="100%"
                  zIndex={9999}
                  p={2}
                  flex={1}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h3">Account Login</Typography>

                  <TextField
                    label="Email Address"
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
                    sx={{ borderRadius: "0", py: 2 }}
                    size="large"
                  >
                    Sign In
                  </LoadingButton>
                  <Typography textAlign="right">
                    Forgot Password ? <Link to="/auth/forgot">Click here</Link>
                  </Typography>
                </Stack>
              );
            }}
          </Formik>
          <Stack
            direction="row"
            justifyContent="space-between"
            spacing={1}
            alignItems="center"
          >
            <a href="https://www.gpcpins.com/privacy-policy">Privacy Policy</a>
            <Divider orientation="vertical" flexItem />
            <a href="https://www.gpcpins.com/terms-and-conditions">
              Terms & Conditions
            </a>
            <Divider orientation="vertical" flexItem />
            <a href="https://www.gpcpins.com/"> Home</a>
          </Stack>
        </Container>
      </Grid>
    </Grid>
  );
};

export default Login;
