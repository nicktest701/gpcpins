import { useTheme, Stack, Typography } from '@mui/material';
import { NavLink } from 'react-router-dom';

function NavLinkItem({ to, title, icon }) {
  const {
    palette,
    typography: { button },
  } = useTheme();

  const linkStyle = ({ isActive }) => {
    return {
      fontFamily: button.fontFamily,
      fontSize: button.fontSize,
      position: 'relative',
      textDecoration: 'none',
      borderBottom: isActive ? `solid 2px ${palette.primary.main} ` : null,
      color: isActive ? palette.primary.main : '#333',
      fontWeight: isActive ? 'bolder' : 'normal',
    };
  };

  return (
    <NavLink to={`${to}?_pid=1`} style={linkStyle} end>
      <Stack
        direction='row'
        columnGap={3}
        sx={{
          padding: 1,
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: palette.grey[300],
          },
        }}
      >
        {icon}
        <Typography variant='button'>{title}</Typography>
      </Stack>
    </NavLink>
  );
}

export default NavLinkItem;
