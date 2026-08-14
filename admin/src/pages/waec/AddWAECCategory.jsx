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
  LinearProgress,
  alpha,
  Divider,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { Close, CloudUpload } from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { v4 as uuid } from "uuid";
import _ from "lodash";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import Swal from "sweetalert2";

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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef(null);

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(addWaecValidationSchema),
    defaultValues: {
      category: "waec",
      voucherType: "",
      sellingPrice: "",
      voucherURL: "",
    },
  });

  // Mutation for adding category
  const { mutateAsync, isLoading } = useMutation({
    mutationFn: postCategory,
    onSuccess: (data) => {
      customDispatch(globalAlertType("info", data));
      handleClose();
      reset();
      setPricingList([]);
      setLogoFile(null);
      setLogoPreview(null);
      setPricingType("");
      setPrice(0);
      setYear(moment().format("YYYY"));
      queryClient.invalidateQueries(["category"]);
    },
    onError: (error) => {
      customDispatch(globalAlertType("error", error));
    },
  });

  const handleClose = () => {
    customDispatch({ type: "openAddWaecCategory", payload: { open: false } });
    reset();
  };

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
        globalAlertType("error", "Logo upload failed. Please try again.")
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
        "asc"
      )
    );
    setPricingType("");
    setPrice(0);
  };

  const handleRemoveTicketType = (id) => {
    setPricingList((prev) => prev.filter((item) => item.id !== id));
  };

  // Submit handler with SweetAlert
  const onSubmit = (values) => {
    if (pricingList.length === 0) {
      setPricingError("Please add at least one ticket price");
      return;
    }

    Swal.fire({
      title: "Add New WAEC Checker?",
      text: "Are you sure you want to create this new WAEC checker?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, add",
    }).then((result) => {
      if (result.isConfirmed) {
        const isProtocolPresent = values.voucherURL?.includes("http");
        const newCategory = {
          type: values.category,
          name: values.voucherType,
          price: values.sellingPrice,
          details: {
            price: values.sellingPrice,
            logo: logoFile,
            voucherURL: isProtocolPresent
              ? values.voucherURL
              : `https://${values.voucherURL}`,
            pricing: pricingList,
          },
          year,
        };
        mutateAsync(newCategory);
      }
    });
  };

  // Logo preview component
  const LogoSection = () => (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Category Logo
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
    <Dialog
      maxWidth="md"
      fullWidth
      TransitionComponent={Transition}
      open={customState.category.open}
      onClose={handleClose}
  PaperProps={{
    elevation: 8,
    sx: {
      borderRadius: 3,
      maxHeight: "90vh",
      overflow: "hidden", // 1. Keeps the outer container bound to maxheight without a scrollbar
      bgcolor: "background.paper",
      boxShadow: (theme) =>
        `0 20px 60px ${alpha(theme.palette.common.black, 0.15)}`,
      // 2. Moved inside the sx object to target the Paper element correctly
      "&::-webkit-scrollbar": {
        display: "none",
      },
      scrollbarWidth: "none", // For Firefox compatibility
    },
  }}
    >
      <DialogTitle
        sx={{
          bgcolor: "primary.main",
          color: "primary.contrastText",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" component="span" fontWeight="bold">
          Add New  Checker
        </Typography>
        <IconButton onClick={handleClose} sx={{ color: "primary.contrastText" }}>
          <Close />
        </IconButton>
      </DialogTitle>

 <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'contents' }}>
        <DialogContent
      dividers
      sx={{
        overflow: "auto",
        p: 3,
        // Custom scrollbar (WebKit)
        "&::-webkit-scrollbar": {
          width: 6,
        },
        "&::-webkit-scrollbar-track": {
          background: "transparent",
        },
        "&::-webkit-scrollbar-thumb": {
          background: (theme) => alpha(theme.palette.primary.main, 0.4),
          borderRadius: 3,
          "&:hover": {
            background: (theme) => alpha(theme.palette.primary.main, 0.6),
          },
        },
      }}
    >
          <Stack spacing={3}>
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
                      label="Checker Name"
                      required
                      error={!!errors.voucherType}
                      helperText={errors.voucherType?.message}
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
            />

            {/* Selling Price */}
            <Controller
              name="sellingPrice"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  label="Selling Price (GH¢)"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">GH¢</InputAdornment>
                    ),
                  }}
                  error={!!errors.sellingPrice}
                  helperText={errors.sellingPrice?.message}
                />
              )}
            />

            {/* Ticket Pricing */}
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Ticket Pricing
              </Typography>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={1}
                mb={2}
              >
                <Autocomplete
                  options={WAEC_VOUCHER_PRICING}
                  freeSolo
                  fullWidth
                  value={pricingType}
                  onInputChange={(_, val) => setPricingType(val)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Quantity / Type"
                      error={!!pricingError}
                      helperText={pricingError}
                    />
                  )}
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
                  sx={{ whiteSpace: "nowrap" ,borderRadius:1.2}}
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
                  label="Website URL"
                  type="url"
                  placeholder="eg. www.example.com"
                  error={!!errors.voucherURL}
                  helperText={
                    errors.voucherURL?.message || "Include https:// if needed"
                  }
                />
              )}
            />

            {/* Logo Upload */}
            <LogoSection />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting || isLoading}
            disabled={isUploading}
          >
            Add Checker
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddWAECCategory;