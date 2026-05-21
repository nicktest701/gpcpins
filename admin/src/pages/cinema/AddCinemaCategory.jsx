import { useContext, useRef, useState } from "react";
import LoadingButton from "@mui/lab/LoadingButton";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import _ from "lodash";
import { v4 as uuid } from "uuid";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Formik } from "formik";
import { CustomContext } from "../../context/providers/CustomProvider";
import { postCategory } from "../../api/categoryAPI";
import moment from "moment";
import CustomTimePicker from "../../components/inputs/CustomTimePicker";
import CustomDatePicker from "../../components/inputs/CustomDatePicker";
import { globalAlertType } from "../../components/alert/alertType";
import { CINEMA_TICKET_TYPE } from "../../mocks/columns";
import {
  Avatar,
  Box,
  Container,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
} from "@mui/material";
import { currencyFormatter } from "../../constants";
import { Close, CloudUpload } from "@mui/icons-material";
import { addCinemaValidationSchema } from "../../config/validationSchema";
import CustomDialogTitle from "../../components/dialogs/CustomDialogTitle";
import DOMPurify from "dompurify";
import { uploadFile } from "@/lib/upload";

const AddCinemaCategory = () => {
  const queryClient = useQueryClient();
  const { customState, customDispatch } = useContext(CustomContext);

  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [companyName, setCompanyName] = useState("");
  const [voucherType, setVoucherType] = useState("");
  const [theatre, setTheatre] = useState("");
  const [location, setLocation] = useState("");
  const [time, setTime] = useState(moment());
  const [date, setDate] = useState(moment());
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);
  const [ticketType, setTicketType] = useState("");
  const [ticketTypeErr, setTicketTypeErr] = useState("");
  const [ticketTypeList, setTicketTypeList] = useState([]);
  const [message, setMessage] = useState("");
  const [description, setDescription] = useState("");

  // Upload file ref
  const fileInputRef = useRef(null);

  const initialValues = {
    category: "cinema",
    voucherType,
    theatre,
    location,
    date,
    time,
    message,
    description,
    companyName,
  };

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: postCategory,
  });
  const onSubmit = (values, options) => {
    setTicketTypeErr("");
    if (ticketTypeList.length === 0) {
      setTicketTypeErr("Please add at least one ticket !");
      options.setSubmitting(false);
      return;
    }

    const newCinemaTicket = {
      type: values.category,
      name: values.voucherType,
      details: {
        movie: DOMPurify.sanitize(values.voucherType),
        theatre: DOMPurify.sanitize(values.theatre),
        pricing: ticketTypeList,
        location: DOMPurify.sanitize(values.location),
        quantity: parseInt(_.sumBy(ticketTypeList, "quantity")),
        date: values.date,
        time: values.time,
        message: DOMPurify.sanitize(values.message),
        description: DOMPurify.sanitize(values.description),
        cinema: logo,
        companyName: DOMPurify.sanitize(values?.companyName),
      },
      year: moment(values.date).format("YYYY"),
    };

    // console.log(newCinemaTicket)
    // return

    mutateAsync(newCinemaTicket, {
      onSettled: () => {
        options.setSubmitting(false);

        queryClient.invalidateQueries(["category"]);
      },
      onSuccess: (data) => {
        customDispatch(globalAlertType("info", data));
        handleClose();
      },
      onError: (error) => {
        customDispatch(globalAlertType("error", error));
      },
    });
  };

  // Upload logo
  const handleUploadFile = async (e) => {
    setLoading(true);

    try {
      const file = e.target.files[0];
      if (!file) return;
      setLogo(file);
      // Create preview
      const reader = new FileReader();
      reader.onload = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);

      // Actually upload to Firebase
      const { downloadURL } = await uploadFile({
        folder: "category",
        file,
        onProgress: (progress) => {
          setProgress(progress);
        },
      });
      setLogo(downloadURL); // store final URL
    } catch (error) {
      customDispatch(
        globalAlertType("error", "Something went wrong. Please try again."),
      );
    } finally {
      setLoading(false);
    }
  };

  ///Close Add Category
  const handleClose = () => {
    customDispatch({ type: "openAddCinemaCategory", payload: { open: false } });
  };

  const handleAddTicketType = () => {
    setTicketTypeErr("");
    if (ticketType?.trim() === "") {
      setTicketTypeErr("Required*");

      return;
    }

    const item = {
      id: uuid(),
      type: ticketType.toUpperCase(),
      quantity: parseInt(DOMPurify.sanitize(quantity)),
      price: DOMPurify.sanitize(price),
    };
    setTicketTypeList((prev) => {
      return _.values(_.merge(_.keyBy([...prev, item], "type")));
    });

    setTicketType(" ");
    setQuantity(0);
    setPrice(0);
  };

  const handleRemoveTicketType = (id) => {
    const filteredTickets = ticketTypeList.filter((item) => item.id !== id);
    setTicketTypeList(filteredTickets);
  };

  // Preview logo if uploaded
  const LogoPreview = () => (
    <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 2 }}>
      {logoPreview && (
        <Avatar
          src={logoPreview}
          variant="rounded"
          sx={{ width: 60, height: 60, objectFit: "contain" }}
        />
      )}
      <Button
        variant="outlined"
        startIcon={<CloudUpload />}
        onClick={() => fileInputRef.current?.click()}
        size="small"
      >
        {logoPreview ? "Change Cover Image" : "Upload Cover Image"}
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept=".png,.jpg,.jpeg,.webp"
        onChange={handleUploadFile}
      />
    </Box>
  );

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={addCinemaValidationSchema}
      onSubmit={onSubmit}
      enableReinitialize={true}
    >
      {({ errors, touched, handleSubmit }) => {
        return (
          <Dialog
            maxWidth="md"
            fullWidth
            // fullScreen
            open={customState.cinemaCategory.open}
          >
            <CustomDialogTitle
              title="New Cinema Ticket"
              onClose={handleClose}
            />
            <DialogContent>
              <Container maxWidth="md">
                <Stack rowGap={2} paddingY={2}>
                  <TextField
                    size="small"
                    label="Company"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    error={Boolean(touched.companyName && errors.companyName)}
                    helperText={touched.companyName && errors.companyName}
                  />
                  {/* Logo Upload */}
                  <Box>
                    {loading && (
                      <Box sx={{ width: "100%", mb: 1 }}>
                        <Typography variant="caption" color="textSecondary">
                          Uploading... {Math.round(progress)}%
                        </Typography>
                        <Box
                          sx={{
                            height: 4,
                            width: "100%",
                            bgcolor: "action.hover",
                            borderRadius: 1,
                            overflow: "hidden",
                          }}
                        >
                          <Box
                            sx={{
                              height: "100%",
                              width: `${progress}%`,
                              bgcolor: "primary.main",
                              transition: "width 0.3s ease",
                            }}
                          />
                        </Box>
                      </Box>
                    )}

                    <Typography variant="subtitle2" gutterBottom>
                      Cover Logo
                    </Typography>
                    <LogoPreview />
                  </Box>

                  <TextField
                    size="small"
                    label="Movie Name"
                    value={voucherType}
                    onChange={(e) => setVoucherType(e.target.value)}
                    error={Boolean(touched.voucherType && errors.voucherType)}
                    helperText={touched.voucherType && errors.voucherType}
                  />

                  {/* Ticket type  */}
                  <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <Autocomplete
                      options={CINEMA_TICKET_TYPE}
                      freeSolo
                      closeText=""
                      disableClearable
                      fullWidth
                      size="small"
                      noOptionsText="No Ticket available"
                      value={ticketType || ""}
                      onInputChange={(e, value) => setTicketType(value)}
                      isOptionEqualToValue={(option, value) => option === value}
                      renderInput={(props) => (
                        <TextField
                          {...props}
                          label="Select a ticket type"
                          error={ticketTypeErr.trim() !== ""}
                          helperText={ticketTypeErr}
                        />
                      )}
                    />
                    <TextField
                      size="small"
                      type="number"
                      inputMode="numeric"
                      label="Quantity"
                      placeholder="Quantity here"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      error={Boolean(touched.quantity && errors.quantity)}
                      helperText={touched.quantity && errors.quantity}
                    />
                    <TextField
                      size="small"
                      type="number"
                      inputMode="decimal"
                      label="Price"
                      placeholder="Price here"
                      value={price}
                      onChange={(e) => setPrice(e.target.valueAsNumber)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Typography>GHS</Typography>
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <Typography>p</Typography>
                          </InputAdornment>
                        ),
                      }}
                      error={Boolean(touched.price && errors.price)}
                      helperText={touched.price && errors.price}
                    />

                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleAddTicketType}
                    >
                      Add
                    </Button>
                  </Stack>
                  <List>
                    {ticketTypeList.length !== 0
                      ? ticketTypeList.map((item) => (
                          <ListItem key={item.id}>
                            <ListItemText
                              primary={`${item.type} (${item.quantity})`}
                              primaryTypographyProps={{
                                fontSize: 11,
                                color: "primary.main",
                                fontWeight: "bolder",
                              }}
                              secondary={currencyFormatter(item?.price)}
                            />

                            <ListItemSecondaryAction>
                              <IconButton
                                color="primary"
                                size="small"
                                onClick={() => handleRemoveTicketType(item?.id)}
                              >
                                <Close />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))
                      : null}
                  </List>

                  <Stack direction="row" spacing={2}>
                    <TextField
                      size="small"
                      label="Cinema/Theatre Name"
                      fullWidth
                      value={theatre}
                      onChange={(e) => setTheatre(e.target.value)}
                      error={Boolean(touched.theatre && errors.theatre)}
                      helperText={touched.theatre && errors.theatre}
                    />
                    <TextField
                      size="small"
                      label="Cinema/Theatre Location"
                      value={location}
                      fullWidth
                      onChange={(e) => setLocation(e.target.value)}
                      error={Boolean(touched.location && errors.location)}
                      helperText={touched.location && errors.location}
                    />
                  </Stack>
                  <Stack direction="row" spacing={2}>
                    <CustomDatePicker
                      label="Date"
                      value={date}
                      setValue={setDate}
                      error={Boolean(touched.date && errors.date)}
                      helperText={touched.date && errors.date}
                    />
                    <CustomTimePicker
                      label="Time"
                      value={time}
                      setValue={setTime}
                      error={Boolean(touched.time && errors.time)}
                      helperText={touched.time && errors.time}
                    />
                  </Stack>

                  <TextField
                    size="small"
                    label="Movie Description"
                    multiline
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    error={Boolean(touched.description && errors.description)}
                    helperText={touched.description && errors.description}
                  />

                  <TextField
                    size="small"
                    label="Message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    error={Boolean(touched.message && errors.message)}
                    helperText={touched.message && errors.message}
                  />
                </Stack>
              </Container>
            </DialogContent>
            <DialogActions>
              <Container
                maxWidth="md"
                sx={{ display: "flex", justifyContent: "flex-end" }}
              >
                <Button onClick={handleClose} disabled={loading}>
                  Cancel
                </Button>
                <LoadingButton
                  variant="contained"
                  loading={isLoading}
                  disabled={loading}
                  onClick={handleSubmit}
                >
                  Proceed
                </LoadingButton>
              </Container>
            </DialogActions>
          </Dialog>
        );
      }}
    </Formik>
  );
};

export default AddCinemaCategory;
