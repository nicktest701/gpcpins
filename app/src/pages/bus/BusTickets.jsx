import { useState } from "react";
import {
  Stack,
  Typography,
  Box,
  Button,
  IconButton,
  Avatar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import moment from "moment";

import SyncAltSharpIcon from "@mui/icons-material/SyncAltSharp";
import { useNavigate } from "react-router-dom";
import { IMAGES } from "../../constants/images";
import BusSearch from "../../components/inputs/BusSearch";
import CustomDatePicker from "../../components/inputs/CustomDatePicker";

function BusTickets() {
  const { breakpoints } = useTheme();
  const matches = useMediaQuery(breakpoints.down("sm"));
  const navigate = useNavigate();

  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState(moment());

  const handleSearch = () => {
    const departureDate = moment(date).format("LL");
    navigate(
      `preview?origin=${origin}&destination=${destination}&date=${date}`,
      {
        replace: true,
        state: {
          searchValue: {
            origin,
            destination,
            date: departureDate,
          },
        },
      }
    );
  };

  return (
    <Box
      sx={{
        backgroundImage: `linear-gradient(to bottom,rgba(0,0,0,0.6),rgba(0,0,0,0.8)),url(${IMAGES.bus_background})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100svh",
        // width: "100svw",
        flexDirection: "column",
        display: "flex",
        justifyContent: matches ? "flex-start" : "center",
        padding: 4,
        paddingTop: matches ? "32px" : "1px",
        alignItems: "center",
      }}
    >
      <Typography
        variant="h1"
        color="white"
        sx={{
          textAlign: "center",
        }}
      >
        Bus Tickets
      </Typography>

      <Typography
        variant="body2"
        paragraph
        sx={{
          textAlign: "center",
          color: "white",
          textShadow: "0px 2px 5px rgba(0,0,0,0.2)",
          pb: 4,
          // fontSize: { xs: 16, sm: 24, md: 32 },
        }}
      >
        Get your tickets and travel to your destination !
      </Typography>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        justifyContent="center"
        alignItems="center"
        width={{ xs: "100%", md: "80%" }}
        sx={{
          // maxWidth: "1080px",
          mx: "auto",
          backgroundColor: "rgba(255,255,255,0.1)",
          padding: 2,
          backdropFilter: "blur(5px)",
          WebkitBackdropFilter: "blur(5px)",
          borderRadius: 2,
        }}
      >
        <BusSearch
          label="Origin"
          value={origin}
          setValue={setOrigin}
          icon={<Avatar src={IMAGES.origin} sx={{ width: 24, height: 24 }} />}
        />
        <IconButton size="small" sx={{ display: { xs: "none", md: "block" } }}>
          <SyncAltSharpIcon color="dark" />
        </IconButton>

        <BusSearch
          label="Destination"
          value={destination}
          setValue={setDestination}
          icon={
            <Avatar src={IMAGES.destination} sx={{ width: 24, height: 24 }} />
          }
        />

        <CustomDatePicker
          label="Date"
          value={date}
          setValue={setDate}
          borderRadius={5}
          size="small"
          inputColor="#fff"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSearch}
          fullWidth
          // sx={{ minWidth: 150, py: 2 }}
        >
          Find Ticket
        </Button>
      </Stack>
    </Box>
  );
}

export default BusTickets;
