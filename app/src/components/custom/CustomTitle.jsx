import { Box, Stack, Typography } from "@mui/material";

function CustomTitle({ title, subtitle }) {
  return (
    <Box py={2}>
      <Stack>
        <Typography variant="h3" color="primary">
          {title}
        </Typography>
        <Typography variant="body2" color="secondary">
          {subtitle}
        </Typography>
      </Stack>
    </Box>
  );
}

export default CustomTitle;
