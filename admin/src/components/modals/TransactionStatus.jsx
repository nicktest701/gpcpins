import {
  Dialog,
  DialogContent,
  Stack,
  CircularProgress,
  Button,
} from "@mui/material";
import moment from "moment";
import { useSearchParams } from "react-router-dom";
import CustomDialogTitle from "../dialogs/CustomDialogTitle";
import { useQuery } from "@tanstack/react-query";
import { getTransactionStatus } from "../../api/transactionAPI";
import { currencyFormatter } from "../../constants";

function TransactionStatus() {
  const [searchParams, setSearchParams] = useSearchParams();

  const open = searchParams.get("open");
  const reference = searchParams.get("payment_reference");
  const type = searchParams.get("type");

  const transaction = useQuery({
    queryKey: ["transaction-status", reference],
    queryFn: () => getTransactionStatus(reference, type),
    enabled: !!open && !!reference && !!type,
  });

  const handleClose = () => {
    setSearchParams((params) => {
      params.delete("open");
      params.delete("type");
      params.delete("payment_reference");

      return params;
    });
  };

  //  console.log(transaction.data);

  return (
    <Dialog maxWidth="sm" fullWidth open={Boolean(open)}>
      <CustomDialogTitle title="Transaction Status" onClose={handleClose} />

      <DialogContent sx={{ padding: 2 }}>
        {transaction.isLoading ? (
          <Stack
            width="100%"
            justifyContent="center"
            alignItems="center"
            spacing={2}
          >
            <CircularProgress />
            <p>Please Wait...</p>
          </Stack>
        ) : transaction?.isError ? (
          <Stack width="100%" justifyContent="center" alignItems="center">
            <p>{transaction.error}</p>
          </Stack>
        ) : (
          <Stack spacing={1}>
            <Button
              variant="contained"
              sx={{
                bgcolor:
                  transaction?.data?.status === "Paid"
                    ? "success.main"
                    : "warning.main",
              }}
            >
              {transaction?.data?.status}
            </Button>
            <div>
              <span style={{ fontWeight: "bold" }}>Message :</span>{" "}
              <span style={{ color: "green" }}>
                {transaction?.data?.message}
              </span>
            </div>
            <div>
              <span style={{ fontWeight: "bold" }}>Date : </span>{" "}
              <span style={{ color: "green" }}>
                {moment(transaction?.data?.date)?.format("LLL")}
              </span>
            </div>
            <div>
              <span style={{ fontWeight: "bold" }}>Transaction ID : </span>{" "}
              <span style={{ color: "green" }}>
                {transaction?.data?.transactionId}
              </span>
            </div>
            <div>
              <span style={{ fontWeight: "bold" }}>
                External Transaction ID :{" "}
              </span>{" "}
              <span style={{ color: "green" }}>
                {transaction?.data?.externalTransactionId}
              </span>
            </div>
            <div>
              <span style={{ fontWeight: "bold" }}>Status : </span>{" "}
              <span style={{ color: "green" }}>
                {transaction?.data?.status}
              </span>
            </div>
            <div>
              <span style={{ fontWeight: "bold" }}>Payment Method : </span>{" "}
              <span style={{ color: "green" }}>
                {transaction?.data?.paymentMethod}
              </span>
            </div>
            <div>
              <span style={{ fontWeight: "bold" }}>Client Reference : </span>{" "}
              <span style={{ color: "green" }}>
                {transaction?.data?.clientReference}
              </span>
            </div>
            <div>
              <span style={{ fontWeight: "bold" }}>Currency Code : </span>{" "}
              <span style={{ color: "green" }}>
                {transaction?.data?.currencyCode}
              </span>
            </div>
            <div>
              <span style={{ fontWeight: "bold" }}>Amount : </span>{" "}
              <span style={{ color: "green" }}>
                {currencyFormatter(transaction?.data?.amount)}
              </span>
            </div>
            <div>
              <span style={{ fontWeight: "bold" }}>Charges : </span>{" "}
              <span style={{ color: "green" }}>
                {currencyFormatter(transaction?.data?.charges)}
              </span>
            </div>
            <div>
              <span style={{ fontWeight: "bold" }}>
                Amount After Charges :{" "}
              </span>{" "}
              <span style={{ color: "green" }}>
                {currencyFormatter(transaction?.data?.amountAfterCharges)}
              </span>
            </div>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default TransactionStatus;
