import {
  Avatar,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { useContext, useRef } from 'react';
import Transition from '../../../components/Transition';
import moment from 'moment';
import { CustomContext } from '../../../context/providers/CustomProvider';
import { currencyFormatter } from '../../../constants';
import ecg_logo from '../../../assets/images/ecg.jpg';
import CheckOutItem from '../../../components/items/CheckOutItem';
import CustomDialogTitle from '../../../components/dialogs/CustomDialogTitle';

const PaymentReceipt = () => {
  const componentRef = useRef();
  const {
    customState: { ecgTransactionInfo },
    customDispatch,
  } = useContext(CustomContext);

  const handleClose = () => {
    customDispatch({
      type: 'viewEcgTransactionInfo',
      payload: {
        open: false,
        details: {},
      },
    });
  };

  const handleDownloadReceipt = () => {
    const link = document.createElement('a');
    link.href = ecgTransactionInfo?.details?.info?.downloadLink;
    link.target = '_blank';
    link.download = `${ecgTransactionInfo?.details?._id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog
      open={ecgTransactionInfo.open}
      onClose={handleClose}
      maxWidth='xs'
      fullWidth
      TransitionComponent={Transition}
    >
      <CustomDialogTitle title='Transaction Details' onClose={handleClose} />
      <DialogContent ref={componentRef}>
        <Stack rowGap={1} paddingY={1}>
          <Avatar
            srcSet={ecg_logo}
            style={{
              width: 40,
              height: 40,
            }}
            sx={{ alignSelf: 'center', marginY: 2 }}
          />
          <CheckOutItem
            title='Transaction No.'
            value={ecgTransactionInfo?.details?._id}
          />
          <CheckOutItem
            title='Order No.'
            value={ecgTransactionInfo?.details?.paymentId}
          />
          <CheckOutItem
            title='Date,Time'
            value={moment(ecgTransactionInfo?.details?.createdAt).format('LLL')}
          />
          <CheckOutItem
            title='Meter No.'
            value={ecgTransactionInfo?.details?.meter?.number}
          />
          <CheckOutItem
            title='Meter Name'
            value={ecgTransactionInfo?.details?.meter?.name}
          />
          <CheckOutItem
            title='District'
            value={ecgTransactionInfo?.details?.meter?.district}
          />
          <CheckOutItem title='Payment Method' value='Mobile Money' />
          <CheckOutItem
            title='Received Amount'
            value={currencyFormatter(ecgTransactionInfo?.details?.info?.amount)}
          />

        
          <CheckOutItem title='Issuer' value={ecgTransactionInfo?.details?.issuer||"Gab Powerful Consult"} />
        </Stack>
        <Typography fontWeight='bold' textAlign='center' paragraph>
          {ecgTransactionInfo?.details?.info?.orderNo}
        </Typography>
        <Divider flexItem>
          <Chip
            label={
              ecgTransactionInfo?.details?.isProcessed ? 'Completed' : 'Pending'
            }
            color={
              !ecgTransactionInfo?.details?.isProcessed
                ? 'secondary'
                : 'success'
            }
            sx={{ color: 'white' }}
          />
        </Divider>
      </DialogContent>
      {ecgTransactionInfo?.details?.isProcessed && (
        <DialogActions>
          <Button onClick={handleDownloadReceipt}>GET Receipt</Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default PaymentReceipt;
