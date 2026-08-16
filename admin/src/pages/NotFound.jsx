import { Container, Paper, Typography, Button, Box, useTheme, alpha, Fade } from "@mui/material";
import { ErrorOutline, Home } from "@mui/icons-material";
import { Link } from "react-router-dom";

function NotFound() {
  const theme = useTheme();

  return (
    <Fade in timeout={600}>
      <Container
        maxWidth="sm"
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: `radial-gradient(circle at 30% 40%, ${alpha(theme.palette.primary.main, 0.04)} 0%, transparent 70%)`,
          py: 4,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, sm: 6 },
            borderRadius: 1.2,
            textAlign: "center",
            width: "100%",
            border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
            bgcolor: "background.paper",
          }}
        >
          {/* Illustration / Icon */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 3,
            }}
          >
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                bgcolor: alpha(theme.palette.warning.main, 0.08),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `2px dashed ${alpha(theme.palette.warning.main, 0.3)}`,
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                },
              }}
            >
              <ErrorOutline
                sx={{
                  fontSize: 64,
                  color: theme.palette.warning.main,
                }}
              />
            </Box>
          </Box>

          {/* Error code */}
          <Typography
            variant="h1"
            component="div"
            sx={{
              fontSize: { xs: "4rem", sm: "6rem" },
              fontWeight: 800,
              color: theme.palette.primary.main,
              letterSpacing: "-0.02em",
              lineHeight: 1,
              mb: 1,
            }}
          >
            404
          </Typography>

          {/* Message */}
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Page Not Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: "auto" }}>
            The page you are looking for doesn’t exist or has been moved.
          </Typography>

          {/* Action Buttons */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              justifyContent: "center",
            }}
          >
            <Button
              component={Link}
              to="/"
              variant="contained"
              color="secondary"
              startIcon={<Home />}
              sx={{
                borderRadius: 1.2,
                textTransform: "none",
                fontWeight: 600,
                boxShadow: `0 8px 24px ${alpha(theme.palette.secondary.main, 0.25)}`,
                "&:hover": {
                  boxShadow: `0 12px 32px ${alpha(theme.palette.secondary.main, 0.35)}`,
                },
                px: 4,
              }}
            >
              Go Home
            </Button>
            <Button
              component={Link}
              to="/"
              variant="outlined"
              color="inherit"
              sx={{
                borderRadius: 1.2,
                textTransform: "none",
                fontWeight: 600,
                px: 4,
              }}
            >
              Contact Support
            </Button>
          </Box>
        </Paper>
      </Container>
    </Fade>
  );
}

export default NotFound;