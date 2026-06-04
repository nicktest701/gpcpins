import { Box, Stack, useTheme } from "@mui/material";
import { NavLink } from "react-router-dom";

export const DropdownBase = ({ children, width = 300 }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width,
        bgcolor: "background.paper",
        boxShadow: theme.shadows[4],
        borderRadius: 1,
        overflow: "hidden",
      }}
    >
      <Stack justifyContent="flex-start" alignItems="flex-start" p={1}>
        {children}
      </Stack>
    </Box>
  );
};

export const dropdownItemStyles = ({ isActive }) => {

  return {
    color: ({theme}) => isActive ? theme.palette.secondary.main : "#333",
    fontWeight: isActive ? "700" : "normal",
    fontSize: "0.85rem",
    textDecoration: "none",
    padding: "8px 16px",
    width: "100%",
    borderRadius: "4px",
    "&:hover": {
      backgroundColor: ({theme}) => theme.palette.action.hover,
      color: ({theme}) => theme.palette.secondary.main,
    },
  };
};