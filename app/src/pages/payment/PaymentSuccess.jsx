import success from '../../assets/images/success.png';
import { Avatar, Box, Paper, Typography } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

function PaymentSuccess() {
  const { state } = useLocation();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateRows: '1fr auto',
      }}
    >
      <Paper
        elevation={2}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          rowGap: 1,
          textAlign: 'center',
          minWidth: 300,
          height: 300,
          mx: 'auto',
          placeSelf: 'center',
          p: 2,
        }}
      >
        <Avatar
          src={success}
          sx={{
            width: 60,
            height: 60,
          }}
        />
        <Typography variant='h6'>Success!</Typography>
        <Typography variant='h6' color='primary.main'>
          Your request has been processed successfully.
        </Typography>
        <Typography variant='caption'>
          You will be notify shortly after your transaction is completed.
        </Typography>
        <Typography variant='caption'>Thank You!</Typography>
        <Link to={state?.path || '/'}>Go Home</Link>
      </Paper>
      <Box sx={{ display: 'grid', placeItems: 'center', paddingY: 2 }}>
        <Typography variant='body2'>
          Copyright &copy; {new Date().getFullYear()} | Gab Powerful Consult
        </Typography>
      </Box>
    </div>
  );
}

export default PaymentSuccess;
