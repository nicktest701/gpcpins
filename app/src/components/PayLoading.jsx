import { Backdrop, CircularProgress } from "@mui/material";

function PayLoading() {
  return (
    <Backdrop
      open={true}
      sx={{ width: "100%", height: "100svh", bgcolor: "#fff" }}
    >
      <CircularProgress size={30} color="secondary" />
    </Backdrop>
  );
}

export default PayLoading;
