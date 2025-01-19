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
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import DOMPurify from "dompurify";
import { useGoogleLogin } from "@react-oauth/google";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Formik } from "formik";
import { useContext, useEffect, useState } from "react";
import { IMAGES } from "../constants";
import { createNewUser, loginGoogleUser } from "../api/userAPI";
import { registerUserValidationSchema } from "../config/validationSchema";
import Google from "../components/jsx-icons/Google";
import { AuthContext } from "../context/providers/AuthProvider";
import axios from "axios";
import { CustomContext } from "../context/providers/CustomProvider";
import GlobalSpinner from "../components/GlobalSpinner";

const Register = () => {
  const { login } = useContext(AuthContext);
  const { customDispatch } = useContext(CustomContext);
  const navigate = useNavigate();
  const { state } = useLocation();
  const [err, setErr] = useState("");

  const initValues = {
    email: "",
    phonenumber: "",
    terms: false,
    token: "111",
  };

  useEffect(() => {
    customDispatch({
      type: "openSidebar",
      payload: false,
    });
    setErr(state?.error);
  }, [state, customDispatch]);

  const { mutate, isLoading } = useMutation({
    mutationFn: createNewUser,
  });

  const onSubmit = (values, options) => {
    setErr("");

    const email = DOMPurify.sanitize(values.email?.trim());
    const phonenumber = DOMPurify.sanitize(values.phonenumber?.trim());
    const token = DOMPurify.sanitize(values.token);

    const user = {
      email,
      phonenumber,
      token,
    };
    // console.log(user);

    //
    mutate(user, {
      onSettled: () => {
        options.setSubmitting(false);
      },
      onSuccess: () => {
        navigate("/user/verify", {
          state: {
            email: phonenumber,
            phonenumber,
            path: state?.path,
            register: true,
            type: "phone",
          },
        });
      },
      onError: (error) => {
        setErr(typeof error === "object" ? error.message : error);
      },
    });
  };

  const goHome = () => navigate("/");

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const userInfo = await axios.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
      );

      handleGoogleLoginSuccess(userInfo?.data);
    },
    onError: () => setErr("Error. Authentication Failed"),
  });



  
  const { mutateAsync: googleMutate, isLoading: googleIsLoading } = useMutation(
    {
      mutationFn: loginGoogleUser,
    }
  );

  const handleGoogleLoginSuccess = async (user) => {
    const info = {
      name: user?.displayName,
      email: user?.email,
      phonenumber: user?.phoneNumber,
      profile: user?.photoURL,
      active: true,
    };

    googleMutate(info, {
      onSuccess: (data) => {
        login(data?.accessToken);
        if (data?.register) {
          navigate("/user/started", {
            state: {
              google: true,
            },
          });
        } else {
     
          goHome();
        }
      },

      onError: () => {
        setErr("Error. Authentication Failed");
      },
    });
  };

  return (
    <Container
      maxWidth="xs"
      sx={{
        display: "grid",
        placeItems: "center",
        height: "100svh",
        px: 4,
      }}
    >
      <IconButton onClick={goHome}>
        <Avatar src={IMAGES.coat_of_arms} sx={{ width: 100, height: 100 }} />
      </IconButton>
      <Formik
        initialValues={initValues}
        validationSchema={registerUserValidationSchema}
        onSubmit={onSubmit}
      >
        {({
          touched,
          values,
          errors,
          handleSubmit,
          handleChange,
        
        }) => {
          return (
            <Stack spacing={2} width="100%">
              <Typography variant="h5">Create a new account</Typography>
              {err && <Alert severity="error">{err}</Alert>}

              <TextField
                label="Email Address"
                required
                fullWidth
                // size="small"
                value={values.email}
                onChange={handleChange("email")}
                error={Boolean(touched.email && errors.email)}
                helperText={touched.email && errors.email}
              />

              <TextField
                label="Telephone Number"
                required
                fullWidth
                // size="small"
                value={values.phonenumber}
                onChange={handleChange("phonenumber")}
                error={Boolean(touched.phonenumber && errors.phonenumber)}
                helperText={touched.phonenumber && errors.phonenumber}
              />
              <FormControlLabel
                label={
                  <Typography variant="body2">
                    Agree to our
                    <i>
                      <Link to="/terms-and-conditions"> terms & conditions </Link>
                    </i>{" "}
                    and
                    <i>
                      <Link to="/privacy-policy"> privacy policy.</Link>
                    </i>
                  </Typography>
                }
                control={
                  <Checkbox
                    checked={values.terms}
                    onChange={handleChange("terms")}
                  />
                }
              />
              {touched.terms && errors.terms && (
                <FormHelperText sx={{ color: "#B72136" }}>
                  {errors.terms}
                </FormHelperText>
              )}

              {/* <GoogleReCaptcha
                onVerify={(token) => setFieldValue("token", token)}
              />
              {errors.token && (
                <FormHelperText sx={{ color: "#B72136" }}>
                  {errors.token}
                </FormHelperText>
              )} */}

              <LoadingButton
                disabled={isLoading || googleIsLoading}
                loading={isLoading}
                variant="contained"
                fullWidth
                onClick={handleSubmit}
              >
                Create Account
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
                Sign up with Google
              </LoadingButton>

              <Typography textAlign="center">
                Already have an account? <Link to="/user/login">Login</Link>
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
        {/* <Link to="/privacy-policy">Privacy Policy</Link>
        <Divider orientation="vertical" flexItem />
        <Link to="/terms-and-conditions">Terms & Conditions</Link>
        <Divider orientation="vertical" flexItem /> */}
        <Link to="/">Go Home</Link>
      </Stack>
      {googleIsLoading && <GlobalSpinner />}
    </Container>
  );
};

export default Register;
