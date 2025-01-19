import { Box, Typography } from "@mui/material";

const PersonalDetailsItem = ({ label, value }) => {
  return (
    <Box sx={{ width: "100%" }}>
      {/* <fieldset> */}
      {/* <legend>{label}</legend> */}
      <Typography color='secondary.main' fontSize={11} fontWeight="600">
        {label}
      </Typography>
      <Typography>{value}</Typography>
      {/* </fieldset> */}
    </Box>
  );
};

export default PersonalDetailsItem;
