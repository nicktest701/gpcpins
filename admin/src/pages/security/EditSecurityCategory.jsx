import { useRef, useState, useEffect } from "react";
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  LinearProgress,
} from "@mui/material";

import { CloudUpload } from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import Swal from "sweetalert2";
import DOMPurify from "dompurify";

import DialogContainer from "../../components/dialogs/DialogContainer";
import CustomYearPicker from "../../components/inputs/CustomYearPicker";
import { CATEGORY } from "../../constants";
import { globalAlertType } from "../../components/alert/alertType";
import { addWaecValidationSchema } from "../../config/validationSchema";
import { editCategory, getCategory } from "../../api/categoryAPI";
import { uploadFile } from "@/lib/upload";
import { useCustomContext } from "../../context/providers/CustomProvider";

const EditSecurityCategory = () => {
  const queryClient = useQueryClient();
  const {
    customState: {
      editSecurityCategory: { open, id },
    },
    customDispatch,
  } = useCustomContext();

  // Local state
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [year, setYear] = useState(moment().format("YYYY"));

  const fileInputRef = useRef(null);

  // React Hook Form
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(addWaecValidationSchema),
    defaultValues: {
      category: "security",
      voucherType: "",
      price: "",
      voucherURL: "",
    },
  });

  // Fetch existing data
  const { data: securityData} = useQuery({
    queryKey: ["category", id],
    queryFn: () => getCategory(id),
    initialData: queryClient
      .getQueryData(["all-category"])
      ?.find((item) => item?.id === id),
    enabled: !!id && open,
  });

  // Populate form when data loads
  useEffect(() => {
    if (securityData && open) {
      setValue("voucherType", securityData.name || "");
      setValue("price", securityData.price || "");
      setValue("voucherURL", securityData.details?.voucherURL || "");
      setYear(securityData.year?.toString() || moment().format("YYYY"));
      setLogoPreview(securityData.details?.logo);
      setLogoFile(securityData.details?.logo);
    }
  }, [securityData, open, setValue]);

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
    mutationFn: editCategory,
    onSuccess: (data) => {
      customDispatch(globalAlertType("info", data));
      handleClose();
      queryClient.invalidateQueries(["category"]);
    },
    onError: (error) => {
      customDispatch(globalAlertType("error", error));
    },
  });

  const handleClose = () => {
    customDispatch({
      type: "openEditSecurityCategory",
      payload: { open: false, id: "" },
    });
    reset();
    setLogoFile(null);
    setLogoPreview(null);
    setYear(moment().format("YYYY"));
  };

  const onSubmit = (values) => {
    Swal.fire({
      title: "Save Changes?",
      text: "Are you sure you want to update this security service category?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, save",
    }).then((result) => {
      if (result.isConfirmed) {
        const isProtocolPresent = values.voucherURL?.includes("http");
        const payload = {
          id: securityData?.id,
          type: values.category,
          name: values.voucherType,
          price: DOMPurify.sanitize(values.price),
          details: {
            voucherURL: isProtocolPresent
              ? values.voucherURL
              : `https://${values.voucherURL}`,
            logo: logoFile || securityData?.details?.logo,
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
    <DialogContainer
      open={open}
      onClose={handleClose}
      title="Edit Security Service"
      subtitle="Update security service category details"
      loading={isSubmitting || isLoading || isUploading}
      disabled={isUploading}
      onConfirm={handleSubmit(onSubmit)}
      confirmText="Save Changes"
      maxWidth="md"
      contentSx={{ overflow: "auto" }}
    >
      <Stack spacing={3}>
        {/* Logo Upload */}
        <LogoSection />

        {/* Security Service Name */}
        <Controller
          name="voucherType"
          control={control}
          render={({ field }) => (
            <Autocomplete
              freeSolo
              options={CATEGORY.security}
              noOptionsText="No option available"
              isOptionEqualToValue={(option, value) => option === value}
              onInputChange={(_, value) => {
                setValue("voucherType", value);
              }}
              value={field.value || null}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Security Service"
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
              label="Security Service Website URL"
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
    </DialogContainer>
  );
};

export default EditSecurityCategory;