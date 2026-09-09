import {  useEffect, useMemo, useState } from "react";
import {
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
  Button,
    Fade,
  IconButton,
  List,
  ListItem,
  ListItemText,
  InputAdornment,
  Box,
  Divider,
} from "@mui/material";
import { ArrowForward, Close, PhoneRounded } from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { v4 as uuid } from "uuid";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/providers/AuthProvider";
import ServiceProvider from "../../components/ServiceProvider";
import {
  getInternationalMobileFormat,
  isValidPartner,
} from "../../constants/PhoneCode";
import { currencyFormatter } from "../../constants";

// Validation schema for each entry
const entrySchema = yup.object({
  provider: yup.string().required("Network provider is required"),
  phoneNumber: yup
    .string()
    .required("Recipient number is required")
    .test(
      "valid-phone",
      "Invalid phone number for selected provider",
      function (value) {
        const { provider } = this.parent;
        return isValidPartner(provider, getInternationalMobileFormat(value));
      },
    ),
  confirmPhonenumber: yup
    .string()
    .required("Please confirm the number")
    .oneOf([yup.ref("phoneNumber"), null], "Numbers must match"),
  price: yup
    .number()
    .typeError("Amount must be a number")
    .required("Amount is required")
    .min(10, "Minimum amount is GHS 10")
    .max(1000, "Maximum amount is GHS 1000"),
});

const AddBulk = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } =useAuth()
  const [pricingList, setPricingList] = useState([]);

  // Load existing list from URL if present
  useEffect(() => {
    const info = searchParams.get("info");
    if (info) {
      try {
        setPricingList(JSON.parse(info));
      } catch (e) {
        console.error("Failed to parse bulk info", e);
      }
    }
  }, [searchParams]);

  // React Hook Form
  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(entrySchema),
    defaultValues: {
      provider: "None",
      phoneNumber: "",
      confirmPhonenumber: "",
      price: "",
    },
  });

  const provider = watch("provider");


  // Add a new entry to the list
  const onAdd = (data) => {
    const formattedNumber = getInternationalMobileFormat(data.phoneNumber);
    const newEntry = {
      id: uuid(),
      type: data.provider,
      recipient: formattedNumber,
      price: Number(data.price),
    };
    setPricingList((prev) => [...prev, newEntry]);
    // Reset form
    reset({
      provider: "None",
      phoneNumber: "",
      confirmPhonenumber: "",
      price: "",
    });
  };

  // Remove an entry
  const handleRemove = (id) => {
    setPricingList((prev) => prev.filter((item) => item.id !== id));
  };

  // Proceed to checkout
  const handleProceed = () => {
    const total = pricingList.reduce((sum, item) => sum + item.price, 0);

    if (!user?.id) {
      navigate(
        `/user/login?redirect_url=${pathname}?link=${searchParams.get(
          "link",
        )}&info=${JSON.stringify(pricingList)}`,
        {
          state: {
            recipientPayload: pricingList,
            totalAmount: total,
          },
        },
      );
      return;
    }

    navigate(
      `bulk_airtime/buy?link=${searchParams.get(
        "link",
      )}&type=Bulk&info=${JSON.stringify(pricingList)}`,
      {
        state: {
          recipientPayload: pricingList,
          totalAmount: total,
        },
      },
    );
  };

  const totalAmount = useMemo(
    () => pricingList.reduce((sum, item) => sum + item.price, 0),
    [pricingList],
  );

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
        <Fade in timeout={400}>
      <Paper
          elevation={0}
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              border: "1px solid",
              borderColor: "divider",
            }}
      >
             {/* Header */}
            <Box
              sx={{
                p: { xs: 3, sm: 4 },
                bgcolor: "primary.light",
                color: "primary.contrastText",
              }}
            >
              <Stack>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="h5" fontWeight={700} pb={0}>
                    Buy Bulk Airtime
                  </Typography>

                  {/* <Chip size="small" color="secondary" label={watchType} /> */}
                </Stack>

                <Typography
                  variant="body2"
                  sx={{
                    opacity: 0.9,
                  }}
                >
                     Add one or more airtime top-ups. Each entry requires a network,
          recipient number, and amount.
                </Typography>
              </Stack>
            </Box>
   

        <form onSubmit={handleSubmit(onAdd)} noValidate>
          <Stack spacing={2}   sx={{
                     p: 2,py:4
              }}>
            {/* Network Provider */}
            <ServiceProvider
              size="small"
              value={provider}
              setValue={(val) => setValue("provider", val)}
              error={!!errors.provider}
              helperText={errors.provider?.message}
            />

            {/* Recipient Number */}
            <Controller
              name="phoneNumber"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  size="small"
                  type="tel"
                  label="Recipient Number"
                  placeholder="024XXXXXXX"
                  error={!!errors.phoneNumber}
                  helperText={errors.phoneNumber?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneRounded fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            {/* Confirm Number */}
            <Controller
              name="confirmPhonenumber"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  size="small"
                  type="tel"
                  label="Confirm Recipient Number"
                  placeholder="Re-enter phone number"
                  error={!!errors.confirmPhonenumber}
                  helperText={errors.confirmPhonenumber?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneRounded fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            {/* Amount */}
            <Controller
              name="price"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  size="small"
                  type="number"
                  label="Amount (GHS)"
                  placeholder="0.00"
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

            <Button type="submit" variant="contained" size="large" fullWidth
            >
              Add Entry
            </Button>
          </Stack>
        </form>

        {pricingList.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Added Entries ({pricingList.length})
            </Typography>
            <List disablePadding>
              {pricingList.map((item) => (
                <ListItem
                  key={item.id}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => handleRemove(item.id)}
                      aria-label="remove"
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  }
                  sx={{
                    bgcolor: "action.hover",
                    borderRadius: 1,
                    mb: 1,
                    "&:hover": { bgcolor: "action.selected" },
                  }}
                >
                  <ListItemText
                    primary={`${item.type} - ${item.recipient}`}
                    secondary={currencyFormatter(item.price)}
                    primaryTypographyProps={{ fontWeight: "medium" }}
                  />
                </ListItem>
              ))}
            </List>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mt: 2, pt: 1 }}
            >
              <Typography variant="h6" fontWeight="bold">
                Total:
              </Typography>
              <Typography variant="h6" color="primary.main">
                {currencyFormatter(totalAmount)}
              </Typography>
            </Stack>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              onClick={handleProceed}
              fullWidth
            
              sx={{ mt: 2 }}
            >
              Proceed to Checkout
            </Button>
          </Box>
        )}
      </Paper>
          </Fade>
    </Container>
  );
};

export default AddBulk;
