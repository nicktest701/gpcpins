import { useContext, useState } from "react";
import _ from "lodash";
import Dialog from "@mui/material/Dialog";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import LoadingButton from "@mui/lab/LoadingButton";
import Swal from "sweetalert2";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { CustomContext } from "../../context/providers/CustomProvider";
import { currencyFormatter } from "../../constants";
import { makeMomoTransaction } from "../../api/paymentAPI";
import VoucherPlaceHolderItem from "../items/VoucherPlaceHolderItem";
import { globalAlertType } from "../alert/alertType";
import CustomDialogTitle from "../dialogs/CustomDialogTitle";
import { AuthContext } from "../../context/providers/AuthProvider";
import { disableWallet, getNonUser, getWalletStatus } from "../../api/userAPI";
import { verifyPin } from "../../config/validation";
import { CircularProgress } from "@mui/material";

function TicketPaymentDetails() {
  const queryClient = useQueryClient();
  const { user } = useContext(AuthContext);
  const {
    customState: {
      ticketPaymentDetails: { open, data: payload },
    },
    customDispatch,
  } = useContext(CustomContext);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [token, setToken] = useState("");
  const [err, setErr] = useState("");
  const [failureCount, setFailCount] = useState(3);

  // Get wallet status and non-user information
  const { data, isLoading: isLoadingWalletStatus } = useQuery({
    queryKey: ["wallet-status"],
    queryFn: getWalletStatus,
    enabled: !!user?.id && payload?.isWallet,
  });

  //Make Payment
  const paymentMutate = useMutation({
    mutationFn: makeMomoTransaction,
    retry: false,
  });

  const { mutateAsync, isSuccess, isLoading } = useMutation({
    mutationFn: getNonUser,
    retry: false,
  });

  const handlePayment = () => {
    if (payload?.isWallet) {
      if (token.trim() === "") {
        return setErr("Pin is required*");
      }
      if (token.trim().length !== 4 || !verifyPin(token?.trim())) {
        return setErr("Please enter a valid pin!");
      }

      const walletBalance = queryClient.getQueryData(
        ["wallet-balance", user?.id],
        {
          exact: true,
        }
      );

      if (Number(walletBalance) < Number(payload.totalAmount)) {
        customDispatch(
          globalAlertType(
            "error",
            "Insufficient Wallet Balance.Please request for a top up."
          )
        );
        return;
      }
      payload.token = token;
    }

    //Check if user exists
    if (!user?.id) {
      mutateAsync({});

      if (isSuccess) {
        paymentMutate.mutateAsync(payload, {
          onSettled: () => {
            customDispatch({ type: "sumCinemaTotal", payload: [] });
            customDispatch({ type: "sumStadiumTotal", payload: [] });
          },
          onSuccess: (data) => {
            if (data) {
              navigate(`/confirm`, {
                replace: true,
                state: {
                  _id: data?._id,
                  type: "ticket",
                  path: pathname,
                  isWallet: payload?.isWallet,
                },
              });
              customDispatch({
                type: "getTicketPaymentDetails",
                payload: { open: false, data: {} },
              });
            }
          },
          onError: (error) => {
            customDispatch(globalAlertType("error", error));
          },
        });
      }
    } else {
      paymentMutate.mutateAsync(payload, {
        onSettled: () => {
          customDispatch({ type: "sumCinemaTotal", payload: [] });
          customDispatch({ type: "sumStadiumTotal", payload: [] });
        },
        onSuccess: (data) => {
          if (data) {
            navigate(`/confirm`, {
              replace: true,
              state: {
                _id: data?._id,
                type: "ticket",
                path: pathname,
                isWallet: payload?.isWallet,
              },
            });
            customDispatch({
              type: "getTicketPaymentDetails",
              payload: { open: false, data: {} },
            });
          }
        },
        onError: async (error) => {
          if (error === "Invalid pin!") {
            setFailCount((prevState) => prevState - 1);

            if (failureCount <= 3) {
              setErr(`${error} .${failureCount - 1} attempt(s) left.`);
              if (failureCount <= 1) {
                await disableWallet();
              }
            } else {
              setErr(error);
            }
          } else {
            customDispatch(globalAlertType("error", error));
          }
        },
      });
    }
  };

  //close Payment Details
  const handleClose = () => {
    Swal.fire({
      title: "Processing",
      text: `Do you want to cancel transaction?`,
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        customDispatch({ type: "sumCinemaTotal", payload: [] });
        customDispatch({ type: "sumStadiumTotal", payload: [] });
        customDispatch({
          type: "getTicketPaymentDetails",
          payload: {
            open: false,
            data: {},
          },
        });
      }
    });
  };

  const handleGoBack = () => {
    customDispatch({
      type: "getTicketPaymentDetails",
      payload: {
        open: false,
        data: {},
      },
    });
  };

  const types =
    payload?.category === "bus"
      ? payload?.paymentDetails?.tickets?.join(",")
      : _.map(payload?.paymentDetails?.tickets, "type").join(",");


  return (
    <Dialog open={open} maxWidth="xs" fullWidth>
      {payload?.isWallet && isLoadingWalletStatus ? (
        <Stack justifyContent="center" alignItems="center" height={200}>
          <CircularProgress />
        </Stack>
      ) : (
        <>
          {payload.isWallet && (failureCount <= 0 || !data?.active) ? (
            <Stack p={4} alignItems="center" spacing={1}>
              <Typography variant="h6" paragraph>
                Wallet Account Disabled
              </Typography>
              <Typography variant="caption">
                Please contact us for further assistance.
              </Typography>
              {data?.timeOut && (
                <>
                  <span>OR</span>
                  <Typography variant="caption">
                    Try again in{" "}
                    <span style={{ color: "red" }}>{data?.timeOut}</span>
                  </Typography>
                </>
              )}
              <Button onClick={handleGoBack}>Go Back</Button>
            </Stack>
          ) : (
            <>
              <CustomDialogTitle
                title="Payment Details"
                onClose={!paymentMutate.isLoading && handleClose}
              />
              <DialogContent>
                <Typography
                  textAlign="center"
                  fontWeight="bold"
                  textTransform="uppercase"
                  width="100%"
                  color="primary"
                >
                  {payload?.ticketName || payload?.voucherType} TICKET
                </Typography>

                <Stack spacing={1} py={2}>
                  <VoucherPlaceHolderItem
                    title={payload?.category === "bus" ? "Seats" : "Type"}
                    value={types || "N/A"}
                  />

                  <VoucherPlaceHolderItem
                    title="Quantity"
                    value={payload?.paymentDetails?.quantity}
                  />
                  <VoucherPlaceHolderItem
                    title="Payment Method"
                    value={payload?.isWallet ? "Wallet" : "Mobile Money"}
                  />
                  <VoucherPlaceHolderItem
                    title="Amount"
                    value={currencyFormatter(
                      payload?.paymentDetails?.totalAmount
                    )}
                  />
                  {/* {!payload.sales && (
              <Avatar
                src={getCode(payload?.user?.phoneNumber).image}
                variant='square'
                sx={{ width: 60, height: 30, marginY: 4, alignSelf: 'center' }}
              />
            )} */}

                  <VoucherPlaceHolderItem
                    title="Name"
                    value={payload?.user?.name || "N/A"}
                  />

                  <VoucherPlaceHolderItem
                    title="Email"
                    value={payload?.user?.email}
                  />
                  {!payload?.isWallet && (
                    <VoucherPlaceHolderItem
                      title="Mobile Number"
                      value={payload?.user?.phoneNumber}
                    />
                  )}
                </Stack>

                {payload?.isWallet && (
                  <Stack py={2}>
                    <Typography variant="h6">Wallet Pin</Typography>

                    <TextField
                      size="small"
                      type="number"
                      inputMode="numeric"
                      placeholder="Enter 4-digit pin"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      error={Boolean(err)}
                      helperText={err}
                      margin="dense"
                      sx={{ textAlign: "center", width: 200 }}
                    />
                  </Stack>
                )}

                <LoadingButton
                  variant="contained"
                  onClick={handlePayment}
                  fullWidth
                  loading={isLoading || paymentMutate.isLoading}
                >
                  {paymentMutate.isLoading ? "Please Wait..." : " Pay"}
                </LoadingButton>
              </DialogContent>
            </>
          )}
        </>
      )}
    </Dialog>
  );
}

export default TicketPaymentDetails;
