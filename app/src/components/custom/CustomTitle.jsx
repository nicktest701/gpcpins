import {  Stack, Typography } from '@mui/material';


function CustomTitle({ title, subtitle }) {
  return (
    <>
      <Stack
        direction='row'
 
        justifyContent='flex-start'
        alignItems='center'
        py={3}
      >
        {/* {icon} */}
        <Stack>
          <Typography variant='h4' color='primary'>{title}</Typography>
          <Typography  variant='body2' color='secondary'>
            {subtitle}
          </Typography>
        </Stack>
      </Stack>
      {/* <Divider /> */}
    </>
  );
}

export default CustomTitle;
