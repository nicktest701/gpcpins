import { Mail } from '@mui/icons-material';
import {
  Container,
  Paper,
  TextField,
  Typography,
  DialogContent,
} from '@mui/material';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';

import { LoadingButton } from '@mui/lab';
import { useContext, useEffect, useState } from 'react';
import { verifyCode } from '../config/validation';
import { useMutation } from '@tanstack/react-query';
import { loginUser, verifyUserOTP } from '../api/userAPI';
import { AuthContext } from '../context/providers/AuthProvider';
// import OTPInput from '../components/inputs/OTPInput';
import { CustomContext } from '../context/providers/CustomProvider';
import { globalAlertType } from '../components/alert/alertType';

function PaymentOTP({ phonenumber }) {
  const { customDispatch } = useContext(CustomContext);
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(60);
  const { login } = useContext(AuthContext);
  const { state } = useLocation();
  const [err, setErr] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      if (seconds > 0) {
        setSeconds((prev) => prev - 1);
      } else {
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  useEffect(() => {
    if (token.length === 6) {
      handleSubmit();
    }
  }, [token]);

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: verifyUserOTP,
  });

  const handleSubmit = () => {
    if (token.trim() === '') {
      setErr('Required!');
      return;
    }
    if (!verifyCode(token)) {
      setErr('Invalid code! Try again');
      return;
    }

    const email = DOMPurify.sanitize(state.email);
    const tokent = DOMPurify.sanitize(token);

    const data = {
      email,
      token: tokent,
    };

    mutateAsync(data, {
      onSuccess: (data) => {
        login(data?.user);
        navigate(state?.path || '/');
      },
      onError: (error) => {
        setErr(error);
      },
    });
  };

  const { mutateAsync: resendMutateAsync, isLoading: isResendLoading } =
    useMutation({
      mutationFn: loginUser,
    });

  const onResendOTP = () => {
    setErr('');
    resendMutateAsync(
      { email: state?.email },
      {
        onSuccess: () => {
          customDispatch(globalAlertType('info', 'Verification code sent!'));
          setSeconds(60);
        },

        onError: (error) => {
          setErr('An unknown error has occured!');
        },
      }
    );
  };

  if (!state?.email) return <Navigate to='/' />;

  return (
    <DialogContent>
      <Container
        maxWidth='sm'
        sx={{
          height: '90dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <Paper
          elevation={2}
          sx={{
            width: 320,
            height: 420,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            p: 2,
          }}
        >
          <Mail color='primary' sx={{ width: 50, height: 50 }} />
          <Typography textAlign='center' variant='h6'>
            Confirm Mobile Money Number
          </Typography>
          <Typography textAlign='center' variant='body2'>
            A verification token has been sent to <b>{phonenumber}</b>.
          </Typography>
          <TextField
            size='small'
            type='number'
            inputMode='numeric'
            placeholder='Enter 6-digit token'
            value={token}
            onChange={(e) => setToken(e.target.value)}
            error={Boolean(err)}
            helperText={err}
            margin='dense'
            sx={{ textAlign: 'center', width: 200 }}
          />

          <LoadingButton
            size='small'
            variant='contained'
            fullWidth
            disabled={isLoading || isResendLoading}
            loading={isLoading}
            sx={{ width: 200 }}
            onClick={handleSubmit}
          >
            Verify
          </LoadingButton>
          <LoadingButton
            loading={isResendLoading}
            disabled={seconds > 0 || isLoading || isResendLoading}
            onClick={onResendOTP}
            size='small'
          >
            RESEND TOKEN{' '}
            {seconds > 0 && (
              <small
                style={{
                  color: '#FFA48D',
                  paddingLeft: '4px',
                  textTransform: 'lowercase',
                }}
              >
                {' '}
                in {seconds}s
              </small>
            )}
          </LoadingButton>
          <small>Token expires in 15 minutes</small>
        </Paper>
      </Container>
    </DialogContent>
  );
}

export default PaymentOTP;
