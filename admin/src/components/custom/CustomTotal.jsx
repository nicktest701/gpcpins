import { Stack, Typography } from "@mui/material";

function CustomTotal({ title, total }) {
  return (
    <Stack
      direction={{ xs: "row", md: "column" }}
      alignItems={{ xs: "center", md: "flex-end" }}
      spacing={{ xs: 1, md: 0.5 }}
      sx={{ textAlign: { xs: "center", md: "right" } ,mb:2}}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        textTransform="uppercase"
        sx={{ fontWeight: 500 }}
      >
        {title || "TOTAL"}
      </Typography>
      <Typography
        variant="h6"
        fontWeight="bold"
        sx={{ fontSize: { xs: "1rem", md: "1.5rem" } }}
      >
        {total}
      </Typography>
    </Stack>
  );
}

export default CustomTotal;