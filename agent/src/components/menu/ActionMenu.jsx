import { useEffect, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const ITEM_HEIGHT = 48;

export default function ActionMenu({ children, icon }) {
  //
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  //
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    const interval = setTimeout(() => {
      if (open) {
        handleClose();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [open]);

  return (
    <div>
      <IconButton
        aria-label='more'
        id='action-button'
        aria-controls={open ? 'action-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup='true'
        onClick={handleClick}
      >
        {icon || <MoreVertIcon />}
      </IconButton>
      <Menu
        id='action-menu'
        MenuListProps={{
          'aria-labelledby': 'action-button',
        }}
        elevation={2}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: ITEM_HEIGHT * 4.5,
            backgroundColor: '#333',
            color: '#fff',
            fontSize: '14px !important',
          },
        }}
      >
        {children}
      </Menu>
    </div>
  );
}
