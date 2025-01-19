import { useContext } from 'react';
import { CustomContext } from '../../context/providers/CustomProvider';
import {
  Avatar,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import Swal from 'sweetalert2';
import moment from 'moment';
import {
  deleteNotifications,
  getAllNotifications,
  updateNotification,
} from '../../api/notificationAPI';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Delete, NotificationsRounded, Star } from '@mui/icons-material';
import { globalAlertType } from '../../components/alert/alertType';

function ViewECGTransactionNotifications() {
  const queryClient = useQueryClient();
  const {
    customState: {
      ecgNotifications: { open },
    },
    customDispatch,
  } = useContext(CustomContext);

  const notifications = useQuery({
    queryKey: ['notifications'],
    initialData: queryClient.getQueryData(['notifications']),
    queryFn: () => getAllNotifications(),
  });

  const handleUnreadNotifications = async (id) => {
    await updateNotification(id);
    queryClient.invalidateQueries(['notifications']);
  };

  //Delete all notifications
  const { mutateAsync: deleteAllMutateAsync } = useMutation({
    mutationFn: deleteNotifications,
  });

  const handleDeleteNotifications = (id, all) => {
    Swal.fire({
      title: 'Removing notification',
      text: `Do you want to remove ${all ? 'all' : ''} notification?`,
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        deleteAllMutateAsync(
          { id, all },
          {
            onSettled: () => {
              queryClient.invalidateQueries(['notifications']);
            },
            onSuccess: (data) => {
              customDispatch(globalAlertType('info', data));
            },
            onError: (error) => {
              customDispatch(globalAlertType('error', error));
            },
          }
        );
      }
    });
  };

  const handleClose = () => {
    customDispatch({
      type: 'ecgNotifications',
      payload: {
        open: false,
        messages: [],
      },
    });
  };

  return (
    <Dialog open={open} maxWidth='md' fullWidth>
      <DialogActions>
        <Stack width='100%' p={2}>
          <Typography variant='h6' paragraph>
            Notifications
          </Typography>
          <Button
            endIcon={<Delete />}
            color='error'
            sx={{ alignSelf: 'flex-end' }}
            onClick={() => handleDeleteNotifications('', true)}
            disabled={notifications?.data?.length === 0}
          >
            Remove all
          </Button>
        </Stack>
      </DialogActions>
      <DialogContent>
        <List>
          {notifications?.data?.length > 0 ? (
            notifications?.data?.map(({ _id, message, active, createdAt }) => {
              return (
                <ListItem
                  key={_id}
                  sx={{
                    bgcolor: active ? 'info.lighter' : 'transparent',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'lightgray',
                    },
                  }}
                  divider
                >
                  <ListItemAvatar>
                    <Avatar
                      color='#fff'
                      sx={{
                        bgcolor: 'info.main',
                        height: 30,
                        width: 30,
                      }}
                    >
                      P
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    onClick={() => handleUnreadNotifications(_id)}
                    primary={message}
                    primaryTypographyProps={{ fontSize: 12 }}
                    secondary={moment(createdAt).format('LLL')}
                    secondaryTypographyProps={{
                      color: 'primary',
                    }}
                  />

                  <ListItemSecondaryAction>
                    <Stack spacing={2}>
                      <IconButton
                        onClick={() => handleDeleteNotifications(_id)}
                      >
                        <Delete />
                      </IconButton>
                      {active ? (
                        // <Chip size='small' label='new' color='error' />
                        <Star fontSize='12' sx={{ color: 'error.light' }} />
                      ) : null}
                    </Stack>
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })
          ) : (
            <Stack justifyContent='center' alignItems='center'>
              <NotificationsRounded />
              <Typography textAlign='center'>
                No Notifications Available
              </Typography>
            </Stack>
          )}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default ViewECGTransactionNotifications;
