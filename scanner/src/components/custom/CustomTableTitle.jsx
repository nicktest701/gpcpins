
import { ListItemText, Stack } from '@mui/material';
import PropTypes from 'prop-types';
function CustomTableTitle({ icon, title, subtitle }) {
  return (
    <Stack
      direction='row'
      columnGap={2}
      justifyContent='center'
      alignItems='center'
    >
      <img
      loading='lazy'
        alt='ico'
        src={icon}
        style={{ width: '45px', heigth: '45px' }}
        className='hide-on-print'
      />
      <ListItemText
        primary={title}
        primaryTypographyProps={{
          fontSize: 20,
          fontWeight: 'bold',
        }}
        secondary={subtitle}
        className='hide-on-print'
      />
    </Stack>
  );
}

CustomTableTitle.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.string,
  subtitle: PropTypes.string,
};
export default CustomTableTitle;
