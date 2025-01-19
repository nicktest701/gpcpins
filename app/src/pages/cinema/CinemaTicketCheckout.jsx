import { useContext, useState } from "react";
import { LoadingButton } from "@mui/lab";
import Container from "@mui/material/Container";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import moment from "moment";
import _ from "lodash";
import { currencyFormatter } from "../../constants";
import { useParams, Navigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCategory } from "../../api/categoryAPI";
import Back from "../../components/Back";
import { Formik } from "formik";
import { CustomContext } from "../../context/providers/CustomProvider";
import AnimatedContainer from "../../components/animations/AnimatedContainer";
import DOMPurify from "dompurify";
import { ticketValidationSchema } from "../../config/validationSchema";
import { AuthContext } from "../../context/providers/AuthProvider";
import PaymentOption from "../../components/PaymentOption";

function CinemaTicketCheckout() {
  const { user } = useContext(AuthContext);
  const [paymentMethod, setPaymentMethod] = useState("");
  const queryClient = useQueryClient();
  const {
    customState: { cinemaTicketTotal },
    customDispatch,
  } = useContext(CustomContext);

  const { id } = useParams();

  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState("");
  const [confirmPhonenumber, setConfirmPhonenumber] = useState("");
  const [mobilePartner, setMobilePartner] = useState("");

  const movieInfo = useQuery({
    queryKey: ["movie-category"],
    queryFn: () => getCategory(id),
    initialData: queryClient
      .getQueryData(["all-category"])
      ?.filter((item) => item?._id === id),

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
    const cinemaCheckOut = {
      category: "cinema",
      categoryId: movieInfo?.data?._id,
      ticketName: movieInfo?.data?.voucherType,
      paymentDetails: {
        tickets: _.filter(cinemaTicketTotal, ({ quantity }) => quantity !== 0),
        quantity: _.sumBy(cinemaTicketTotal, "quantity"),
        totalAmount: _.sumBy(cinemaTicketTotal, "total"),
      },
      totalAmount: _.sumBy(cinemaTicketTotal, "total"),
      user: {
        name: user?.name,
        email: DOMPurify.sanitize(values?.email),
        phoneNumber: DOMPurify.sanitize(values?.phoneNumber)||user?.phonenumber,
        provider: values.mobilePartner,
      },
      isWallet: paymentMethod === "wallet",
    };

    customDispatch({
      type: "getTicketPaymentDetails",
      payload: { open: true, data: cinemaCheckOut },
    });
  };

  if (_.isEmpty(cinemaTicketTotal)) {
    <Navigate to={`/evoucher/cinema-ticket/movie/${id}`} />;
  }

  return (
    <>
      <Back to={`/evoucher/cinema-ticket/movie/${id}`} />
      <Container maxWidth="md" sx={{ pb: 4, pt: { xs: 0, md: 2 } }}>
        <Typography
          variant="h6"
          sx={{
            bgcolor: "secondary.main",
            color: "primary.contrastText",
            padding: 1,
          }}
        >
          Event Ticket Details
        </Typography>

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
              direction="column"
              spacing={2}
              alignItems="center"
              justifyContent="center"
            >
              <img
                loading="lazy"
                src={movieInfo?.data?.details?.cinema}
                style={{
                  width: "100%",
                  height: "200px",
                  objectFit: "contain",
                }}
                alt="cinema_image"
              />
              <Stack spacing={1} justifyContent="center" alignItems="center">
                <Typography color="secondary" sx={{ fontWeight: "bold" }}>
                  {movieInfo?.data?.details?.movie}
                </Typography>
                <Typography variant="body2">
                  {moment(new Date(movieInfo?.data?.details?.date)).format(
                    "dddd,Do MMMM,YYYY"
                  )}
                </Typography>

                <Typography variant="body2">
                  {moment(new Date(movieInfo?.data?.details?.time)).format(
                    "h:mm a"
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
                boxShadow: "20px 20px 60px #d9d9d9,-20px 20px 60px #ffffff",
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
                {cinemaTicketTotal?.map((item) => {
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
                    {currencyFormatter(_.sumBy(cinemaTicketTotal, "total"))}
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
                      <Typography variant="caption">Personal Info</Typography>
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

                      <LoadingButton variant="contained" onClick={handleSubmit}>
                        Make Payment
                      </LoadingButton>
                    </>
                  );
                }}
              </Formik>
            </Stack>
          </AnimatedContainer>
        </Stack>
      </Container>
    </>
  );
}

export default CinemaTicketCheckout;
