import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

function VoucherPlaceHolderItem({ title, value, img }) {
  return (
    <Stack direction='row' justifyContent='space-between'>
      <Typography fontWeight='bold' variant='body2'>
        {title}
      </Typography>
      <Typography variant='body2' sx={{ display: 'flex', gap: 2 }}>
        {img}
        {value}
      </Typography>
    </Stack>
  );
}

export default VoucherPlaceHolderItem;
