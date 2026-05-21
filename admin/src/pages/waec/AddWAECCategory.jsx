import { useContext, useState, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  Autocomplete,
  InputAdornment,
  Typography,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  FormHelperText,
  Avatar,
  Box,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { Close, CloudUpload } from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { v4 as uuid } from "uuid";
import _ from "lodash";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import moment from "moment";

import { CustomContext } from "../../context/providers/CustomProvider";
import { postCategory } from "../../api/categoryAPI";
import { CATEGORY, currencyFormatter } from "../../constants";
import { globalAlertType } from "../../components/alert/alertType";
import Transition from "../../components/Transition";
import CustomYearPicker from "../../components/inputs/CustomYearPicker";
import { addWaecValidationSchema } from "../../config/validationSchema";
import { WAEC_VOUCHER_PRICING } from "../../mocks/columns";
import { uploadFile } from "@/lib/upload";

const AddWAECCategory = () => {
  const queryClient = useQueryClient();
  const { customState, customDispatch } = useContext(CustomContext);

  // Local state
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [year, setYear] = useState(moment().format("YYYY"));
  const [pricingList, setPricingList] = useState([]);
  const [pricingError, setPricingError] = useState("");
  const [pricingType, setPricingType] = useState("");
  const [price, setPrice] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  // Upload file ref
  const fileInputRef = useRef(null);

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(addWaecValidationSchema()),
    defaultValues: {
      category: "waec",
      voucherType: "",
      sellingPrice: 0,
      voucherURL: "",
    },
  });
  const category = watch("category");

  // Mutation for adding category
  const { mutateAsync, isLoading } = useMutation({
    mutationFn: postCategory,
    onSettled: () => {
      queryClient.invalidateQueries(["category", category]);
    },
    onSuccess: (data) => {
      customDispatch(globalAlertType("info", data));
      handleClose();
      // Reset form and local state
      reset();
      setPricingList([]);
      setLogoFile(null);
      setLogoPreview(null);
      setPricingType("");
      setPrice(0);
      setYear(moment().format("YYYY"));
    },
    onError: (error) => {
      customDispatch(globalAlertType("error", error));
    },
  });

  const handleClose = () => {
    customDispatch({ type: "openAddWaecCategory", payload: { open: false } });
    reset();
  };

  // Upload logo
  const handleUploadFile = async (e) => {
    setLoading(true);

    try {
      const file = e.target.files[0];
      if (!file) return;
      setLogoFile(file);
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
      setLogoFile(downloadURL); // store final URL
    } catch (error) {
      customDispatch(
        globalAlertType("error", "Something went wrong. Please try again."),
      );
    } finally {
      setLoading(false);
    }
  };

  // Add ticket pricing
  const handleAddTicketType = () => {
    setPricingError("");
    if (!pricingType.trim()) {
      setPricingError("Required*");
      return;
    }
    if (!price || price <= 0) {
      setPricingError("Valid price is required");
      return;
    }

    const newItem = {
      id: uuid(),
      type: pricingType.trim().toUpperCase(),
      price: Number(price),
    };
    setPricingList((prev) =>
      _.orderBy(
        _.values(_.merge(_.keyBy([...prev, newItem], "type"))),
        "type",
        "asc",
      ),
    );
    setPricingType("");
    setPrice(0);
  };

  const handleRemoveTicketType = (id) => {
    setPricingList((prev) => prev.filter((item) => item.id !== id));
  };

  // Submit handler
  const onSubmit = (values) => {
    if (pricingList.length === 0) {
      setPricingError("Please add at least one ticket price");
      return;
    }

    const isProtocolPresent = values.voucherURL?.includes("http");
    const newCategory = {
      type: values.category,
      name: values.voucherType,
      price: values.sellingPrice,
      details: {
        price: values.sellingPrice,
        logo: logoFile, // uploaded URL
        voucherURL: isProtocolPresent
          ? values.voucherURL
          : `https://${values.voucherURL}`,
        pricing: pricingList,
      },
      year,
    };

    mutateAsync(newCategory);
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
        {logoPreview ? "Change Logo" : "Upload Logo"}
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
    <Dialog
      maxWidth="md"
      fullWidth
      TransitionComponent={Transition}
      open={customState.category.open}
      onClose={handleClose}
    >
      <DialogTitle>Add New WAEC Checker</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {/* WAEC Checker Name */}
            <Controller
              name="voucherType"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  freeSolo
                  options={CATEGORY.exams}
                  noOptionsText="No option available"
                  isOptionEqualToValue={(option, value) => option === value}
                  onInputChange={(_, value) => {
                    setValue("voucherType", value);
                  }}
                  value={field.value || null}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="WAEC Checker Name"
                      required
                      error={!!errors.voucherType}
                      helperText={errors.voucherType?.message}
                      size="small"
                    />
                  )}
                />
              )}
            />

            {/* Year */}
            <CustomYearPicker
              label="Year"
              year={year}
              setYear={setYear}
              size="small"
            />

            {/* Selling Price */}
            <Controller
              name="sellingPrice"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  label="Selling Price"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">GH¢</InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">p</InputAdornment>
                    ),
                  }}
                  error={!!errors.sellingPrice}
                  helperText={errors.sellingPrice?.message}
                  size="small"
                />
              )}
            />

            {/* Pricing List Section */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Ticket Pricing
              </Typography>
              <Stack direction={{ xs: "column", md: "row" }} spacing={1} mb={2}>
                <Autocomplete
                  options={WAEC_VOUCHER_PRICING}
                  freeSolo
                  fullWidth
                  size="small"
                  value={pricingType}
                  onInputChange={(_, val) => setPricingType(val)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Quantity / Type"
                      error={!!pricingError}
                      helperText={pricingError && " "}
                    />
                  )}
                />
                <TextField
                  type="number"
                  label="Price (GH¢)"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  size="small"
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
                  sx={{ whiteSpace: "nowrap" }}
                >
                  Add
                </Button>
              </Stack>
              {pricingError && (
                <FormHelperText error>{pricingError}</FormHelperText>
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
                        primary={`${item.type} Checker(s) for ${currencyFormatter(item.price)}`}
                        primaryTypographyProps={{
                          variant: "body2",
                          color: "text.primary",
                        }}
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

            {/* Voucher URL */}
            <Controller
              name="voucherURL"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="WAEC Website URL"
                  type="url"
                  placeholder="eg. www.example.com"
                  error={!!errors.voucherURL}
                  helperText={
                    errors.voucherURL?.message || "Include https:// if needed"
                  }
                  size="small"
                />
              )}
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
                Category Logo
              </Typography>
              <LogoPreview />
            </Box>

            
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting || isLoading}
          >
            Add Voucher
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddWAECCategory;
