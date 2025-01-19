import { useTheme } from "@emotion/react";
import { Box } from "@mui/material";
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
      borderBottom: isActive ? `solid 2px ${palette.primary.main} ` : null,
      color: isActive ? palette.primary.main : "#333",
      backgroundColor: isActive ? "#eee" : "transparent",
      fontWeight: isActive ? "bolder" : "400",
      padding: "8px",
      transition: "all 100ms ease-in-out",
    };
  };
  return (
    <>
      <Box
        sx={{
          py: 6,
        }}
      >
        <NavLink className="profile-link" style={linkStyle} to="/profile" end>
          Personal
        </NavLink>
        <NavLink className="profile-link" style={linkStyle} to="business" end>
          Business
        </NavLink>
        {/* <NavLink to="notifications" style={linkStyle}>
          Notifications
        </NavLink> */}
      </Box>
    </>
  );
}

export default ProfileSidebar;
