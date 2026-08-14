import { useState, useEffect, useRef } from "react";
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import Swal from "sweetalert2";

import { useCustomContext } from "../../context/providers/CustomProvider";
import { editCategory, getCategory } from "../../api/categoryAPI";
import { globalAlertType } from "../../components/alert/alertType";
import Transition from "../../components/Transition";
import { CATEGORY, currencyFormatter } from "../../constants";
import CustomYearPicker from "../../components/inputs/CustomYearPicker";
import { addWaecValidationSchema } from "../../config/validationSchema";
import { WAEC_VOUCHER_PRICING } from "../../mocks/columns";
import { uploadFile } from "@/lib/upload";

const EditWAECCategory = () => {
  const queryClient = useQueryClient();

  const {
    customState: {
      editWaecCategory: { open, id },
    },
    customDispatch,
  } = useCustomContext();

  // Local state
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [year, setYear] = useState(moment().format("YYYY"));
  const [pricingList, setPricingList] = useState([]);
  const [pricingError, setPricingError] = useState("");
  const [pricingType, setPricingType] = useState("");
  const [price, setPrice] = useState(0);

  const fileInputRef = useRef(null);

  // Fetch existing WAEC data
  const { data: waecData, isLoading: isLoadingData } = useQuery({
    queryKey: ["category", id],
    queryFn: () => getCategory(id),
    initialData: queryClient
      .getQueryData(["all-category"])
      ?.find((item) => item?.id === id),
    enabled: !!id && open,
  });

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

  // Populate form when data loads
  useEffect(() => {
    if (waecData && open) {
     
      setValue("voucherType", waecData.name);
      setValue("sellingPrice", waecData.details?.price || "");
      setValue("voucherURL", waecData.details?.voucherURL || "");
      setYear(waecData.year?.toString() || moment().format("YYYY"));
      setPricingList(waecData.details?.pricing || []);
      setLogoPreview(waecData.details?.logo);
      setLogoFile(waecData.details?.logo);
    }
  }, [waecData, open, setValue]);

  const handleClose = () => {
    customDispatch({
      type: "openEditWaecCategory",
      payload: { open: false, id: "" },
    });
    reset();
    setPricingList([]);
    setLogoFile(null);
    setLogoPreview(null);
    setUploadProgress(0);
    setIsUploading(false);
    setPricingType("");
    setPrice(0);
    setYear(moment().format("YYYY"));
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
        globalAlertType("error", "Logo upload failed. Please try again."),
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
        "asc",
      ),
    );
    setPricingType("");
    setPrice(0);
  };

  const handleRemoveTicketType = (id) => {
    setPricingList((prev) => prev.filter((item) => item.id !== id));
  };

  const editMutation = useMutation({
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

  const onSubmit = (values) => {
    if (pricingList.length === 0) {
      setPricingError("Please add at least one ticket price");
      return;
    }

    // SweetAlert confirmation
    Swal.fire({
      title: "Save Changes?",
      text: "Are you sure you want to update this WAEC checker?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, save",
    }).then((result) => {
      if (result.isConfirmed) {
        const isProtocolPresent = values.voucherURL?.includes("http");
        const payload = {
          id: waecData?.id,
          name: values.voucherType,
          type: values.category,
          details: {
            voucherURL: isProtocolPresent
              ? values.voucherURL
              : `https://${values.voucherURL}`,
            pricing: pricingList,
            logo: logoFile,
            price: values.sellingPrice,
          },
          year,
        };
        editMutation.mutate(payload);
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
  open={open}
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
      Edit WAEC Checker
    </Typography>
    <IconButton
      onClick={handleClose}
      sx={{ color: "primary.contrastText" }}
    >
      <Close />
    </IconButton>
  </DialogTitle>

  {/* 3. Wrap your form fields inside DialogContent so the scroll container works flawlessly */}
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
      {isLoadingData ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <LinearProgress sx={{ width: "100%" }} />
        </Box>
      ) : (
        <Stack spacing={3}>
          {/* Logo Upload */}
          <LogoSection />
          <Divider />

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
                  />
                )}
              />
            )}
          />

          {/* Year */}
          <CustomYearPicker label="Year" year={year} setYear={setYear} />

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
                    sx={{ whiteSpace: "nowrap",borderRadius:1.2 }}
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
                  />
                )}
              />
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting || editMutation.isLoading}
            disabled={isUploading}
          >
            Save Changes
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>

  );
};

export default EditWAECCategory;

// import { useContext, useState, useEffect, useRef } from "react";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Stack,
//   TextField,
//   Autocomplete,
//   InputAdornment,
//   Typography,
//   Button,
//   IconButton,
//   List,
//   ListItem,
//   ListItemText,
//   ListItemSecondaryAction,
//   FormHelperText,
//   Avatar,
//   Box,
//   LinearProgress,
//   alpha,
// } from "@mui/material";
// import LoadingButton from "@mui/lab/LoadingButton";
// import { Close, CloudUpload } from "@mui/icons-material";
// import { useForm, Controller } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import { v4 as uuid } from "uuid";
// import _ from "lodash";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import moment from "moment";

// import {
//   CustomContext,
//   useCustomContext,
// } from "../../context/providers/CustomProvider";
// import { editCategory, getCategory } from "../../api/categoryAPI";
// import { globalAlertType } from "../../components/alert/alertType";
// import Transition from "../../components/Transition";
// import { CATEGORY, currencyFormatter } from "../../constants";
// import CustomYearPicker from "../../components/inputs/CustomYearPicker";
// import { addWaecValidationSchema } from "../../config/validationSchema";
// import { WAEC_VOUCHER_PRICING } from "../../mocks/columns";
// import { uploadFile } from "@/lib/upload";

// const EditWAECCategory = () => {
//   const queryClient = useQueryClient();

//   // Context
//   const {
//     customState: {
//       editWaecCategory: { open, id },
//     },
//     customDispatch,
//   } = useCustomContext();

//   // Local state
//   const [logoFile, setLogoFile] = useState(null); // uploaded URL
//   const [logoPreview, setLogoPreview] = useState(null); // preview for UI
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [isUploading, setIsUploading] = useState(false);
//   const [year, setYear] = useState(moment().format("YYYY"));
//   const [pricingList, setPricingList] = useState([]);
//   const [pricingError, setPricingError] = useState("");
//   const [pricingType, setPricingType] = useState("");
//   const [price, setPrice] = useState(0);

//   // File input ref
//   const fileInputRef = useRef(null);

//   // Fetch existing WAEC data
//   const { data: waecData, isLoading: isLoadingData } = useQuery({
//     queryKey: ["category", id],
//     queryFn: () => getCategory(id),
//     initialData: queryClient
//       .getQueryData(["all-category"])
//       ?.find((item) => item?._id === id),
//     enabled: !!id && open,
//   });

//   // React Hook Form setup
//   const {
//     control,
//     handleSubmit,
//     setValue,
//     reset,
//     formState: { errors, isSubmitting },
//   } = useForm({
//     resolver: yupResolver(addWaecValidationSchema()),
//     defaultValues: {
//       category: "waec",
//       voucherType: "",
//       sellingPrice: "",
//       voucherURL: "",
//     },
//   });

//   // Populate form when data loads
//   useEffect(() => {
//     if (waecData && open) {
//       setValue("voucherType", waecData.name);
//       setValue("sellingPrice", waecData.details?.price || "");
//       setValue("voucherURL", waecData.details?.voucherURL || "");
//       setYear(waecData.year || moment().format("YYYY"));
//       setPricingList(waecData.details?.pricing || []);
//       setLogoPreview(waecData.details?.logo);
//       setLogoFile(waecData.details?.logo); // store existing URL
//     }
//   }, [waecData, open, setValue]);

//   // Reset form and local state when dialog closes
//   const handleClose = () => {
//     customDispatch({
//       type: "openEditWaecCategory",
//       payload: { open: false, id: "" },
//     });
//     reset();
//     setPricingList([]);
//     setLogoFile(null);
//     setLogoPreview(null);
//     setUploadProgress(0);
//     setIsUploading(false);
//     setPricingType("");
//     setPrice(0);
//     setYear(moment().format("YYYY"));
//   };

//   // Upload logo with progress
//   const handleUploadFile = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     setIsUploading(true);
//     setUploadProgress(0);

//     try {
//       // Show local preview
//       const reader = new FileReader();
//       reader.onload = () => setLogoPreview(reader.result);
//       reader.readAsDataURL(file);

//       // Upload to Firebase with progress
//       const { downloadURL } = await uploadFile({
//         folder: "category",
//         file,
//         onProgress: (progress) => setUploadProgress(progress),
//       });
//       setLogoFile(downloadURL);
//     } catch (error) {
//       customDispatch(
//         globalAlertType("error", "Logo upload failed. Please try again."),
//       );
//     } finally {
//       setIsUploading(false);
//       setUploadProgress(0);
//     }
//   };

//   // Add ticket pricing
//   const handleAddTicketType = () => {
//     setPricingError("");
//     if (!pricingType.trim()) {
//       setPricingError("Required*");
//       return;
//     }
//     if (!price || price <= 0) {
//       setPricingError("Valid price is required");
//       return;
//     }

//     const newItem = {
//       id: uuid(),
//       type: pricingType.trim().toUpperCase(),
//       price: Number(price),
//     };
//     setPricingList((prev) =>
//       _.orderBy(
//         _.values(_.merge(_.keyBy([...prev, newItem], "type"))),
//         "type",
//         "asc",
//       ),
//     );
//     setPricingType("");
//     setPrice(0);
//   };

//   const handleRemoveTicketType = (id) => {
//     setPricingList((prev) => prev.filter((item) => item.id !== id));
//   };

//   // Submit form
//   const editMutation = useMutation({
//     mutationFn: editCategory,
//     onSuccess: (data) => {
//       customDispatch(globalAlertType("info", data));
//       handleClose();
//       queryClient.invalidateQueries(["category"]);
//     },
//     onError: (error) => {
//       customDispatch(globalAlertType("error", error));
//     },
//   });

//   const onSubmit = (values) => {
//     if (pricingList.length === 0) {
//       setPricingError("Please add at least one ticket price");
//       return;
//     }

//     // console.log(values);
//     // return;

//     const isProtocolPresent = values.voucherURL?.includes("http");
//     const payload = {
//       id: waecData?.id,
//       name: values.voucherType,
//       type: values.category,
//       details: {
//         voucherURL: isProtocolPresent
//           ? values.voucherURL
//           : `https://${values.voucherURL}`,
//         pricing: pricingList,
//         logo: logoFile, // could be existing or newly uploaded
//         price: values.sellingPrice,
//       },
//       year,
//     };

//     editMutation.mutate(payload);
//   };

//   // Logo preview component with progress bar
//   const LogoSection = () => (
//     <Box>
//       <Typography variant="subtitle2" gutterBottom>
//         Category Logo
//       </Typography>
//       <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
//         {logoPreview && (
//           <Avatar
//             src={logoPreview}
//             variant="rounded"
//             sx={{ width: 60, height: 60, objectFit: "contain" }}
//           />
//         )}
//         <Button
//           variant="outlined"
//           startIcon={<CloudUpload />}
//           onClick={() => fileInputRef.current?.click()}
//           disabled={isUploading}
//         >
//           {logoPreview ? "Change Logo" : "Upload Logo"}
//         </Button>
//         <input
//           type="file"
//           ref={fileInputRef}
//           style={{ display: "none" }}
//           accept=".png,.jpg,.jpeg,.webp"
//           onChange={handleUploadFile}
//         />
//       </Box>
//       {isUploading && (
//         <Box sx={{ width: "100%", mt: 1 }}>
//           <LinearProgress variant="determinate" value={uploadProgress} />
//           <Typography variant="caption" color="text.secondary">
//             Uploading... {Math.round(uploadProgress)}%
//           </Typography>
//         </Box>
//       )}
//     </Box>
//   );

//   return (
//     <Dialog
//       maxWidth="md"
//       fullWidth
//       TransitionComponent={Transition}
//       open={open}
//       onClose={handleClose}
//        PaperProps={{
//         elevation: 8,
//         sx: {
//           borderRadius: 4,
//           // overflow: "hidden",
//           background:(theme)=> theme.palette.background.paper,
//           backdropFilter: "blur(4px)",
//           boxShadow:(theme)=> `0 20px 60px ${alpha(theme.palette.common.black, 0.15)}`,
//         },
//       }}
//     >
//       <DialogTitle>Edit WAEC Checker</DialogTitle>
//       <form onSubmit={handleSubmit(onSubmit)} noValidate>
//         <DialogContent dividers sx={{
//           overflowY:'auto'
//         }}>
//           {isLoadingData ? (
//             <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
//               <LinearProgress />
//             </Box>
//           ) : (
//             <Stack spacing={2} sx={{ pt: 1 }}>
//               {/* Logo Upload */}
//               <LogoSection />

//               {/* WAEC Checker Name */}
//               <Controller
//                 name="voucherType"
//                 control={control}
//                 render={({ field }) => (
//                   <Autocomplete
//                     freeSolo
//                     options={CATEGORY.exams}
//                     noOptionsText="No option available"
//                     isOptionEqualToValue={(option, value) => option === value}
//                     onInputChange={(_, value) => {
//                       setValue("voucherType", value);
//                     }}
//                     value={field.value || null}
//                     renderInput={(params) => (
//                       <TextField
//                         {...params}
//                         label="WAEC Checker Name"
//                         required
//                         error={!!errors.voucherType}
//                         helperText={errors.voucherType?.message}
//                         size="small"
//                       />
//                     )}
//                   />
//                 )}
//               />

//               {/* Year */}
//               <CustomYearPicker
//                 label="Year"
//                 year={year}
//                 setYear={setYear}
//                 size="small"
//               />

//               {/* Selling Price */}
//               <Controller
//                 name="sellingPrice"
//                 control={control}
//                 render={({ field }) => (
//                   <TextField
//                     {...field}
//                     type="number"
//                     label="Selling Price"
//                     required
//                     InputProps={{
//                       startAdornment: (
//                         <InputAdornment position="start">GH¢</InputAdornment>
//                       ),
//                       endAdornment: (
//                         <InputAdornment position="end">p</InputAdornment>
//                       ),
//                     }}
//                     error={!!errors.sellingPrice}
//                     helperText={errors.sellingPrice?.message}
//                     size="small"
//                   />
//                 )}
//               />

//               {/* Ticket Pricing */}
//               <Box>
//                 <Typography variant="subtitle2" gutterBottom>
//                   Ticket Pricing
//                 </Typography>
//                 <Stack
//                   direction={{ xs: "column", md: "row" }}
//                   spacing={1}
//                   mb={2}
//                 >
//                   <Autocomplete
//                     options={WAEC_VOUCHER_PRICING}
//                     freeSolo
//                     fullWidth
//                     size="small"
//                     value={pricingType}
//                     onInputChange={(_, val) => setPricingType(val)}
//                     renderInput={(params) => (
//                       <TextField
//                         {...params}
//                         label="Quantity / Type"
//                         error={!!pricingError}
//                         helperText={pricingError && " "}
//                       />
//                     )}
//                   />
//                   <TextField
//                     type="number"
//                     label="Price (GH¢)"
//                     value={price}
//                     onChange={(e) => setPrice(e.target.value)}
//                     size="small"
//                     InputProps={{
//                       startAdornment: (
//                         <InputAdornment position="start">GH¢</InputAdornment>
//                       ),
//                     }}
//                     sx={{ minWidth: 120 }}
//                   />
//                   <Button
//                     variant="contained"
//                     onClick={handleAddTicketType}
//                     sx={{ whiteSpace: "nowrap" }}
//                   >
//                     Add
//                   </Button>
//                 </Stack>
//                 {pricingError && (
//                   <FormHelperText error>{pricingError}</FormHelperText>
//                 )}
//                 {pricingList.length > 0 && (
//                   <List
//                     sx={{
//                       maxHeight: 200,
//                       overflow: "auto",
//                       bgcolor: "action.hover",
//                       borderRadius: 1,
//                       p: 1,
//                     }}
//                   >
//                     {pricingList.map((item) => (
//                       <ListItem key={item.id} sx={{ py: 0.5 }}>
//                         <ListItemText
//                           primary={`${item.type} Checker(s) for ${currencyFormatter(item.price)}`}
//                           primaryTypographyProps={{
//                             variant: "body2",
//                             color: "text.primary",
//                           }}
//                         />
//                         <ListItemSecondaryAction>
//                           <IconButton
//                             edge="end"
//                             size="small"
//                             onClick={() => handleRemoveTicketType(item.id)}
//                             aria-label="remove"
//                           >
//                             <Close fontSize="small" />
//                           </IconButton>
//                         </ListItemSecondaryAction>
//                       </ListItem>
//                     ))}
//                   </List>
//                 )}
//               </Box>

//               {/* Voucher URL */}
//               <Controller
//                 name="voucherURL"
//                 control={control}
//                 render={({ field }) => (
//                   <TextField
//                     {...field}
//                     label="WAEC Website URL"
//                     type="url"
//                     placeholder="eg. www.example.com"
//                     error={!!errors.voucherURL}
//                     helperText={
//                       errors.voucherURL?.message || "Include https:// if needed"
//                     }
//                     size="small"
//                   />
//                 )}
//               />
//             </Stack>
//           )}
//         </DialogContent>
//         <DialogActions sx={{ p: 2 }}>
//           <Button onClick={handleClose}>Cancel</Button>
//           <LoadingButton
//             type="submit"
//             variant="contained"
//             loading={isSubmitting || editMutation.isLoading}
//             disabled={isUploading}
//           >
//             Save Changes
//           </LoadingButton>
//         </DialogActions>
//       </form>
//     </Dialog>
//   );
// };

// export default EditWAECCategory;
