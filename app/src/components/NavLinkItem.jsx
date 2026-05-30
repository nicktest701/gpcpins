import { ListItemButton, ListItemIcon, ListItemText, useTheme, alpha } from "@mui/material";
import { NavLink } from "react-router-dom";

function NavLinkItem({ to, title, icon, end = true }) {
  const theme = useTheme();

  return (
    <ListItemButton
      component={NavLink}
      to={`${to}?_pid=1`}
      end={end}
      sx={{
        borderRadius: 2,
        px: 1.5,
        py:0.5,
        transition: theme.transitions.create(['background-color', 'border-color', 'color'], {
          duration: theme.transitions.duration.short,
        }),
        '&.active': {
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          borderLeft: `4px solid ${theme.palette.primary.main}`,
          pl: '12px', // compensate for border width (16px - 4px)
          '& .MuiListItemIcon-root': {
            color: theme.palette.primary.main,
          },
          '& .MuiListItemText-primary': {
            color: theme.palette.primary.main,
            fontWeight: 600,
          },
        },
        '&:hover:not(.active)': {
          bgcolor: alpha(theme.palette.grey[500], 0.08),
        },
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: 36,
          color: theme.palette.text.secondary,
          transition: theme.transitions.create('transform'),
          '&:hover': {
            transform: 'scale(1.1)',
          },
        }}
      >
        {icon}
      </ListItemIcon>
      <ListItemText
        primary={title}
        primaryTypographyProps={{
          // variant: 'body2',
          fontSize:13,
          // fontWeight: 500,
          sx: {
            transition: theme.transitions.create('color'),
          },
        }}
      />
    </ListItemButton>
  );
}

export default NavLinkItem;