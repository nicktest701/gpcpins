import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

import PropTypes from 'prop-types';
import { memo } from 'react';

const ItemCard = ({ title, value, icon }) => {
  return (
    <Card
      sx={{
        // border: '1px solid lightgray',
        // borderTop: '2px solid #012e54',
        position: 'relative',
        borderRadius: 2,
      }}
      elevation={1}
    >
      <CardContent>
        <Typography variant='h6' textAlign='center' sx={{ paddingY: 1 }}>
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
        <Typography variant='body2' color='primary'>
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
};

ItemCard.propTypes = {
  title: PropTypes.string,
  value: PropTypes.number,
  icon: PropTypes.node,
};

export default memo(ItemCard);
