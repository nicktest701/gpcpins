import { useContext, useState } from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import LoadingButton from "@mui/lab/LoadingButton";
import Swal from "sweetalert2";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import DOMPurify from "dompurify";
import { CustomContext } from "@/context/providers/CustomProvider";
import { currencyFormatter } from "@/constants";
import { makeMomoTransaction } from "@/api/paymentAPI";
import { disableWallet, getNonUser, getWalletStatus } from "@/api/userAPI";
import {
  CircularProgress,
  Box,
  Container,
  Paper,
  Fade,
  useTheme,
  alpha,
} from "@mui/material";
import { AuthContext } from "@/context/providers/AuthProvider";
import VoucherPlaceHolderItem from "@/components/items/VoucherPlaceHolderItem";
import { globalAlertType } from "@/components/alert/alertType";
import PaymentOption from "@/components/PaymentOption";
import { paymentOptionSchema } from "../../config/validationSchema";
import { Formik } from "formik";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import { useEffect } from "react";

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
  const theme = useTheme();

  const [token, setToken] = useState("");
  const [err, setErr] = useState("");
  const [failureCount, setFailCount] = useState(3);

  const [paymentMethod, setPaymentMethod] = useState("momo");
  const [mobilePartner, setMobilePartner] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [confirmPhonenumber, setConfirmPhonenumber] = useState("");

  // Get wallet status
  const { data, isLoading: isLoadingWalletStatus } = useQuery({
    queryKey: ["wallet-status"],
    queryFn: () => getWalletStatus(),
    enabled: !!user?.id && payload?.isWallet,
  });

  // Get wallet status
  const { data: dataDisableWallet } = useQuery({
    queryKey: ["disable-wallet"],
    queryFn: () => disableWallet(),
    enabled: failureCount === 0,
    initialData: { active: true, timeOut: null },
  });

  useEffect(() => {
    setErr("");

    if (dataDisableWallet?.active === false) {
      const message = `Wallet disabled due to multiple failed attempts.Try again after ${dataDisableWallet?.timeOut}`;
      setErr(message);

      queryClient.invalidateQueries({ queryKey: ["wallet-status"] });
    }
  }, [dataDisableWallet, queryClient]);

  //Make Payment
  const paymentMutate = useMutation({
    mutationFn: makeMomoTransaction,
    retry: false,
  });

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: getNonUser,
    retry: false,
  });

  const initialValues = {
    paymentMethod,
    token,
    mobilePartner,
    phoneNumber,
    confirmPhonenumber,
  };

  const onSubmit = (values) => {
    const payloadData = {
      category: payload?.category,
      categoryId: payload?.categoryId,
      service: "voucher",
      voucherName: payload?.voucherName,
      price: payload?.price,
      quantity: payload?.quantity,
      totalAmount: payload?.totalAmount,
      user: {
        name: DOMPurify.sanitize(values.fullName || user.fullName),
        email: DOMPurify.sanitize(payload?.email || user.email),
        phoneNumber: DOMPurify.sanitize(phoneNumber || user?.phonenumber),
        provider: values?.mobilePartner,
      },
      isWallet: paymentMethod === "wallet",
    };

    if (user?.id && paymentMethod === "wallet") {
      const walletBalance = queryClient.getQueryData(
        ["wallet-balance", user?.id],
        { exact: true },
      );

      if (
        Number(walletBalance) === 0 ||
        Number(walletBalance) < Number(payload.totalAmount)
      ) {
        customDispatch(
          globalAlertType(
            "error",
            "Insufficient Wallet Balance. Please request a top up.",
          ),
        );
        return;
      }
      payloadData.token = token;
    }

    Swal.fire({
      title: "Processing",
      text: `Proceed with payment?`,
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        if (!user?.id) {
          mutateAsync(
            {},
            {
              onSuccess: () => {

                paymentMutate.mutateAsync(payloadData, {
                  onSuccess: (data) => {
                    // console.log(data);
                    // return
                    if (data && data?.transactionId) {
                      navigate(`/confirm`, {
                        replace: true,
                        state: {
                          id: data?.transactionId,
                          categoryType: "voucher",
                          path: pathname,
                          isWallet: payloadData?.isWallet,
                        },
                      });
                    }
                  },
                  onError: (error) => {
                    customDispatch(globalAlertType("error", error));
                  },
                });
              },
            },
          );
        } else {
          paymentMutate.mutateAsync(payloadData, {
            onSuccess: (data) => {
              if (data && data?.transactionId) {
                navigate(`/confirm`, {
                  replace: true,
                  state: {
                    id: data?.transactionId,
                    categoryType: "voucher",
                    path: pathname,
                    isWallet: payloadData?.isWallet,
                  },
                });
              }
            },
            onError: async (error) => {
              if (error === "Invalid PIN!") {
                setFailCount((prevState) => prevState - 1);
                if (failureCount === 0) {
                  const message = `Wallet disabled due to multiple failed attempts.Try again after ${dataDisableWallet?.timeOut}`;
                  setErr(message);
                  queryClient.setQueryData(["wallet-status"], (oldData) => ({
                    ...oldData,
                    active: false,
                    timeOut: dataDisableWallet?.timeOut,
                  }));
                } else {
                  setErr(`${error} ${failureCount - 1} attempt(s) left.`);
                }
              } else {
                // setErr(`${error} ${failureCount - 1} attempt(s) left.`);
                customDispatch(globalAlertType("error", error));
              }
            },
          });
        }
      }
    });
  };

  const handleClose = () => {
    Swal.fire({
      title: "Processing",
      text: `Do you want to cancel transaction?`,
      showCancelButton: true,
      confirmButtonColor: theme.palette.error.main,
      cancelButtonColor: theme.palette.grey[500],
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
      payload: { data: {} },
    });
    navigate(`/evoucher?_pid=1`, { replace: true });
  };

  if (!payload?.category) {
    return <Navigate to="/evoucher?_pid=1" />;
  }

  return (
    <Box sx={{ minHeight: "100vh", py: 4, bgcolor: theme.palette.grey[50] }}>
      <Container maxWidth="sm">
        {payload?.isWallet && isLoadingWalletStatus ? (
          <Stack justifyContent="center" alignItems="center" height={200}>
            <CircularProgress />
          </Stack>
        ) : (
          <>
            {payload.isWallet && (failureCount <= 0 || !data?.active) ? (
              <Fade in timeout={800}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    textAlign: "center",
                    boxShadow: theme.shadows[8],
                  }}
                >
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Wallet Account Disabled
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Please contact us for further assistance.
                  </Typography>
                  {data?.timeOut && (
                    <>
                      <Typography variant="body2" color="text.secondary">
                        OR
                      </Typography>
                      <Typography
                        variant="body2"
                        color="error.main"
                        sx={{ mt: 1 }}
                      >
                        Try again in {data?.timeOut}
                      </Typography>
                    </>
                  )}
                  <Button
                    onClick={handleGoBack}
                    variant="outlined"
                    sx={{ mt: 2, borderRadius: 2 }}
                  >
                    Go Back
                  </Button>
                </Paper>
              </Fade>
            ) : (
              <Fade in timeout={800}>
                <Paper
                  elevation={3}
                  sx={{
                    p: { xs: 3, sm: 4 },
                    borderRadius: 4,
                    bgcolor: theme.palette.background.paper,
                    boxShadow: theme.shadows[8],
                  }}
                >
                  {/* Custom Header */}
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mb: 3 }}
                  >
                    <Stack>
                      <Typography variant="h5" fontWeight={600}>
                        Payment Details
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Overview of Payment Information
                      </Typography>
                    </Stack>
                    <IconButton
                      onClick={
                        !paymentMutate.isLoading ? handleClose : undefined
                      }
                      disabled={paymentMutate.isLoading}
                      sx={{
                        transition: theme.transitions.create([
                          "background-color",
                          "transform",
                        ]),
                        "&:hover": {
                          bgcolor: alpha(theme.palette.grey[500], 0.1),
                          transform: "scale(1.1)",
                        },
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Stack>

                  <Stack spacing={2} sx={{ mb: 3 }}>
                    <Typography
                      color="primary"
                      textAlign="center"
                      fontWeight={600}
                      textTransform="uppercase"
                    >
                      {payload?.voucherName} VOUCHER
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
                    <VoucherPlaceHolderItem
                      title="Name"
                      value={payload?.user?.name || "N/A"}
                    />
                    <VoucherPlaceHolderItem
                      title="Email"
                      value={payload?.email}
                    />
                  </Stack>

                  <Formik
                    initialValues={initialValues}
                    validationSchema={paymentOptionSchema(
                      paymentMethod,
                      user?.id,
                    )}
                    enableReinitialize
                    onSubmit={onSubmit}
                  >
                    {({ errors, touched, handleSubmit }) => (
                      <>
                        <PaymentOption
                          showWallet={user?.id}
                          showMomo
                          setPaymentMethod={setPaymentMethod}
                          error={Boolean(
                            touched.paymentMethod && errors.paymentMethod,
                          )}
                          value={paymentMethod}
                          helperText={errors.paymentMethod || err}
                          mobileMoneyDetails={{
                            mobilePartner,
                            setMobilePartner,
                            mobilePartnerErr: Boolean(
                              touched.mobilePartner && errors.mobilePartner,
                            ),
                            mobilePartnerHelperText: errors.mobilePartner,
                            phonenumber: phoneNumber,
                            setPhonenumber: setPhoneNumber,
                            phonenumberErr: Boolean(
                              touched.phoneNumber && errors.phoneNumber,
                            ),
                            phonenumberHelperText: errors.phoneNumber,
                            confirmPhonenumber,
                            setConfirmPhonenumber,
                            confirmPhonenumberErr: Boolean(
                              touched.phoneNumber && errors.confirmPhonenumber,
                            ),
                            confirmPhonenumberHelperText:
                              errors.confirmPhonenumber,
                          }}
                          walletDetails={{
                            token,
                            setToken,
                            tokenErr:
                              Boolean(touched.token && errors.token) || err,
                            tokenHelperText: errors.token || err,
                          }}
                        />

                        <LoadingButton
                          variant="contained"
                          onClick={handleSubmit}
                          fullWidth
                          loading={isLoading || paymentMutate.isLoading}
                          sx={{
                            py: 1.2,
                            borderRadius: 2,
                            boxShadow: "none",
                            transition: theme.transitions.create([
                              "background-color",
                              "box-shadow",
                              "transform",
                            ]),
                            "&:hover": {
                              boxShadow: theme.shadows[4],
                              transform: "scale(1.02)",
                            },
                          }}
                        >
                          {isLoading || paymentMutate.isLoading
                            ? "Please Wait..."
                            : "Pay"}
                        </LoadingButton>
                      </>
                    )}
                  </Formik>
                </Paper>
              </Fade>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}

export default VoucherPayment;
