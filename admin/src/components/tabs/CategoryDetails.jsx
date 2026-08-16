import {
  ArrowBack,
  ArrowDropDown,
  CheckCircle,
  Cancel,
  Category,
  Receipt,
  BarChart,
  TrendingUp,
  TrendingDown,
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
  alpha,
  useTheme,
  Card,
  CardContent,
  Avatar,
} from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { getCategory } from "../../api/categoryAPI";
import { getVoucherDetails } from "../../api/voucherAPI";
import { currencyFormatter } from "../../constants";
import AnimatedContainer from "../../components/animations/AnimatedContainer";
import CustomTitle from "../../components/custom/CustomTitle";

function CategoryDetails() {
  const theme = useTheme();
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
    refetch: refetchCategory,
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
    refetch: refetchStats,
  } = useQuery({
    queryKey: ["voucher", category, id],
    queryFn: () => getVoucherDetails(id),
    enabled: !!category && !!id,
  });

  const isLoading = categoryLoading || statsLoading;
  const isError = categoryError || statsError;

  // Helper to get category icon
  const getCategoryIcon = () => {
    const icons = {
      cinema: "🎬",
      stadium: "⚽",
      bus: "🚌",
      university: "🎓",
      waec: "📚",
    };
    return icons[category] || "📦";
  };

  // Helper to get category color
  const getCategoryColor = () => {
    const colors = {
      cinema: theme.palette.error.main,
      stadium: theme.palette.success.main,
      bus: theme.palette.info.main,
      university: theme.palette.warning.main,
      waec: theme.palette.secondary.main,
    };
    return colors[category] || theme.palette.primary.main;
  };

  // Loading state
  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <CustomTitle title="Category Details" showBack />
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1.2 }} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1.2 }} />
          </Grid>
          <Grid item xs={12}>
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 1.2 }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  // Error state
  if (isError || !categoryData) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 1.2,
            border: `1px solid ${theme.palette.error.main}`,
          }}
        >
          <Typography variant="h6" color="error" gutterBottom>
            Oops! Something went wrong.
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {categoryErrorObj?.message || "Failed to load category details."}
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              refetchCategory();
              refetchStats();
            }}
            sx={{ mr: 2 }}
          >
            Retry
          </Button>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </Paper>
      </Container>
    );
  }

  const {
    name: voucherType,
    price,
    details,
    active,
    year,
  } = categoryData || {};
  const pricing = details?.pricing || [];
  const formType = details?.formType;

  const {
    new: newVouchers = 0,
    sold = 0,
    reserved = 0,
    used = 0,
    expired = 0,
    total = 0,
  } = voucherStats || {};

  const categoryColor = getCategoryColor();
  const categoryIcon = getCategoryIcon();

  return (
    <AnimatedContainer>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <CustomTitle
          title={voucherType || "Category Details"}
          subtitle={`Manage ${category} vouchers and tickets`}
          showBack
        />

        {/* Stats Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={3}>
            <StatsCard
              label="Total"
              value={total}
              icon={<Category />}
              color={theme.palette.primary.main}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatsCard
              label="Available"
              value={newVouchers}
              icon={<TrendingUp />}
              color={theme.palette.success.main}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatsCard
              label="Sold"
              value={sold}
              icon={<Receipt />}
              color={theme.palette.warning.main}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatsCard
              label="Reserved"
              value={reserved}
              icon={<TrendingDown />}
              color={theme.palette.error.main}
            />
          </Grid>
        </Grid>

        <Grid container spacing={4}>
          {/* Main Info Card */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                height: "100%",
                borderRadius: 1.2,
                border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                background: `linear-gradient(135deg, ${alpha(categoryColor, 0.04)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: -50,
                  right: -50,
                  width: 200,
                  height: 200,
                  borderRadius: "50%",
                  background: alpha(categoryColor, 0.05),
                  pointerEvents: "none",
                },
              }}
            >
              <Stack spacing={2.5}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: alpha(categoryColor, 0.1),
                      fontSize: "2rem",
                    }}
                  >
                    {categoryIcon}
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      Category
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {voucherType || "N/A"}
                    </Typography>
                  </Box>
                  <Box sx={{ flexGrow: 1 }} />
                  <Chip
                    label={active ? "Active" : "Inactive"}
                    color={active ? "success" : "error"}
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Stack>

                <Divider />

                <Grid container spacing={2}>
                  {category === "university" && formType && (
                    <Grid item xs={12}>
                      <InfoRow label="Form Type" value={formType} />
                    </Grid>
                  )}
                  {!["cinema", "stadium"].includes(category) && price && (
                    <Grid item xs={12}>
                      <InfoRow
                        label="Price"
                        value={currencyFormatter(price)}
                        valueColor="primary"
                      />
                    </Grid>
                  )}
                  {year && (
                    <Grid item xs={12}>
                      <InfoRow label="Year" value={year} />
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <InfoRow
                      label="Status"
                      value={active ? "Available" : "Unavailable"}
                      valueColor={active ? "success" : "error"}
                    />
                  </Grid>
                </Grid>
              </Stack>
            </Paper>
          </Grid>

          {/* Pricing Options */}
          {["cinema", "waec", "stadium"].includes(category) &&
            pricing.length > 0 && (
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 1.2,
                    height: "100%",
                    border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                  }}
                >
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Pricing Options
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Available {category === "waec" ? "checker" : "ticket"} types
                  </Typography>
                  <List sx={{ p: 0 }}>
                    {pricing.map((item, index) => (
                      <ListItem
                        key={item.id}
                        divider={index < pricing.length - 1}
                        sx={{
                          px: 1,
                          py: 1.5,
                          borderRadius: 1.2,
                          transition: "background 0.2s",
                          "&:hover": {
                            bgcolor: alpha(theme.palette.primary.main, 0.04),
                          },
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography fontWeight="600" variant="body2">
                              {item.type}
                              {category === "waec" && " Checker"}
                              {category !== "waec" && " Ticket"}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {category === "cinema" && "Standard seating"}
                            </Typography>
                          }
                        />
                        <Typography variant="body1" fontWeight="bold" color="primary">
                          {currencyFormatter(item.price)}
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            )}

          {/* Additional Stats */}
          {isTicket && (
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 1.2,
                  border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                }}
              >
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Ticket Usage
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <StatMiniCard
                      label="Used"
                      value={used}
                      color={theme.palette.success.main}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <StatMiniCard
                      label="Expired"
                      value={expired}
                      color={theme.palette.error.main}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <StatMiniCard
                      label="Remaining"
                      value={total - sold - reserved - used}
                      color={theme.palette.info.main}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <StatMiniCard
                      label="Utilization"
                      value={`${total > 0 ? Math.round((sold / total) * 100) : 0}%`}
                      color={theme.palette.secondary.main}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Container>
    </AnimatedContainer>
  );
}

// Helper components
const InfoRow = ({ label, value, valueColor = "text.primary" }) => (
  <Stack direction="row" justifyContent="space-between" alignItems="center">
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2" fontWeight="500" color={valueColor}>
      {value || "N/A"}
    </Typography>
  </Stack>
);

const StatsCard = ({ label, value, icon, color }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      borderRadius: 1.2,
      border: `1px solid ${alpha(color, 0.2)}`,
      bgcolor: alpha(color, 0.04),
      transition: "all 0.2s ease",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: `0 4px 12px ${alpha(color, 0.15)}`,
      },
    }}
  >
    <Stack direction="row" alignItems="center" spacing={1}>
      <Box
        sx={{
          p: 0.75,
          borderRadius: "50%",
          bgcolor: alpha(color, 0.12),
          color: color,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="h5" fontWeight="bold" color={color}>
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
      </Box>
    </Stack>
  </Paper>
);

const StatMiniCard = ({ label, value, color }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      textAlign: "center",
      borderRadius: 1.2,
      border: `1px solid ${alpha(color, 0.15)}`,
      bgcolor: alpha(color, 0.04),
    }}
  >
    <Typography variant="h4" fontWeight="bold" color={color}>
      {value}
    </Typography>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
  </Paper>
);

export default CategoryDetails;
