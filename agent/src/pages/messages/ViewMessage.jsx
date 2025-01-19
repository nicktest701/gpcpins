import { useContext } from 'react';
import {
  Chip,
  Dialog,
  DialogContent,
  ListItemText,
  Stack,
  Tooltip,
} from '@mui/material';
import Swal from 'sweetalert2';
import moment from 'moment/moment';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LoadingButton } from '@mui/lab';
import { CustomContext } from '../../context/providers/CustomProvider';
import { globalAlertType } from '../../components/alert/alertType';
import {
  deleteBroadcastMessages,
  resendBroadcastMessage,
} from '../../api/broadcastMessageAPI';
import CustomDialogTitle from '../../components/dialogs/CustomDialogTitle';

function ViewMessage() {
  const queryClient = useQueryClient();

  const {
    customState: {
      viewMessage: { open, data },
    },
    customDispatch,
  } = useContext(CustomContext);

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: resendBroadcastMessage,
  });
  const onSend = () => {
    const message = {
      id: data?._id,
      type: data?.type,
      recipient: data?.recipient,
      body: data?.body,
      createdAt: data?.createdAt,
    };

    mutateAsync(message, {
      onSettled: () => {
        queryClient.invalidateQueries(['broadcast-messages']);
      },
      onSuccess: (data) => {
        customDispatch(globalAlertType('info', data));
        handleClose();
      },
      onError: (error) => {
        customDispatch(globalAlertType('error', error));
      },
    });
  };

  const { mutateAsync: deleteMutateAsync, isLoading: dLoading } = useMutation({
    mutationFn: deleteBroadcastMessages,
  });
  const handleDelete = () => {
    Swal.fire({
      title: 'Removing Message',
      text: 'Do you want to remove message?',
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        deleteMutateAsync(data?._id, {
          onSettled: () => {
            queryClient.invalidateQueries(['broadcast-messages']);
          },
          onSuccess: (data) => {
            customDispatch(globalAlertType('info', data));
            handleClose();
          },
          onError: (error) => {
            customDispatch(globalAlertType('error', error));
          },
        });
      }
    });
  };

  const handleClose = () => {
    customDispatch({
      type: 'viewMessage',
      payload: {
        data: {},
        open: false,
      },
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      <CustomDialogTitle title='Message' onClose={handleClose} />

      <DialogContent>
        <Stack
          direction='row'
          justifyContent='flex-end'
          alignItems='flex-end'
          spacing={1}
        >
          <Tooltip title='Delete'>
            <LoadingButton
              size='small'
              color='error'
              loading={dLoading}
              onClick={handleDelete}
            >
              Remove
            </LoadingButton>
          </Tooltip>

          <Tooltip title='Resend'>
            <LoadingButton
              size='small'
              loading={isLoading}
              variant='outlined'
              onClick={onSend}
            >
              Resend
            </LoadingButton>
          </Tooltip>
        </Stack>
        <Chip
          label={data?.active ? 'Delivered' : 'Not Delivered'}
          color={data?.active ? 'success' : 'error'}
          sx={{ color: '#fff' }}
          size='small'
        />
        <Stack>
          <ListItemText
            primary='Date of Issue'
            secondary={moment(new Date(data?.createdAt)).format('Do MMMM YYYY')}
            primaryTypographyProps={{ color: 'primary', fontWeight: 'bold' }}
          />
          <Stack direction='row'>
            <ListItemText
              primary='Type'
              secondary={data?.type}
              primaryTypographyProps={{ color: 'primary', fontWeight: 'bold' }}
            />
            <ListItemText
              primary='Receipient'
              secondary={data?.recipient}
              primaryTypographyProps={{ color: 'primary', fontWeight: 'bold' }}
            />
          </Stack>
          <ListItemText
            primary='Title'
            secondary={data?.title}
            primaryTypographyProps={{ color: 'primary', fontWeight: 'bold' }}
          />

          <ListItemText
            primary='Message'
            secondary={data?.body}
            primaryTypographyProps={{ color: 'primary', fontWeight: 'bold' }}
          />
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

export default ViewMessage;
