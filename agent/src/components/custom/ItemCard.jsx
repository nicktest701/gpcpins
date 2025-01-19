import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

import PropTypes from 'prop-types';


const ItemCard = ({ title, value, icon, bg }) => {
  return (
    <Card
      sx={{
        border: '1px solid whitesmoke',
        position: 'relative',
        borderRadius: 1,
        width: '100%',
        bgcolor: bg || 'lightgray',
        // bgcolor: bg || `rgba(24, 144, 255,.3)`,
      }}
      elevation={1}
    >
      <CardContent>
        <Typography variant='h5' textAlign='center' sx={{ paddingY: 1 }}>
          {value}
        </Typography>
        <div
          style={{
            position: 'absolute',
            right: 10,
            bottom: 5,
          }}
        >
          {icon}
        </div>
        <Typography variant='body1' color='primary'>
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
};

ItemCard.propTypes = {
  title: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  icon: PropTypes.node,
};

export default ItemCard;
