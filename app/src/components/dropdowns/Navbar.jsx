import { Stack, Box, useTheme } from "@mui/material";
import { NavLink } from "react-router-dom";
import EvoucherDropdown from "./EvoucherDropdown";
import PrepaidDropdown from "./PrepaidDropdown";
import AirtimeDropdown from "./AirtimeDropdown";
import ComplaintModal from "../modals/ComplaintModal";

// Single wrapper component that uses CSS :hover to show/hide the dropdown
const DropdownWrapper = ({ label, to, dropdownComponent: DropdownComponent }) => {
  const theme = useTheme();

  const linkStyle = ({ isActive }) => ({
    color: isActive ? theme.palette.primary.main : "#333",
      borderBottom: isActive ? `2px solid ${theme.palette.secondary.main}` : "none",
    fontWeight: isActive ? "700" : "normal",
    textDecoration: "none",
    fontSize: "1rem",
    textTransform:'uppercase',
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
    color: isActive ? theme.palette.primary.main : "#333",
    fontWeight: isActive ? "700" : "normal",
    borderBottom: isActive ? `2px solid ${theme.palette.secondary.main}` : "none",
    textDecoration: "none",
    fontSize: "0.9rem",
    padding: "8px 12px",
    transition: "color 0.2s",
    "&:hover": { color: theme.palette.secondary.main },
  });

  return (
    <Stack
      direction="row"
      spacing={1.2}
      sx={{
        flex:1,
        display: { xs: "none", lg: "flex" },
        alignItems: "center",
        justifyContent:'center',
        bgcolor: "background.paper",
        py: 1,
      }}
    >
      <NavLink to="/" style={homeLinkStyle} className="nav-item">
        HOME
      </NavLink>

      <DropdownWrapper
        label="Vouchers & Tickets"
        to="evoucher"
        dropdownComponent={EvoucherDropdown}
      />

      <DropdownWrapper
        label="ECG Prepaid & Postpaid"
        to="electricity"
        dropdownComponent={PrepaidDropdown}
      />

      <DropdownWrapper
        label="Airtime & Data Bundle"
        to="airtime"
        dropdownComponent={AirtimeDropdown}
      />
      <div className="nav-item">
     <ComplaintModal buttonVariant="button" buttonText="HELP & SUPPORT" />
      </div>
    </Stack>
  );
};

export default Navbar;