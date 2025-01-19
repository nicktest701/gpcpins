import React from 'react';
import {
  Avatar,
  Button,
  ListItemButton,
  Stack,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
function StadiumTicketItem({ _id, details }) {
  const navigate = useNavigate();

  const handleNavigateToMatch = () => {
    navigate(`match/${_id}?home=${details?.home}&away=${details?.away}`, {
      state: {
        details: {
          _id,
          ...details,
        },
      },
    });
  };
  return (
    <ListItemButton
      divider
      onClick={handleNavigateToMatch}
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Stack justifyContent='center' spacing={1}>
        <Typography variant='caption'>{details.matchType}</Typography>
        <Stack
          direction='row'
          padding={1}
          justifyContent='center'
          alignItems='center'
          spacing={3}
        >
          <Typography variant='caption'>{details?.home}</Typography>
          <Avatar variant='square' src={details.homeImage} />
          <Typography>Vs</Typography>
          <Avatar variant='square' src={details.awayImage} />
          <Typography variant='caption'>{details?.away}</Typography>
        </Stack>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1}
          alignItems={{ xs: 'center', md: 'flex-start' }}
        >
          <Typography variant='body2' color='primary' fontWeight='bold'>
            {details?.venue}
          </Typography>
          <Typography
            variant='body2'
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            {moment(new Date(details?.date)).format('dddd,LL')}
          </Typography>
          <Typography
            variant='body2'
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            {moment(new Date(details?.time)).format('hh:mm a')}
          </Typography>
          <Typography
            variant='body2'
            sx={{ display: { xs: 'block', sm: 'none' } }}
          >
            {moment(new Date(details.date)).format('dddd,LL')} |{' '}
            {moment(new Date(details.time)).format('h:mm a')}
          </Typography>
        </Stack>
      </Stack>

      <Button
        variant='outlined'
        size='small'
        sx={{ display: { xs: 'none', sm: 'block' }, borderRadius: 1 }}
        onClick={handleNavigateToMatch}
      >
        Get Ticket
      </Button>
    </ListItemButton>
  );
}

export default StadiumTicketItem;
