function LoadingSpinner({ value }) {
  return (
    <div
      style={{
        position: "fixed",
        top: -250,
        bottom: -200,
        inset: 0,
        backgroundColor: "rgba(255,255,255,0.92)",
        zIndex: "99999999999",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minWidth: "100svw",
        minHeight: "100svh",
        overflow: "hidden",
        gap: "16px",
      }}
    >
      <div className="spinner3"></div>
      <p>{value || "Please Wait.."}</p>
    </div>
  );
}

export default LoadingSpinner;
