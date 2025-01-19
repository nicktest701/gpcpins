import { Stack } from "@mui/material";


const CustomFormControl = ({ children }) => {
  return (
    <Stack
      spacing={2}
      direction={{ xs: "column", sm: "row" }}
      paddingY={1}
      justifyContent={{ xs: "center", md: "space-between" }}
      alignItems="center"
    >
      {children}
    </Stack>
  );
};

export default CustomFormControl;
