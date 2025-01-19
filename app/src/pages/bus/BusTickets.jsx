import { useState } from "react";
import {
  Stack,
  Typography,
  Box,
  Button,
  IconButton,
  Avatar,
} from "@mui/material";
import moment from "moment";

import SyncAltSharpIcon from "@mui/icons-material/SyncAltSharp";
import { useNavigate } from "react-router-dom";
import { IMAGES } from "../../constants/images";
import BusSearch from "../../components/inputs/BusSearch";
import CustomDatePicker from "../../components/inputs/CustomDatePicker";

function BusTickets() {
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
    <div
      style={{
        backgroundImage: `linear-gradient(to bottom,rgba(0,0,0,0.2),rgba(0,0,0,0.5)),url(${IMAGES.bus_background})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100svh",
        width: "100swv",
        flexDirection: "column",
        display: "flex",
        justifyContent: "center",
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
      <Box
        sx={{
          gap: 4,
          width: "100%",
          height: "100%",
          p:4
        }}
      >
        <Typography
          variant="h3"
          sx={{
            textAlign: "center",
            color: "white",
            textShadow: "0px 2px 5px rgba(0,0,0,0.2)",
            // fontSize: { xs: 16, sm: 24, md: 32 },
          }}
        >
          Get your tickets and travel to your destination !
        </Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="center"
          alignItems="center"
          sx={{
            maxWidth: "1080px",
            mx: "auto",
            backgroundColor: "rgba(255,255,255,0.1)",
            padding: 2,
            backdropFilter: "blur(5px)",
            WebkitBackdropFilter: "blur(5px)",
          }}
        >
          <BusSearch
            label="Origin"
            value={origin}
            setValue={setOrigin}
            icon={<Avatar src={IMAGES.origin} sx={{ width: 24, height: 24 }} />}
          />
          <IconButton
            size="small"
            sx={{ display: { xs: "none", md: "block" } }}
          >
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
            size="large"
            inputColor='#fff'
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            sx={{ minWidth: 150, py: 2 }}
          >
            Find Tickets
          </Button>
        </Stack>
      </Box>
    </div>
  );
}

export default BusTickets;
