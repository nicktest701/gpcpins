// import { LoadingButton } from "@mui/lab";
// import {
//   Alert,
//   Avatar,
//   Container,
//   Divider,
//   FormHelperText,
//   IconButton,
//   Stack,
//   TextField,
//   Typography,
// } from "@mui/material";

// import DOMPurify from "dompurify";
// import {
//   Link,
//   useNavigate,
//   useLocation,
//   useSearchParams,
// } from "react-router-dom";
// import { useGoogleLogin } from "@react-oauth/google";
// // import { GoogleReCaptcha } from 'react-google-recaptcha-v3';
// import { useMutation } from "@tanstack/react-query";
// import { Formik } from "formik";
// import { useContext, useEffect, useState } from "react";
// import { IMAGES } from "../constants";
// import { loginGoogleUser, loginUser } from "../api/userAPI";
// import { loginValidationSchema } from "../config/validationSchema";
// import Google from "../components/jsx-icons/Google";
// import { AuthContext } from "../context/providers/AuthProvider";
// import axios from "axios";
// import { CustomContext } from "../context/providers/CustomProvider";
// import GlobalSpinner from "../components/GlobalSpinner";

// const Login = () => {
//   const [searchParams] = useSearchParams();
//   const { customDispatch } = useContext(CustomContext);
//   const { login } = useContext(AuthContext);
//   const navigate = useNavigate();
//   const { state } = useLocation();
//   const [err, setErr] = useState("");
//   const [msg, setMsg] = useState("");
//   const initValues = {
//     email: "",
//     token: "77",
//   };

//   useEffect(() => {
//     customDispatch({
//       type: "openSidebar",
//       payload: false,
//     });
//     if (state?.msg) {
//       setMsg(state?.msg);
//     }
//     if (state?.err) {
//       setErr(state?.error);
//     }
//   }, [state, customDispatch]);

//   const { mutate, isLoading } = useMutation({
//     mutationFn: loginUser,
//   });

//   const onSubmit = (values) => {
//     setMsg("");
//     setErr("");

//     const email = DOMPurify.sanitize(values.email?.trim());
//     const tokent = DOMPurify.sanitize(values.token);
//     const type = email.includes("@") ? "email" : "phone";
//     const user = {
//       email,
//       type,
//       token: tokent,
//     };

//     mutate(user, {
//       onSuccess: () => {
//         navigate("/user/verify", {
//           state: {
//             type,
//             email: email,
//             path: state?.path,
//             redirectURL: `${searchParams.get(
//               "redirect_url"
//             )}&info=${searchParams.get("info")}`,
//           },
//         });
//       },

//       onError: (error) => {
//         setErr(error);
//       },
//     });
//   };

//   const goHome = () => navigate(searchParams.get("redirect_url") || "/");

//   const googleLogin = useGoogleLogin({
//     onSuccess: async (tokenResponse) => {
//       const userInfo = await axios.get(
//         "https://www.googleapis.com/oauth2/v3/userinfo",
//         {
//           headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
//         }
//       );

//       handleGoogleLoginSuccess(userInfo?.data);
//     },
//     onError: () => {
//       setErr("Error. Authentication Failed");
//     },
//   });

//   const { mutateAsync: googleMutate, isLoading: googleIsLoading } = useMutation(
//     {
//       mutationFn: loginGoogleUser,
//     }
//   );

//   const handleGoogleLoginSuccess = async (user) => {
//     const info = {
//       firstname: user?.given_name,
//       lastname: user?.family_name,
//       name: user?.displayName,
//       email: user?.email,
//       phonenumber: user?.phoneNumber,
//       profile: user?.picture || user?.photoURL,
//     };

//     googleMutate(info, {
//       onSuccess: (data) => {
//         if (data) {
//           login(data?.accessToken);
//           goHome();
//         }
//       },

//       onError: () => setErr("Error. Authentication Failed"),
//     });
//   };

//   return (
//     <Container
//       maxWidth="xs"
//       sx={{
//         display: "grid",
//         placeItems: "center",
//         height: "100svh",
//       }}
//     >
//       <IconButton onClick={goHome}>
//         <Avatar src={IMAGES.coat_of_arms} sx={{ width: 80, height: 80 }} />
//       </IconButton>
//       <Formik
//         initialValues={initValues}
//         validationSchema={loginValidationSchema}
//         onSubmit={onSubmit}
//       >
//         {({ touched, values, errors, handleSubmit, handleChange }) => {
//           return (
//             <Stack spacing={2} width="100%">
//               <Typography variant="h5">Log into your account</Typography>
//               {err && <Alert severity="error">{err}</Alert>}
//               {msg && <Alert severity="success">{msg}</Alert>}

//               <TextField
//                 label="Email Address or Phone Number"
//                 size="small"
//                 required
//                 fullWidth
//                 value={values.email}
//                 onChange={handleChange("email")}
//                 error={Boolean(touched.email && errors.email)}
//                 helperText={touched.email && errors.email}
//               />

//               {/* <GoogleReCaptcha
//                 onVerify={(token) => setFieldValue('token', token)}
//                 refreshReCaptcha={false}
//               /> */}
//               {errors.token && (
//                 <FormHelperText sx={{ color: "#B72136" }}>
//                   {errors.token}
//                 </FormHelperText>
//               )}

//               <LoadingButton
//                 disabled={isLoading || googleIsLoading}
//                 loading={isLoading}
//                 variant="contained"
//                 fullWidth
//                 onClick={handleSubmit}
//               >
//                 Sign in
//               </LoadingButton>
//               <Divider>OR</Divider>

//               <LoadingButton
//                 disabled={isLoading || googleIsLoading}
//                 loading={googleIsLoading}
//                 startIcon={<Google />}
//                 fullWidth
//                 sx={{ border: "1px solid lightgray", color: "#333" }}
//                 onClick={() => googleLogin()}
//               >
//                 Sign in with Google
//               </LoadingButton>

//               <Typography textAlign="center">
//                 Don&apos;t have an account?{" "}
//                 <Link to="/user/register">Signup</Link>
//               </Typography>
//             </Stack>
//           );
//         }}
//       </Formik>
//       <Stack
//         direction="row"
//         justifyContent="space-between"
//         spacing={1}
//         alignItems="center"
//       >
//         <Link to="/privacy-policy">Privacy Policy</Link>
//         <Divider orientation="vertical" flexItem />
//         <Link to="/terms-and-conditions">Terms & Conditions</Link>
//         <Divider orientation="vertical" flexItem />
//         <Link to="/"> Home</Link>
//       </Stack>
//       {googleIsLoading && <GlobalSpinner />}
//     </Container>
//   );
// };

// export default Login;

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
  Paper,
  Fade,
  useTheme,
  alpha,
} from "@mui/material";
import DOMPurify from "dompurify";
import {
  Link,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
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

function Login() {
  const [searchParams] = useSearchParams();
  const { customDispatch } = useContext(CustomContext);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const { state } = useLocation();
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const theme = useTheme();

  const initValues = {
    email: "",
    token: "77",
  };

  useEffect(() => {
    customDispatch({ type: "openSidebar", payload: false });
    if (state?.msg) setMsg(state?.msg);
    if (state?.err) setErr(state?.error);
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
    const user = { email, type, token: tokent };

    mutate(user, {
      onSuccess: (data) => {
    
        navigate("/user/verify", {
          state: {
            type,
            email,
            id: data?.id,
            path: state?.path,
            redirectURL: `${searchParams.get("redirect_url")}&info=${searchParams.get("info")}`,
          },
        });
      },
      onError: (error) => setErr(error),
    });
  };

  const goHome = () => navigate(searchParams.get("redirect_url") || "/");

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const userInfo = await axios.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        },
      );
      handleGoogleLoginSuccess(userInfo?.data);
    },
    onError: () => setErr("Error. Authentication Failed"),
  });

  const { mutateAsync: googleMutate, isLoading: googleIsLoading } = useMutation(
    {
      mutationFn: loginGoogleUser,
    },
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
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        py: 4,
      }}
    >
      <Fade in timeout={800}>
        <Paper
          elevation={3}
          sx={{
            width: "100%",
            p: { xs: 3, sm: 4 },
            borderRadius: 4,
            bgcolor: theme.palette.background.paper,
            boxShadow: theme.shadows[8],
          }}
        >
          <Stack spacing={3} alignItems="center">
            {/* Logo */}
            <IconButton onClick={goHome} sx={{ p: 0, mb: 1 }}>
              <Avatar
                src={IMAGES.coat_of_arms}
                alt="logo"
                sx={{
                  width: 80,
                  height: 80,
                  boxShadow: theme.shadows[2],
                  transition: theme.transitions.create("transform"),
                  "&:hover": { transform: "scale(1.05)" },
                }}
              />
            </IconButton>

            <Typography variant="h5" fontWeight={600} textAlign="center">
              Log into your account
            </Typography>

            {/* Alerts */}
            {err && (
              <Alert severity="error" sx={{ width: "100%" }}>
                {err}
              </Alert>
            )}
            {msg && (
              <Alert severity="success" sx={{ width: "100%" }}>
                {msg}
              </Alert>
            )}

            <Formik
              initialValues={initValues}
              validationSchema={loginValidationSchema}
              onSubmit={onSubmit}
            >
              {({ touched, values, errors, handleSubmit, handleChange }) => (
                <Stack spacing={2.5} width="100%">
                  <TextField
                    label="Email Address or Phone Number"
                    size="medium"
                    required
                    fullWidth
                    value={values.email}
                    onChange={handleChange("email")}
                    error={Boolean(touched.email && errors.email)}
                    helperText={touched.email && errors.email}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        transition: theme.transitions.create([
                          "border-color",
                          "box-shadow",
                        ]),
                        "&:hover fieldset": {
                          borderColor: theme.palette.primary.main,
                        },
                        "&.Mui-focused fieldset": {
                          borderWidth: 2,
                          borderColor: theme.palette.primary.main,
                        },
                      },
                    }}
                  />

                  {errors.token && (
                    <FormHelperText error>{errors.token}</FormHelperText>
                  )}

                  <LoadingButton
                    disabled={isLoading || googleIsLoading}
                    loading={isLoading}
                    variant="contained"
                    fullWidth
                    onClick={handleSubmit}
                    sx={{
                      py: 1.2,
                      borderRadius: 2,
                      boxShadow: "none",
                      transition: theme.transitions.create([
                        "background-color",
                        "box-shadow",
                        "transform",
                      ]),
                      "&:hover": {
                        boxShadow: theme.shadows[4],
                        transform: "scale(1.02)",
                      },
                    }}
                  >
                    Sign in
                  </LoadingButton>

                  <Divider sx={{ color: theme.palette.text.secondary }}>
                    OR
                  </Divider>

                  <LoadingButton
                    disabled={isLoading || googleIsLoading}
                    loading={googleIsLoading}
                    startIcon={<Google />}
                    fullWidth
                    variant="outlined"
                    sx={{
                      py: 1.2,
                      borderRadius: 2,
                      borderColor: alpha(theme.palette.grey[500], 0.3),
                      color: theme.palette.text.primary,
                      transition: theme.transitions.create([
                        "border-color",
                        "background-color",
                        "transform",
                      ]),
                      "&:hover": {
                        borderColor: theme.palette.primary.main,
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                        transform: "scale(1.02)",
                      },
                    }}
                    onClick={() => googleLogin()}
                  >
                    Sign in with Google
                  </LoadingButton>

                  <Typography textAlign="center" variant="body2">
                    Don&apos;t have an account?{" "}
                    <Link
                      to="/user/register"
                      style={{
                        color: theme.palette.primary.main,
                        fontWeight: 500,
                        textDecoration: "none",
                        borderBottom: `1px solid transparent`,
                        transition: theme.transitions.create("border-color"),
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.borderBottomColor =
                          theme.palette.primary.main)
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.borderBottomColor = "transparent")
                      }
                    >
                      Sign up
                    </Link>
                  </Typography>
                </Stack>
              )}
            </Formik>

            {/* Footer links */}
            <Stack
              direction="row"
              justifyContent="center"
              spacing={2}
              alignItems="center"
              flexWrap="wrap"
              sx={{ mt: 2 }}
            >
              <Link
                to="/privacy-policy"
                style={{
                  color: theme.palette.text.secondary,
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  transition: theme.transitions.create("color"),
                }}
                onMouseEnter={(e) =>
                  (e.target.style.color = theme.palette.primary.main)
                }
                onMouseLeave={(e) =>
                  (e.target.style.color = theme.palette.text.secondary)
                }
              >
                Privacy Policy
              </Link>
              <Divider orientation="vertical" flexItem />
              <Link
                to="/terms-and-conditions"
                style={{
                  color: theme.palette.text.secondary,
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  transition: theme.transitions.create("color"),
                }}
                onMouseEnter={(e) =>
                  (e.target.style.color = theme.palette.primary.main)
                }
                onMouseLeave={(e) =>
                  (e.target.style.color = theme.palette.text.secondary)
                }
              >
                Terms & Conditions
              </Link>
              <Divider orientation="vertical" flexItem />
              <Link
                to="/"
                style={{
                  color: theme.palette.text.secondary,
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  transition: theme.transitions.create("color"),
                }}
                onMouseEnter={(e) =>
                  (e.target.style.color = theme.palette.primary.main)
                }
                onMouseLeave={(e) =>
                  (e.target.style.color = theme.palette.text.secondary)
                }
              >
                Home
              </Link>
            </Stack>
          </Stack>
        </Paper>
      </Fade>

      {googleIsLoading && <GlobalSpinner />}
    </Container>
  );
}

export default Login;
