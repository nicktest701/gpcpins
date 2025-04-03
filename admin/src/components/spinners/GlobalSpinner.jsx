function GlobalSpinner() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.2)",
        zIndex: "99999999999",
        display: "grid",
        placeItems: "center",
        minWidth: "100svw",
         height: "100svh",
        overflow: "hidden",
      }}
    >
      <div className="spinner2"></div>
    </div>
  );
}

export default GlobalSpinner;
