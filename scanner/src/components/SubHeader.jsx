import { Stack, Typography } from '@mui/material';

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

        <Typography variant='h6'>{title}</Typography>
      </Stack>
      {/* <Divider flexItem /> */}
    </>
  );
}

export default SubHeader;
