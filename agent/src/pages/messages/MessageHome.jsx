import { Button, Container, MenuItem } from '@mui/material';

import CustomTitle from '../../components/custom/CustomTitle';
import CustomizedMaterialTable from '../../components/tables/CustomizedMaterialTable';
import Swal from 'sweetalert2';
import { AddRounded, Message, MessageOutlined } from '@mui/icons-material';
import AddMessage from './AddMessage';
import { useContext, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteBroadcastMessages,
  getAllBroadcastMessages,
} from '../../api/broadcastMessageAPI';
import PayLoading from '../../components/PayLoading';
import { BROADCAST_MESSAGES_COLUMNS } from '../../mocks/columns';
import ActionMenu from '../../components/menu/ActionMenu';
import { CustomContext } from '../../context/providers/CustomProvider';
import { globalAlertType } from '../../components/alert/alertType';
import ViewMessage from './ViewMessage';

function MessageHome() {
  const queryClient = useQueryClient();
  const { customDispatch } = useContext(CustomContext);
  const [openMessage, setOpenMessage] = useState(false);

  const messages = useQuery({
    queryKey: ['broadcast-messages'],
    queryFn: () => getAllBroadcastMessages(),
  });

  //Delete Message

  const { mutateAsync } = useMutation({
    mutationFn: deleteBroadcastMessages,
  });
  const handleRemoveMessage = (id) => {
    Swal.fire({
      title: 'Removing',
      text: 'Do you want to remove message?',
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        mutateAsync(id, {
          onSettled: () => {
            queryClient.invalidateQueries(['broadcast-messages']);
          },
          onSuccess: (data) => {
            customDispatch(globalAlertType('info', data));
          },
          onError: (error) => {
            customDispatch(globalAlertType('error', error));
          },
        });
      }
    });
  };

  const handleViewMessage = (data) => {
    customDispatch({
      type: 'viewMessage',
      payload: {
        open: true,
        data,
      },
    });
  };

  const columns = [
    ...BROADCAST_MESSAGES_COLUMNS,
    {
      field: '',
      title: 'Action',
      export: false,
      width: 40,
      render: (rowData) => (
        <ActionMenu>
          <MenuItem onClick={() => handleViewMessage(rowData)}>
            View Message
          </MenuItem>
          <MenuItem onClick={() => handleRemoveMessage(rowData?._id)}>
            Delete
          </MenuItem>
        </ActionMenu>
      ),
    },
  ];

  if (messages.isLoading) {
    return <PayLoading />;
  }

  return (
    <Container sx={{ py: 2 }}>
      <CustomTitle
        title='Messages'
        subtitle='Broadcast messages to employees & customers via email amd sms'
        icon={<Message sx={{ width: 50, height: 50 }} color='primary' />}
      />

      <CustomizedMaterialTable
        title='Broadcast Messages'
        columns={columns}
        data={messages?.data}
        emptyMessage='No Messages available'
        icon={
          <MessageOutlined sx={{ width: 40, height: 40 }} color='primary' />
        }
        addButton={
          <Button
            sx={{ marginTop: '4px' }}
            variant='outlined'
            onClick={() => setOpenMessage(true)}
          >
            New Message
          </Button>
        }
        autocompleteComponent={
          <Button
            variant='contained'
            startIcon={<AddRounded />}
            onClick={() => setOpenMessage(true)}
          >
            New Message
          </Button>
        }
      />

      <AddMessage open={openMessage} setOpen={setOpenMessage} />
      <ViewMessage />
    </Container>
  );
}

export default MessageHome;
