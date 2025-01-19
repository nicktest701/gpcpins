import { Button, Stack, Typography, useTheme } from '@mui/material';
import { Mail, Phone } from '@mui/icons-material';
import PinDropIcon from '@mui/icons-material/PinDrop';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import Facebook from '../components/jsx-icons/Facebook';
import Whatsapp from '../components/jsx-icons/Whatsapp';
import Twitter from '../components/jsx-icons/Twitter';
import Instagram from '../components/jsx-icons/Instagram';

function ContactInfo() {
  const { palette } = useTheme();
  const cardStyles = {
    backgroundColor: palette.secondary.main,
    color: '#fff',
    borderRadius: 1,
    padding: 2,
    boxShadow: '20px 20px 60px #d9d9d9,-20px -20px 60px #ffffff',
  };
  return (
    <Stack sx={cardStyles} spacing={1}>
      <Typography>
        Fill up the form and our Team will get back to you within 24 hours.
      </Typography>
      <Stack
        width='100%'
        alignItems='flex-start'
        justifyContent='flex-start'
        paddingY={2}
      >
        <Button
          sx={{
            color: '#fff',
          }}
          startIcon={<Phone fontSize='small' />}
        >
          +233543772591
        </Button>
        <Button
          sx={{
            color: '#fff',
          }}
          startIcon={<Mail fontSize='small' />}
        >
          nicktest701@gmail.com
        </Button>
        <Button
          sx={{
            color: '#fff',
          }}
          startIcon={<MyLocationIcon fontSize='small' />}
        >
          AK-23424-422
        </Button>
        <Button
          sx={{
            color: '#fff',
          }}
          startIcon={<PinDropIcon fontSize='small' />}
        >
          +22nd Avenue Street ,Kumasi
        </Button>

        <Stack direction='row' spacing={1} pt={2}>
          <Whatsapp height={24} width={24} />
          <Facebook height={24} width={24} />
          <Twitter height={24} width={24} />
          <Instagram height={24} width={24} />
        </Stack>
      </Stack>
    </Stack>
  );
}

export default ContactInfo;
