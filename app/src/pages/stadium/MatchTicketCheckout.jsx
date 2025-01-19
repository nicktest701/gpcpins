import { useContext, useState } from "react";
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
import { currencyFormatter } from "../../constants";
import { Navigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCategory } from "../../api/categoryAPI";
import Back from "../../components/Back";
import { Formik } from "formik";
import { CustomContext } from "../../context/providers/CustomProvider";
import PayLoading from "../../components/PayLoading";
import AnimatedContainer from "../../components/animations/AnimatedContainer";
import DOMPurify from "dompurify";
import { ticketValidationSchema } from "../../config/validationSchema";
import { AuthContext } from "../../context/providers/AuthProvider";
import PaymentOption from "../../components/PaymentOption";

function MatchTicketCheckout() {
  const { user } = useContext(AuthContext);
  const {
    customState: { stadiumTicketTotal },
    customDispatch,
  } = useContext(CustomContext);
  const { id } = useParams();
  const [paymentMethod, setPaymentMethod] = useState("");
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState("");
  const [confirmPhonenumber, setConfirmPhonenumber] = useState("");
  const [mobilePartner, setMobilePartner] = useState("");

  const stadium = useQuery({
    queryKey: ["match"],
    queryFn: () => getCategory(id),
    enabled: !!id,
  });
  const initialValues = {
    email,
    phoneNumber,
    confirmPhonenumber,
    mobilePartner,
    paymentMethod,
  };

  const onSubmit = (values) => {
    const stadiumCheckOut = {
      category: "stadium",
      categoryId: stadium?.data?._id,
      ticketName: stadium?.data?.voucherType,
      paymentDetails: {
        tickets: _.filter(stadiumTicketTotal, ({ quantity }) => quantity !== 0),
        quantity: Number(_.sumBy(stadiumTicketTotal, "quantity")),
        totalAmount: Number(_.sumBy(stadiumTicketTotal, "total")),
      },
      totalAmount: Number(_.sumBy(stadiumTicketTotal, "total")),
      user: {
        name: user?.name,
        email: DOMPurify.sanitize(email),
        phoneNumber: DOMPurify.sanitize(phoneNumber)||user?.phonenumber,
        provider: values.mobilePartner,
      },
      isWallet: paymentMethod === "wallet",
    };

    customDispatch({
      type: "getTicketPaymentDetails",
      payload: { open: true, data: stadiumCheckOut },
    });
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
                        "dddd,Do MMMM,YYYY"
                      )}
                    </Typography>

                    <Typography variant="body2">
                      {moment(new Date(stadium?.data?.details?.time)).format(
                        "hh:mm a"
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
                          _.sumBy(stadiumTicketTotal, "total")
                        )}
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                  <Formik
                    initialValues={initialValues}
                    onSubmit={onSubmit}
                    enableReinitialize={true}
                    validationSchema={ticketValidationSchema(
                      paymentMethod === "momo"
                    )}
                  >
                    {({ handleSubmit, errors, touched }) => {
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
                              touched.paymentMethod && errors.paymentMethod
                            )}
                            helperText={errors.paymentMethod}
                            mobileMoneyDetails={{
                              mobilePartner,
                              setMobilePartner,
                              mobilePartnerErr: Boolean(
                                touched.mobilePartner && errors.mobilePartner
                              ),
                              mobilePartnerHelperText: errors.mobilePartner,
                              phonenumber: phoneNumber,
                              setPhonenumber: setPhoneNumber,
                              phonenumberErr: Boolean(
                                touched.phoneNumber && errors.phoneNumber
                              ),
                              phonenumberHelperText: errors.phoneNumber,
                              //
                              confirmPhonenumber,
                              setConfirmPhonenumber,
                              confirmPhonenumberErr: Boolean(
                                touched.phoneNumber && errors.confirmPhonenumber
                              ),
                              confirmPhonenumberHelperText:
                                errors.confirmPhonenumber,
                            }}
                          />

                          <LoadingButton
                            variant="contained"
                            onClick={handleSubmit}
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
