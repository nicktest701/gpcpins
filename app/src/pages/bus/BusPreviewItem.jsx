import {
  Avatar,
  Button,
  Divider,
  List,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { IMAGES, currencyFormatter } from "../../constants";

function BusPreviewItem({ item }) {
  const navigate = useNavigate();

  const handleBuyTicket = () => {
    navigate(`buy/${item?._id}`, { state: item });
  };

  const cardStyles = {
    // minWidth: 250,
    cursor: "pointer",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    border: "dashed 1px #ccc",
    padding: 1,
    transition: "all 250ms ease-in-out",
  };
  const primaryStyle = { fontWeight: "bold", fontSize: 11 };
  const secondaryStyle = { fontSize: 12 };
  return (
    <>
      <Stack
        direction="row"
        spacing={3}
        sx={cardStyles}
        onClick={handleBuyTicket}
      >
        <Stack spacing={1}>
          <Typography
            color="secondary"
            sx={{ fontWeight: "bold", paddingBottom: 1 }}
          >
            {item.voucherType}
          </Typography>
          <Divider />

          <List>
            <ListItemText
              primary="Available Seats"
              primaryTypographyProps={primaryStyle}
              secondary={`${item?.activeVouchers ?? 0} out of ${
                item?.details?.noOfSeats
              }`}
              secondaryTypographyProps={secondaryStyle}
            />
            <ListItemText
              primary="Date"
              primaryTypographyProps={primaryStyle}
              secondary={moment(item?.details?.date).format(
                "dddd,Do MMMM,YYYY"
              )}
              secondaryTypographyProps={secondaryStyle}
            />
            <Stack
              direction="row"
              spacing={2}
              justifyContent="center"
              alignItems="center"
            >
              <ListItemText
                primary="Boarding Time"
                primaryTypographyProps={primaryStyle}
                secondary={moment(item?.details?.report).format("h:mm a")}
                secondaryTypographyProps={secondaryStyle}
              />

              <ListItemText
                primary="Departure Time"
                primaryTypographyProps={primaryStyle}
                secondary={moment(item?.details?.time).format("h:mm a")}
                secondaryTypographyProps={secondaryStyle}
              />
            </Stack>

            <Stack
              direction="row"
              spacing={2}
              justifyContent="center"
              alignItems="center"
            >
              <ListItemText
                primary="Fare"
                primaryTypographyProps={primaryStyle}
                secondary={currencyFormatter(item?.price)}
                secondaryTypographyProps={{
                  ...secondaryStyle,
                  color: "green",
                }}
              />
              <Button
                variant="outlined"
                sx={{ alignSelf: "flex-end" }}
                size="small"
                onClick={handleBuyTicket}
                endIcon={
                  <Avatar
                    src={IMAGES.bus_ticket}
                    sx={{ width: 32, height: 24 }}
                  />
                }
              >
                Buy Ticket
              </Button>
            </Stack>
          </List>
        </Stack>
      </Stack>
    </>
  );
}

export default BusPreviewItem;
