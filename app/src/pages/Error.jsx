import { Button, Container, Typography } from '@mui/material';

function Error({ error, resetErrorBoundary }) {
  return (
    <Container
      sx={{
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Typography variant='h2' textAlign='center'>
        oOps!!
      </Typography>
      <Typography variant='h6' textAlign='center'>
        Something went wrong.
      </Typography>
      {/* <Typography variant='caption' textAlign='center'>
        `{typeof error === 'object' ? error?.message : error}
      </Typography> */}
      <Typography variant='caption' textAlign='center'>
        Try checking your internet connection or try reloading the app.
      </Typography>
      <Button variant='contained' color='secondary' onClick={() => resetErrorBoundary()}>
        Try Again
      </Button>
    </Container>
  );
}

export default Error;
