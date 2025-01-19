import {
  Alert,
  Button,
  CircularProgress,
  Container,
  Divider,
  Stack,
  Typography,
  Link as MuiLink,
} from "@mui/material";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, Navigate, useLocation } from "react-router-dom";
import { findTransaction, getTransactionById } from "../../api/transactionAPI";
import CheckOutItem from "../../components/items/CheckOutItem";
import moment from "moment";
import { currencyFormatter } from "../../constants";
import { useContext, useState } from "react";
import { downloadVouchers, makePayment } from "../../api/paymentAPI";
import { globalAlertType } from "../../components/alert/alertType";
import { FileDownloadRounded } from "@mui/icons-material";
import { CustomContext } from "../../context/providers/CustomProvider";

const LostVoucher = () => {
  const { state } = useLocation();
  const { customDispatch } = useContext(CustomContext);
  const [errCount, setErrCount] = useState(0);

  const transaction = useQuery({
    queryKey: ["retrieve-voucher", state?.id, state?.mobileNo],
    queryFn: () =>
      state?.general
        ? findTransaction(state?.id, state?.mobileNo)
        : getTransactionById(state?.id, state?.mobileNo),
    enabled: !!state?.id && !!state?.mobileNo,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    onError: () => {
      setErrCount(errCount + 1);
    },
  });

  const isVoucher = ["waec", "university", "security"].includes(
    transaction?.data?.info?.type
  );

  const { mutateAsync, data, isLoading } = useMutation({
    mutationFn: makePayment,
  });

  const retrieveVouchers = () => {
    mutateAsync(
      {
        id: transaction?.data?._id,
        type: transaction?.data?.info?.type,
      },
      {
        onSuccess: (data) => {
          if (data?.id) {
            customDispatch(
              globalAlertType(
                "info",
                `${isVoucher ? "Vouchers" : "Ticket"} generated!`
              )
            );
          }
        },
        onError: () => {
          setErrCount(errCount + 1);
          customDispatch(
            globalAlertType("error", "An unknown error has occurred!")
          );
        },
      }
    );
  };

  const handleDownloadVouchers = () => downloadVouchers(transaction?.data?._id);

  if (!state?.id || !state?.mobileNo) {
    return <Navigate to={state?.general ? "/" : "/evoucher"} />;
  }

  return (
    <>
      {errCount > 2 && (
        <Alert severity="info" sx={{ fontSize: 12 }}>
          Finding problems retrieiving vouchers , tickets,transaction details?
          Send a message via SMS on +233244012766 or via{" "}
          <Link
            to="https://chat.whatsapp.com/LOLI3PEzn31BPAUu017ylx"
            target="_blank"
            style={{ textDecoration: "underline" }}
          >
            Whatsapp
          </Link>{" "}
          to our support desk or any of our business lines.
        </Alert>
      )}
      <Container
        maxWidth="md"
        sx={{
          minHeight: "70svh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 1,
          textAlign: "center",
          p: 2,
        }}
      >
        {transaction.isLoading ? (
          <Stack justifyContent="center" alignItems="center" spacing={2}>
            <CircularProgress />
            <Typography>
              Searching for your transaction details.Please wait...
            </Typography>
          </Stack>
        ) : transaction.isError ? (
          <>
            {/* <Typography variant='h2' color='error'>
            Error!
          </Typography> */}

            <Typography variant="h3">No match found </Typography>
            <Stack direction="row" justifyContent="center" alignItems="center">
              <Typography>
                Sorry we could not find a transaction with this information.
              </Typography>
              <MuiLink onClick={transaction?.refetch}>Try again?</MuiLink>
            </Stack>
            <Link to={state?.general ? "/" : "/evoucher"}>Go Back</Link>
          </>
        ) : (
          <>
            <Typography
              variant="h3"
              color={transaction.isError ? "red" : "green"}
            >
              {transaction.isError ? "No match found" : "Match found!"}
            </Typography>
            <Typography variant="caption">
              Showing details of your transaction
            </Typography>
            <Link to="/">Go Home</Link>
            <Container maxWidth="md" sx={{ py: 2 }}>
              {/* Genral Search */}
              {state?.general ? (
                <Stack rowGap={2}>
                  <Divider />

                  <Stack spacing={1}>
                    <CheckOutItem
                      title="Transaction No."
                      value={transaction?.data?._id}
                    />
                    {transaction?.data?.mode === "Mobile Money" && (
                      <CheckOutItem
                        title="External Transaction ID "
                        value={transaction?.data?.externalTransactionId}
                      />
                    )}
                    <CheckOutItem
                      title="Type"
                      value={transaction?.data?.domain}
                    />
                    <CheckOutItem
                      title="Date"
                      value={moment(
                        new Date(transaction?.data?.createdAt)
                      ).format("LLL")}
                    />
                    <CheckOutItem
                      title="Amount Paid"
                      value={currencyFormatter(transaction?.data?.amount)}
                    />

                    <CheckOutItem
                      title="Payment Method"
                      value={transaction?.data?.mode}
                    />

                    <CheckOutItem
                      title="Mobile No."
                      value={transaction?.data?.phonenumber}
                    />
                    <CheckOutItem
                      title="Status"
                      value={transaction?.data?.status}
                    />

                    <Divider flexItem />
                    {transaction?.data?.downloadLink && (
                      <Button
                        disabled={isLoading}
                        variant="contained"
                        target="_blank"
                        sx={{
                          maxWidth: "300px",
                          borderRadius: 1,
                          alignSelf: "center",
                        }}
                        size="large"
                        endIcon={<FileDownloadRounded />}
                        href={transaction?.data?.downloadLink}
                      >
                        Download Details
                      </Button>
                    )}
                  </Stack>
                </Stack>
              ) : (
                <Stack rowGap={2}>
                  <Divider />

                  <Stack spacing={1}>
                    <CheckOutItem
                      title="Transaction No."
                      value={transaction?.data?._id}
                    />
                    {transaction?.data?.mode === "Mobile Money" && (
                      <CheckOutItem
                        title="External Transaction ID "
                        value={transaction?.data?.externalTransactionId}
                      />
                    )}
                    <CheckOutItem
                      title="Date"
                      value={moment(
                        new Date(transaction?.data?.createdAt)
                      ).format("LLL")}
                    />
                    <CheckOutItem
                      title="Amount Paid"
                      value={currencyFormatter(transaction?.data?.info?.amount)}
                    />
                    <CheckOutItem
                      title="Payment Method"
                      value={transaction?.data?.mode}
                    />
                    <CheckOutItem
                      title="Agent"
                      value={transaction?.data?.info?.agentName || "Agent"}
                    />
                    <CheckOutItem
                      title="Mobile No."
                      value={transaction?.data?.info?.agentPhoneNumber}
                    />
                    <CheckOutItem
                      title="Email Address"
                      value={transaction?.data?.info?.agentEmail}
                    />
                    <CheckOutItem
                      title="Order No."
                      value={transaction?.data?.info?.orderNo}
                    />
                    <Divider flexItem />
                  </Stack>
                  <Stack
                    rowGap={2}
                    alignItems="center"
                    justifyContent="center"
                    paddingY={2}
                  >
                    {data?.id ? (
                      <Button
                        disabled={isLoading}
                        variant="contained"
                        onClick={handleDownloadVouchers}
                        sx={{ maxWidth: "300px", borderRadius: 1 }}
                        size="large"
                        endIcon={<FileDownloadRounded />}
                      >
                        Download Vouchers
                      </Button>
                    ) : (
                      <Button
                        disabled={isLoading}
                        variant="contained"
                        onClick={retrieveVouchers}
                        sx={{ maxWidth: "400px", borderRadius: 1 }}
                        size="large"
                      >
                        Click here to Retreive{" "}
                        {`${isVoucher ? "Vouchers" : "Tickets"} `}
                      </Button>
                    )}
                  </Stack>
                  {isLoading && (
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      spacing={2}
                      width="100%"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <CircularProgress size={16} />
                      <Typography variant="caption">
                        {` Retrieving your ${
                          isVoucher ? "Vouchers" : "Tickets"
                        } .This might take a while.Please Wait ..... `}
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              )}
            </Container>
          </>
        )}
      </Container>
    </>
  );
};

export default LostVoucher;
