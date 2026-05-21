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
// import Checkbox from "@mui/material/Checkbox";
// import FormControlLabel from "@mui/material/FormControlLabel";
// import DOMPurify from "dompurify";
// import { useGoogleLogin } from "@react-oauth/google";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import { useMutation } from "@tanstack/react-query";
// import { Formik } from "formik";
// import { useContext, useEffect, useState } from "react";
// import { IMAGES } from "../constants";
// import { createNewUser, loginGoogleUser } from "../api/userAPI";
// import { registerUserValidationSchema } from "../config/validationSchema";
// import Google from "../components/jsx-icons/Google";
// import { AuthContext } from "../context/providers/AuthProvider";
// import axios from "axios";
// import { CustomContext } from "../context/providers/CustomProvider";
// import GlobalSpinner from "../components/GlobalSpinner";

// const Register = () => {
//   const { login } = useContext(AuthContext);
//   const { customDispatch } = useContext(CustomContext);
//   const navigate = useNavigate();
//   const { state } = useLocation();
//   const [err, setErr] = useState("");

//   const initValues = {
//     email: "",
//     phonenumber: "",
//     terms: false,
//     token: "111",
//   };

//   useEffect(() => {
//     customDispatch({
//       type: "openSidebar",
//       payload: false,
//     });
//     setErr(state?.error);
//   }, [state, customDispatch]);

//   const { mutate, isLoading } = useMutation({
//     mutationFn: createNewUser,
//   });

//   const onSubmit = (values, options) => {
//     setErr("");

//     const email = DOMPurify.sanitize(values.email?.trim());
//     const phonenumber = DOMPurify.sanitize(values.phonenumber?.trim());
//     const token = DOMPurify.sanitize(values.token);

//     const user = {
//       email,
//       phonenumber,
//       token,
//     };
//     // console.log(user);

//     //
//     mutate(user, {
//       onSettled: () => {
//         options.setSubmitting(false);
//       },
//       onSuccess: () => {
//         navigate("/user/verify", {
//           state: {
//             email: phonenumber,
//             phonenumber,
//             path: state?.path,
//             register: true,
//             type: "phone",
//           },
//         });
//       },
//       onError: (error) => {
//         setErr(typeof error === "object" ? error.message : error);
//       },
//     });
//   };

//   const goHome = () => navigate("/");

//   const googleLogin = useGoogleLogin({
//     onSuccess: async (tokenResponse) => {
//       const userInfo = await axios.get(
//         "https://www.googleapis.com/oauth2/v3/userinfo",
//         { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
//       );

//       handleGoogleLoginSuccess(userInfo?.data);
//     },
//     onError: () => setErr("Error. Authentication Failed"),
//   });

//   const { mutateAsync: googleMutate, isLoading: googleIsLoading } = useMutation(
//     {
//       mutationFn: loginGoogleUser,
//     }
//   );

//   const handleGoogleLoginSuccess = async (user) => {
//     const info = {
//       name: user?.displayName,
//       email: user?.email,
//       phonenumber: user?.phoneNumber,
//       profile: user?.photoURL,
//       active: true,
//     };

//     googleMutate(info, {
//       onSuccess: (data) => {
//         login(data?.accessToken);
//         if (data?.register) {
//           navigate("/user/started", {
//             state: {
//               google: true,
//             },
//           });
//         } else {
//           goHome();
//         }
//       },

//       onError: () => {
//         setErr("Error. Authentication Failed");
//       },
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
//         validationSchema={registerUserValidationSchema}
//         onSubmit={onSubmit}
//       >
//         {({ touched, values, errors, handleSubmit, handleChange }) => {
//           return (
//             <Stack spacing={2} width="100%">
//               <Typography variant="h5">Create a new account</Typography>
//               {err && <Alert severity="error">{err}</Alert>}

//               <TextField
//                 label="Email Address"
//                 required
//                 fullWidth
//                 size="small"
//                 value={values.email}
//                 onChange={handleChange("email")}
//                 error={Boolean(touched.email && errors.email)}
//                 helperText={touched.email && errors.email}
//               />

//               <TextField
//                 label="Telephone Number"
//                 required
//                 fullWidth
//                 size="small"
//                 value={values.phonenumber}
//                 onChange={handleChange("phonenumber")}
//                 error={Boolean(touched.phonenumber && errors.phonenumber)}
//                 helperText={touched.phonenumber && errors.phonenumber}
//               />
//               <FormControlLabel
//                 label={
//                   <Typography variant="caption">
//                     Agree to our
//                     <Typography component="span">
//                       <Link to="/terms-and-conditions">
//                         {" "}
//                         terms & conditions{" "}
//                       </Link>
//                     </Typography>{" "}
//                     and
//                     <Typography component="span">
//                       <Link to="/privacy-policy"> privacy policy.</Link>
//                     </Typography>
//                   </Typography>
//                 }
//                 control={
//                   <Checkbox
//                     checked={values.terms}
//                     onChange={handleChange("terms")}
//                   />
//                 }
//               />
//               {touched.terms && errors.terms && (
//                 <FormHelperText sx={{ color: "#B72136" }}>
//                   {errors.terms}
//                 </FormHelperText>
//               )}

//               {/* <GoogleReCaptcha
//                 onVerify={(token) => setFieldValue("token", token)}
//               />
//               {errors.token && (
//                 <FormHelperText sx={{ color: "#B72136" }}>
//                   {errors.token}
//                 </FormHelperText>
//               )} */}

//               <LoadingButton
//                 disabled={isLoading || googleIsLoading}
//                 loading={isLoading}
//                 variant="contained"
//                 fullWidth
//                 onClick={handleSubmit}
//               >
//                 Create Account
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
//                 Sign up with Google
//               </LoadingButton>

//               <Typography textAlign="center">
//                 Already have an account? <Link to="/user/login">Login</Link>
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
//         {/* <Link to="/privacy-policy">Privacy Policy</Link>
//         <Divider orientation="vertical" flexItem />
//         <Link to="/terms-and-conditions">Terms & Conditions</Link>
//         <Divider orientation="vertical" flexItem /> */}
//         <Link to="/">Go Home</Link>
//       </Stack>
//       {googleIsLoading && <GlobalSpinner />}
//     </Container>
//   );
// };

// export default Register;

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
  FormControlLabel,
  Checkbox,
  Link as MuiLink,
} from "@mui/material";
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

function Register() {
  const { login } = useContext(AuthContext);
  const { customDispatch } = useContext(CustomContext);
  const navigate = useNavigate();
  const { state } = useLocation();
  const [err, setErr] = useState("");
  const theme = useTheme();

  const initValues = {
    email: "",
    phonenumber: "",
    terms: false,
    token: "111",
  };

  useEffect(() => {
    customDispatch({ type: "openSidebar", payload: false });
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

    const user = { email, phonenumber, token };

    mutate(user, {
      onSettled: () => options.setSubmitting(false),
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
        { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } },
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
          navigate("/user/started", { state: { google: true } });
        } else {
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
              Create a new account
            </Typography>

            {err && (
              <Alert severity="error" sx={{ width: "100%" }}>
                {err}
              </Alert>
            )}

            <Formik
              initialValues={initValues}
              validationSchema={registerUserValidationSchema}
              onSubmit={onSubmit}
            >
              {({ touched, values, errors, handleSubmit, handleChange }) => (
                <Stack spacing={2.5} width="100%">
                  <TextField
                    label="Email Address"
                    required
                    fullWidth
                    size="medium"
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

                  <TextField
                    label="Telephone Number"
                    required
                    fullWidth
                    size="medium"
                    value={values.phonenumber}
                    onChange={handleChange("phonenumber")}
                    error={Boolean(touched.phonenumber && errors.phonenumber)}
                    helperText={touched.phonenumber && errors.phonenumber}
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

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={values.terms}
                        onChange={handleChange("terms")}
                        sx={{
                          transition: theme.transitions.create("transform"),
                          "&:hover": { transform: "scale(1.1)" },
                        }}
                      />
                    }
                    label={
                      <Typography variant="body2">
                        I agree to the{" "}
                        <MuiLink
                          component={Link}
                          to="/terms-and-conditions"
                          sx={{
                            color: theme.palette.primary.main,
                            textDecoration: "none",
                            borderBottom: `1px solid transparent`,
                            transition:
                              theme.transitions.create("border-color"),
                            "&:hover": {
                              borderBottomColor: theme.palette.primary.main,
                            },
                          }}
                        >
                          terms & conditions
                        </MuiLink>{" "}
                        and{" "}
                        <MuiLink
                          component={Link}
                          to="/privacy-policy"
                          sx={{
                            color: theme.palette.primary.main,
                            textDecoration: "none",
                            borderBottom: `1px solid transparent`,
                            transition:
                              theme.transitions.create("border-color"),
                            "&:hover": {
                              borderBottomColor: theme.palette.primary.main,
                            },
                          }}
                        >
                          privacy policy
                        </MuiLink>
                        .
                      </Typography>
                    }
                  />

                  {touched.terms && errors.terms && (
                    <FormHelperText error>{errors.terms}</FormHelperText>
                  )}

                  {/* ReCaptcha token field is hidden but preserved */}
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
                    Create Account
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
                    Sign up with Google
                  </LoadingButton>

                  <Typography textAlign="center" variant="body2">
                    Already have an account?{" "}
                    <Link
                      to="/user/login"
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
                      Log in
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

export default Register;
