import {
  Button,
  IconButton,
  Paper,
  Stack,
  Typography,
  Chip,
  Fade,
  Zoom,
  Box,
  LinearProgress,
  Tooltip,
  alpha,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { currencyFormatter } from "../../constants";
import { Add, Remove, LocalOffer, ConfirmationNumber } from "@mui/icons-material";
import { CustomContext } from "../../context/providers/CustomProvider";

// ----- Styled Components -----
const TicketCard = styled(Paper)(({ theme, soldout }) => ({
  padding: theme.spacing(2.5),
  borderRadius: theme.shape.borderRadius * 2,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  position: "relative",
  overflow: "hidden",
  border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
  background: soldout
    ? alpha(theme.palette.action.disabledBackground, 0.6)
    : theme.palette.background.paper,
  opacity: soldout ? 0.7 : 1,
  "&::before": {
    content: '""',
    position: "absolute",
    inset: 0,
    borderRadius: "inherit",
    padding: "2px",
    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.secondary.main, 0.2)})`,
    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
    WebkitMaskComposite: "xor",
    maskComposite: "exclude",
    pointerEvents: "none",
    opacity: 0,
    transition: "opacity 0.4s ease",
  },
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: theme.shadows[6],
    "&::before": {
      opacity: 1,
    },
  },
  "&:hover .price-badge": {
    transform: "scale(1.05)",
  },
}));

const QuantityNumber = styled(Typography)(({ theme }) => ({
  minWidth: 32,
  textAlign: "center",
  fontWeight: 700,
  fontSize: "1.25rem",
  color: theme.palette.text.primary,
  transition: "transform 0.2s",
}));

const PriceBadge = styled(Box)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
  padding: theme.spacing(0.5, 1.5),
  borderRadius: theme.shape.borderRadius * 3,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  transition: "transform 0.3s ease",
  "& .MuiTypography-root": {
    fontWeight: 700,
    color: theme.palette.primary.main,
  },
}));

const StyledIconButton = styled(IconButton)(({ theme, active }) => ({
  width: 40,
  height: 40,
  backgroundColor: active
    ? alpha(theme.palette.primary.main, 0.12)
    : "transparent",
  border: `1px solid ${active ? theme.palette.primary.main : alpha(theme.palette.divider, 0.4)}`,
  transition: "all 0.25s ease",
  "&:hover:not(:disabled)": {
    backgroundColor: theme.palette.primary.main,
    borderColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    transform: "scale(1.08)",
  },
  "&:disabled": {
    opacity: 0.4,
    borderColor: alpha(theme.palette.divider, 0.2),
  },
}));

// ----- Component -----
const MovieItem = ({ type, remainingQuantity, price }) => {
  const theme = useTheme();
  const { customDispatch } = useContext(CustomContext);

  const [quantity, setQuantity] = useState(0);

  const itemTotal = useMemo(() => quantity * price, [quantity, price]);

  // Dispatch to global state
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

  const addItem = useCallback(() => {
    setQuantity((prev) => Math.min(prev + 1, remainingQuantity));
  }, [remainingQuantity]);

  const removeItem = useCallback(() => {
    setQuantity((prev) => Math.max(prev - 1, 0));
  }, []);

  const isSoldOut = remainingQuantity === 0;

  // ----- Render -----
  return (
    <TicketCard elevation={isSoldOut ? 0 : 2} soldout={isSoldOut ? 1 : 0}>
      <Stack spacing={2.5} flex={1}>
        {/* Header: Type + Price */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{
              flex: 1,
              fontSize: { xs: "1rem", sm: "1.1rem" },
              color: isSoldOut ? "text.disabled" : "text.primary",
            }}
          >
            {type}
          </Typography>
          <PriceBadge className="price-badge">
            <Typography variant="body1">{currencyFormatter(price)}</Typography>
          </PriceBadge>
        </Stack>

        {/* Availability */}
        <Box>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={1}
          >
            <Typography variant="body2" color="text.secondary">
              Available:
            </Typography>
            <Chip
              label={`${remainingQuantity} left`}
              size="small"
              color={
                remainingQuantity === 0
                  ? "error"
                  : remainingQuantity < 10
                  ? "warning"
                  : "default"
              }
              variant={remainingQuantity === 0 ? "filled" : "outlined"}
              sx={{ fontWeight: 600 }}
            />
          </Stack>
          {remainingQuantity > 0 && remainingQuantity < 20 && (
            <LinearProgress
              variant="determinate"
              value={(remainingQuantity / 50) * 100}
              color={remainingQuantity < 10 ? "warning" : "primary"}
              sx={{
                mt: 1,
                height: 4,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.grey[500], 0.2),
              }}
            />
          )}
        </Box>

        {/* Quantity Selector */}
        {!isSoldOut ? (
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mt: "auto", pt: 1 }}
          >
            <Tooltip title="Decrease quantity" arrow>
              <span>
                <StyledIconButton
                  onClick={removeItem}
                  disabled={quantity === 0}
                  active={quantity > 0 ? 1 : 0}
                  aria-label="Decrease quantity"
                >
                  <Remove fontSize="small" />
                </StyledIconButton>
              </span>
            </Tooltip>

            <Zoom in key={quantity} timeout={200}>
              <QuantityNumber>{quantity}</QuantityNumber>
            </Zoom>

            <Tooltip title="Increase quantity" arrow>
              <span>
                <StyledIconButton
                  onClick={addItem}
                  disabled={quantity === remainingQuantity}
                  active={quantity < remainingQuantity ? 1 : 0}
                  aria-label="Increase quantity"
                >
                  <Add fontSize="small" />
                </StyledIconButton>
              </span>
            </Tooltip>
          </Stack>
        ) : (
          <Box sx={{ mt: "auto", pt: 1 }}>
            <Chip
              label="Sold Out"
              color="error"
              icon={<ConfirmationNumber />}
              sx={{ width: "100%", fontWeight: 700, py: 1 }}
            />
          </Box>
        )}

        {/* Item total (fade in) */}
        <Fade in={quantity > 0} timeout={300}>
          <Typography
            variant="body2"
            color="success.main"
            align="right"
            fontWeight={600}
            sx={{ mt: 1 }}
          >
            Total: {currencyFormatter(itemTotal)}
          </Typography>
        </Fade>
      </Stack>
    </TicketCard>
  );
};

export default MovieItem;

// import {
//   Button,
//   IconButton,
//   Paper,
//   Stack,
//   Typography,
//   Chip,
//   Fade,
//   Zoom,
// } from "@mui/material";
// import { styled } from "@mui/material/styles";
// import { useCallback, useContext, useEffect, useMemo, useState } from "react";
// import { currencyFormatter } from "../../constants";
// import { Add, Remove } from "@mui/icons-material";
// import { CustomContext } from "../../context/providers/CustomProvider";

// // Styled Paper with hover effect
// const TicketCard = styled(Paper)(({ theme }) => ({
//   padding: theme.spacing(2),
//   borderRadius: theme.shape.borderRadius * 2,
//   transition: "all 0.2s ease-in-out",
//   "&:hover": {
//     transform: "translateY(-4px)",
//     boxShadow: theme.shadows[8],
//   },
//   height: "100%",
//   display: "flex",
//   flexDirection: "column",
//   justifyContent: "space-between",
// }));

// // Animated quantity number
// const QuantityNumber = styled(Typography)(({ theme }) => ({
//   minWidth: 32,
//   textAlign: "center",
//   fontWeight: 600,
//   fontSize: "1.25rem",
//   transition: "transform 0.2s",
// }));

// const MovieItem = ({ type, remainingQuantity, price }) => {
//   const { customDispatch } = useContext(CustomContext);

//   // Local quantity state
//   const [quantity, setQuantity] = useState(0);

//   // Memoized total for this item
//   const itemTotal = useMemo(() => quantity * price, [quantity, price]);

//   // Dispatch update to global state
//   useEffect(() => {
//     customDispatch({
//       type: "sumCinemaTotal",
//       payload: [
//         {
//           type,
//           price,
//           quantity,
//           total: itemTotal,
//         },
//       ],
//     });
//   }, [type, price, quantity, itemTotal, customDispatch]);

//   // Handlers with useCallback
//   const addItem = useCallback(() => {
//     setQuantity((prev) => Math.min(prev + 1, remainingQuantity));
//   }, [remainingQuantity]);

//   const removeItem = useCallback(() => {
//     setQuantity((prev) => Math.max(prev - 1, 0));
//   }, []);

//   // Sold out state
//   if (remainingQuantity === 0) {
//     return (
//       <TicketCard elevation={2}>
//         <Stack spacing={2} alignItems="center">
//           <Typography variant="h6" fontWeight="bold" color="text.secondary">
//             {type}
//           </Typography>
//           <Typography variant="h5" color="text.disabled">
//             {currencyFormatter(price)}
//           </Typography>
//           <Chip label="Sold Out" color="error" variant="outlined" />
//         </Stack>
//       </TicketCard>
//     );
//   }

//   return (
//     <TicketCard elevation={3}>
//       <Stack spacing={2} flex={1}>
//         {/* Ticket Type and Price */}
//         <Stack
//           direction="row"
//           justifyContent="space-between"
//           alignItems="center"
//         >
//           <Typography variant="h6" fontWeight="bold">
//             {type}
//           </Typography>
//           <Typography variant="h5" color="primary" fontWeight="600">
//             {currencyFormatter(price)}
//           </Typography>
//         </Stack>

//         {/* Remaining indicator */}
//         <Stack direction="row" justifyContent="space-between" alignItems="center">
//           <Typography variant="body2" color="text.secondary">
//             Available:
//           </Typography>
//           <Chip
//             label={`${remainingQuantity} left`}
//             size="small"
//             color={remainingQuantity < 10 ? "warning" : "default"}
//           />
//         </Stack>

//         {/* Quantity Selector */}
//         <Stack
//           direction="row"
//           justifyContent="space-between"
//           alignItems="center"
//           sx={{ mt: "auto", pt: 2 }}
//         >
//           <IconButton
//             onClick={removeItem}
//             disabled={quantity === 0}
//             size="large"
//             sx={{
//               bgcolor: quantity > 0 ? "action.hover" : "transparent",
//               "&:hover:not(:disabled)": {
//                 bgcolor: "primary.light",
//                 color: "primary.contrastText",
//               },
//               transition: "all 0.2s",
//             }}
//           >
//             <Remove />
//           </IconButton>

//           <Zoom in key={quantity} timeout={300}>
//             <QuantityNumber>{quantity}</QuantityNumber>
//           </Zoom>

//           <IconButton
//             onClick={addItem}
//             disabled={quantity === remainingQuantity}
//             size="large"
//             sx={{
//               bgcolor: quantity < remainingQuantity ? "action.hover" : "transparent",
//               "&:hover:not(:disabled)": {
//                 bgcolor: "primary.light",
//                 color: "primary.contrastText",
//               },
//               transition: "all 0.2s",
//             }}
//           >
//             <Add />
//           </IconButton>
//         </Stack>

//         {/* Optional: Show total for this item if quantity > 0 */}
//         <Fade in={quantity > 0}>
//           <Typography variant="body2" color="success.main" align="right">
//             Total: {currencyFormatter(itemTotal)}
//           </Typography>
//         </Fade>
//       </Stack>
//     </TicketCard>
//   );
// };

// export default MovieItem;
