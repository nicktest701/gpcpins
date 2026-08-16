import { Stack, Typography } from "@mui/material";

function CustomTotal({ title, total }) {
  return (
    <Stack
      direction='column'
      alignItems={{ xs: "center", md: "flex-start" }}
      spacing={0.5}
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