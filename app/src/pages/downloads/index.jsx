import { Box, Typography } from "@mui/material";
import Download from "./Download";

const Downloads = () => {
  return (
    <Box
      sx={{
        borderRadius: 2, // Rounded corners
        p: 4, // Padding
        mx: "auto", // Center horizontally
        // Limit width
        maxWidth: "1080px",
        textAlign: "center", // Center-align text
        minHeight: "100svh",
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2 }}>
        Download Our Apps
      </Typography>

      <Typography variant="body2">
        Choose the app that fits your needs: Redeem vouchers, scan tickets, or
        manage sales effortlessly. Simplify your experience today!
      </Typography>

      <Download />
    </Box>
  );
};

export default Downloads;
