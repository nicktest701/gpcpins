import { useContext, useState, useEffect, useRef } from "react";
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Container,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  LinearProgress,
  CircularProgress,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { CloudUpload } from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import Swal from "sweetalert2";
import DOMPurify from "dompurify";

import DialogContainer from "../../components/dialogs/DialogContainer";
import Transition from "../../components/Transition";
import CustomDatePicker from "../../components/inputs/CustomDatePicker";
import CustomTimePicker from "../../components/inputs/CustomTimePicker";
import { TOWNS } from "../../mocks/towns";
import { globalAlertType } from "../../components/alert/alertType";
import { addBusValidationSchema } from "../../config/validationSchema";
import { editCategory, getCategory } from "../../api/categoryAPI";
import { uploadFile } from "@/lib/upload";
import { useCustomContext } from "../../context/providers/CustomProvider";

const EditBusCategory = () => {
  const queryClient = useQueryClient();
  const {
    customState: {
      editBusCategory: { open, id },
    },
    customDispatch,
  } = useCustomContext();

  // Logo upload state
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef(null);

  // React Hook Form
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(addBusValidationSchema),
    defaultValues: {
      category: "bus",
      companyName: "",
      origin: "",
      destination: "",
      vehicleNo: "",
      noOfSeats: "",
      price: "",
      date: moment(),
      report: moment(),
      time: moment(),
      message: "",
    },
  });

  // Fetch existing data
  const { data: busData, isLoading: isLoadingData } = useQuery({
    queryKey: ["category", id],
    queryFn: () => getCategory(id),
    initialData: queryClient
      .getQueryData(["all-category"])
      ?.find((item) => item?.id === id),
    enabled: !!id && open,
  });

  // Populate form when data loads
  useEffect(() => {
    if (busData && open) {
      const details = busData.details || {};
      setValue("companyName", details.companyName || "");
      setValue("origin", details.origin || "");
      setValue("destination", details.destination || "");
      setValue("vehicleNo", details.vehicleNo || "");
      setValue("noOfSeats", details.noOfSeats || "");
      setValue("price", busData.price || "");
      setValue("date", details.date ? moment(details.date) : moment());
      setValue("report", details.report ? moment(details.report) : moment());
      setValue("time", details.time ? moment(details.time) : moment());
      setValue("message", details.message || "");
      setLogoPreview(details.logo);
      setLogoFile(details.logo);
    }
  }, [busData, open, setValue]);

  // Upload logo with progress
  const handleUploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const reader = new FileReader();
      reader.onload = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);

      const { downloadURL } = await uploadFile({
        folder: "category",
        file,
        onProgress: (progress) => setUploadProgress(progress),
      });
      setLogoFile(downloadURL);
    } catch (error) {
      customDispatch(
        globalAlertType("error", "Image upload failed. Please try again.")
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Mutation
  const { mutateAsync, isLoading } = useMutation({
    mutationFn: editCategory,
    onSuccess: (data) => {
      customDispatch(globalAlertType("success", data));
      handleClose();
      queryClient.invalidateQueries(["category"]);
      queryClient.invalidateQueries(["all-category"]);
    },
    onError: (error) => {
      customDispatch(globalAlertType("error", error));
    },
  });

  const handleClose = () => {
    customDispatch({
      type: "openEditBusCategory",
      payload: { open: false, id: "" },
    });
    reset();
  };

  const onSubmit = (values) => {
    Swal.fire({
      title: "Save Changes?",
      text: "Are you sure you want to update this bus ticket?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, save",
    }).then((result) => {
      if (result.isConfirmed) {
        const payload = {
          id: busData?.id,
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
            logo: logoFile || busData?.details?.logo,
          },
        };
        mutateAsync(payload);
      }
    });
  };

  // Logo preview component
  const LogoSection = () => (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Bus Image
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
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
          disabled={isUploading}
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
      {isUploading && (
        <Box sx={{ width: "100%", mt: 1 }}>
          <LinearProgress variant="determinate" value={uploadProgress} />
          <Typography variant="caption" color="text.secondary">
            Uploading... {Math.round(uploadProgress)}%
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <DialogContainer
      open={open}
      onClose={handleClose}
      title="Edit Bus Ticket"
      subtitle="Update bus ticket details"
      loading={isSubmitting || isLoading || isUploading}
      disabled={isUploading}
      onConfirm={handleSubmit(onSubmit)}
      confirmText="Save Changes"
      maxWidth="md"
      contentSx={{ overflow: "auto" }}
    >
      {isLoadingData ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={3}>
          {/* Company Name */}
          <Controller
            name="companyName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Company Name"
                fullWidth
                error={!!errors.companyName}
                helperText={errors.companyName?.message}
              />
            )}
          />

          {/* Logo Upload */}
          <LogoSection />

          {/* Origin */}
          <Controller
            name="origin"
            control={control}
            render={({ field }) => (
              <Autocomplete
                freeSolo
                options={TOWNS}
                noOptionsText="No towns available"
                isOptionEqualToValue={(option, value) => option === value}
                onInputChange={(_, value) => {
                  setValue("origin", value);
                }}
                value={field.value || null}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Origin (From)"
                    required
                    error={!!errors.origin}
                    helperText={errors.origin?.message || "e.g. Kumasi"}
                  />
                )}
              />
            )}
          />

          {/* Destination */}
          <Controller
            name="destination"
            control={control}
            render={({ field }) => (
              <Autocomplete
                freeSolo
                options={TOWNS}
                noOptionsText="No towns available"
                isOptionEqualToValue={(option, value) => option === value}
                onInputChange={(_, value) => {
                  setValue("destination", value);
                }}
                value={field.value || null}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Destination (To)"
                    required
                    error={!!errors.destination}
                    helperText={errors.destination?.message || "e.g. Cape Coast"}
                  />
                )}
              />
            )}
          />

          {/* Vehicle & Seats */}
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <Controller
              name="vehicleNo"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Vehicle Registration Number"
                  fullWidth
                  error={!!errors.vehicleNo}
                  helperText={errors.vehicleNo?.message}
                />
              )}
            />
            <Controller
              name="noOfSeats"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  label="Number of Seats"
                  fullWidth
                  error={!!errors.noOfSeats}
                  helperText={errors.noOfSeats?.message}
                />
              )}
            />
          </Stack>

          {/* Price */}
          <Controller
            name="price"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label="Fare (GH¢)"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">GH¢</InputAdornment>
                  ),
                }}
                error={!!errors.price}
                helperText={errors.price?.message}
              />
            )}
          />

          {/* Departure Date */}
          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <CustomDatePicker
                label="Departure Date"
                value={field.value}
                setValue={(val) => setValue("date", val)}
                error={!!errors.date}
                helperText={errors.date?.message}
                minDate={moment()}
              />
            )}
          />

          {/* Times */}
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <Controller
              name="report"
              control={control}
              render={({ field }) => (
                <CustomTimePicker
                  label="Boarding Time"
                  value={field.value}
                  setValue={(val) => setValue("report", val)}
                  error={!!errors.report}
                  helperText={errors.report?.message}
                />
              )}
            />
            <Controller
              name="time"
              control={control}
              render={({ field }) => (
                <CustomTimePicker
                  label="Departure Time"
                  value={field.value}
                  setValue={(val) => setValue("time", val)}
                  error={!!errors.time}
                  helperText={errors.time?.message}
                />
              )}
            />
          </Stack>

          {/* Message */}
          <Controller
            name="message"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Additional Message"
                multiline
                rows={2}
                fullWidth
                error={!!errors.message}
                helperText={errors.message?.message}
              />
            )}
          />
        </Stack>
      )}
    </DialogContainer>
  );
};

export default EditBusCategory;