import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import {
  CheckCircleRounded,
  ErrorRounded,
  InfoRounded,
  WarningRounded,
  Close,
} from "@mui/icons-material";
import { useCustomContext } from "../../context/providers/CustomProvider";
import SlideRightTransition from "../SlideRightTransition";
const GlobalAlert = () => {
  const {
    customState: { alertData },
    customDispatch,
  } = useCustomContext();

  const handleClose = () => {
    customDispatch({
      type: "closeAlert",
    });
  };
  // // const borderColor = alertData?.severity === 'error' ? '#B72136' : '#15bee4';
  // const color = alertData?.severity === "error" ? "#B72136" : "#08660D";

  // ─── Severity configuration ───────────────────────────────────────
  const severityConfig = {
    success: {
      icon: <CheckCircleRounded />,
      color: "#2e7d32",
      bgcolor: "#e8f5e9",
      borderColor: "#4caf50",
    },
    error: {
      icon: <ErrorRounded />,
      color: "#c62828",
      bgcolor: "#ffebee",
      borderColor: "#f44336",
    },
    warning: {
      icon: <WarningRounded />,
      color: "#e65100",
      bgcolor: "#fff3e0",
      borderColor: "#ff9800",
    },
    info: {
      icon: <InfoRounded />,
      color: "#0d47a1",
      bgcolor: "#e3f2fd",
      borderColor: "#2196f3",
    },
  };

  const config = severityConfig[alertData?.severity] || severityConfig.info;

  return (
    <Snackbar
      anchorOrigin={{
        horizontal: "right",
        vertical: "top",
      }}
      // open={true}
      open={alertData?.open}
      autoHideDuration={5000}
      onClose={handleClose}
      TransitionComponent={SlideRightTransition}
      message={alertData?.message}
      sx={{
        maxWidth: 480,
        width: "100%",
        zIndex: 9999,
        "& .MuiSnackbarContent-root": {
          padding: 0,
        },
      }}
    >
      <Alert
        icon={config.icon}
        severity={alertData?.severity}
        sx={{
          width: "100%",
          py: 1.5,
          px: 2,
          borderRadius: 0,
          bgcolor: config.bgcolor,
          color: config.color,
          borderLeft: `4px solid ${config.borderColor}`,
          boxShadow: (theme) => theme.shadows[6],
          "& .MuiAlert-icon": {
            fontSize: 24,
            color: config.borderColor,
          },
          "& .MuiAlert-message": {
            fontWeight: 500,
            fontSize: "0.95rem",
            lineHeight: 1.5,
            padding: "4px 0",
          },
          "& .MuiAlert-action": {
            padding: 0,
            alignItems: "center",
            marginLeft: 1,
          },
        }}
      >
        {alertData?.message}
      </Alert>
    </Snackbar>
  );
};

export default GlobalAlert;
