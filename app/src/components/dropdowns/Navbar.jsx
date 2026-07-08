import { Stack, Box, useTheme } from "@mui/material";
import { NavLink } from "react-router-dom";
import EvoucherDropdown from "./EvoucherDropdown";
import PrepaidDropdown from "./PrepaidDropdown";
import AirtimeDropdown from "./AirtimeDropdown";

// Single wrapper component that uses CSS :hover to show/hide the dropdown
const DropdownWrapper = ({ label, to, dropdownComponent: DropdownComponent }) => {
  const theme = useTheme();

  const linkStyle = ({ isActive }) => ({
    color: isActive ? theme.palette.secondary.main : "#333",
    fontWeight: isActive ? "700" : "normal",
    textDecoration: "none",
    fontSize: "0.9rem",
    padding: "8px 12px",
    transition: "color 0.2s",
    "&:hover": { color: theme.palette.secondary.main },
  });

  return (
    <Box
      sx={{
        position: "relative",
        // Dropdown is hidden by default, shown when this container is hovered
        "& .dropdown-menu": {
          visibility: "hidden",
          opacity: 0,
          transform: "translateY(-8px)",
          transition: "all 200ms ease-in-out",
          pointerEvents: "none",
        },
        "&:hover .dropdown-menu": {
          visibility: "visible",
          opacity: 1,
          transform: "translateY(0)",
          pointerEvents: "auto",
        },
      }}
    >
      <NavLink to={to} style={linkStyle} className="nav-item">
        {label}
      </NavLink>
      <Box className="dropdown-menu" sx={{ position: "absolute", top: "100%", left: 0, zIndex: 1300 }}>
        <DropdownComponent />
      </Box>
    </Box>
  );
};

const Navbar = () => {
  const theme = useTheme();
  const homeLinkStyle = ({ isActive }) => ({
    color: isActive ? theme.palette.secondary.main : "#333",
    fontWeight: isActive ? "700" : "normal",
    textDecoration: "none",
    fontSize: "0.9rem",
    padding: "8px 12px",
    transition: "color 0.2s",
    "&:hover": { color: theme.palette.secondary.main },
  });

  return (
    <Stack
      direction="row"
      spacing={4}
      sx={{
        display: { xs: "none", lg: "flex" },
        alignItems: "center",
        bgcolor: "background.paper",
        py: 1,
      }}
    >
      <NavLink to="/" style={homeLinkStyle} className="nav-item">
        Home
      </NavLink>

      <DropdownWrapper
        label="Vouchers & Tickets"
        to="evoucher"
        dropdownComponent={EvoucherDropdown}
      />

      <DropdownWrapper
        label="Prepaid Units"
        to="electricity"
        dropdownComponent={PrepaidDropdown}
      />

      <DropdownWrapper
        label="Airtime & Data Bundle"
        to="airtime"
        dropdownComponent={AirtimeDropdown}
      />
    </Stack>
  );
};

export default Navbar;