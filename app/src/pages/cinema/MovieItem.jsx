import {
  Button,
  IconButton,
  Paper,
  Stack,
  Typography,
  Chip,
  Fade,
  Zoom,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { currencyFormatter } from "../../constants";
import { Add, Remove } from "@mui/icons-material";
import { CustomContext } from "../../context/providers/CustomProvider";

// Styled Paper with hover effect
const TicketCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius * 2,
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[8],
  },
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
}));

// Animated quantity number
const QuantityNumber = styled(Typography)(({ theme }) => ({
  minWidth: 32,
  textAlign: "center",
  fontWeight: 600,
  fontSize: "1.25rem",
  transition: "transform 0.2s",
}));

const MovieItem = ({ type, remainingQuantity, price }) => {
  const { customDispatch } = useContext(CustomContext);

  // Local quantity state
  const [quantity, setQuantity] = useState(0);

  // Memoized total for this item
  const itemTotal = useMemo(() => quantity * price, [quantity, price]);

  // Dispatch update to global state
  useEffect(() => {
    customDispatch({
      type: "sumCinemaTotal",
      payload: [
        {
          type,
          price,
          quantity,
          total: itemTotal,
        },
      ],
    });
  }, [type, price, quantity, itemTotal, customDispatch]);

  // Handlers with useCallback
  const addItem = useCallback(() => {
    setQuantity((prev) => Math.min(prev + 1, remainingQuantity));
  }, [remainingQuantity]);

  const removeItem = useCallback(() => {
    setQuantity((prev) => Math.max(prev - 1, 0));
  }, []);

  // Sold out state
  if (remainingQuantity === 0) {
    return (
      <TicketCard elevation={2}>
        <Stack spacing={2} alignItems="center">
          <Typography variant="h6" fontWeight="bold" color="text.secondary">
            {type}
          </Typography>
          <Typography variant="h5" color="text.disabled">
            {currencyFormatter(price)}
          </Typography>
          <Chip label="Sold Out" color="error" variant="outlined" />
        </Stack>
      </TicketCard>
    );
  }

  return (
    <TicketCard elevation={3}>
      <Stack spacing={2} flex={1}>
        {/* Ticket Type and Price */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6" fontWeight="bold">
            {type}
          </Typography>
          <Typography variant="h5" color="primary" fontWeight="600">
            {currencyFormatter(price)}
          </Typography>
        </Stack>

        {/* Remaining indicator */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Available:
          </Typography>
          <Chip
            label={`${remainingQuantity} left`}
            size="small"
            color={remainingQuantity < 10 ? "warning" : "default"}
          />
        </Stack>

        {/* Quantity Selector */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mt: "auto", pt: 2 }}
        >
          <IconButton
            onClick={removeItem}
            disabled={quantity === 0}
            size="large"
            sx={{
              bgcolor: quantity > 0 ? "action.hover" : "transparent",
              "&:hover:not(:disabled)": {
                bgcolor: "primary.light",
                color: "primary.contrastText",
              },
              transition: "all 0.2s",
            }}
          >
            <Remove />
          </IconButton>

          <Zoom in key={quantity} timeout={300}>
            <QuantityNumber>{quantity}</QuantityNumber>
          </Zoom>

          <IconButton
            onClick={addItem}
            disabled={quantity === remainingQuantity}
            size="large"
            sx={{
              bgcolor: quantity < remainingQuantity ? "action.hover" : "transparent",
              "&:hover:not(:disabled)": {
                bgcolor: "primary.light",
                color: "primary.contrastText",
              },
              transition: "all 0.2s",
            }}
          >
            <Add />
          </IconButton>
        </Stack>

        {/* Optional: Show total for this item if quantity > 0 */}
        <Fade in={quantity > 0}>
          <Typography variant="body2" color="success.main" align="right">
            Total: {currencyFormatter(itemTotal)}
          </Typography>
        </Fade>
      </Stack>
    </TicketCard>
  );
};

export default MovieItem;
