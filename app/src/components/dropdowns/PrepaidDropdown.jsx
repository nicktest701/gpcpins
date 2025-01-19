import { Box, Stack, useTheme } from '@mui/material';
import { NavLink } from 'react-router-dom';

import { useContext } from 'react';
import { AuthContext } from '../../context/providers/AuthProvider';


const PrepaidDropdown = ({ display }) => {
  const {palette}=useTheme()
  const { user } = useContext(AuthContext);

  const styles = ({ isActive }) => {
    return {
      color: isActive ? palette.secondary.main: '#333',
      fontWeight: isActive ? '700' : 'normal',
      // color: isActive ? '#fff' : '#333',
      fontSize: 13,
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
        top: 41,
        boxShadow: '3px 3px 1px hsl(207, 97%, 98%)',
        transform: `translateY(${display ? 0 : 10}px)`,
        transition: 'all 150ms ease-in-out',
        opacity: display ? 1 : 0,
      }}
    >
      <Stack justifyContent='flex-start' alignItems='flex-start' padding={0}>
        <NavLink style={styles} to='/electricity/' className='dropdown-item'>
          - Buy
        </NavLink>
        {user?.id && (
          <NavLink
            style={styles}
            to='/electricity/meters'
            className='dropdown-item'
          >
            - Meters
          </NavLink>
        )}
      </Stack>
    </Box>
  );
};

export default PrepaidDropdown;
