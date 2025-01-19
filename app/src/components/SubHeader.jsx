import { ArrowBackRounded } from '@mui/icons-material';
import { IconButton, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
function SubHeader({ title, to }) {
  return (
    <>
      <Stack
        direction='row'
        padding={2}
        // display='flex'
        // alignItems='center'
        // paddingLeft={4}
        // margin='auto'
        // maxWidth='1000px'
      >
        {/* <Link to={to}> */}
        <Link to='/'>
          <IconButton sx={{ marginRight: 2 }}>
            <ArrowBackRounded />
          </IconButton>
        </Link>
        <Typography variant='h6'>{title}</Typography>
      </Stack>
      {/* <Divider flexItem /> */}
    </>
  );
}

export default SubHeader;
