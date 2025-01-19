import { useContext } from 'react';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { CheckCircleRounded, ErrorRounded } from '@mui/icons-material';
import { CustomContext } from '../../context/providers/CustomProvider';
import SlideRightTransition from '../SlideRightTransition';
const GlobalAlert = () => {
  const {
    customState: { alertData },
    customDispatch,
  } = useContext(CustomContext);

  const handleClose = () => {
    customDispatch({
      type: 'closeAlert',
    });
  };
  // const borderColor = alertData?.severity === 'error' ? '#B72136' : '#15bee4';
  const color = alertData?.severity === 'error' ? '#B72136' : '#083d77';

  return (
    <Snackbar
      anchorOrigin={{
        horizontal: 'right',
        vertical: 'top',
      }}
      // open={true}
      open={alertData?.open}
      autoHideDuration={5000}
      onClose={handleClose}
      TransitionComponent={SlideRightTransition}
      message={alertData?.message}
    >
      <Alert
        icon={
          alertData?.severity === 'info' ? (
            <CheckCircleRounded color='success' />
          ) : (
            <ErrorRounded color='error' />
          )
        }
        severity={alertData?.severity}
        // onClose={handleClose}
        sx={{
          // width: "100%",
          color: alertData?.severity === 'info' ? 'white' : 'error.main',
          borderBottom: `2px solid ${color}`,
          bgcolor: 'primary.main',
          py: 1,
          borderRadius: 1,
          // boxShadow: "20px 20px 60px #d9d9d9,-20px -20px 60px #ffffff",
        }}
      >
        {alertData?.message}
      </Alert>
    </Snackbar>
  );
};

export default GlobalAlert;
