import { Backdrop } from '@mui/material';

function PayLoading() {
  return (
    <Backdrop
      open={true}
      sx={{ width: '100%', height: '100svh', bgcolor: '#fff', zIndex: 99 }}
    >
      <div className='spinner'></div>
    </Backdrop>
  );
}

export default PayLoading;
