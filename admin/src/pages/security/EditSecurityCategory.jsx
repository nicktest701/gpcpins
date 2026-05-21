import { useContext, useRef, useState } from "react";
import LoadingButton from "@mui/lab/LoadingButton";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Formik } from "formik";
import { CustomContext } from "../../context/providers/CustomProvider";
import { editCategory, getCategory } from "../../api/categoryAPI";
import { CATEGORY } from "../../constants";
import Transition from "../../components/Transition";
import { globalAlertType } from "../../components/alert/alertType";
import moment from "moment";
import CustomYearPicker from "../../components/inputs/CustomYearPicker";
import { addWaecValidationSchema } from "../../config/validationSchema";
import DOMPurify from "dompurify";
import { Avatar, Box } from "@mui/material";
import { CloudUpload } from "@mui/icons-material";
import { uploadFile } from "@/lib/upload";

const EditSecurityCategory = () => {
  const queryClient = useQueryClient();
  //Context

  const {
    customState: {
      editSecurityCategory: { open, id },
    },
    customDispatch,
  } = useContext(CustomContext);
  //state
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [voucherType, setVoucherType] = useState("");
  const [price, setPrice] = useState(0);
  const [voucherURL, setVoucherURL] = useState("");
  const [year, setYear] = useState(moment().format("YYYY"));

  // Upload file ref
  const fileInputRef = useRef(null);

  const initialValues = {
    category: "security",
    voucherType,
    price,
    voucherURL,
  };

  const security = useQuery({
    queryKey: ["category", id],
    queryFn: () => getCategory(id),
    initialData: queryClient
      .getQueryData(["all-category"])
      ?.find((item) => item?._id === id),
    enabled: !!id,
    onSuccess: (security) => {
      setPrice(security?.price);
      setVoucherType(security?.name);
      setVoucherURL(security?.details?.voucherURL);
      setYear(security?.year);
      setLogo(security.details.logo)
      setLogoPreview(security.details.logo)
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
    const isProtocolPresent = values.voucherURL?.includes("http");

    const modifiedSecurityCategory = {
      id: security.data?.id,
      type: values.category,
      name: values.voucherType,
      price: DOMPurify.sanitize(values.price),
      details: {
        voucherURL: isProtocolPresent
          ? values.voucherURL
          : `https://${values.voucherURL}`,
        logo: logo || security?.data?.details?.logo,
      },
      year,
    };

    // if (_.isEmpty(logo) || _.isNull(logo)) {
    //   delete modifiedSecurityCategory.details?.logo;
    // }

    mutateAsync(modifiedSecurityCategory, {
      onSettled: () => {
        option.setSubmitting(false);
        queryClient.invalidateQueries(["category"]);
      },
      onSuccess: (data) => {
        customDispatch(globalAlertType("info", data));
        handleClose();
        option.resetForm();
      },
      onError: (error) => {
        customDispatch(globalAlertType("error", error));
      },
    });
  };

  //Close Add Category
  const handleClose = () => {
    customDispatch({
      type: "openEditSecurityCategory",
      payload: { open: false, id: "" },
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
      validationSchema={addWaecValidationSchema}
      onSubmit={onSubmit}
      enableReinitialize={true}
    >
      {({ touched, values, errors, handleChange, handleSubmit }) => {
        return (
          <Dialog
            maxWidth="xs"
            fullWidth
            TransitionComponent={Transition}
            open={open}
            onClose={handleClose}
          >
            <DialogTitle>Edit Security Service</DialogTitle>
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
                  options={CATEGORY.security}
                  freeSolo
                  noOptionsText="No option avaiable"
                  value={voucherType || null}
                  onInputChange={(e, value) => setVoucherType(value)}
                  isOptionEqualToValue={(option, value) => option === value}
                  renderInput={(props) => (
                    <TextField
                      {...props}
                      label="Security Service"
                      error={Boolean(touched.voucherType && errors.voucherType)}
                      helperText={touched.voucherType && errors.voucherType}
                    />
                  )}
                />

                <CustomYearPicker label="Year" year={year} setYear={setYear} />

                <TextField
                  type="number"
                  inputMode="decimal"
                  label="Price"
                  placeholder="Price here"
                  value={values.price}
                  onChange={handleChange("price")}
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
                  label="Security Service Website URL"
                  value={values.voucherURL}
                  onChange={handleChange("voucherURL")}
                  helperText={
                    errors.voucherURL
                      ? errors.voucherURL
                      : "eg. www.example.com"
                  }
                />
              </Stack>
            </DialogContent>
            <DialogActions sx={{ padding: 1 }}>
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
            </DialogActions>
          </Dialog>
        );
      }}
    </Formik>
  );
};

export default EditSecurityCategory;
