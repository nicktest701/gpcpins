import { ListItemText } from "@mui/material";

function CustomTotal({ title, total }) {
  return (
    <ListItemText
      sx={{ alignSelf: "flex-end", textAlign: { xs: "center", md: "right" } }}
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
