import React from "react";
import {
  ListItemButton,
  ListItemIcon,
  Collapse,
  List,
  ListItemText,
  useTheme,
} from "@mui/material";

import { ExpandLess, ExpandMore } from "@mui/icons-material";

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
      <ListItemButton
        onClick={handleCollapse}
        sx={{ marginLeft: "-8px" }}
        title={title}
      >
        <ListItemIcon>{icon}</ListItemIcon>
        <ListItemText
          secondary={title}
          secondaryTypographyProps={{
            color: "#fff",
            fontFamily: button.fontFamily,
            fontSize: 12,
          }}
        />
        {open ? (
          <ExpandLess color="secondary" />
        ) : (
          <ExpandMore color="secondary" />
        )}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List disablePadding sx={{ paddingLeft: 2 }}>
          {children}
        </List>
      </Collapse>
    </>
  );
}

export default NavLinkItemCollapse;
