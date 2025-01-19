import { useState } from "react";
import { Container, Paper, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import AnimatedContainer from "../components/animations/AnimatedContainer";
import { LoadingButton } from "@mui/lab";
import { useMutation } from "@tanstack/react-query";
import { putVerifierResetPasswordLink } from "../api/verifierAPI";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: putVerifierResetPasswordLink,
  });

  const handleSubmit = () => {
    setErr("");

    if (email?.trim() === "") {
      setErr("Required!");
      return;
    }

    if (!/[A-Z0-9._%+-]+@[A-Z0-9-]+.+.[A-Z]{2,4}/gim.test(email)) {
      setErr("Invalid email address!");
      return;
    }

    const sanitizedEmail = DOMPurify.sanitize(email);

    const user = {
      email: sanitizedEmail,
    };

    mutateAsync(user, {
      onSuccess: (data) => {
        console.log(data);
        navigate("/auth/link", {
          state: {
            email: sanitizedEmail,
          },
        });
      },
      onError: (error) => {
        // console.log(error);
        setErr(error);
      },
    });
  };

  return (
    <AnimatedContainer delay={0.1}>
      <Container
        maxWidth="sm"
        sx={{
          height: "90dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <Paper
          elevation={2}
          sx={{
            // width: 320,
            height: 420,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            p: 4,
          }}
        >
          {/* <Key color="primary" sx={{ width: 50, height: 50 }} /> */}
          <Typography textAlign="center" variant="h3" paragraph>
            Forgot your password
          </Typography>
          <Typography variant="body2" paragraph>
            Please enter the <b>email address</b> you use to sign in to your
            account.
          </Typography>
          <TextField
            type="email"
            label="Email Address"
            required
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={err !== ""}
            helperText={err}
          />

          <LoadingButton
            size="large"
            variant="contained"
            fullWidth
            disabled={isLoading}
            loading={isLoading}
            onClick={handleSubmit}
            sx={{ borderRadius: 0, py: 2 }}
          >
            Request Reset Link
          </LoadingButton>
        </Paper>
      </Container>
    </AnimatedContainer>
  );
}

export default ForgotPassword;
