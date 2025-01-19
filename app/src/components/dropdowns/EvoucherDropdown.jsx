import { Box, Stack, useTheme } from '@mui/material';
import { NavLink } from 'react-router-dom';

const EvoucherDropdown = ({ display }) => {
  const {palette}=useTheme()
  const styles = ({ isActive }) => {
    return {
      color: isActive ? palette.secondary.main : '#333',
      fontWeight: isActive ? '700' : 'normal',
      fontSize:13
    };
  };

  return (
    <Box
      sx={{
        display: 'block',
        position: 'absolute',
        visibility: display ? 'visible' : 'collapse',
        width: 300,
        bgcolor: '#fff',
        top: 40,
        // '20px 20px 60px hsl(207, 97%, 98%),-20px 20px 60px hsl(207, 97%, 98%)',
        boxShadow: '3px 3px 1px hsl(207, 97%, 98%)',
        transform: `translateY(${display ? 0 : 10}px)`,
        transition: 'all 150ms ease-in-out',
        opacity: display ? 1 : 0,
      }}
    >
      <Stack justifyContent='flex-start' alignItems='flex-start' padding={0}>
        <NavLink
          style={styles}
          to='/evoucher/waec-checker'
          className='dropdown-item'
        >
           WAEC & School Placement Checkers
        </NavLink>
        <NavLink
          style={styles}
          to='/evoucher/university-form'
          className='dropdown-item'
        >
           University & Polytechnic Forms
        </NavLink>
        <NavLink
          style={styles}
          to='/evoucher/security-service'
          className='dropdown-item'
        >
           Security Service Forms
        </NavLink>
        <NavLink
          style={styles}
          to='/evoucher/cinema-ticket'
          className='dropdown-item'
        >
           Cinema & Event Tickets
        </NavLink>
        <NavLink
          style={styles}
          to='/evoucher/bus-ticket'
          className='dropdown-item'
        >
           Bus Tickets
        </NavLink>
        <NavLink
          style={styles}
          to='/evoucher/stadia-ticket'
          className='dropdown-item'
        >
           Stadium Tickets
        </NavLink>
      </Stack>
    </Box>
  );
};

export default EvoucherDropdown;
