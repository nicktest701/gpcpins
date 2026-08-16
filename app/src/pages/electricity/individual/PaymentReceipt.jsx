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
} from "@mui/material";
import { useContext, useRef } from "react";
import Transition from "../../../components/Transition";
import moment from "moment";
import { CustomContext } from "../../../context/providers/CustomProvider";
import { currencyFormatter } from "../../../constants";
import ecg_logo from "../../../assets/images/ecg.jpg";
import CheckOutItem from "../../../components/items/CheckOutItem";
import CustomDialogTitle from "../../../components/dialogs/CustomDialogTitle";

const PaymentReceipt = () => {
  const componentRef = useRef();
  const {
    customState: { ecgTransactionInfo },
    customDispatch,
  } = useContext(CustomContext);

  const handleClose = () => {
    customDispatch({
      type: "viewEcgTransactionInfo",
      payload: {
        open: false,
        details: {},
      },
    });
  };

  // console.log(ecgTransactionInfo)

  const handleDownloadReceipt = () => {
    const link = document.createElement("a");
    link.href = ecgTransactionInfo?.details?.info?.receiptUrl;
    link.target = "_blank";
    link.download = `${ecgTransactionInfo?.details?.info?.receiptUrl}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog
      open={ecgTransactionInfo.open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      TransitionComponent={Transition}
    >
      <CustomDialogTitle title="Transaction Details" onClose={handleClose} />
      <DialogContent ref={componentRef}>
        <Stack rowGap={1} paddingY={1}>
          <Avatar
            srcSet={ecg_logo}
            style={{
              width: 40,
              height: 40,
            }}
            sx={{ alignSelf: "center", marginY: 2 }}
          />
          <CheckOutItem
            title="Completed On"
            value={moment(ecgTransactionInfo?.details?.createdAt).format("LLL")}
          />
          <CheckOutItem
            title="Transaction No."
            value={ecgTransactionInfo?.details?.id}
          />
          <CheckOutItem
            title="Recharge Token"
             value={ecgTransactionInfo?.details?.info?.rechargeToken
              ?ecgTransactionInfo?.details?.info?.rechargeToken.replace(/\s|-/g, "").match(/.{1,4}/g)?.join("-")
              : ""}
         
          />
          <CheckOutItem
            title="Meter No."
            value={ecgTransactionInfo?.details?.meter?.number}
          />
          <CheckOutItem
            title="Meter Name"
            value={ecgTransactionInfo?.details?.meter?.name}
          />
          <CheckOutItem
            title="District"
            value={ecgTransactionInfo?.details?.meter?.district}
          />
          <CheckOutItem title="Payment Mode" value={ecgTransactionInfo?.details?.mode}/>
          <CheckOutItem title="Mobile No" value={ecgTransactionInfo?.details?.mobileNo}/>
          <CheckOutItem
            title="Received Amount"
            value={currencyFormatter(ecgTransactionInfo?.details?.amount)}
          />

          <CheckOutItem
            title="Payment By"
            value={
              ecgTransactionInfo?.details?.meter?.paymentBy || ecgTransactionInfo?.details?.mobileNo
            }
          />
          <CheckOutItem
            title="Issuer"
            value={
              ecgTransactionInfo?.details?.issuerName || "Gab Powerful Consult"
            }
          />
        </Stack>
        <Typography fontWeight="bold" textAlign="center" paragraph>
          {ecgTransactionInfo?.details?.info?.orderNo}
        </Typography>
        <Divider flexItem>
          <Chip
            label={ecgTransactionInfo?.details?.status}
            color={
              !ecgTransactionInfo?.details?.isProcessed
                ? "secondary"
                : "success"
            }
            sx={{ color: "white" }}
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
