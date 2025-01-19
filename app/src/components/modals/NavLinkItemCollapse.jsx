import React from 'react';
import {
  ListItemButton,
  ListItemIcon,
  Collapse,
  List,
  ListItemText,
  useTheme,
} from '@mui/material';

import { ExpandLess, ExpandMore } from '@mui/icons-material';

function NavLinkItemCollapse({ title, children, icon }) {
  const {
    typography: { button },
  } = useTheme();

  const [open, setOpen] = React.useState(false);

  const handleCollapse = () => {
    setOpen(!open);
  };

  return (
    <>
      <ListItemButton onClick={handleCollapse} sx={{ marginLeft: '-8px' }}>
        <ListItemIcon>{icon}</ListItemIcon>
        <ListItemText
          secondary={title}
          secondaryTypographyProps={{
            color: '#333',
            fontFamily: button.fontFamily,
            fontSize: button.fontSize,
          }}
        />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} timeout='auto' unmountOnExit>
        <List disablePadding sx={{ paddingLeft: 6 }}>
          {children}
        </List>
      </Collapse>
    </>
  );
}

export default NavLinkItemCollapse;
