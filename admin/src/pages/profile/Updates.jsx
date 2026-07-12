import {
  CircularProgress,
  Container,
  Stack,
  TextField,
  Typography,
  Box,
  Button,
  Paper,
  alpha,
  useTheme,
  IconButton,
} from "@mui/material";
import { ArrowBack, Save, Person, Phone } from "@mui/icons-material";
import Swal from "sweetalert2";
import DOMPurify from "dompurify";
import { useMemo } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import AnimatedContainer from "../../components/animations/AnimatedContainer";
import { LoadingButton } from "@mui/lab";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCustomContext } from "../../context/providers/CustomProvider";
import { useAuth } from "../../context/providers/AuthProvider";
import { globalAlertType } from "../../components/alert/alertType";
import { isValidPhoneNumber } from "../../constants/PhoneCode";
import { putAdmin } from "../../api/adminAPI";
import { parseJwt } from "../../config/sessionHandler";

function Updates() {
  const theme = useTheme();
  const { field } = useParams();
  const { state } = useLocation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { customDispatch } = useCustomContext();
  const { user, updateUser } = useAuth();

  // Dynamic validation schema based on field
  const validationSchema = useMemo(() => {
    switch (field) {
      case "firstname":
        return yup.object({
          firstname: yup
            .string()
            .required("First name is required")
            .min(2, "First name must be at least 2 characters")
            .max(50, "First name is too long"),
        });
      case "lastname":
        return yup.object({
          lastname: yup
            .string()
            .required("Last name is required")
            .min(2, "Last name must be at least 2 characters")
            .max(50, "Last name is too long"),
        });
      case "phonenumber":
        return yup.object({
          phonenumber: yup
            .string()
            .required("Phone number is required")
            .test("valid-phone", "Invalid phone number", (value) =>
              isValidPhoneNumber(value),
            ),
        });
      default:
        return yup.object({});
    }
  }, [field]);

  // React Hook Form
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      phonenumber: "",
    },
    mode: "onChange",
  });

  // Mutation
  const { mutateAsync, isLoading } = useMutation({
    mutationFn: putAdmin,
  });

  const onSubmit = (data) => {
    // Build payload
    const payload = { _id: user?.id };
    const sanitizedValue = DOMPurify.sanitize(data[field]?.trim());

    if (field === "firstname") payload.firstname = sanitizedValue;
    if (field === "lastname") payload.lastname = sanitizedValue;
    if (field === "phonenumber") payload.phonenumber = sanitizedValue;

    // SweetAlert confirmation
    Swal.fire({
      title: "Update Information",
      text: `Are you sure you want to update your ${field}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: theme.palette.secondary.main,
      cancelButtonColor: theme.palette.grey[500],
      confirmButtonText: "Yes, update it",
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        mutateAsync(payload, {
          onSuccess: (data) => {
            customDispatch(
              globalAlertType("info", "Profile updated successfully!"),
            );
            updateUser(data);
            queryClient.invalidateQueries({ queryKey: ["user"] });
            navigate("/profile");
          },
          onError: (error) => {
            customDispatch(
              globalAlertType("error", error?.message || "Update failed"),
            );
          },
        });
      }
    });
  };

  // Redirect if phone update without state
  if (field === "phonenumber" && !state?.phonenumber) {
    return <Navigate to="/profile" />;
  }

  // Field labels & icons
  const fieldConfig = {
    firstname: {
      label: "First Name",
      icon: <Person />,
      placeholder: "Enter your new first name",
    },
    lastname: {
      label: "Last Name",
      icon: <Person />,
      placeholder: "Enter your new last name",
    },
    phonenumber: {
      label: "Phone Number",
      icon: <Phone />,
      placeholder: "Enter your new phone number",
    },
  };

  const config = fieldConfig[field] || fieldConfig.firstname;

  return (
    <AnimatedContainer>
      <Container sx={{ py: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
            bgcolor: "background.paper",
          }}
        >
          {/* Header */}
          <Stack spacing={2} sx={{ mb: 4 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <IconButton onClick={() => navigate("/profile")} sx={{ mr: 1 }}>
                <ArrowBack />
              </IconButton>
              <Typography variant="h5" fontWeight="bold">
                Update {config.label}
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Enter your new {config.label.toLowerCase()} below.
            </Typography>
          </Stack>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              <Controller
                name={field}
                control={control}
                render={({ field: controllerField }) => (
                  <TextField
                    {...controllerField}
                    label={config.label}
                    placeholder={config.placeholder}
                    fullWidth
                    required
                    size="large"
                    error={!!errors[field]}
                    helperText={errors[field]?.message}
                    InputProps={{
                      startAdornment: config.icon && (
                        <Box sx={{ mr: 1, color: "text.secondary" }}>
                          {config.icon}
                        </Box>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                )}
              />

              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  color="inherit"
                  component={Link}
                  to="/profile"
                  disabled={isSubmitting || isLoading}
                  sx={{ borderRadius: 2, textTransform: "none" }}
                >
                  Cancel
                </Button>
                <LoadingButton
                  type="submit"
                  variant="contained"
                  color="secondary"
                  loading={isSubmitting || isLoading}
                  disabled={!isValid || isSubmitting || isLoading}
                  startIcon={<Save />}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    boxShadow: `0 8px 24px ${alpha(theme.palette.secondary.main, 0.25)}`,
                    "&:hover": {
                      boxShadow: `0 12px 32px ${alpha(theme.palette.secondary.main, 0.35)}`,
                    },
                  }}
                >
                  Save Changes
                </LoadingButton>
              </Stack>
            </Stack>
          </form>
        </Paper>
      </Container>
    </AnimatedContainer>
  );
}

export default Updates;

// import {
//   CircularProgress,
//   Container,
//   Stack,
//   TextField,
//   Typography,
//   Box,
//   Button,
// } from "@mui/material";
// import Swal from "sweetalert2";
// import DOMPurify from "dompurify";
// import { useState } from "react";
// import {
//   Link,
//   Navigate,
//   useLocation,
//   useNavigate,
//   useParams,
// } from "react-router-dom";
// import AnimatedContainer from "../../components/animations/AnimatedContainer";
// import { LoadingButton } from "@mui/lab";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { useCustomContext } from "../../context/providers/CustomProvider";
// import { useAuth } from "../../context/providers/AuthProvider";
// import { globalAlertType } from "../../components/alert/alertType";
// import { isValidPhoneNumber } from "../../constants/PhoneCode";
// import { putAdmin } from "../../api/adminAPI";
// import { parseJwt } from "../../config/sessionHandler";

// function Updates() {
//   const { field } = useParams();
//   const { state } = useLocation();
//   const queryClient = useQueryClient();
//   const navigate = useNavigate();
//   const { customDispatch } = useCustomContext();
//   const { user, updateUser } = useAuth();
//   const [lastname, setLastname] = useState("");
//   const [firstname, setFirstname] = useState("");
//   const [phonenumber, setPhonenumber] = useState("");
//   const [err, setErr] = useState("");

//   const { mutateAsync, isLoading } = useMutation({
//     mutationFn: putAdmin,
//   });
//   const updateChanges = () => {
//     setErr("");
//     let data = {
//       _id: user?.id,
//     };

//     if (field === "firstname") {
//       if (firstname?.trim() === "") {
//         setErr("Required*");
//         return;
//       }
//       data.firstname = firstname;
//     }

//     if (field === "lastname") {
//       if (lastname?.trim() === "") {
//         setErr("Required*");
//         return;
//       }
//       data.lastname = lastname;
//     }

//     if (field === "phonenumber") {
//       if (phonenumber.trim() === "") {
//         setErr("Required!");
//         return;
//       }
//       if (!isValidPhoneNumber(phonenumber)) {
//         setErr("Invalid Phone Number!");
//         return;
//       }

//       const phoneNumber = DOMPurify.sanitize(phonenumber?.trim());
//       data.phonenumber = phoneNumber;
//     }

//     Swal.fire({
//       title: "Updating Information",
//       text: `Procceed with changes?`,
//       showCancelButton: true,
//     }).then(({ isConfirmed }) => {
//       if (isConfirmed) {
//         mutateAsync(data, {
//           onSuccess: (data) => {
//             customDispatch(globalAlertType("info", "Profile Updated!"));
//             updateUser(parseJwt(data?.acessToken));
//             queryClient.invalidateQueries(["user"]);
//             navigate("/profile");
//           },
//           onError: (error) => {
//             customDispatch(globalAlertType("error", error));
//           },
//         });
//       }
//     });
//   };

//   if (field === "phonenumber" && !state?.phonenumber) {
//     return <Navigate to="/profile" />;
//   }

//   return (
//     <AnimatedContainer>
//       <Container sx={{ minHeight: 300 }}>
//         <Typography variant="h4" color="primary">
//           Updates
//         </Typography>
//         <Typography variant="body2" paragraph>
//           Enter a new{" "}
//           {field === "firstname"
//             ? "First Name"
//             : field === "lastname"
//               ? "Last Name"
//               : field === "phonenumber"
//                 ? "Phone Number"
//                 : "Value"}
//         </Typography>

//         <Stack spacing={2}>
//           {field === "firstname" && (
//             <TextField
//               label="New First Name"
//               fullWidth
//               required
//               value={firstname}
//               onChange={(e) => setFirstname(e.target.value)}
//               error={err !== ""}
//               helperText={err}
//               margin="dense"
//               sx={{ marginBottom: 4 }}
//             />
//           )}
//           {field === "lastname" && (
//             <TextField
//               label="Last Name"
//               size="small"
//               fullWidth
//               required
//               value={lastname}
//               onChange={(e) => setLastname(e.target.value)}
//               error={err !== ""}
//               helperText={err}
//               margin="dense"
//               sx={{ marginBottom: 4 }}
//             />
//           )}

//           {field === "phonenumber" && (
//             <TextField
//               size="small"
//               type="tel"
//               inputMode="tel"
//               variant="outlined"
//               label="Mobile Number"
//               fullWidth
//               required
//               value={phonenumber}
//               onChange={(e) => setPhonenumber(e.target.value)}
//               error={err !== ""}
//               helperText={err}
//               margin="dense"
//             />
//           )}

//           <Box
//             sx={{
//               display: "flex",
//               justifyContent: "flex-end",
//               alignItems: "center",
//               gap: 2,
//             }}
//           >
//             <Link to="/profile">
//               <Button color="secondary" size="small" disabled={isLoading}>
//                 Cancel
//               </Button>
//             </Link>

//             <LoadingButton
//               size="small"
//               variant="contained"
//               onClick={updateChanges}
//               loading={isLoading}
//               loadingIndicator={<CircularProgress color="inherit" size={16} />}
//             >
//               {isLoading ? "Saving" : "Save Changes"}
//             </LoadingButton>
//           </Box>
//         </Stack>
//       </Container>
//     </AnimatedContainer>
//   );
// }

// export default Updates;
