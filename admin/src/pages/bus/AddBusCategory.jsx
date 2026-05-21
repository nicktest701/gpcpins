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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Dompurify from "dompurify";
import { Formik } from "formik";
import { CustomContext } from "../../context/providers/CustomProvider";
import { postCategory } from "../../api/categoryAPI";
import CustomTimePicker from "../../components/inputs/CustomTimePicker";
import CustomDatePicker from "../../components/inputs/CustomDatePicker";
import moment from "moment";
import { globalAlertType } from "../../components/alert/alertType";
import { TOWNS } from "../../mocks/towns";
import { addBusValidationSchema } from "../../config/validationSchema";
import CustomDialogTitle from "../../components/dialogs/CustomDialogTitle";
import Compressor from "compressorjs";
import { Avatar, Box, Container } from "@mui/material";
import { uploadFile } from "@/lib/upload";
import { CloudUpload } from "@mui/icons-material";

const AddBusCategory = () => {
  //context
  const queryClient = useQueryClient();
  const { customState, customDispatch } = useContext(CustomContext);

  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logo, setLogo] = useState(null);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [price, setPrice] = useState(Number(0));
  const [report, setReport] = useState(moment());
  const [time, setTime] = useState(moment());
  const [date, setDate] = useState(moment());
  const [vehicleNo, setVehicleNo] = useState("");
  const [noOfSeats, setNoOfSeats] = useState(0);
  const [companyName, setCompanyName] = useState("");
  const [message, setMessage] = useState("");

  // Upload file ref
  const fileInputRef = useRef(null);

  const initialValues = {
    category: "bus",
    price,
    origin,
    destination,
    vehicleNo,
    noOfSeats,
    date,
    report,
    time,
    message,
    companyName,
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

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: postCategory,
  });
  const onSubmit = (values, option) => {
    const newBusTicket = {
      type: values.category,
      name: `${origin} to ${destination}`,
      price: values.price,
      details: {
        origin: Dompurify.sanitize(origin),
        destination: Dompurify.sanitize(destination),
        vehicleNo: Dompurify.sanitize(values?.vehicleNo?.toUpperCase()),
        noOfSeats: parseInt(Dompurify.sanitize(values.noOfSeats)),
        date: values.date,
        report: values.report,
        time: values.time,
        message: Dompurify.sanitize(values.message),
        companyName: Dompurify.sanitize(values.companyName),
        logo,
      },
      year: moment(values.date).year(),
    };

    mutateAsync(newBusTicket, {
      onSettled: () => {
        option.setSubmitting(false);

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
    option.setSubmitting(false);
  };

  ///Close Add Category
  const handleClose = () => {
    customDispatch({ type: "openAddBusCategory", payload: { open: false } });
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
      validationSchema={addBusValidationSchema}
      onSubmit={onSubmit}
      enableReinitialize={true}
    >
      {({ errors, touched, handleSubmit }) => {
        return (
          <Dialog maxWidth="md" fullWidth open={customState.busCategory.open}>
            <CustomDialogTitle title="New Bus Ticket" onClose={handleClose} />
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
                      Bus Image
                    </Typography>
                    <LogoPreview />
                  </Box>
                  <Autocomplete
                    options={TOWNS}
                    freeSolo
                    closeText=""
                    disableClearable
                    fullWidth
                    loadingText="Please wait..."
                    isOptionEqualToValue={(option, value) =>
                      value === undefined ||
                      value === null ||
                      value === "" ||
                      option === value
                    }
                    getOptionLabel={(option) => option || ""}
                    value={origin}
                    onChange={(e, value) => setOrigin(value)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        label="Origin(From)"
                        error={Boolean(touched.origin && errors.origin)}
                        helperText={
                          touched.origin && errors.origin
                            ? errors.origin
                            : "eg. Kumasi"
                        }
                      />
                    )}
                  />

                  {/* Destination  */}
                  <Autocomplete
                    options={TOWNS}
                    freeSolo
                    closeText=""
                    disableClearable
                    fullWidth
                    loadingText="Please wait..."
                    isOptionEqualToValue={(option, value) =>
                      value === undefined ||
                      value === null ||
                      value === "" ||
                      option === value
                    }
                    getOptionLabel={(option) => option || ""}
                    value={destination}
                    onChange={(e, value) => setDestination(value)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        label="Destination(To)"
                        error={Boolean(
                          touched.destination && errors.destination,
                        )}
                        helperText={
                          touched.destination && errors.destination
                            ? errors.destination
                            : "eg. Cape Coast"
                        }
                      />
                    )}
                  />
                  <Stack direction="row" spacing={2}>
                    <TextField
                      size="small"
                      label="Vehicle Registration Number"
                      value={vehicleNo}
                      fullWidth
                      onChange={(e) => setVehicleNo(e.target.value)}
                      error={Boolean(touched.vehicleNo && errors.vehicleNo)}
                      helperText={touched.vehicleNo && errors.vehicleNo}
                    />
                    <TextField
                      size="small"
                      label="Number Of Seats"
                      value={noOfSeats}
                      fullWidth
                      onChange={(e) => setNoOfSeats(e.target.value)}
                      error={Boolean(touched.noOfSeats && errors.noOfSeats)}
                      helperText={touched.noOfSeats && errors.noOfSeats}
                    />
                  </Stack>

                  <TextField
                    size="small"
                    type="number"
                    inputMode="decimal"
                    label="Fare"
                    fullWidth
                    placeholder="Price here"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
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

                  <CustomDatePicker
                    label="Departure Date"
                    value={date}
                    setValue={setDate}
                    error={Boolean(touched.date && errors.date)}
                    helperText={touched.date && errors.date}
                  />
                  <Stack direction="row" spacing={2}>
                    <CustomTimePicker
                      label="Boarding Time"
                      value={report}
                      setValue={setReport}
                      error={Boolean(touched.report && errors.report)}
                      helperText={touched.report && errors.report}
                    />
                    <CustomTimePicker
                      label="Departure Time"
                      value={time}
                      setValue={setTime}
                      error={Boolean(touched.time && errors.time)}
                      helperText={touched.time && errors.time}
                    />
                  </Stack>
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
            <DialogActions sx={{ padding: 1 }}>
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
                  Add Ticket
                </LoadingButton>
              </Container>
            </DialogActions>
          </Dialog>
        );
      }}
    </Formik>
  );
};

export default AddBusCategory;
