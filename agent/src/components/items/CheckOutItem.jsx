import { Stack, Typography } from '@mui/material';

const CheckOutItem = ({ title, titleColor, value, color }) => {
  return (
    <Stack direction='row'>
      <Typography
        variant='caption'
        color={titleColor || color || 'text.secondary'}
        textAlign='left'
        sx={{ flex: 0.4 }}
      >
        {title}
      </Typography>
      <Typography
        variant='caption'
        textAlign='right'
        color={color || 'text.primary'}
        sx={{ flex: 0.6 }}
        flexWrap='wrap'
      >
        {value}
      </Typography>
    </Stack>
  );
};

export default CheckOutItem;
