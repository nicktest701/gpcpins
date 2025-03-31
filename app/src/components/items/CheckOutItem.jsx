import { Stack, Typography } from "@mui/material";

const CheckOutItem = ({ title, titleColor, value, color }) => {
  return (
    <Stack direction="row" spacing={2}>
      <Typography
        variant="body2"
        fontWeight="700"
        color={titleColor || color || "secondary"}
        textAlign="left"
        sx={{ flex: 0.3, fontSize: { xs: 12, sm: "normal" } }}
        flexWrap="nowrap"
        whiteSpace="nowrap"
      >
        {title}
      </Typography>
      <Typography
        variant="body2"
        textAlign="left"
        color={color || "text.primary"}
        sx={{
          flex: 0.6,
          display: { xs: "inline-block" },
          fontSize: { xs: 12, sm: "normal" },
        }}
        whiteSpace="wrap"
      >
        {value}
      </Typography>
    </Stack>
  );
};

export default CheckOutItem;
