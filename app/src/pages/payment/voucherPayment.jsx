import { useContext, useState } from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import LoadingButton from "@mui/lab/LoadingButton";
import Swal from "sweetalert2";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { CustomContext } from "../../context/providers/CustomProvider";
import { currencyFormatter } from "../../constants";
import { makeMomoTransaction } from "../../api/paymentAPI";
import { disableWallet, getNonUser, getWalletStatus } from "../../api/userAPI";
import { verifyPin } from "../../config/validation";
import { CircularProgress, Box, Container } from "@mui/material";
import { AuthContext } from "../../context/providers/AuthProvider";
import VoucherPlaceHolderItem from "../../components/items/VoucherPlaceHolderItem";
import { globalAlertType } from "../../components/alert/alertType";
import CustomDialogTitle from "../../components/dialogs/CustomDialogTitle";

function VoucherPayment() {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const {
    customState: {
      voucherPaymentDetails: { data: payload },
    },
    customDispatch,
  } = useContext(CustomContext);

  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [token, setToken] = useState("");
  const [err, setErr] = useState("");
  const [failureCount, setFailCount] = useState(3);

  // Get wallet status
  const { data, isLoading: isLoadingWalletStatus } = useQuery({
    queryKey: ["wallet-status"],
    queryFn: () => getWalletStatus(),
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
          onSuccess: (data) => {
            if (data) {
              navigate(`/confirm`, {
                replace: true,
                state: {
                  _id: data?._id,
                  type: "voucher",
                  path: pathname,
                  isWallet: payload?.isWallet,
                },
              });

            //   customDispatch({
            //     type: "getVoucherPaymentDetails",
            //     payload: { open: false, data: {} },
            //   });
            }
          },
          onError: (error) => {
            customDispatch(globalAlertType("error", error));
          },
        });
      }
    } else {
      paymentMutate.mutateAsync(payload, {
        onSuccess: (data) => {
          if (data) {
            navigate(`/confirm`, {
              replace: true,
              state: {
                _id: data?._id,
                type: "voucher",
                path: pathname,
                isWallet: payload?.isWallet,
              },
            });

            // customDispatch({
            //   type: "getVoucherPaymentDetails",
            //   payload: { open: false, data: {} },
            // });
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
        paymentMutate.reset();
        handleGoBack();
      }
    });
  };

  const handleGoBack = () => {
    customDispatch({
      type: "getVoucherPaymentDetails",
      payload: {
        data: {},
      },
    });
    navigate(`/evoucher?_pid=1`, {
      replace: true,
    });
  };

  if (!payload?.category) {
    return <Navigate to="/evoucher?_pid=1" />;
  }

  return (
    <Box sx={{ minHeight: "100svh" }}>
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
                subtitle="Overview of Payment Information"
                onClose={!paymentMutate.isLoading ? handleClose : () => {}}
              />

              <Container maxWidth="sm" sx={{ pt: 3 }}>
                <Stack spacing={2} py={3}>
                  <Typography
                    color="primary"
                    textAlign="center"
                    fontWeight="bold"
                    textTransform="uppercase"
                    width="100%"
                  >
                    {payload?.voucherType} VOUCHER
                  </Typography>

                  <VoucherPlaceHolderItem
                    title="Price"
                    value={currencyFormatter(payload?.price)}
                  />

                  <VoucherPlaceHolderItem
                    title="Quantity"
                    value={payload?.quantity}
                  />
                  <VoucherPlaceHolderItem
                    title="Payment Method"
                    value={payload?.isWallet ? "Wallet" : "Mobile Money"}
                  />
                  <VoucherPlaceHolderItem
                    title="Amount"
                    value={currencyFormatter(payload?.totalAmount)}
                  />

                  {/* {!payload.sales && (
              <Avatar
                src={getCode(payload?.user?.phoneNumber).image}
                variant='square'
                sx={{ width: 40, height: 20, marginY: 4, alignSelf: 'center' }}
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
                  {isLoading || paymentMutate.isLoading
                    ? "Please Wait..."
                    : " Pay"}
                </LoadingButton>
              </Container>
            </>
          )}
        </>
      )}
    </Box>
  );
}

export default VoucherPayment;
