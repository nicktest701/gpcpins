import { useState } from "react";
import { Stack, Typography, Collapse, Menu, MenuItem, Tooltip, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { ExpandMore } from "@mui/icons-material";
import { NavLink } from "react-router-dom";

function SidebarGroup({ title, icon: Icon, children, collapsed, defaultOpen = false, onNavigate }) {
  const theme = useTheme();
  const [open, setOpen] = useState(defaultOpen);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (e) => {
    if (collapsed) setAnchorEl(e.currentTarget);
    else setOpen((o) => !o);
  };

  const trigger = (
    <Stack
      direction="row"
      alignItems="center"
      onClick={handleClick}
      spacing={1.5}
      sx={{
        px: collapsed ? 1.25 : 1.5,
        py: 1,
        mx: 1,
        borderRadius: 1.2,
        cursor: "pointer",
        justifyContent: collapsed ? "center" : "space-between",
        color: alpha("#fff", 0.75),
        "&:hover": { bgcolor: alpha("#fff", 0.06), color: "#fff" },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
        <Icon sx={{ fontSize: 20, flexShrink: 0 }} />
        {!collapsed && (
          <Typography noWrap sx={{ fontSize: 13, fontWeight: 500, letterSpacing: 0.2 }}>
            {title}
          </Typography>
        )}
      </Stack>
      {!collapsed && (
        <ExpandMore
          sx={{
            fontSize: 18,
            flexShrink: 0,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform .2s ease",
          }}
        />
      )}
    </Stack>
  );

  return (
    <>
      {collapsed ? (
        <Tooltip title={title} placement="right" arrow>
          {trigger}
        </Tooltip>
      ) : (
        trigger
      )}

      {!collapsed && (
        <Collapse in={open} timeout={220} unmountOnExit>
          <Stack
            sx={{
              ml: "27px",
              pl: 1.5,
              my: 0.25,
              borderLeft: `1px solid ${alpha("#fff", 0.12)}`,
              gap: 0.25,
            }}
          >
            {children.map((child) => (
              <NavLink
                key={child.to}
                to={child.to}
                end
                onClick={onNavigate}
                style={{ textDecoration: "none" }}
              >
                {({ isActive }) => (
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1.25}
                    sx={{
                      px: 1.25,
                      py: 0.75,
                      borderRadius: 1.2,
                      color: isActive ? theme.palette.secondary.main : alpha("#fff", 0.7),
                      bgcolor: isActive ? alpha(theme.palette.secondary.main, 0.12) : "transparent",
                      "&:hover": { bgcolor: alpha("#fff", 0.06), color: "#fff" },
                    }}
                  >
                    <child.icon sx={{ fontSize: 17, flexShrink: 0 }} />
                    <Typography noWrap sx={{ fontSize: 12.5, fontWeight: isActive ? 600 : 500 }}>
                      {child.title}
                    </Typography>
                  </Stack>
                )}
              </NavLink>
            ))}
          </Stack>
        </Collapse>
      )}

      {collapsed && (
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          PaperProps={{
            sx: {
              ml: 1,
              minWidth: 210,
              bgcolor: theme.palette.primary.main,
              backgroundImage: "none",
              border: `1px solid ${alpha("#fff", 0.1)}`,
            },
          }}
        >
          <Typography
            sx={{
              px: 2,
              py: 0.5,
              fontSize: 11,
              color: alpha("#fff", 0.5),
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {title}
          </Typography>
          {children.map((child) => (
            <MenuItem
              key={child.to}
              component={NavLink}
              to={child.to}
              onClick={() => {
                setAnchorEl(null);
                onNavigate?.();
              }}
              sx={{
                fontSize: 13,
                gap: 1.25,
                color: alpha("#fff", 0.85),
                "&.active": { color: theme.palette.secondary.main },
              }}
            >
              <child.icon sx={{ fontSize: 17 }} />
              {child.title}
            </MenuItem>
          ))}
        </Menu>
      )}
    </>
  );
}

export default SidebarGroup;
