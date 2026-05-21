import {
  ArrowBack,
  ArrowDropDown,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";
import {
  Button,
  Container,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
  Skeleton,
  Chip,
  Box,
} from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { getCategory } from "../../api/categoryAPI";
import { getVoucherDetails } from "../../api/voucherAPI";
import { currencyFormatter } from "../../constants";

function CategoryDetails() {
  const { category, id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isTicket = ["cinema", "stadium", "bus"].includes(category);

  // Fetch category details
  const {
    data: categoryData,
    isLoading: categoryLoading,
    isError: categoryError,
    error: categoryErrorObj,
  } = useQuery({
    queryKey: ["category", id],
    queryFn: () => getCategory(id),
    initialData: queryClient
      .getQueryData(["category"])
      ?.find((item) => item?.id === id),
    enabled: !!id,
  });

  // Fetch voucher statistics
  const {
    data: voucherStats,
    isLoading: statsLoading,
    isError: statsError,
  } = useQuery({
    queryKey: ["voucher", category, id],
    queryFn: () => getVoucherDetails(id),
    enabled: !!category && !!id,
  });

  const handleBack = () => navigate(-1);

  // Loading state with skeleton
  if (categoryLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
          <IconButton onClick={handleBack} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Skeleton variant="text" width={200} height={40} />
        </Box>
        <Paper elevation={0} sx={{ p: 3, mb: 4 }}>
          <Skeleton variant="rectangular" height={200} />
        </Paper>
        <Skeleton variant="rectangular" height={150} />
      </Container>
    );
  }

  if (categoryError) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: "center" }}>
        <Typography color="error">
          Error loading category: {categoryErrorObj?.message}
        </Typography>
        <Button variant="contained" onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Container>
    );
  }

  // Destructure data
  const {
    name: voucherType,
    price,
    details,
    active,
    year,
  } = categoryData || {};
  const pricing = details?.pricing || [];
  const formType = details?.formType;

  // Stats
  const {
    new: newVouchers = 0,
    sold = 0,
    reserved = 0,
    used = 0,
    expired = 0,
    total = 0,
  } = voucherStats || {};

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header with back button and title */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
        <IconButton onClick={handleBack} aria-label="go back">
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1" fontWeight="bold">
          {voucherType || "Category Details"}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Chip
          label={active ? "Active" : "Inactive"}
          color={active ? "success" : "error"}
          variant="outlined"
          icon={active ? <CheckCircle /> : <Cancel />}
        />
      </Stack>

      <Grid container spacing={4}>
        {/* Main Info Card */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              height: "100%",
              borderRadius: 3,
              background: "linear-gradient(135deg, #f5f7fa 0%, #fff 100%)",
            }}
          >
            <Stack spacing={2}>
              <Typography
                variant="h3"
                component="div"
                fontWeight="bold"
                color="primary"
              >
                {voucherType}
              </Typography>
              {category === "university" && formType && (
                <Typography variant="body1" color="text.secondary">
                  {formType}
                </Typography>
              )}
              {!["cinema", "stadium"].includes(category) && price && (
                <Typography variant="h4" color="secondary.main">
                  {currencyFormatter(price)}
                </Typography>
              )}
              {year && (
                <Typography variant="body2" color="text.secondary">
                  Year: {year}
                </Typography>
              )}
            </Stack>
          </Paper>
        </Grid>

        {/* Pricing Dropdown (if applicable) */}
        {["cinema", "waec", "stadium"].includes(category) &&
          pricing.length > 0 && (
            <Grid item xs={12} md={6}>
              <Paper
                elevation={3}
                sx={{ p: 3, borderRadius: 3, height: "100%" }}
              >
                <Typography variant="h6" gutterBottom>
                  Pricing Options
                </Typography>
                View Pricing Details
                <List
                  sx={{
                    minWidth: 220,
                    maxHeight: 300,
                    overflow: "auto",
                    p: 0,
                  }}
                >
                  {pricing.map((item) => (
                    <ListItem key={item.id} divider>
                      <ListItemText
                        primary={`${item.type} ${category === "waec" ? "Checker" : "Ticket"}`}
                        primaryTypographyProps={{ fontWeight: "bold" }}
                        secondary={currencyFormatter(item.price)}
                        secondaryTypographyProps={{ color: "primary.main" }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          )}

        {/* Voucher Statistics */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              Voucher / Ticket Statistics
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6} sm={3}>
                <StatCard label="New" value={newVouchers} color="info" />
              </Grid>
              <Grid item xs={6} sm={3}>
                <StatCard label="Sold" value={sold} color="warning" />
              </Grid>
              <Grid item xs={6} sm={3}>
                <StatCard label="Reserved" value={reserved} color="error" />
              </Grid>
              {isTicket && (
                <>
                  <Grid item xs={6} sm={3}>
                    <StatCard label="Used" value={used} color="success" />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <StatCard label="Expired" value={expired} color="error" />
                  </Grid>
                </>
              )}
            </Grid>
            <Divider sx={{ my: 2 }} />
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6" fontWeight="bold">
                TOTAL
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="primary">
                {total}
              </Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

// Helper component for statistics cards
const StatCard = ({ label, value, color }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      textAlign: "center",
      bgcolor: `${color}.50`,
      borderRadius: 2,
      border: `1px solid ${color}.200`,
    }}
  >
    <Typography variant="h4" fontWeight="bold" color={`${color}.main`}>
      {value}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
  </Paper>
);

export default CategoryDetails;
