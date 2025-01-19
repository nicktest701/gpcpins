import { useContext, useTransition, useState } from 'react';
import Transition from '../../components/Transition';
import {
  Button,
  Dialog,
  DialogContent,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
} from '@mui/material';

import { useQueryClient } from '@tanstack/react-query';
import AnimatedContainer from '../../components/animations/AnimatedContainer';
import { Search } from '@mui/icons-material';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

const StadiumSearchList = ({ open, setOpen }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const [matchesList, setMatchesList] = useState();
  const [value, setValue] = useState('');

  const handleSearch = (value) => {
    startTransition(() => {
      setValue(value);
      if (value.trim() === '') {
        setMatchesList([]);
        return;
      }
      const filteredMatches = queryClient
        .getQueryData(['all-category'])
        ?.filter((match) => {
          const home = match?.details?.home?.toLowerCase();
          const away = match?.details?.away?.toLowerCase();

          return (
            home?.includes(value.toLowerCase()) ||
            (away?.includes(value.toLowerCase()) &&
              match?.category === 'stadium')
          );
        });

      setMatchesList(filteredMatches);
    });
  };

  const handleClose = () => setOpen(false);

  const handleNavigateToMatch = (id) => {
    navigate(`match/${id}`);
    handleClose();
  };

  return (
    <Dialog
      TransitionComponent={Transition}
      open={open}
      maxWidth='md'
      fullWidth
      onClose={handleClose}
      tabIndex={99999}
    >
      {/* <CustomDialogTitle title='' onClose={handleClose} /> */}
      <DialogContent>
        <Stack
          direction='row'
          spacing={2}
          justifyContent='center'
          alignItems='center'
        >
          <input
            type='search'
            value={value}
            onChange={(e) => handleSearch(e.target.value)}
            autoFocus={true}
            className='match-search'
            placeholder='Search match'
          />

          {/* {isPending ? (
            <CircularProgress size='small' />
          ) : ( */}
          <>
            <Button
              variant='contained'
              sx={{ display: { xs: 'none', sm: 'block' } }}
              onClick={handleSearch}
            >
              Search
            </Button>
            <IconButton
              sx={{
                display: { xs: 'flex', sm: 'none' },
                bgcolor: '#80bdff !important',
                color: 'white',
              }}
              onClick={handleSearch}
            >
              <Search sx={{ width: 20, height: 20 }} />
            </IconButton>
          </>
          {/* )} */}
        </Stack>

        {matchesList?.length === 0 && (
          <p
            style={{
              textAlign: 'center',
              paddingBlock: '24px',
            }}
          >
            No Ticket match your search..
          </p>
        )}

        <List>
          {matchesList?.map(({ _id, voucherType, details }) => (
            <ListItemButton
              key={_id}
              onClick={() => handleNavigateToMatch(_id)}
            >
              <ListItemText
                primary={voucherType}
                primaryTypographyProps={{
                  fontSize: 12,
                  fontWeight: 'bold',
                  color: 'primary',
                }}
                secondary={`${moment(new Date(details.date)).format(
                  'dddd,LL'
                )} | ${moment(new Date(details.time)).format('h:mm a')}`}
                secondaryTypographyProps={{ fontSize: 10 }}
              />
            </ListItemButton>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default StadiumSearchList;
