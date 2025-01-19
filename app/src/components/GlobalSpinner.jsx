import { CircularProgress } from "@mui/material";

function GlobalSpinner() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.2)",
        zIndex: "999999",
        display: "grid",
        placeItems: "center",
        minHeight: "100svh",
      }}
    >
      <CircularProgress size={30} color="primary" />
      {/* <div className="spinner2"></div> */}
    </div>
  );
}

export default GlobalSpinner;
