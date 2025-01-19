import {
  Avatar,
  Button,
  Container,
  IconButton,
  Stack,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";
import { useState } from "react";
import BusSearch from "../../components/inputs/BusSearch";
import BusPreviewItem from "./BusPreviewItem";
import SyncAltSharpIcon from "@mui/icons-material/SyncAltSharp";
import ArrowForward from "@mui/icons-material/ArrowForward";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import bus_not_found from "../../assets/images/bus_not_found.svg";
import moment from "moment";
import CustomDatePicker from "../../components/inputs/CustomDatePicker";

import { IMAGES } from "../../constants";
// import Back from '../../components/Back';
import { getBusByOrigin } from "../../api/categoryAPI";
function BusPreview() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [origin, setOrigin] = useState(searchParams.get("origin"));
  const [destination, setDestination] = useState(
    searchParams.get("destination")
  );
  const [date, setDate] = useState(moment(new Date(searchParams.get("date"))));

  const bus = useQuery({
    queryKey: ["bus", origin, destination],
    queryFn: () => getBusByOrigin({ origin, destination }),
    enabled: !!origin && !!destination,
  });

  const handleSearch = () => {
    setSearchParams((params) => {
      params.set("origin", origin);
      params.set("destination", destination);
      params.set("date", date.format("ll"));
      return params;
    });

    bus.refetch();
  };

  return (
    <Container sx={{ minHeight: "100vh", pt: 4, bgcolor: "#fff" }}>
      {origin && destination && (
        <Stack direction="row" spacing={2} pb={2} mt={3}>
          <Typography variant="h6" color="primary">
            {origin}
          </Typography>
          <ArrowForward />
          <Typography variant="h6" color="green">
            {destination}
          </Typography>
        </Stack>
      )}
      {/* <Back to='/evoucher/bus-ticket' /> */}

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="center"
        alignItems="center"
        sx={{
          padding: 1,
          boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
        }}
      >
        <BusSearch
          label="Origin"
          value={origin}
          setValue={setOrigin}
          icon={<Avatar src={IMAGES.origin} sx={{ width: 24, height: 24 }} />}
          inputColor="secondary.main"
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
          inputColor="secondary.main"
        />
        <CustomDatePicker
          value={date}
          setValue={setDate}
          label="Departure Date"
          borderRadius={5}
          size="large"
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          sx={{ minWidth: 150, py: 2 }}
          // endIcon={<Avatar src={IMAGES.bus} sx={{ width: 32, height: 24 }} />}
        >
          Find Tickets
        </Button>
      </Stack>
      {bus?.isLoading ? (
        <Box
          sx={{
            width: "100%",
            height: "50svh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 3,
          }}
        >
          <CircularProgress />
          <Typography>Loading Results..</Typography>
        </Box>
      ) : bus.isError ? (
        <Typography paragraph>
          An error has occurred! Couldn&apos;t fetch bus tickets.
        </Typography>
      ) : bus?.data?.length === 0 ? (
        <Stack
          justifyContent="center"
          alignItems="center"
          spacing={2}
          paddingY={8}
        >
          <Avatar
            src={bus_not_found}
            alt="not found"
            sx={{
              width: { xs: 150, sm: 180, md: 220 },
              height: { xs: 150, sm: 180, md: 220 },
            }}
          />
          <Typography variant="h6" fontWeight="bold" textAlign="center">
            Sorry we couldn&#39;t find any results
          </Typography>
          <Typography textAlign="center">
            We searched and couldn&#39;t find any bus ticket which match your
            search. Adjust your origin or destination.
          </Typography>
        </Stack>
      ) : (
        <>
          <Typography variant="h4" py={4}>
            Available Tickets
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: { xs: "center", md: "flex-start" },
              flexWrap: "wrap",
              gap: 3,
              pb: 8,
            }}
          >
            {bus.data?.map((item) => (
              <BusPreviewItem key={item._id} item={item} />
            ))}
          </Box>
        </>
      )}
    </Container>
  );
}

export default BusPreview;
