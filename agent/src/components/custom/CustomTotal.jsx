import { ListItemText } from "@mui/material";

function CustomTotal({ title, total }) {
  return (
    <ListItemText
      sx={{
        alignSelf: { xs: "flex-start", md: "flex-end" },
        textAlign: { xs: "left", md: "right" },
      }}
      primary={total}
      primaryTypographyProps={{
        fontWeight: "bold",
        fontSize: { xs: "1rem", md: "1.5rem" },
      }}
      secondary={title || "TOTAL"}
      secondaryTypographyProps={{
        color: "secondary",
        textTransform: "uppercase",
      }}
    />
  );
}

export default CustomTotal;
