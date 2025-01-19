import { useContext } from 'react';
import CustomTitle from '../../components/custom/CustomTitle';
import { Container, MenuItem } from '@mui/material';
import { NoteAlt } from '@mui/icons-material';
import CustomizedMaterialTable from '../../components/tables/CustomizedMaterialTable';
import { AuthContext } from '../../context/providers/AuthProvider';
import Swal from 'sweetalert2';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getTransactionByEmail,
  removeAnyTransaction,
} from '../../api/transactionAPI';
import { transactionsColumns } from '../../mocks/columns';
import ActionMenu from '../../components/menu/ActionMenu';
import { globalAlertType } from '../../components/alert/alertType';
import { CustomContext } from '../../context/providers/CustomProvider';

const Transaction = () => {
  const queryClient = useQueryClient();
  const { customDispatch } = useContext(CustomContext);
  const { user } = useContext(AuthContext);

  //Get all transactions by meter id
  const transactions = useQuery({
    queryKey: ['prepaid-transaction-email', user?.email, user?.phonenumber],
    queryFn: () => getTransactionByEmail(user?.email, user?.phonenumber),
    // enabled: !!user?.email && !!user?.phonenumber,
  });

  // console.log(transactions.data)

  const handleDownload = async (id, downloadLink) => {
    const link = document.createElement('a');
    link.href = downloadLink;
    link.target = '_blank';
    link.download = `${id}.pdf`; // You can set the desired file name here
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const { isLoading, mutateAsync } = useMutation({
    mutationFn: removeAnyTransaction,
  });

  const removeTransaction = (id) => {
    Swal.fire({
      title: 'Removing',
      text: 'Do you want to remove transaction?',
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        mutateAsync([id], {
          onSettled: () => {
            queryClient.invalidateQueries({
              queryKey: [
                'prepaid-transaction-email',
                user?.email,
                user?.phonenumber,
              ],
            });
          },
          onSuccess: () => {
            customDispatch(globalAlertType('info', 'Transaction Removed!'));
          },
          onError: () => {
            customDispatch(
              globalAlertType(
                'error',
                'Failed to remove transaction! An error has occurred!'
              )
            );
          },
        });
      }
    });
  };

  const modifiedColumns = [
    ...transactionsColumns,
    {
      field: '',
      title: 'Action',
      export: false,
      render: (data) => {
        return (
          <ActionMenu>
            {data?.status === 'completed' && (
              <MenuItem
                sx={{ fontSize: 13 }}
                onClick={() => handleDownload(data?._id, data?.downloadLink)}
              >
                Download
              </MenuItem>
            )}
            <MenuItem
              sx={{ fontSize: 13 }}
              onClick={() => removeTransaction(data?._id)}
            >
              Remove
            </MenuItem>
          </ActionMenu>
        );
      },
    },
  ];

  return (
    <Container sx={{ py: 2 }}>
      <CustomTitle
        icon={<NoteAlt sx={{ width: 50, height: 50 }} color='primary' />}
        title='Transactions'
        subtitle='Manage all your transactions made.'
      />
      <CustomizedMaterialTable
        isLoading={transactions.isLoading || isLoading}
        title='Transactions'
        search={true}
        columns={modifiedColumns}
        data={transactions.data}
        showExportButton={true}
        emptyMessage='No Transaction available'
        icon={<NoteAlt sx={{ width: 40, height: 40 }} color='primary' />}
        onRefresh={transactions.refetch}
      />
    </Container>
  );
};

export default Transaction;
