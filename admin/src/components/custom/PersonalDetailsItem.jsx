import { Box, Typography } from "@mui/material";

const PersonalDetailsItem = ({ label, value }) => {
  return (
    <Box sx={{ width: "100%" }}>

      <Typography color='secondary.main' fontSize={11} fontWeight="600">
        {label}
      </Typography>
      <Typography>{value}</Typography>
  
    </Box>
  );
};

export default PersonalDetailsItem;
