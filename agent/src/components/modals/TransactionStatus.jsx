import { Dialog, DialogContent, Stack, CircularProgress } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import CustomDialogTitle from '../dialogs/CustomDialogTitle';
import { useQuery } from '@tanstack/react-query';
import { getTransactionStatus } from '../../api/transactionAPI';

function TransactionStatus() {
  const [searchParams, setSearchParams] = useSearchParams();

  const open = searchParams.get('open');
  const reference = searchParams.get('payment_reference');
  const type = searchParams.get('type');

  const transaction = useQuery({
    queryKey: ['transaction-status', reference],
    queryFn: () => getTransactionStatus(reference, type),
    enabled: !!reference && !!type,
  });

  const handleClose = () => {
    setSearchParams((params) => {
      params.delete('open');
      params.delete('payment_reference');

      return params;
    });
  };

  console.log(transaction.data);

  return (
    <Dialog maxWidth='sm' fullWidth open={Boolean(open)}>
      <CustomDialogTitle title='Transaction Status' onClose={handleClose} />

      <DialogContent sx={{ padding: 2 }}>
        {transaction.isLoading ? (
          <Stack
            width='100%'
            justifyContent='center'
            alignItems='center'
            spacing={2}
          >
            <CircularProgress />
            <p>Please Wait...</p>
          </Stack>
        ) : transaction?.isError ? (
          <Stack width='100%' justifyContent='center' alignItems='center'>
            <p>{transaction.error}</p>
          </Stack>
        ) : (
          <Stack spacing={1}>
            <div>
              <span style={{ fontWeight: 'bold' }}>Message :</span>{' '}
              <span>{transaction?.data?.message}</span>
            </div>
            <div>
              <span style={{ fontWeight: 'bold' }}>Date : </span>{' '}
              <span>{transaction?.data?.data?.date}</span>
            </div>
            <div>
              <span style={{ fontWeight: 'bold' }}>Status : </span>{' '}
              <span>{transaction?.data?.data?.status}</span>
            </div>
            <div>
              <span style={{ fontWeight: 'bold' }}>Payment Method : </span>{' '}
              <span>{transaction?.data?.data?.paymentMethod}</span>
            </div>
            <div>
              <span style={{ fontWeight: 'bold' }}>Client Reference : </span>{' '}
              <span>{transaction?.data?.data?.clientReference}</span>
            </div>
            <div>
              <span style={{ fontWeight: 'bold' }}>Currency Code : </span>{' '}
              <span>{transaction?.data?.data?.currencyCode}</span>
            </div>
            <div>
              <span style={{ fontWeight: 'bold' }}>Amount : </span>{' '}
              <span>{transaction?.data?.data?.amount}</span>
            </div>
            <div>
              <span style={{ fontWeight: 'bold' }}>Charges : </span>{' '}
              <span>{transaction?.data?.data?.charges}</span>
            </div>
            <div>
              <span style={{ fontWeight: 'bold' }}>
                Amount After Charges :{' '}
              </span>{' '}
              <span>{transaction?.data?.data?.amountAfterCharges}</span>
            </div>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default TransactionStatus;
