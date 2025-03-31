import { LoadingButton } from "@mui/lab";
import {
  Alert,
  Avatar,
  Container,
  Divider,
  FormHelperText,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import DOMPurify from "dompurify";
import {
  Link,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
// import { GoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useMutation } from "@tanstack/react-query";
import { Formik } from "formik";
import { useContext, useEffect, useState } from "react";
import { IMAGES } from "../constants";
import { loginGoogleUser, loginUser } from "../api/userAPI";
import { loginValidationSchema } from "../config/validationSchema";
import Google from "../components/jsx-icons/Google";
import { AuthContext } from "../context/providers/AuthProvider";
import axios from "axios";
import { CustomContext } from "../context/providers/CustomProvider";
import GlobalSpinner from "../components/GlobalSpinner";

const Login = () => {
  const [searchParams] = useSearchParams();
  const { customDispatch } = useContext(CustomContext);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const { state } = useLocation();
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const initValues = {
    email: "",
    token: "77",
  };

  useEffect(() => {
    customDispatch({
      type: "openSidebar",
      payload: false,
    });
    if (state?.msg) {
      setMsg(state?.msg);
    }
    if (state?.err) {
      setErr(state?.error);
    }
  }, [state, customDispatch]);

  const { mutate, isLoading } = useMutation({
    mutationFn: loginUser,
  });

  const onSubmit = (values) => {
    setMsg("");
    setErr("");

    const email = DOMPurify.sanitize(values.email?.trim());
    const tokent = DOMPurify.sanitize(values.token);
    const type = email.includes("@") ? "email" : "phone";
    const user = {
      email,
      type,
      token: tokent,
    };

    mutate(user, {
      onSuccess: () => {
        navigate("/user/verify", {
          state: {
            type,
            email: email,
            path: state?.path,
            redirectURL: `${searchParams.get(
              "redirect_url"
            )}&info=${searchParams.get("info")}`,
          },
        });
      },

      onError: (error) => {
        setErr(error);
      },
    });
  };

  const goHome = () => navigate(searchParams.get("redirect_url") || "/");

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const userInfo = await axios.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }
      );

      handleGoogleLoginSuccess(userInfo?.data);
    },
    onError: () => {
      setErr("Error. Authentication Failed");
    },
  });

  const { mutateAsync: googleMutate, isLoading: googleIsLoading } = useMutation(
    {
      mutationFn: loginGoogleUser,
    }
  );

  const handleGoogleLoginSuccess = async (user) => {
    const info = {
      firstname: user?.given_name,
      lastname: user?.family_name,
      name: user?.displayName,
      email: user?.email,
      phonenumber: user?.phoneNumber,
      profile: user?.picture || user?.photoURL,
    };

    googleMutate(info, {
      onSuccess: (data) => {
        if (data) {
          login(data?.accessToken);
          goHome();
        }
      },

      onError: () => setErr("Error. Authentication Failed"),
    });
  };

  return (
    <Container
      maxWidth="xs"
      sx={{
        display: "grid",
        placeItems: "center",
        height: "100svh",
      }}
    >
      <IconButton onClick={goHome}>
        <Avatar src={IMAGES.coat_of_arms} sx={{ width: 80, height: 80 }} />
      </IconButton>
      <Formik
        initialValues={initValues}
        validationSchema={loginValidationSchema}
        onSubmit={onSubmit}
      >
        {({ touched, values, errors, handleSubmit, handleChange }) => {
          return (
            <Stack spacing={2} width="100%">
              <Typography variant="h5">Log into your account</Typography>
              {err && <Alert severity="error">{err}</Alert>}
              {msg && <Alert severity="success">{msg}</Alert>}

              <TextField
                label="Email Address or Phone Number"
                size="small"
                required
                fullWidth
                value={values.email}
                onChange={handleChange("email")}
                error={Boolean(touched.email && errors.email)}
                helperText={touched.email && errors.email}
              />
            
              {/* <GoogleReCaptcha
                onVerify={(token) => setFieldValue('token', token)}
                refreshReCaptcha={false}
              /> */}
              {errors.token && (
                <FormHelperText sx={{ color: "#B72136" }}>
                  {errors.token}
                </FormHelperText>
              )}

              <LoadingButton
                disabled={isLoading || googleIsLoading}
                loading={isLoading}
                variant="contained"
                fullWidth
                onClick={handleSubmit}
              >
                Sign in
              </LoadingButton>
              <Divider>OR</Divider>

              <LoadingButton
                disabled={isLoading || googleIsLoading}
                loading={googleIsLoading}
                startIcon={<Google />}
                fullWidth
                sx={{ border: "1px solid lightgray", color: "#333" }}
                onClick={() => googleLogin()}
              >
                Sign in with Google
              </LoadingButton>

              <Typography textAlign="center">
                Don&apos;t have an account?{" "}
                <Link to="/user/register">Signup</Link>
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
        <Link to="/privacy-policy">Privacy Policy</Link>
        <Divider orientation="vertical" flexItem />
        <Link to="/terms-and-conditions">Terms & Conditions</Link>
        <Divider orientation="vertical" flexItem />
        <Link to="/"> Home</Link>
      </Stack>
      {googleIsLoading && <GlobalSpinner />}
    </Container>
  );
};

export default Login;
