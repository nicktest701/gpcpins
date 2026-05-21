// import React from 'react';
// import {
//   ListItemButton,
//   ListItemIcon,
//   Collapse,
//   List,
//   ListItemText,
//   useTheme,
// } from '@mui/material';

// import { ExpandLess, ExpandMore } from '@mui/icons-material';

// function NavLinkItemCollapse({ title, children, icon }) {
//   const {
//     typography: { button },
//   } = useTheme();

//   const [open, setOpen] = React.useState(false);

//   const handleCollapse = () => {
//     setOpen(!open);
//   };

//   return (
//     <>
//       <ListItemButton onClick={handleCollapse} sx={{ marginLeft: '-8px' }}>
//         <ListItemIcon>{icon}</ListItemIcon>
//         <ListItemText
//           secondary={title}
//           secondaryTypographyProps={{
//             color: '#333',
//             fontFamily: button.fontFamily,
//             fontSize: button.fontSize,
//           }}
//         />
//         {open ? <ExpandLess /> : <ExpandMore />}
//       </ListItemButton>
//       <Collapse in={open} timeout='auto' unmountOnExit>
//         <List disablePadding sx={{ paddingLeft: 6 }}>
//           {children}
//         </List>
//       </Collapse>
//     </>
//   );
// }

// export default NavLinkItemCollapse;




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
          my: 0.5,
          px: 1.5,
          py: 1,
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
            variant: 'body2',
            fontWeight: 500,
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
        <List component="div" disablePadding sx={{ pl: 3 }}>
          {children}
        </List>
      </Collapse>
    </>
  );
}

export default NavLinkItemCollapse;