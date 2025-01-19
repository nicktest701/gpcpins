import { Stack, Typography } from '@mui/material';

const CheckOutItem = ({ title, titleColor, value, color }) => {
  return (
    <Stack direction='row' spacing={2}>
      <Typography
        variant='body2'
        fontWeight='700'
        color={titleColor || color || 'secondary'}
        textAlign='left'
        sx={{ flex: 0.4 }}
      >
        {title}
      </Typography>
      <Typography
        variant='body2'
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
