import { useState } from "react";
import {
  Collapse,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  List,
  useTheme,
  alpha,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";

function NavLinkItemCollapse({ icon, title, children }) {
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  const handleClick = () => setOpen(!open);

  return (
    <>
      <ListItemButton
        onClick={handleClick}
        sx={{
          borderRadius: 2,
          px: 1.5,
          transition: theme.transitions.create('background-color'),
          '&:hover': {
            bgcolor: alpha(theme.palette.grey[500], 0.08),
          },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 40,
            color: theme.palette.text.secondary,
            transition: theme.transitions.create('transform'),
            '&:hover': { transform: 'scale(1.1)' },
          }}
        >
          {icon}
        </ListItemIcon>
        <ListItemText
          primary={title}
          primaryTypographyProps={{
              fontSize:13,
            // fontWeight: 500,
          }}
        />
        {open ? (
          <ExpandLess
            sx={{
              color: theme.palette.text.secondary,
              transition: theme.transitions.create('transform'),
              transform: open ? 'rotate(0deg)' : 'rotate(180deg)',
            }}
          />
        ) : (
          <ExpandMore
            sx={{
              color: theme.palette.text.secondary,
              transition: theme.transitions.create('transform'),
            }}
          />
        )}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding sx={{ pl: 2 }}>
          {children}
        </List>
      </Collapse>
    </>
  );
}

export default NavLinkItemCollapse;