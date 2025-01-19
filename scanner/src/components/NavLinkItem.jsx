import { useTheme, Stack, Typography, Tooltip } from "@mui/material";
import { NavLink } from "react-router-dom";

function NavLinkItem({ to, title, icon }) {
  const {
    palette,
    typography: { button },
  } = useTheme();

  const linkStyle = ({ isActive }) => {
    return {
      // fontFamily: button.fontFamily,
      // fontSize: button.fontSize,
      position: "relative",
      textDecoration: "none",
      borderBottom: isActive ? `solid 2px ${palette.primary.main} ` : null,
      color: isActive ? "var(--secondary)" : palette.primary.main,
      fontWeight: isActive ? "bolder" : "normal",
      backgroundColor:'#f78e2a80'
    };
  };

  return (
    <Tooltip title={title} placement="right">
      <NavLink
        to={`${to}?YixHy=a34cdd3543&_pid=423423`}
        // to={`${to}?YixHy=${generateRandomCode(150)}&_pid=${uuid()}`}
        style={linkStyle}
        end
      >
        <Stack
          direction="row"
          columnGap={3}
          sx={{
            padding: 1,
            cursor: "pointer",
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.1)",
            },
          }}
        >
          {icon}
          <Typography variant="button">{title}</Typography>
        </Stack>
      </NavLink>
    </Tooltip>
  );
}

export default NavLinkItem;
