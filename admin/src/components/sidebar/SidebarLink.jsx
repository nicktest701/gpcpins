import { Stack, Tooltip, Typography, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { NavLink } from "react-router-dom";

// NOTE: the original NavLinkItem appended a static tracking query string
// (?YixHy=a34cdd3543&_pid=423423) to every route. That looked like leftover
// debug code from a commented-out `generateRandomCode`/`uuid()` call rather
// than something intentional, so it's been dropped here. If it's actually
// needed (analytics, cache-busting), reinstate it in the `to` below.

function SidebarLink({ to, title, icon: Icon, collapsed, onNavigate }) {
  const theme = useTheme();

  const link = (
    <NavLink
      to={to}
      end
      onClick={onNavigate}
      style={{ textDecoration: "none", display: "block" }}
    >
      {({ isActive }) => (
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{
            px: collapsed ? 1.25 : 1.5,
            py: 1,
            mx: 1,
            borderRadius: 2.5,
            justifyContent: collapsed ? "center" : "flex-start",
            color: isActive ? theme.palette.secondary.main : alpha("#fff", 0.75),
            bgcolor: isActive ? alpha(theme.palette.secondary.main, 0.14) : "transparent",
            transition: "background-color .18s ease, color .18s ease",
            "&:hover": {
              bgcolor: isActive
                ? alpha(theme.palette.secondary.main, 0.18)
                : alpha("#fff", 0.06),
              color: isActive ? theme.palette.secondary.main : "#fff",
            },
          }}
        >
          <Icon sx={{ fontSize: 20, flexShrink: 0 }} />
          {!collapsed && (
            <Typography
              noWrap
              sx={{ fontSize: 13, fontWeight: isActive ? 600 : 500, letterSpacing: 0.2, flex: 1 }}
            >
              {title}
            </Typography>
          )}
        </Stack>
      )}
    </NavLink>
  );

  if (!collapsed) return link;

  return (
    <Tooltip title={title} placement="right" arrow>
      <span style={{ display: "block" }}>{link}</span>
    </Tooltip>
  );
}

export default SidebarLink;
