import React, { useContext, useRef, useState } from "react";
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
import { Close } from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { v4 as uuid } from "uuid";
import _ from "lodash";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import Swal from "sweetalert2";
import DOMPurify from "dompurify";

import DialogContainer from "../../components/dialogs/DialogContainer";
import Transition from "../../components/Transition";
import CustomDatePicker from "../../components/inputs/CustomDatePicker";
import CustomTimePicker from "../../components/inputs/CustomTimePicker";
import { STADIUM_STANDS, MATCH_TYPE } from "../../mocks/columns";
import { currencyFormatter } from "../../constants";
import { globalAlertType } from "../../components/alert/alertType";
import { addStadiumValidationSchema } from "../../config/validationSchema";
import { postCategory } from "../../api/categoryAPI";
import { uploadFile } from "@/lib/upload";
import { useCustomContext } from "../../context/providers/CustomProvider";

const AddStadiumCategory = () => {
  const queryClient = useQueryClient();
  const { customState, customDispatch } = useCustomContext();

  // Local state for stands list
  const [standsList, setStandsList] = useState([]);
  const [standError, setStandError] = useState("");
  const [stand, setStand] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);

  // File upload states
  const [homeTeamImage, setHomeTeamImage] = useState(null);
  const [awayTeamImage, setAwayTeamImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // React Hook Form
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(addStadiumValidationSchema),
    defaultValues: {
      category: "stadium",
      matchType: "",
      home: "",
      away: "",
      venue: "",
      date: moment(),
      time: moment(),
      message: "",
      companyName: "",
    },
  });

  // Upload helper with progress
  const uploadFileWithProgress = async (file) => {
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const { downloadURL } = await uploadFile({
        folder: "category",
        file,
        onProgress: (progress) => setUploadProgress(progress),
      });
      return downloadURL;
    } catch (error) {
      customDispatch(
        globalAlertType("error", "Upload failed. Please try again.")
      );
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleHomeTeamFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = await uploadFileWithProgress(file);
    if (url) setHomeTeamImage(url);
  };

  const handleAwayTeamFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = await uploadFileWithProgress(file);
    if (url) setAwayTeamImage(url);
  };

  // Add stand
  const handleAddStand = () => {
    setStandError("");
    if (!stand.trim()) {
      setStandError("Please select or enter a stand");
      return;
    }
    if (!quantity || quantity <= 0) {
      setStandError("Valid quantity is required");
      return;
    }
    if (!price || price <= 0) {
      setStandError("Valid price is required");
      return;
    }

    const newItem = {
      id: uuid(),
      type: stand.trim().toUpperCase(),
      quantity: Number(quantity),
      price: Number(price),
    };
    setStandsList((prev) =>
      _.orderBy(
        _.values(_.merge(_.keyBy([...prev, newItem], "type"))),
        "type",
        "asc"
      )
    );
    setStand("");
    setQuantity(0);
    setPrice(0);
  };

  const handleRemoveStand = (id) => {
    setStandsList((prev) => prev.filter((item) => item.id !== id));
  };

  // Mutation
  const { mutateAsync, isLoading } = useMutation({
    mutationFn: postCategory,
    onSuccess: (data) => {
      customDispatch(globalAlertType("success", data));
      handleClose();
      reset();
      setStandsList([]);
      setHomeTeamImage(null);
      setAwayTeamImage(null);
      queryClient.invalidateQueries(["category"]);
    },
    onError: (error) => {
      customDispatch(globalAlertType("error", error));
    },
  });

  const handleClose = () => {
    customDispatch({
      type: "openAddStadiumCategory",
      payload: { open: false },
    });
    reset();
  };

  const onSubmit = (values) => {
    if (standsList.length === 0) {
      setStandError("Please add at least one stand");
      return;
    }

    Swal.fire({
      title: "Add New Football Ticket?",
      text: "Are you sure you want to create this new match ticket?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, add",
    }).then((result) => {
      if (result.isConfirmed) {
        const payload = {
          type: values.category,
          name: DOMPurify.sanitize(
            `${values.home} Vs ${values.away} (${values.matchType})`
          ),
          details: {
            matchType: DOMPurify.sanitize(values.matchType?.toUpperCase()),
            match: DOMPurify.sanitize(`${values.home} Vs ${values.away}`),
            homeImage: homeTeamImage,
            awayImage: awayTeamImage,
            home: DOMPurify.sanitize(values.home),
            away: DOMPurify.sanitize(values.away),
            pricing: standsList,
            venue: DOMPurify.sanitize(values.venue),
            quantity: parseInt(_.sumBy(standsList, "quantity")),
            date: values.date,
            time: values.time,
            message: DOMPurify.sanitize(values.message),
            companyName: DOMPurify.sanitize(values.companyName),
          },
          year: moment(values.date).format("YYYY"),
        };
        mutateAsync(payload);
      }
    });
  };

  // Team logo preview
  const TeamLogoPreview = ({ image }) => (
    <Box sx={{ mt: 1 }}>
      {image && (
        <Avatar
          src={image}
          variant="rounded"
          sx={{ width: 60, height: 60, objectFit: "contain" }}
        />
      )}
    </Box>
  );

  return (
    <DialogContainer
      open={customState.stadiumCategory.open}
      onClose={handleClose}
      title="New Football Ticket"
      subtitle="Add a new match ticket with stands pricing"
      loading={isSubmitting || isLoading || isUploading}
      disabled={isUploading}
      onConfirm={handleSubmit(onSubmit)}
      confirmText="Proceed"
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

        {/* Match Type */}
        <Controller
          name="matchType"
          control={control}
          render={({ field }) => (
            <Autocomplete
              freeSolo
              options={MATCH_TYPE}
              noOptionsText="No match type available"
              isOptionEqualToValue={(option, value) => option === value}
              onInputChange={(_, value) => {
                setValue("matchType", value);
              }}
              value={field.value || null}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Match Type"
                  required
                  error={!!errors.matchType}
                  helperText={errors.matchType?.message || "e.g. Friendly Match, Cup Final"}
                />
              )}
            />
          )}
        />

        {/* Home Team Logo */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Home Team Logo
          </Typography>
          <Button
            variant="outlined"
            component="label"
            disabled={isUploading}
          >
            Upload Image
            <input
              type="file"
              hidden
              accept=".png,.jpg,.jpeg,.webp"
              onChange={handleHomeTeamFile}
            />
          </Button>
          <TeamLogoPreview image={homeTeamImage} />
        </Box>

        {/* Home Team */}
        <Controller
          name="home"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Home Team"
              fullWidth
              required
              error={!!errors.home}
              helperText={errors.home?.message || "e.g. Team A"}
            />
          )}
        />

        {/* Away Team Logo */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Away Team Logo
          </Typography>
          <Button
            variant="outlined"
            component="label"
            disabled={isUploading}
          >
            Upload Image
            <input
              type="file"
              hidden
              accept=".png,.jpg,.jpeg,.webp"
              onChange={handleAwayTeamFile}
            />
          </Button>
          <TeamLogoPreview image={awayTeamImage} />
        </Box>

        {/* Away Team */}
        <Controller
          name="away"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Away Team"
              fullWidth
              required
              error={!!errors.away}
              helperText={errors.away?.message || "e.g. Team B"}
            />
          )}
        />

        {/* Stand Pricing */}
        <Box>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Stand Pricing
          </Typography>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1} mb={2}>
            <Autocomplete
              options={STADIUM_STANDS}
              freeSolo
              fullWidth
              value={stand}
              onInputChange={(_, val) => setStand(val)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Stand"
                  error={!!standError}
                  helperText={standError}
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
              onClick={handleAddStand}
              sx={{ whiteSpace: "nowrap",borderRadius:1.2 }}
            >
              Add
            </Button>
          </Stack>
          {standError && (
            <Typography color="error" variant="caption">
              {standError}
            </Typography>
          )}
          {standsList.length > 0 && (
            <List
              sx={{
                maxHeight: 200,
                overflow: "auto",
                bgcolor: "action.hover",
                borderRadius: 1,
                p: 1,
              }}
            >
              {standsList.map((item) => (
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
                      onClick={() => handleRemoveStand(item.id)}
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

        {/* Venue */}
        <Controller
          name="venue"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Venue"
              fullWidth
              required
              error={!!errors.venue}
              helperText={errors.venue?.message || "e.g. Kumasi, Ghana"}
            />
          )}
        />

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

        {/* Upload progress indicator */}
        {isUploading && (
          <Box sx={{ width: "100%" }}>
            <LinearProgress variant="determinate" value={uploadProgress} />
            <Typography variant="caption" color="text.secondary">
              Uploading... {Math.round(uploadProgress)}%
            </Typography>
          </Box>
        )}
      </Stack>
    </DialogContainer>
  );
};

export default React.memo(AddStadiumCategory);