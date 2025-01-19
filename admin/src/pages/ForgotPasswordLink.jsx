import { Mail } from "@mui/icons-material";
import { Container, Paper, Typography } from "@mui/material";
import { Link, Navigate, useLocation } from "react-router-dom";
import AnimatedContainer from "../components/animations/AnimatedContainer";
import { LoadingButton } from "@mui/lab";

function ForgotPasswordLink() {
  const { state } = useLocation();

  if (!state?.email) {
    return <Navigate to="/auth/login" />;
  }

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
          <Mail color="primary" sx={{ width: 50, height: 50 }} />
          <Typography textAlign="center" variant="h3" paragraph>
            Reset Link Sent!
          </Typography>
          <Typography variant="body2" paragraph>
            A password reset message was sent to <b><i>{state?.email}</i></b>. Please
            click the link in that message to reset your password.
          </Typography>

          <LoadingButton
            LinkComponent={Link}
            href="/"
            size="large"
            variant="contained"
            fullWidth
            sx={{ borderRadius: 0, py: 2 }}
          >
            Done
          </LoadingButton>
        </Paper>
      </Container>
    </AnimatedContainer>
  );
}

export default ForgotPasswordLink;
