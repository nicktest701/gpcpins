import { Box, Container, Typography, Button, Stack, Card, CardContent, CardActions, Avatar, useTheme, alpha, Fade, Grid } from "@mui/material";
import { GetApp, QrCodeScanner, Storefront, PhoneAndroid } from "@mui/icons-material";
import { useContext } from "react";
import { useCustomContext } from "../../context/providers/CustomProvider";
import { globalAlertType } from "../../components/alert/alertType";
import Swal from "sweetalert2";

// Static App Meta-Data (Icons are mapped inside the loop to avoid static instance stale memory)
const APPS_META = [
  {
    id: "gpcpins",
    name: "Voucher & Ticketing",
    description: "Access, redeem, and manage your vouchers securely. Stay updated with the latest deals and offers anytime, anywhere.",
    qrCode: "/images/gpcpins.png",
    type: "voucher",
  },
  {
    id: "gpcscanner",
    name: "Verification",
    description: "Scan and validate tickets or vouchers instantly. Ensure secure and seamless verification at events or for purchases.",
    qrCode: "/images/verification.png",
    type: "scanner",
  },
  {
    id: "agent",
    name: "Agent",
    description: "Sell airtime and data bundles, track sales in real-time, and manage customer interactions efficiently with the Agent App.",
    qrCode: "/images/agent.png",
    type: "agent",
  },
];

// Helper to resolve icon component on demand
const getAppIcon = (type) => {
  switch (type) {
    case "voucher": return <QrCodeScanner fontSize="large" />;
    case "scanner": return <PhoneAndroid fontSize="large" />;
    case "agent": return <Storefront fontSize="large" />;
    default: return <GetApp fontSize="large" />;
  }
};

function Download() {
  const theme = useTheme();
  const { customDispatch } = useCustomContext();

  const handleDownload = async (appId, appName) => {
    try {
      const result = await Swal.fire({
        title: `Download ${appName}?`,
        text: "You are about to download the APK file. It will open in a new tab.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, download",
        cancelButtonText: "Cancel",
        confirmButtonColor: theme.palette.secondary.main,
      });

      if (!result.isConfirmed) return;

      customDispatch(globalAlertType("info", `Downloading ${appName}. Please wait...`));

      // Optimized programmatic link trigger without lingering DOM injection
      const link = document.createElement("a");
      link.href = `https://gpcpins.com/downloads/apps/${appId}.apk`;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.download = `${appId}.apk`;
      link.click();

      setTimeout(() => {
        customDispatch(globalAlertType("success", `${appName} download started!`));
      }, 1000);
    } catch (error) {
      customDispatch(globalAlertType("error", "An error occurred during download execution."));
    }
  };

  return (
    <Fade in timeout={600}>
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        {/* Header Section */}
        {/* <Box textAlign="center" mb={6}>
          <Typography variant="h3" fontWeight="bold" color="primary" gutterBottom>
            Download Our Apps
          </Typography>
          <Typography variant="body1" color="text.secondary" maxWidth="sm" mx="auto">
            Choose the app that fits your needs and download it to get started.
          </Typography>
        </Box> */}

        {/* App Cards Grid Structure */}
        <Grid container spacing={4} justifyContent="center">
          {APPS_META.map((app) => (
            <Grid key={app.id} item xs={12} sm={6} md={4}>
              <AppCard
                app={app}
                onDownload={handleDownload}
                theme={theme}
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Fade>
  );
}

// ----- Reusable Isolated App Card -----
const AppCard = ({ app, onDownload, theme }) => {
  const { id, name, description, qrCode, type } = app;

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 4,
        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: theme.shadows[6],
          borderColor: theme.palette.primary.main,
          "& .card-icon": {
            backgroundColor: alpha(theme.palette.primary.main, 0.12),
            color: theme.palette.primary.main,
          },
        },
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          padding: "2px",
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.secondary.main, 0.2)})`,
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          pointerEvents: "none",
          opacity: 0,
          transition: "opacity 0.4s ease",
        },
        "&:hover::before": {
          opacity: 1,
        },
      }}
    >
      <CardContent sx={{ flex: 1, p: 3 }}>
        <Stack spacing={2} alignItems="center" textAlign="center">
          {/* Dynamic Render Icon */}
          <Avatar
            className="card-icon"
            sx={{
              width: 64,
              height: 64,
              bgcolor: alpha(theme.palette.secondary.main, 0.08),
              color: theme.palette.secondary.main,
              transition: "all 0.3s ease",
            }}
          >
            {getAppIcon(type)}
          </Avatar>

          {/* Title Text */}
          <Typography variant="h6" fontWeight="bold">
            {name}
          </Typography>

          {/* Description Text */}
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>

          {/* Dynamic Image Wrapper */}
          <Box
            component="img"
            src={qrCode}
            alt={`QR Code for ${name}`}
            loading="lazy"
            sx={{
              width: 120,
              height: 120,
              objectFit: "contain",
              mt: 1,
              borderRadius: 2,
              bgcolor: "background.paper",
              p: 1,
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            }}
          />
          <Typography variant="caption" color="text.secondary">
            Scan to download
          </Typography>
        </Stack>
      </CardContent>

      <CardActions sx={{ p: 3, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          color="secondary"
          startIcon={<GetApp />}
          onClick={() => onDownload(id, name)}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            boxShadow: `0 4px 12px ${alpha(theme.palette.secondary.main, 0.25)}`,
            "&:hover": {
              boxShadow: `0 8px 24px ${alpha(theme.palette.secondary.main, 0.35)}`,
            },
          }}
        >
          Download (.apk)
        </Button>
      </CardActions>
    </Card>
  );
};

export default Download;
