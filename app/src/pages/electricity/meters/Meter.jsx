import { Stack, Typography } from '@mui/material';
import { IMAGES } from '../../../constants';

function Meter({ title, color, type, onClick }) {
  return (
    <Stack
      sx={{
        position: 'relative',
        width: { xs: 200, md: 250 },
        height: { xs: 120, md: 150 },
        // bgcolor: color || 'secondary.main',
        // background: `linear-gradient(145deg,${color},#083d77)`,

        background: `linear-gradient(to top right,rgba(3, 21, 35,0.95),rgba(3, 21, 35,0.95)),url(${IMAGES.earth})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        boxShadow: '20px 20px 60px #d9d9d9,-20px -20px 60px #ffffff',
        borderRadius: 2,
        padding: 2,
        color: 'secondary.contrastText',
        transition: 'all 250ms ease-in-out',
        cursor: 'pointer',
        '&:hover': {
          bgcolor: 'primary.main',
          transform: 'scale(1.1)',
        },
      }}
      onClick={() => onClick(type)}
    >
      <Typography variant='caption' paragraph>
        {title}
      </Typography>

      <div
        style={{
          alignSelf: 'flex-start',
        }}
      >
        <img
          src={IMAGES.ecg}
          width={28}
          height={28}
          style={{
            borderRadius: '50%',
          }}
        />
      </div>
      <div
        style={{
          alignSelf: 'flex-end',
        }}
      >
        <img
          src={IMAGES.chip}
          style={{
            width: '30px',
            height: '30px',
          }}
        />
      </div>
    </Stack>
  );
}

export default Meter;
