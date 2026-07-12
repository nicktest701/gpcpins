import {
  Button,
  IconButton,
  Paper,
  Stack,
  Typography,
  Chip,
  Box,
  alpha,
  useTheme,
} from "@mui/material";
import { currencyFormatter } from "../../constants";
import { useCallback, useContext, useEffect, useState } from "react";
import { CustomContext } from "../../context/providers/CustomProvider";
import { Add, Remove, ConfirmationNumber } from "@mui/icons-material";

function MatchTicketItem({ type, remainingQuantity, price }) {
  const theme = useTheme();
  const { customDispatch } = useContext(CustomContext);
  const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    customDispatch({
      type: "sumStadiumTotal",
      payload: [
        {
          type,
          price,
          quantity,
          total: quantity * price,
        },
      ],
    });
  }, [type, price, quantity, customDispatch]);

  const addItem = useCallback(() => {
    if (remainingQuantity === quantity) return;
    setQuantity((prev) => prev + 1);
  }, [remainingQuantity, quantity]);

  const removeItem = useCallback(() => {
    setQuantity((prev) => (prev <= 0 ? 0 : prev - 1));
  }, []);

  const isSoldOut = remainingQuantity === 0;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 1.5,
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: theme.shadows[2],
          borderColor: theme.palette.primary.main,
        },
        bgcolor: isSoldOut ? alpha(theme.palette.action.disabledBackground, 0.4) : "background.paper",
        opacity: isSoldOut ? 0.7 : 1,
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
      >
        {/* Left: Type and Price */}
        <Stack spacing={0.5} flex={1}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ fontSize: "0.95rem" }}>
            {type}
          </Typography>
          <Typography variant="body2" color="primary" fontWeight={600}>
            {currencyFormatter(price)}
          </Typography>
          <Chip
            label={`${remainingQuantity} left`}
            size="small"
            color={remainingQuantity < 10 ? "warning" : "default"}
            variant={isSoldOut ? "filled" : "outlined"}
            sx={{ alignSelf: "flex-start", fontWeight: 500, fontSize: "0.65rem" }}
          />
        </Stack>

        {/* Right: Quantity Selector */}
        {isSoldOut ? (
          <Chip
            icon={<ConfirmationNumber />}
            label="Sold Out"
            color="error"
            sx={{ fontWeight: 600 }}
          />
        ) : (
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton
              onClick={removeItem}
              disabled={quantity === 0}
              size="small"
              sx={{
                border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
                borderRadius: 1,
                "&:hover:not(:disabled)": {
                  bgcolor: theme.palette.primary.main,
                  color: "white",
                  borderColor: theme.palette.primary.main,
                },
              }}
            >
              <Remove fontSize="small" />
            </IconButton>

            <Typography variant="h6" fontWeight="bold" sx={{ minWidth: 24, textAlign: "center" }}>
              {quantity}
            </Typography>

            <IconButton
              onClick={addItem}
              disabled={quantity === remainingQuantity}
              size="small"
              sx={{
                border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
                borderRadius: 1,
                "&:hover:not(:disabled)": {
                  bgcolor: theme.palette.primary.main,
                  color: "white",
                  borderColor: theme.palette.primary.main,
                },
              }}
            >
              <Add fontSize="small" />
            </IconButton>
          </Stack>
        )}
      </Stack>

      {/* Show item total if quantity > 0 */}
      {quantity > 0 && (
        <Typography variant="caption" color="success.main" fontWeight="600" align="right" display="block" sx={{ mt: 0.5 }}>
          Subtotal: {currencyFormatter(quantity * price)}
        </Typography>
      )}
    </Paper>
  );
}

export default MatchTicketItem;

// import {
//   Button,
//   IconButton,
//   ListItem,
//   ListItemSecondaryAction,
//   ListItemText,
//   Stack,
//   Typography,
// } from "@mui/material";
// import { currencyFormatter } from "../../constants";
// import { useCallback, useContext, useEffect, useState } from "react";
// import { CustomContext } from "../../context/providers/CustomProvider";
// import { Add, Remove } from "@mui/icons-material";

// function MatchTicketItem({ type, remainingQuantity, price }) {
//   const { customDispatch } = useContext(CustomContext);
//   const [quantity, setQuantity] = useState(parseInt(0));

//   useEffect(() => {
//     customDispatch({
//       type: "sumStadiumTotal",
//       payload: [
//         {
//           type,
//           price,
//           quantity,
//           total: Number(quantity) * Number(price),
//         },
//       ],
//     });
//   }, [type, price, quantity, customDispatch]);

//   const addItem = useCallback(() => {
//     if (remainingQuantity === quantity) return;
//     setQuantity((prev) => prev + 1);
//   }, [remainingQuantity, quantity]);
  
//   const removeItem = useCallback(
//     () => setQuantity((prev) => (prev <= 0 ? 0 : prev - 1)),
//     []
//   );

//   return (
//     <ListItem>
//       <ListItemText
//         primary={type}
//         primaryTypographyProps={{ fontWeight: "bold", fontSize: 14 }}
//         secondary={
//           <Typography variant="body2" color="error">
//             {currencyFormatter(price)}
//           </Typography>
//         }
//       />
//       <ListItemSecondaryAction>
//         {remainingQuantity > 0 ? (
//           <Stack
//             direction="row"
//             spacing={1}
//             justifyContent="center"
//             alignItems="center"
//           >
//             {quantity > 0 && (
//               <IconButton
//                 onClick={removeItem}
//                 sx={{
//                   "&:hover": {
//                     bgcolor: "primary.main",
//                   },
//                 }}
//               >
//                 <Remove />
//               </IconButton>
//             )}
//             <Typography variant="h6">{quantity}</Typography>
//             <IconButton
//               onClick={addItem}
//               sx={{
//                 "&:hover": {
//                   bgcolor: "primary.main",
//                 },
//               }}
//             >
//               <Add />
//             </IconButton>
//           </Stack>
//         ) : (
//           <Button variant="text" color="error">
//             Sold Out
//           </Button>
//         )}
//       </ListItemSecondaryAction>
//     </ListItem>
//   );
// }

// export default MatchTicketItem;
