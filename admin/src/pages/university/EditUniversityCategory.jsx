import { useContext, useRef, useState } from "react";
import { LoadingButton } from "@mui/lab";
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Formik } from "formik";
import { CustomContext } from "../../context/providers/CustomProvider";
import { editCategory, getCategory } from "../../api/categoryAPI";
import Transition from "../../components/Transition";
import { UNIVERSITY_FORM_TYPE } from "../../mocks/columns";
import { globalAlertType } from "../../components/alert/alertType";
import { CATEGORY } from "../../constants";
import moment from "moment";
import CustomYearPicker from "../../components/inputs/CustomYearPicker";
import { addUniversityValidationSchema } from "../../config/validationSchema";

import DOMPurify from "dompurify";
import { uploadFile } from "@/lib/upload";
import { CloudUpload } from "@mui/icons-material";

const EditUniversityCategory = () => {
  //context
  const queryClient = useQueryClient();
  const {
    customState: {
      editUniversityCategory: { open, id },
    },
    customDispatch,
  } = useContext(CustomContext);

  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [voucherType, setVoucherType] = useState("");
  const [voucherURL, setVoucherURL] = useState("");
  const [formType, setFormType] = useState("");
  const [price, setPrice] = useState(Number(0));
  const [year, setYear] = useState(moment().format("YYYY"));

  // Upload file ref
  const fileInputRef = useRef(null);

  const initialValues = {
    category: "university",
    voucherType,
    voucherURL,
    formType,
    price,
  };

  const university = useQuery({
    queryKey: ["category", id],
    queryFn: () => getCategory(id),
    initialData: queryClient
      .getQueryData(["all-category"])
      ?.find((item) => item?.id === id),
    enabled: !!id,
    onSuccess: (university) => {
      setVoucherType(university.name);
      setFormType(university?.details?.formType);
      setVoucherURL(university?.details?.voucherURL);
      setPrice(university.price);
      setYear(university.year);
      setLogo(university?.details?.logo);
      setLogoPreview(university?.details?.logo);
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
      console.log(error);
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
    const isProtocolPresent = values.voucherURL?.includes("http");

    const newUniversityForm = {
      id: university.data?.id,
      type: values.category,
      name: values.voucherType,
      price: DOMPurify.sanitize(values.price),
      details: {
        formType: DOMPurify.sanitize(values.formType),
        voucherURL: isProtocolPresent
          ? values.voucherURL
          : `https://${values.voucherURL}`,
        logo: logo || university?.data?.details?.logo,
      },
      year,
    };

    mutateAsync(newUniversityForm, {
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

  ///Close Add Category
  const handleClose = () => {
    customDispatch({
      type: "openEditUniversityCategory",
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
    <Formik
      initialValues={initialValues}
      validationSchema={addUniversityValidationSchema}
      onSubmit={onSubmit}
      enableReinitialize={true}
    >
      {({ errors, touched, handleSubmit }) => {
        return (
          <Dialog
            maxWidth="xs"
            fullWidth
            TransitionComponent={Transition}
            open={open}
            onClose={handleClose}
          >
            <DialogTitle>New University</DialogTitle>
            <DialogContent>
              <Stack rowGap={2} paddingY={2}>
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

                <Autocomplete
                  options={CATEGORY.university}
                  freeSolo
                  noOptionsText="No form available"
                  value={voucherType || null}
                  onInputChange={(e, value) => setVoucherType(value)}
                  isOptionEqualToValue={(option, value) => option === value}
                  renderInput={(props) => (
                    <TextField
                      {...props}
                      label="University"
                      error={Boolean(touched.voucherType && errors.voucherType)}
                      helperText={touched.voucherType && errors.voucherType}
                    />
                  )}
                />
                <Autocomplete
                  options={UNIVERSITY_FORM_TYPE}
                  freeSolo
                  noOptionsText="No option available"
                  value={formType || null}
                  onInputChange={(e, value) => setFormType(value)}
                  isOptionEqualToValue={(option, value) => option === value}
                  renderInput={(props) => (
                    <TextField
                      {...props}
                      label="Form Type"
                      error={Boolean(touched.formType && errors.formType)}
                      helperText={touched.formType && errors.formType}
                    />
                  )}
                />

                <CustomYearPicker label="Year" year={year} setYear={setYear} />

                <TextField
                  type="number"
                  inputMode="decimal"
                  label="Price"
                  placeholder="Price here"
                  value={price || 0}
                  onChange={(e) => setPrice(e.target.value)}
                  error={Boolean(touched.price && errors.price)}
                  helperText={touched.price && errors.price}
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
                />
                <TextField
                  type="url"
                  inputMode="url"
                  label="University Website URL"
                  value={voucherURL || ""}
                  onChange={(e) => setVoucherURL(e.target.value)}
                  error={Boolean(touched.voucherURL && errors.voucherURL)}
                  helperText={
                    errors.voucherURL
                      ? errors.voucherURL
                      : "eg. www.example.com"
                  }
                />
              </Stack>
            </DialogContent>
            <DialogActions sx={{ padding: 1 }}>
              <Button onClick={handleClose}>Cancel</Button>
              <LoadingButton
                variant="contained"
                loading={isLoading || loading}
                disabled={isLoading || loading}
                onClick={handleSubmit}
              >
                Save Changes
              </LoadingButton>
            </DialogActions>
          </Dialog>
        );
      }}
    </Formik>
  );
};

export default EditUniversityCategory;
