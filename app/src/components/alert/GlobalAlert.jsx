import { useContext } from "react";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { CheckCircleRounded, ErrorRounded } from "@mui/icons-material";
import { CustomContext } from "../../context/providers/CustomProvider";
import SlideRightTransition from "../SlideRightTransition";
const GlobalAlert = () => {
  const {
    customState: { alertData },
    customDispatch,
  } = useContext(CustomContext);

  const handleClose = () => {
    customDispatch({
      type: "closeAlert",
    });
  };
  // const borderColor = alertData?.severity === 'error' ? '#B72136' : '#15bee4';
  const color = alertData?.severity === "error" ? "#B72136" : "#08660D";

  return (
    <Snackbar
      anchorOrigin={{
        horizontal: "right",
        vertical: "top",
      }}
      tr
      // open={true}
      open={alertData?.open}
      autoHideDuration={5000}
      onClose={handleClose}
      TransitionComponent={SlideRightTransition}
      message={alertData?.message}
      sx={{ zIndex: 9999 }}
    >
      <Alert
        icon={
          alertData?.severity === "info" ? (
            <CheckCircleRounded color="success" />
          ) : (
            <ErrorRounded color="error" />
          )
        }
        severity={alertData?.severity}
        // onClose={handleClose}
        sx={{
          // width: "100%",
          color: alertData?.severity === "info" ? "#08660D" : "error.main",
          borderBottom: `2px solid ${color}`,
          bgcolor: "#fff",
          py: 1,
          borderRadius: 1,
          fontSize: 12,
           boxShadow: "10px 10px 30px #d9d9d9,-10px -10px 30px #ffffff",
        }}
      >
        {alertData?.message}
      </Alert>
    </Snackbar>
  );
};

export default GlobalAlert;
