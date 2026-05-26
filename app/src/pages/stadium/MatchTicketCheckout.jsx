import { useContext, useEffect, useState } from "react";
import _ from "lodash";
import { LoadingButton } from "@mui/lab";
import Avatar from "@mui/material/Avatar";
import Container from "@mui/material/Container";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import moment from "moment";
import { currencyFormatter } from "@/constants";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCategory } from "@/api/categoryAPI";
import Back from "@/components/Back";
import { globalAlertType } from "@/components/alert/alertType";
import { Formik } from "formik";
import { CustomContext } from "@/context/providers/CustomProvider";
import PayLoading from "@/components/PayLoading";
import { disableWallet, getNonUser } from "@/api/userAPI";
import AnimatedContainer from "@/components/animations/AnimatedContainer";
import DOMPurify from "dompurify";
import { ticketValidationSchema } from "@/config/validationSchema";
import { useAuth } from "@/context/providers/AuthProvider";
import PaymentOption from "@/components/PaymentOption";
import { makeMomoTransaction } from "@/api/paymentAPI";

function MatchTicketCheckout() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    customState: { stadiumTicketTotal },
    customDispatch,
  } = useContext(CustomContext);
  const { id } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [token, setToken] = useState("");
  const [err, setErr] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [email, setEmail] = useState("");
  const [mobilePartner, setMobilePartner] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [confirmPhonenumber, setConfirmPhonenumber] = useState("");
  const [failureCount, setFailCount] = useState(3);

  const stadium = useQuery({
    queryKey: ["match"],
    queryFn: () => getCategory(id),
    enabled: !!id,
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
    email,
    token,
    phoneNumber,
    confirmPhonenumber,
    mobilePartner,
    paymentMethod,
  };

  const onSubmit = (values) => {
    const payloadData = {
      categoryId: stadium?.data?.id,
      service: "ticket",
      category: stadium?.data?.type,
      voucherName: stadium?.data?.name,
      paymentDetails: {
        tickets: _.filter(stadiumTicketTotal, ({ quantity }) => quantity !== 0),
        quantity: _.sumBy(stadiumTicketTotal, "quantity"),
        totalAmount: _.sumBy(stadiumTicketTotal, "total"),
      },
      totalAmount: _.sumBy(stadiumTicketTotal, "total"),
      user: {
        name: user?.name,
        email: DOMPurify.sanitize(values?.email),
        phoneNumber:
          DOMPurify.sanitize(values?.phoneNumber) || user?.phonenumber,
        provider: values.mobilePartner,
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
        Number(walletBalance) < Number(payloadData.totalAmount)
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

    if (!user?.id) {
      mutateAsync(
        {},
        {
          onSettled: () => {
            customDispatch({ type: "sumCinemaTotal", payload: [] });
            customDispatch({ type: "sumStadiumTotal", payload: [] });
          },
          onSuccess: () => {
            paymentMutate.mutateAsync(payloadData, {
              onSuccess: (data) => {
                if (data) {
                  navigate(`/confirm`, {
                    replace: true,
                    state: {
                      id: data?.transactionId,
                      categoryType: "ticket",
                      path: pathname,
                      isWallet: payloadData?.isWallet,
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
          },
        },
      );
    } else {
      paymentMutate.mutateAsync(payloadData, {
        onSettled: () => {
          customDispatch({ type: "sumCinemaTotal", payload: [] });
          customDispatch({ type: "sumStadiumTotal", payload: [] });
        },
        onSuccess: (data) => {
          if (data) {
      

            navigate(`/confirm`, {
              replace: true,
              state: {
                id: data?.transactionId,
                categoryType: "ticket",
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
            customDispatch(globalAlertType("error", error));
          }
        },
      });
    }
  };

  if (_.isEmpty(stadiumTicketTotal) || !id) {
    return <Navigate to={`/evoucher/stadia-ticket/match/${id}`} />;
  }

  return (
    <>
      <Back to={`/evoucher/stadia-ticket/match/${id}`} />
      <Container
        maxWidth="md"
        sx={{ minHeight: "100vh", pb: { xs: 8, md: 4 }, pt: { xs: 0, md: 2 } }}
      >
        <Typography
          variant="h6"
          sx={{
            bgcolor: "secondary.main",
            color: "primary.contrastText",
            padding: 1,
          }}
        >
          Ticket Details
        </Typography>
        {stadium?.isLoading ? (
          <PayLoading />
        ) : stadium?.isError ? (
          <Typography>{stadium.error}</Typography>
        ) : (
          stadium?.data && (
            <Stack
              sx={{
                py: { xs: 8, md: 2 },
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
                gap: 5,
              }}
            >
              <AnimatedContainer delay={0.2}>
                <Stack
                  width="100%"
                  spacing={2}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Typography variant="caption">
                    {stadium?.data?.details?.matchType}
                  </Typography>
                  <Stack
                    direction="row"
                    padding={2}
                    justifyContent="center"
                    alignItems="center"
                    spacing={3}
                  >
                    <Stack
                      justifyContent="center"
                      alignItems="center"
                      spacing={2}
                    >
                      <Avatar
                        variant="square"
                        src={stadium?.data?.details?.homeImage}
                        sx={{ width: 45, height: 45 }}
                      />
                      <Typography>{stadium?.data?.details?.home}</Typography>
                    </Stack>
                    <Typography>Vs</Typography>
                    <Stack
                      justifyContent="center"
                      alignItems="center"
                      spacing={2}
                    >
                      <Avatar
                        variant="square"
                        src={stadium?.data?.details?.awayImage}
                        sx={{ width: 45, height: 45 }}
                      />
                      <Typography>{stadium?.data?.details?.away}</Typography>
                    </Stack>
                  </Stack>

                  <Stack
                    spacing={1}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Typography variant="body2">
                      {moment(new Date(stadium?.data?.details?.date)).format(
                        "dddd,Do MMMM,YYYY",
                      )}
                    </Typography>

                    <Typography variant="body2">
                      {moment(new Date(stadium?.data?.details?.time)).format(
                        "hh:mm a",
                      )}
                    </Typography>
                  </Stack>
                </Stack>
              </AnimatedContainer>

              <AnimatedContainer delay={0.4}>
                <Stack
                  spacing={2}
                  borderRadius={2}
                  padding={2}
                  sx={{
                    bgcolor: "#fff",
                    boxShadow:
                      "20px 20px 60px hsl(207, 97%, 98%),-20px 20px 60px hsl(207, 97%, 98%)",
                    // boxShadow: '20px 20px 60px #d9d9d9,-20px 20px 60px #ffffff',
                  }}
                >
                  <Typography
                    sx={{
                      bgcolor: "secondary.main",
                      color: "primary.contrastText",
                      padding: 1,
                      textAlign: "center",
                    }}
                  >
                    Payment Details
                  </Typography>
                  <List>
                    {stadiumTicketTotal?.map((item) => {
                      if (item?.quantity === 0) return;

                      return (
                        <ListItem key={item?.type} divider>
                          <ListItemText
                            primary={`${item?.type}(${item?.quantity})`}
                          />
                          <ListItemSecondaryAction>
                            {currencyFormatter(item?.total)}
                          </ListItemSecondaryAction>
                        </ListItem>
                      );
                    })}
                    <ListItem divider>
                      <ListItemText
                        primary="TOTAL"
                        primaryTypographyProps={{
                          fontWeight: "bold",
                        }}
                      />
                      <ListItemSecondaryAction
                        sx={{ color: "primary.main", fontWeight: "bold" }}
                      >
                        {currencyFormatter(
                          _.sumBy(stadiumTicketTotal, "total"),
                        )}
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                  <Formik
                    initialValues={initialValues}
                    onSubmit={onSubmit}
                    enableReinitialize={true}
                    validationSchema={ticketValidationSchema(
                      paymentMethod === "momo",
                    )}
                  >
                    {({ handleSubmit, errors, touched }) => {
                      console.log(errors);
                      return (
                        <>
                          <Typography variant="caption">
                            Personal Info
                          </Typography>
                          <TextField
                            size="small"
                            type="email"
                            variant="outlined"
                            label="Email Address(optional)"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            error={Boolean(touched.email && errors.email)}
                            helperText={touched.email && errors.email}
                          />
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
                                touched.phoneNumber &&
                                errors.confirmPhonenumber,
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
                            disabled={!paymentMethod || isLoading}
                          >
                            Make Payment
                          </LoadingButton>
                        </>
                      );
                    }}
                  </Formik>
                </Stack>
              </AnimatedContainer>
            </Stack>
          )
        )}
      </Container>
    </>
  );
}

export default MatchTicketCheckout;
