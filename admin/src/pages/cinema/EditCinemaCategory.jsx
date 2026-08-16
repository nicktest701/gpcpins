import { useContext, useRef, useState, useEffect } from "react";
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  TextField,
  Typography,
  LinearProgress,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { Close, CloudUpload } from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { v4 as uuid } from "uuid";
import _ from "lodash";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import Swal from "sweetalert2";
import DOMPurify from "dompurify";

import DialogContainer from "../../components/dialogs/DialogContainer";
import Transition from "../../components/Transition";
import CustomDatePicker from "../../components/inputs/CustomDatePicker";
import CustomTimePicker from "../../components/inputs/CustomTimePicker";
import { CINEMA_TICKET_TYPE } from "../../mocks/columns";
import { currencyFormatter } from "../../constants";
import { globalAlertType } from "../../components/alert/alertType";
import { addCinemaValidationSchema } from "../../config/validationSchema";
import { editCategory, getCategory } from "../../api/categoryAPI";
import { uploadFile } from "@/lib/upload";
import { useCustomContext } from "../../context/providers/CustomProvider";

const EditCinemaCategory = () => {
  const queryClient = useQueryClient();
  const {
    customState: {
      editCinemaCategory: { open, id },
    },
    customDispatch,
  } = useCustomContext();

  // Local state for ticket pricing list
  const [pricingList, setPricingList] = useState([]);
  const [pricingError, setPricingError] = useState("");
  const [pricingType, setPricingType] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);

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
    resolver: yupResolver(addCinemaValidationSchema),
    defaultValues: {
      category: "cinema",
      companyName: "",
      voucherType: "",
      theatre: "",
      location: "",
      date: moment(),
      time: moment(),
      message: "",
      description: "",
    },
  });

  // Fetch existing data
  const { data: cinemaData, isLoading: isLoadingData } = useQuery({
    queryKey: ["category", id],
    queryFn: () => getCategory(id),
    initialData: queryClient
      .getQueryData(["all-category"])
      ?.find((item) => item?.id === id),
    enabled: !!id && open,
  });

  // Populate form when data loads
  useEffect(() => {
    if (cinemaData && open) {
      const details = cinemaData.details || {};
      setValue("companyName", details.companyName || "");
      setValue("voucherType", cinemaData.name || "");
      setValue("theatre", details.theatre || "");
      setValue("location", details.location || "");
      setValue("date", details.date ? moment(details.date) : moment());
      setValue("time", details.time ? moment(details.time) : moment());
      setValue("message", details.message || "");
      setValue("description", details.description || "");
      setPricingList(details.pricing || []);
      setLogoPreview(details.cinema);
      setLogoFile(details.cinema);
    }
  }, [cinemaData, open, setValue]);

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

  // Add ticket pricing
  const handleAddTicketType = () => {
    setPricingError("");
    if (!pricingType.trim()) {
      setPricingError("Required*");
      return;
    }
    if (!quantity || quantity <= 0) {
      setPricingError("Valid quantity is required");
      return;
    }
    if (!price || price <= 0) {
      setPricingError("Valid price is required");
      return;
    }

    const newItem = {
      id: uuid(),
      type: pricingType.trim().toUpperCase(),
      quantity: Number(quantity),
      price: Number(price),
    };
    setPricingList((prev) =>
      _.orderBy(
        _.values(_.merge(_.keyBy([...prev, newItem], "type"))),
        "type",
        "asc"
      )
    );
    setPricingType("");
    setQuantity(0);
    setPrice(0);
  };

  const handleRemoveTicketType = (id) => {
    setPricingList((prev) => prev.filter((item) => item.id !== id));
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
      type: "openEditCinemaCategory",
      payload: { open: false, id: "" },
    });
    reset();
  };

  const onSubmit = (values) => {
    if (pricingList.length === 0) {
      setPricingError("Please add at least one ticket type");
      return;
    }

    Swal.fire({
      title: "Save Changes?",
      text: "Are you sure you want to update this cinema ticket?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, save",
    }).then((result) => {
      if (result.isConfirmed) {
        const payload = {
          id: cinemaData?.id,
          type: values.category,
          name: values.voucherType,
          details: {
            movie: DOMPurify.sanitize(values.voucherType),
            theatre: DOMPurify.sanitize(values.theatre),
            pricing: pricingList,
            location: DOMPurify.sanitize(values.location),
            quantity: parseInt(_.sumBy(pricingList, "quantity")),
            date: values.date,
            time: values.time,
            message: DOMPurify.sanitize(values.message),
            description: DOMPurify.sanitize(values.description),
            companyName: DOMPurify.sanitize(values.companyName),
            cinema: logoFile || cinemaData?.details?.cinema,
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
        Cover Image
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
      title="Edit Cinema Ticket"
      subtitle="Update cinema or event ticket details"
      loading={isSubmitting || isLoading || isUploading}
      disabled={isUploading}
      onConfirm={handleSubmit(onSubmit)}
      confirmText="Save Changes"
      maxWidth="md"
      contentSx={{ overflow: "auto" }}
    >
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

        {/* Movie Name */}
        <Controller
          name="voucherType"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Movie Name"
              fullWidth
              required
              error={!!errors.voucherType}
              helperText={errors.voucherType?.message}
            />
          )}
        />

        {/* Ticket Pricing */}
        <Box>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Ticket Pricing
          </Typography>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1} mb={2}>
            <Autocomplete
              options={CINEMA_TICKET_TYPE}
              freeSolo
              fullWidth
              value={pricingType}
              onInputChange={(_, val) => setPricingType(val)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Ticket Type"
                  error={!!pricingError}
                  helperText={pricingError}
                />
              )}
            />
            <TextField
              type="number"
              label="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              sx={{ minWidth: 100 }}
            />
            <TextField
              type="number"
              label="Price (GH¢)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">GH¢</InputAdornment>
                ),
              }}
              sx={{ minWidth: 120 }}
            />
            <Button
              variant="contained"
              onClick={handleAddTicketType}
              sx={{ whiteSpace: "nowrap",borderRadius:1.2 }}
            >
              Add
            </Button>
          </Stack>
          {pricingError && (
            <Typography color="error" variant="caption">
              {pricingError}
            </Typography>
          )}
          {pricingList.length > 0 && (
            <List
              sx={{
                maxHeight: 200,
                overflow: "auto",
                bgcolor: "action.hover",
                borderRadius: 1,
                p: 1,
              }}
            >
              {pricingList.map((item) => (
                <ListItem key={item.id} sx={{ py: 0.5 }}>
                  <ListItemText
                    primary={`${item.type} (${item.quantity})`}
                    secondary={currencyFormatter(item.price)}
                    primaryTypographyProps={{ variant: "body2" }}
                    secondaryTypographyProps={{ variant: "caption" }}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => handleRemoveTicketType(item.id)}
                      aria-label="remove"
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        {/* Theatre & Location */}
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <Controller
            name="theatre"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Cinema / Theatre Name"
                fullWidth
                required
                error={!!errors.theatre}
                helperText={errors.theatre?.message}
              />
            )}
          />
          <Controller
            name="location"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Cinema / Theatre Location"
                fullWidth
                required
                error={!!errors.location}
                helperText={errors.location?.message}
              />
            )}
          />
        </Stack>

        {/* Date & Time */}
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <CustomDatePicker
                label="Date"
                value={field.value}
                setValue={(val) => setValue("date", val)}
                error={!!errors.date}
                helperText={errors.date?.message}
                minDate={moment()}
              />
            )}
          />
          <Controller
            name="time"
            control={control}
            render={({ field }) => (
              <CustomTimePicker
                label="Time"
                value={field.value}
                setValue={(val) => setValue("time", val)}
                error={!!errors.time}
                helperText={errors.time?.message}
              />
            )}
          />
        </Stack>

        {/* Description */}
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Movie Description"
              multiline
              rows={3}
              fullWidth
              error={!!errors.description}
              helperText={errors.description?.message}
            />
          )}
        />

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
    </DialogContainer>
  );
};

export default EditCinemaCategory;