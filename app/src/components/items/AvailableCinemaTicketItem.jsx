import { Box, Card, CardMedia, CardContent, Typography, Stack, Chip, Skeleton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { currencyFormatter } from "../../constants";

function AvailableCinemaTicketItem({ id, details, isLoading = false }) {
  const navigate = useNavigate();

  const handleNavigate = () => {
    if (!isLoading && id) navigate(`movie/${id}`);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <Card sx={{ width: { xs: "100%", md: 260 }, borderRadius: 2 }}>
        <Skeleton variant="rectangular" height={160} />
        <CardContent>
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </CardContent>
      </Card>
    );
  }

  // Handle missing data
  if (!details) return null;

  const {
    cinema,
    movie,
    description,
    theatre,
    location,
    date,
    time,
    pricing = [],
  } = details;

  // Get min and max price from pricing array
  const prices = pricing.map((p) => p.price).filter(Boolean);
  const minPrice = prices.length ? Math.min(...prices) : null;
  const maxPrice = prices.length ? Math.max(...prices) : null;
  const priceDisplay =
    minPrice && maxPrice && minPrice !== maxPrice
      ? `${currencyFormatter(minPrice)} - ${currencyFormatter(maxPrice)}`
      : minPrice
      ? currencyFormatter(minPrice)
      : null;

  return (
    <Card
      sx={{
        height:'100%',
        width: { xs: "100%", md: 300 },
        borderRadius: 2,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: (theme) => theme.shadows[8],
        },
      }}
      onClick={handleNavigate}
    >
      <CardMedia
        component="img"
        height="160"
        image={cinema || "/placeholder-image.jpg"}
        alt={movie || "Movie poster"}
        sx={{ objectFit: "contain" }}
      />
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom noWrap>
          {movie || "Untitled"}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            mb: 1,
          }}
        >
          {description || "No description available"}
        </Typography>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="caption" color="warning.main">
            {theatre || "Theatre"}
          </Typography>
          <Chip
            label={location || "Location"}
            size="small"
            variant="outlined"
            color="primary"
          />
        </Stack>
        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
          {date ? moment(new Date(date)).format("LL") : "Date TBA"} |{" "}
          {time ? moment(new Date(time)).format("hh:mm a") : "Time TBA"}
        </Typography>
        {priceDisplay && (
          <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
            {priceDisplay}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default AvailableCinemaTicketItem;