import {  useRef, useState, useEffect } from "react";
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
import { UNIVERSITY_FORM_TYPE } from "../../mocks/columns";
import { CATEGORY } from "../../constants";
import { globalAlertType } from "../../components/alert/alertType";
import { addUniversityValidationSchema } from "../../config/validationSchema";
import { editCategory, getCategory } from "../../api/categoryAPI";
import { uploadFile } from "@/lib/upload";
import { useCustomContext } from "../../context/providers/CustomProvider";

const EditUniversityCategory = () => {
  const queryClient = useQueryClient();
  const {
    customState: {
      editUniversityCategory: { open, id },
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
    resolver: yupResolver(addUniversityValidationSchema),
    defaultValues: {
      category: "university",
      voucherType: "",
      formType: "",
      price: "",
      voucherURL: "",
    },
  });

  // Fetch existing data
  const { data: universityData } = useQuery({
    queryKey: ["category", id],
    queryFn: () => getCategory(id),
    initialData: queryClient
      .getQueryData(["all-category"])
      ?.find((item) => item?.id === id),
    enabled: !!id && open,
  });

  // Populate form when data loads
  useEffect(() => {
    if (universityData && open) {
      setValue("voucherType", universityData.name || "");
      setValue("formType", universityData.details?.formType || "");
      setValue("price", universityData.price || "");
      setValue("voucherURL", universityData.details?.voucherURL || "");
      setYear(universityData.year?.toString() || moment().format("YYYY"));
      setLogoPreview(universityData.details?.logo);
      setLogoFile(universityData.details?.logo);
    }
  }, [universityData, open, setValue]);

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
        globalAlertType("error", "Logo upload failed. Please try again."),
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
    },
    onError: (error) => {
      customDispatch(globalAlertType("error", error));
    },
  });

  const handleClose = () => {
    customDispatch({
      type: "openEditUniversityCategory",
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
      text: "Are you sure you want to update this university category?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, save",
    }).then((result) => {
      if (result.isConfirmed) {
        const isProtocolPresent = values.voucherURL?.includes("http");
        const payload = {
          id: universityData?.id,
          type: values.category,
          name: values.voucherType,
          price: DOMPurify.sanitize(values.price),
          details: {
            formType: DOMPurify.sanitize(values.formType),
            voucherURL: isProtocolPresent
              ? values.voucherURL
              : `https://${values.voucherURL}`,
            logo: logoFile || universityData?.details?.logo,
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
      title="Edit University Category"
      subtitle="Update university form details"
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
        <CustomYearPicker label="Year" year={year} setYear={setYear} />

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
    </DialogContainer>
  );
};

export default EditUniversityCategory;
