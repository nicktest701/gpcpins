import {
  CircularProgress,
  Container,
  Stack,
  TextField,
  Typography,
  Box,
  Button,
} from "@mui/material";
import Swal from "sweetalert2";
import DOMPurify from "dompurify";
import { useState } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import AnimatedContainer from "../../components/animations/AnimatedContainer";
import { LoadingButton } from "@mui/lab";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCustomData } from "../../context/providers/CustomProvider";
import { useAuth } from "../../context/providers/AuthProvider";
import { globalAlertType } from "../../components/alert/alertType";
import { isValidPhoneNumber } from "../../constants/PhoneCode";
import { putVerifier } from "../../api/verifierAPI";
import { parseJwt } from "../../config/sessionHandler";

function Updates() {
  const { user, login } = useAuth();
  const { field } = useParams();
  const { state } = useLocation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { customDispatch } = useCustomData();
  const [lastname, setLastname] = useState("");
  const [firstname, setFirstname] = useState("");
  const [phonenumber, setPhonenumber] = useState("");
  const [err, setErr] = useState("");

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: putVerifier,
  });
  const updateChanges = () => {
    setErr("");
    let data = {
      _id: user?.id,
    };

    if (field === "firstname") {
      if (firstname?.trim() === "") {
        setErr("Required*");
        return;
      }
      data.firstname = firstname;
    }

    if (field === "lastname") {
      if (lastname?.trim() === "") {
        setErr("Required*");
        return;
      }
      data.lastname = lastname;
    }

    if (field === "phonenumber") {
      if (phonenumber.trim() === "") {
        setErr("Required!");
        return;
      }
      if (!isValidPhoneNumber(phonenumber)) {
        setErr("Invalid Phone Number!");
        return;
      }

      const phoneNumber = DOMPurify.sanitize(phonenumber?.trim());
      data.phonenumber = phoneNumber;
    }

    Swal.fire({
      title: "Updating Information",
      text: `Procceed with changes?`,
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        mutateAsync(data, {
          onSuccess: (data) => {
            customDispatch(globalAlertType("info", "Profile Updated!"));
            login(parseJwt(data?.accessToken));
            queryClient.invalidateQueries(["user"]);
            navigate("/profile");
          },
          onError: (error) => {
            customDispatch(globalAlertType("error", error));
          },
        });
      }
    });
  };

  if (field === "phonenumber" && !state?.phonenumber) {
    return <Navigate to="/profile" />;
  }

  return (
    <AnimatedContainer>
      <Container sx={{ minHeight: 300 }}>
        <Typography variant="h4" color="primary">
          Updates
        </Typography>
        <Typography variant="body2" paragraph>
          Enter a new{" "}
          {field === "firstname"
            ? "First Name"
            : field === "lastname"
            ? "Last Name"
            : field === "phonenumber"
            ? "Phone Number"
            : "Value"}
        </Typography>

        <Stack spacing={2}>
          {field === "firstname" && (
            <TextField
              label="New First Name"
              fullWidth
              required
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              error={err !== ""}
              helperText={err}
              margin="dense"
              sx={{ marginBottom: 4 }}
            />
          )}
          {field === "lastname" && (
            <TextField
              label="Last Name"
             
              fullWidth
              required
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              error={err !== ""}
              helperText={err}
              margin="dense"
              sx={{ marginBottom: 4 }}
            />
          )}

          {field === "phonenumber" && (
            <TextField
              
              type="tel"
              inputMode="tel"
              variant="outlined"
              label="Mobile Number"
              fullWidth
              required
              value={phonenumber}
              onChange={(e) => setPhonenumber(e.target.value)}
              error={err !== ""}
              helperText={err}
              margin="dense"
            />
          )}

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Link to="/profile">
              <Button color="secondary" size="small" disabled={isLoading}>
                Cancel
              </Button>
            </Link>

            <LoadingButton
              size="small"
              variant="contained"
              onClick={updateChanges}
              loading={isLoading}
              loadingIndicator={<CircularProgress color="inherit" size={16} />}
            >
              {isLoading ? "Saving" : "Save Changes"}
            </LoadingButton>
          </Box>
        </Stack>
      </Container>
    </AnimatedContainer>
  );
}

export default Updates;
