function GlobalSpinner() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.2)",
        zIndex: "9999999",
        display: "grid",
        placeItems: "center",
        minWidth: "100svw",
        minHeight: "100svh",
      }}
    >
      <div className="spinner2"></div>
    </div>
  );
}

export default GlobalSpinner;
