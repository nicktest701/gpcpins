import { useTheme } from "@emotion/react";
import { Box, Paper, Typography } from "@mui/material";
import { NavLink } from "react-router-dom";

function ProfileSidebar() {
  const {
    palette,
    typography: { button },
  } = useTheme();

  const linkStyle = ({ isActive }) => {
    return {
      width: "100%",
      fontFamily: button.fontFamily,
      fontSize: button.fontSize,
      textDecoration: "none",
      borderBottom: isActive ? `solid 2px ${palette.secondary.main} ` : null,
      color: isActive ? palette.primary.main : "#333",
      backgroundColor: isActive ? "#eee" : "transparent",
      fontWeight: isActive ? "bolder" : "400",
      padding: "8px",
      transition: "all 100ms ease-in-out",
    };
  };
  return (
    <Box
      sx={{
        p: 4,
      }}
    >
      <NavLink className="profile-link" style={linkStyle} to="/profile" end>
        Personal Details
      </NavLink>
      <NavLink to="notifications" style={linkStyle}>
        Notifications
      </NavLink>
    </Box>
  );
}

export default ProfileSidebar;
