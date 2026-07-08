import { useLocation, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  AlertTitle,
  useTheme,
} from "@mui/material";
import { ErrorOutline } from "@mui/icons-material";

function PaymentError() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleRetry = () => {
    navigate(state?.path || "/");
  };

  const handleHome = () => {
    navigate("/");
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
      }}
    >
      <Paper
        elevation={1}
        sx={{
          p: { xs: 3, sm: 5 },
          width: "100%",
          textAlign: "center",
          borderRadius: 3,
          bgcolor: "background.paper",
        }}
      >
        {/* Error Icon */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <ErrorOutline
            sx={{
              fontSize: 72,
              color: theme.palette.error.main,
            }}
          />
        </Box>

        <Typography
          variant="h4"
          component="h1"
          fontWeight="bold"
          color="error.main"
          gutterBottom
        >
          Payment Failed
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: "80%", mx: "auto" }}
        >
          Something went wrong while processing your transaction. Please retry
          or return to the home page.
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            justifyContent: "center",
          }}
        >
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleRetry}
            sx={{ minWidth: 160 }}
          >
            Retry Transaction
          </Button>
          <Button
            variant="outlined"
            color="primary"
            size="large"
            onClick={handleHome}
            sx={{ minWidth: 120 }}
          >
            Go Home
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default PaymentError;
