import {
  Button,
  IconButton,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { useCallback, useContext, useEffect, useState } from "react";
import { currencyFormatter } from "../../constants";
import { Add, Remove } from "@mui/icons-material";
import { CustomContext } from "../../context/providers/CustomProvider";

const MovieItem = ({ type, remainingQuantity, price }) => {
  const { customDispatch } = useContext(CustomContext);
  const [quantity, setQuantity] = useState(parseInt(0));

  useEffect(() => {
    customDispatch({
      type: "sumCinemaTotal",
      payload: [
        {
          type,
          price,
          quantity,
          total: parseFloat(quantity) * parseFloat(price),
        },
      ],
    });
  }, [type, price, quantity, customDispatch]);

  const addItem = useCallback(() => {
    if (remainingQuantity === quantity) return;
    setQuantity((prev) => prev + 1);
  }, [remainingQuantity, quantity]);

  const removeItem = useCallback(
    () => setQuantity((prev) => (prev <= 0 ? 0 : prev - 1)),
    []
  );

  return (
    <ListItem>
      <ListItemText
        primary={type}
        primaryTypographyProps={{ fontWeight: "bold", fontSize: 14 }}
        secondary={
          <Typography variant="body2" color="error">
            {currencyFormatter(price)}
          </Typography>
        }
      />
      <ListItemSecondaryAction>
        {remainingQuantity > 0 ? (
          <Stack
            direction="row"
            spacing={1}
            justifyContent="center"
            alignItems="center"
          >
            {quantity > 0 && (
              <IconButton
                onClick={removeItem}
                sx={{
                  "&:hover": {
                    bgcolor: "primary.main",
                  },
                }}
              >
                <Remove />
              </IconButton>
            )}
            <Typography variant="h6">{quantity}</Typography>
            <IconButton
              onClick={addItem}
              sx={{
                "&:hover": {
                  bgcolor: "primary.main",
                },
              }}
            >
              <Add />
            </IconButton>
          </Stack>
        ) : (
          <Button variant="text" color="error">
            Sold Out
          </Button>
        )}
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default MovieItem;
