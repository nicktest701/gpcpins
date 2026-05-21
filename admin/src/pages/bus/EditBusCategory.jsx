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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Formik } from "formik";
import { CustomContext } from "../../context/providers/CustomProvider";
import { editCategory, getCategory } from "../../api/categoryAPI";
import CustomTimePicker from "../../components/inputs/CustomTimePicker";
import CustomDatePicker from "../../components/inputs/CustomDatePicker";
import moment from "moment";
import { globalAlertType } from "../../components/alert/alertType";
import { TOWNS } from "../../mocks/towns";
import CustomDialogTitle from "../../components/dialogs/CustomDialogTitle";
import { addBusValidationSchema } from "../../config/validationSchema";
import Compressor from "compressorjs";
import { Avatar, Box, CircularProgress, Container } from "@mui/material";
import DOMPurify from "dompurify";
import { uploadFile } from "@/lib/upload";
import { CloudUpload } from "@mui/icons-material";
const EditBusCategory = () => {
  //context
  const queryClient = useQueryClient();
  const {
    customState: {
      editBusCategory: { open, id },
    },
    customDispatch,
  } = useContext(CustomContext);

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
  const [message, setMessage] = useState("");
  const [companyName, setCompanyName] = useState("");

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

  const bus = useQuery({
    queryKey: ["category", id],
    queryFn: () => getCategory(id),
    initialData: queryClient
      .getQueryData(["all-category"])
      ?.find((item) => item?.id === id),
    enabled: !!id,
    onSuccess: (bus) => {
      setOrigin(bus?.details?.origin);
      setDestination(bus?.details?.destination);
      setPrice(bus?.price);
      setVehicleNo(bus?.details?.vehicleNo);
      setNoOfSeats(bus?.details?.noOfSeats);
      setReport(moment(bus?.details?.report));
      setTime(moment(bus?.details?.time));
      setDate(moment(bus?.details?.date));
      setMessage(bus?.details?.message);
      setCompanyName(bus?.details?.companyName);
      setLogoPreview(bus?.details?.logo);
      setLogo(bus?.details?.logo);
    },
  });

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
    mutationFn: editCategory,
  });
  const onSubmit = (values, option) => {
    const newBusTicket = {
      id: bus?.data?.id,
      type: values.category,
      name: `${values.origin} to ${values.destination}`,
      price: values.price,
      details: {
        origin: DOMPurify.sanitize(values.origin),
        destination: DOMPurify.sanitize(values.destination),
        vehicleNo: values.vehicleNo?.toUpperCase(),
        noOfSeats: DOMPurify.sanitize(values.noOfSeats),
        date: values.date,
        time: values.time,
        report: values.report,
        message: DOMPurify.sanitize(values.message),
        companyName: DOMPurify.sanitize(values.companyName),
        logo: logo || bus?.data?.details?.logo,
      },
    };

    // if (_.isEmpty(logo) || _.isNull(logo)) {
    //   delete newBusTicket.details?.logo;
    // }

    mutateAsync(newBusTicket, {
      onSettled: () => {
        option.setSubmitting(false);
        queryClient.invalidateQueries(["category"]);
      },
      onSuccess: (data) => {
        customDispatch(globalAlertType("info", data));
        option.resetForm();
        handleClose();
      },
      onError: (error) => {
        customDispatch(globalAlertType("error", error));
      },
    });
  };

  ///Close Edit Bus Category
  const handleClose = () => {
    customDispatch({
      type: "openEditBusCategory",
      payload: {
        open: false,
        id: "",
      },
    });
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
          <Dialog maxWidth="md" fullWidth open={open}>
            <CustomDialogTitle title="Edit Bus Ticket" onClose={handleClose} />
            {bus.isLoading ? (
              <CircularProgress />
            ) : (
              <>
                <DialogContent>
                  <Container maxWidth="md">
                    <Stack rowGap={2} paddingY={2}>
                      <TextField
                        size="small"
                        label="Company"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        error={Boolean(
                          touched.companyName && errors.companyName,
                        )}
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
                      <TextField
                        size="small"
                        label="Vehicle Registration Number"
                        value={vehicleNo}
                        onChange={(e) => setVehicleNo(e.target.value)}
                        error={Boolean(touched.vehicleNo && errors.vehicleNo)}
                        helperText={touched.vehicleNo && errors.vehicleNo}
                      />
                      <TextField
                        size="small"
                        label="Number Of Seats"
                        value={noOfSeats}
                        onChange={(e) => setNoOfSeats(e.target.value)}
                        error={Boolean(touched.noOfSeats && errors.noOfSeats)}
                        helperText={touched.noOfSeats && errors.noOfSeats}
                      />

                      <TextField
                        size="small"
                        type="number"
                        inputMode="decimal"
                        label="Fare"
                        placeholder="Price here"
                        value={price || "0"}
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
                        value={message || ""}
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
                      Save Changes
                    </LoadingButton>
                  </Container>
                </DialogActions>
              </>
            )}
          </Dialog>
        );
      }}
    </Formik>
  );
};

export default EditBusCategory;
