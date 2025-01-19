import { Box, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

function AvailableCinemaTicketItem({ _id, details }) {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(`movie/${_id}`);
  };

  return (
    <Box
      sx={{
        width: { md: 250 },
        border: '1px solid #ccc',
        borderRadius: 1,
        overflow: 'hidden',
        transition: 'all 150ms ease-in-out',
        cursor: 'pointer',
        '&:hover': {
          transform: 'scale(1.05)',
          translate: '(10px,20px)',
        },
      }}
      onClick={handleNavigate}
    >
      <img
        loading='lazy'
        alt='album'
        src={details?.cinema}
        style={{
          width: '100%',
          height: '150px',
          objectFit: 'cover',
          objectPosition: 'center',
        }}
      />
      <Stack spacing={1} padding={2}>
        <Typography variant='h6' color='secondary.main'>
          {details?.movie}
        </Typography>
        <Typography
          variant='caption'
          color='gray'
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {details?.description}
        </Typography>

        <Typography variant='caption' color='warning.main'>
          {details?.theatre} |{' '}
          <Typography
            sx={{
              fontWeight: 'bold',
              color: 'secondary.main',
            }}
          >
            {details?.location}
          </Typography>
        </Typography>
        <Typography variant='body2' color='secondary.main' flexWrap='nowrap'>
          {moment(new Date(details?.date)).format('LL')}-
          {moment(new Date(details?.time)).format('hh:mm a')}
        </Typography>
        {/* <Typography
          width='fit-content'
          p='4px'
          borderRadius={1}
          color='info.dark'
          bgcolor='info.light'
          variant='body2'
        >
          {currencyFormatter(details?.pricing[0]?.price)}
        </Typography> */}
        {/* <Typography
          width='fit-content'
          p='4px'
          borderRadius={1}
          color='info.dark'
          bgcolor='info.light'
          variant='body2'
        >
          {currencyFormatter(details?.pricing?.reverse()[0]?.price)}
        </Typography> */}
      </Stack>
    </Box>
  );
}

export default AvailableCinemaTicketItem;
