import { useState, useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const ITEM_HEIGHT = 48;

// Styled object extracted outside to prevent re-creation on every render
const MENU_PAPER_PROPS = {
  style: {
    maxHeight: ITEM_HEIGHT * 4.5,
    backgroundColor: '#333',
    color: '#fff',
    fontSize: '14px', // Fixed: Remove invalid !important from inline styles
  },
};

export default function ActionMenu({ children }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    if (!open) return;

    // Fixed: Changed from mixed setTimeout/clearInterval to proper clearTimeout
    const timer = setTimeout(() => {
      handleClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [open]);

  return (
    <div>
      <IconButton
        aria-label="more"
        id="action-button"
        aria-controls={open ? 'action-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="action-menu"
        MenuListProps={{
          'aria-labelledby': 'action-button',
        }}
        elevation={2}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={MENU_PAPER_PROPS}
      >
        {children}
      </Menu>
    </div>
  );
}
