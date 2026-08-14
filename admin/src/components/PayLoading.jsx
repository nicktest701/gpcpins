import { Backdrop, CircularProgress } from "@mui/material";

function PayLoading() {
  return (
    <Backdrop
      open={true}
      sx={{ width: "100%", height: "100svh", bgcolor: "#fff", zIndex: 9999 }}
    >
      <CircularProgress />
    </Backdrop>
  );
}

export default PayLoading;
