import {  useRef, useState } from "react";
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
  Avatar,
  Box,
  LinearProgress,
  alpha,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { Close, CloudUpload } from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import Swal from "sweetalert2";
import DOMPurify from "dompurify";

import { useCustomContext } from "../../context/providers/CustomProvider";
import { postCategory } from "../../api/categoryAPI";
import Transition from "../../components/Transition";
import { UNIVERSITY_FORM_TYPE } from "../../mocks/columns";
import { globalAlertType } from "../../components/alert/alertType";
import { CATEGORY } from "../../constants";
import CustomYearPicker from "../../components/inputs/CustomYearPicker";
import { addUniversityValidationSchema } from "../../config/validationSchema";
import { uploadFile } from "@/lib/upload";

const AddUniversityCategory = () => {
  const queryClient = useQueryClient();
  const { customState, customDispatch } = useCustomContext();

  // Local state
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [year, setYear] = useState(moment().format("YYYY"));

  const fileInputRef = useRef(null);

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(addUniversityValidationSchema),
    defaultValues: {
      category: "university",
      voucherType: "",
      formType: "",
      price: "",
      voucherURL: "",
    },
  });

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

  // Mutation
  const { mutateAsync, isLoading } = useMutation({
    mutationFn: postCategory,
    onSuccess: (data) => {
      customDispatch(globalAlertType("info", data));
      handleClose();
      reset();
      setLogoFile(null);
      setLogoPreview(null);
      setYear(moment().format("YYYY"));
      queryClient.invalidateQueries(["category"]);
    },
    onError: (error) => {
      customDispatch(globalAlertType("error", error));
    },
  });

  const handleClose = () => {
    customDispatch({
      type: "openAddUniversityCategory",
      payload: { open: false },
    });
    reset();
  };

  const onSubmit = (values) => {
    // SweetAlert confirmation
    Swal.fire({
      title: "Add New University Category?",
      text: "Are you sure you want to create this new university category?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, add",
    }).then((result) => {
      if (result.isConfirmed) {
        const isProtocolPresent = values.voucherURL?.includes("http");
        const payload = {
          type: values.category,
          name: values.voucherType,
          price: DOMPurify.sanitize(values.price),
          details: {
            formType: DOMPurify.sanitize(values.formType),
            voucherURL: isProtocolPresent
              ? values.voucherURL
              : `https://${values.voucherURL}`,
            logo: logoFile,
          },
          year,
        };
        mutateAsync(payload);
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
      open={customState.universityCategory.open}
      onClose={handleClose}
      PaperProps={{
        elevation: 8,
        sx: {
          borderRadius: 3,
          maxHeight: "90vh",
          overflow: "hidden",
          bgcolor: "background.paper",
          boxShadow: (theme) =>
            `0 20px 60px ${alpha(theme.palette.common.black, 0.15)}`,
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
          Add University Category
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
            {/* Logo Upload */}
            <LogoSection />

            {/* University Name */}
            <Controller
              name="voucherType"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  freeSolo
                  options={CATEGORY.university}
                  noOptionsText="No form available"
                  isOptionEqualToValue={(option, value) => option === value}
                  onInputChange={(_, value) => {
                    setValue("voucherType", value);
                  }}
                  value={field.value || null}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="University Name"
                      required
                      error={!!errors.voucherType}
                      helperText={errors.voucherType?.message}
                    />
                  )}
                />
              )}
            />

            {/* Form Type */}
            <Controller
              name="formType"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  freeSolo
                  options={UNIVERSITY_FORM_TYPE}
                  noOptionsText="No option available"
                  isOptionEqualToValue={(option, value) => option === value}
                  onInputChange={(_, value) => {
                    setValue("formType", value);
                  }}
                  value={field.value || null}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Form Type"
                      required
                      error={!!errors.formType}
                      helperText={errors.formType?.message}
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

            {/* Price */}
            <Controller
              name="price"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  label="Price (GH¢)"
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

            {/* Voucher URL */}
            <Controller
              name="voucherURL"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="University Website URL"
                  type="url"
                  placeholder="eg. www.example.com"
                  error={!!errors.voucherURL}
                  helperText={
                    errors.voucherURL?.message || "Include https:// if needed"
                  }
                />
              )}
            />
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
            Add Voucher
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddUniversityCategory;