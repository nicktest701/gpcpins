import { useContext, useEffect, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { CustomContext } from '../../context/providers/CustomProvider';

const ITEM_HEIGHT = 48;

export default function EmployeeMenu({ rowData }) {
  const { customDispatch } = useContext(CustomContext);

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

  //VIEW Employee Details
  const handleViewEmployee = () => {
    handleClose();
    customDispatch({
      type: 'viewEmployee',
      payload: { open: true, data: rowData },
    });
  };

  return (
    <div>
      <IconButton
        aria-label='more'
        id='employee-button'
        aria-controls={open ? 'employee-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup='true'
        onClick={handleClick}
      >
        <MoreVertIcon color='primary' />
      </IconButton>
      <Menu
        id='employee-menu'
        MenuListProps={{
          'aria-labelledby': 'employee-button',
        }}
        elevation={0}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: ITEM_HEIGHT * 4.5,
            // width: '20ch',
            background: 'linear-gradient(145deg, #e6e6e6, #ffffff)',
            boxShadow: '10px 10px 60px #d9d9d9,-20px -20px 60px #ffffff',
            borderRadius: 2,
          },
        }}
      >
        <MenuItem onClick={handleViewEmployee}>View Account </MenuItem>
      </Menu>
    </div>
  );
}
