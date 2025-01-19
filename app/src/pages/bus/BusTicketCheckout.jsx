import { useContext, useMemo, useState } from "react";
import { ChairRounded } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import moment from "moment";
import { Box, Tooltip } from "@mui/material";
import { currencyFormatter } from "../../constants";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCategory } from "../../api/categoryAPI";
import PayLoading from "../../components/PayLoading";
import Back from "../../components/Back";
import { Formik } from "formik";
import { CustomContext } from "../../context/providers/CustomProvider";
import { getAvailbleBusSeats } from "../../api/voucherAPI";
import DOMPurify from "dompurify";
import { AuthContext } from "../../context/providers/AuthProvider";
import { ticketValidationSchema } from "../../config/validationSchema";
import PaymentOption from "../../components/PaymentOption";

function BusTicketCheckout() {
  const queryClient = useQueryClient();
  const { user } = useContext(AuthContext);
  const { customDispatch } = useContext(CustomContext);
  const { id } = useParams();

  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [confirmPhonenumber, setConfirmPhonenumber] = useState("");
  const [mobilePartner, setMobilePartner] = useState("");
  const [quantity, setQuantity] = useState(parseInt(0));

  const [selectedItems, setSelectedItems] = useState([]);

  const bus = useQuery({
    queryKey: ["bus-category"],
    queryFn: () => getCategory(id),
    initialData: queryClient
      .getQueryData(["all-category"])
      ?.filter((item) => item?._id === id),

    enabled: !!id,
  });

  const busVouchers = useQuery({
    queryKey: ["available-seats", id],
    queryFn: () => getAvailbleBusSeats(id),
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
    const busCheckOut = {
      category: "bus",
      categoryId: bus?.data?._id,
      ticketName: bus?.data?.voucherType,
      paymentDetails: {
        tickets: selectedItems,
        quantity,
        totalAmount,
      },
      totalAmount,
      user: {
        name: user?.name,
        email: DOMPurify.sanitize(values?.email),
        phoneNumber:
          DOMPurify.sanitize(values?.phoneNumber) || user?.phonenumber,
        provider: values.mobilePartner,
      },
      isWallet: paymentMethod === "wallet",
    };

    // console.log(busCheckOut);
    customDispatch({
      type: "getTicketPaymentDetails",
      payload: { open: true, data: busCheckOut },
    });
  };

  const totalAmount = useMemo(
    () => parseInt(quantity) * parseFloat(bus?.data?.price),
    [quantity, bus?.data?.price]
  );

  //Switch seat no colors

  const switchColors = (seatNo) =>
    selectedItems.includes(seatNo) ? "green" : "var(--secondary)";

  //Select  a particular ticket
  const handleSelectTicket = (seatNo) => {
    const alreadySelected = selectedItems.find((item) => item === seatNo);
    if (alreadySelected) {
      const filteredTickets = selectedItems.filter((item) => item !== seatNo);
      setSelectedItems(filteredTickets);
      setQuantity(filteredTickets.length);
      return;
    }
    setSelectedItems((prev) => [...prev, seatNo]);
    setQuantity((prev) => prev + 1);
  };

  return (
    <>
      <Container maxWidth="md" sx={{ pb: 4, pt: { xs: 0, md: 2 } }}>
        <Back />
        <Typography
          variant="h6"
          sx={{
            bgcolor: "secondary.main",
            color: "primary.contrastText",
            padding: 1,
          }}
        >
          Bus Ticket Details
        </Typography>
        {busVouchers?.isLoading ? (
          <PayLoading />
        ) : busVouchers?.isError ? (
          <Typography>An unknown error has occurred!</Typography>
        ) : busVouchers?.data?.length !== 0 ? (
          <>
            <Typography variant="h6" py={1} pt={2}>
              Available Tickets
            </Typography>
            <Typography
              variant="body2"
              fontStyle="italic"
              py={1}
              paragraph
              pt={2}
            >
              Select your preferred ticket from the available ticktets.
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                flexWrap: "wrap",
                gap: 4,
                p: 1,
                height: "300px",
                overflowY: "auto",
              }}
            >
              {busVouchers?.data?.map(({ seatNo, active }) => {
                return active ? (
                  <Tooltip title={`Seat ${seatNo}`} placement="top">
                    <IconButton
                      key={seatNo}
                      disabled={!active}
                      sx={{
                        position: "relative",
                      }}
                      onClick={() => handleSelectTicket(seatNo)}
                    >
                      <ChairRounded
                        sx={{
                          width: 30,
                          height: 30,
                          bgcolor: switchColors(seatNo),
                          color: "#fff",
                          zIndex: 30,
                          position: "absolute",
                          inset: 0,
                          "&:hover": {
                            color: "green",
                          },
                        }}
                      />
                      <Typography
                        sx={{
                          color: "#000",
                          fontWeight: "bold",
                          bgcolor: "transparent",
                          fontSize: 11,
                          zIndex: 33,
                          position: "absolute",
                          top: 0,
                          left: 6,
                          right: 0,
                        }}
                      >
                        {seatNo}
                      </Typography>
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Tooltip title={`Seat ${seatNo}`}>
                    <IconButton
                      sx={{
                        width: 8,
                        height: 8,
                      }}
                      key={seatNo}
                      size="small"
                      disabled={true}
                    >
                      <ChairRounded
                        sx={{
                          zIndex: 30,
                          position: "absolute",
                          inset: 0,
                          "&:hover": {
                            color: "green",
                          },
                        }}
                      />
                    </IconButton>
                  </Tooltip>
                );
              })}
            </Box>

            <Stack
              sx={{
                py: { xs: 8, md: 2 },
                mt: 8,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
                gap: 5,
              }}
            >
              <Stack
                direction="column"
                spacing={1}
                alignItems="center"
                justifyContent="center"
              >
                <img
                  loading="lazy"
                  src={bus?.data?.details?.logo}
                  style={{
                    width: "200px",
                    height: "200px",
                    objectFit: "contain",
                  }}
                  alt="bus_image"
                />

                <Typography color="secondary" sx={{ fontWeight: "bold" }}>
                  {bus?.data?.voucherType}
                </Typography>
                <Typography variant="body2">
                  {moment(bus?.data?.details?.date).format("dddd,Do MMMM,YYYY")}
                </Typography>

                <Typography variant="body2">
                  {moment(bus?.data?.details?.time).format("hh:mm a")}
                </Typography>
              </Stack>

              <Stack
                spacing={2}
                borderRadius={2}
                padding={2}
                sx={{
                  bgcolor: "#fff",
                  boxShadow:
                    "20px 20px 60px hsl(207, 97%, 98%),-20px 20px 60px hsl(207, 97%, 98%)",
                }}
              >
                <Typography
                  sx={{
                    bgcolor: "secondary.main",
                    color: "primary.contrastText",
                    padding: 1,
                    textAlign: "center",
                    width: "100%",
                  }}
                >
                  Payment Details
                </Typography>
                <List sx={{ bgcolor: "#fff" }}>
                  <ListItem divider>
                    <ListItemText primary="Price" />
                    <ListItemSecondaryAction>
                      {currencyFormatter(bus?.data?.price)}
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem divider>
                    <ListItemText primary="Quantity" />
                    <ListItemSecondaryAction>
                      <IconButton color="primary">{quantity}</IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem divider>
                    <ListItemText
                      primary="TOTAL"
                      primaryTypographyProps={{
                        fontWeight: "bold",
                      }}
                    />
                    <ListItemSecondaryAction>
                      {currencyFormatter(totalAmount)}
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

                        <LoadingButton
                          disabled={quantity === 0}
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
            </Stack>
          </>
        ) : (
          <Stack justifyContent="center" alignItems="center" py={4} spacing={2}>
            {/* <img
              src={ticket_empty}
              alt='empty icon'
              style={{
                width: 'px',
                height: '60px',
              }}
            /> */}
            <Typography variant="h6" textAlign="center">
              No Ticket available for this route...
            </Typography>
          </Stack>
        )}
      </Container>
    </>
  );
}

export default BusTicketCheckout;
