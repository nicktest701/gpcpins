import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  List,
  Stack,
  Typography,
} from "@mui/material";
import { lazy, useContext, useEffect, useState } from "react";
import Meter from "../meters/Meter";
import MeterListItem from "../meters/MeterListItem";
import ViewMeter from "../meters/ViewMeter";
import { CustomContext } from "../../../context/providers/CustomProvider";
import AddMeter from "../meters/AddMeter";
import UserPayment from "../meters/UserPayment";
import ConfirmAddMeter from "../meters/ConfirmAddMeter";
import { useQuery } from "@tanstack/react-query";
import { getAllMetersByUserId } from "../../../api/meterAPI";
import { NoteRounded } from "@mui/icons-material";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../../context/providers/AuthProvider";
import { IMAGES } from "../../../constants";
import { getInitials } from "../../../config/validation";

const PrepaidTransactions = lazy(() => import("./PrepaidTransactions"));
function Meters() {
  const { user } = useContext(AuthContext);
  const { customDispatch } = useContext(CustomContext);
  const [photo, setPhoto] = useState(null);
  const [openTransaction, setOpenTransaction] = useState(false);

  const meterInfo = useQuery({
    queryKey: ["meter", user?.id],
    queryFn: () => getAllMetersByUserId(user?.id),
    enabled: !!user?.id,
    retry: 1,
    initialData: [],
  });

  useEffect(() => {
    setPhoto(user?.profile);
  }, [user]);

  const openAddMeter = (type) => {
    customDispatch({
      type: "openAddMeter",
      payload: {
        open: true,
        type,
        details: {},
      },
    });
  };

  if (!user?.id) {
    return <Navigate to="/electricity" />;
  }

  if (meterInfo.isLoading) {
    return (
      <Container sx={{ display: "grid", placeItems: "center", height: "50vh" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (meterInfo.isError) {
    return <Navigate to="/electricity" />;
  }

  return (
    <Container sx={{ py: 3 }}>
      {/* <Container
        sx={{
          position: "relative",
          paddingY: 2,
          background: `linear-gradient(rgba(0,0,0,0.8),rgba(0,0,0,0.9)),url(${IMAGES.ecg}) no-repeat `,
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Avatar
          alt="profile_icon"
          src={photo}
          sx={{
            width: 50,
            height: 50,
            bgcolor: "primary.main",
            textTransform: "uppercase",
          }}
        >
          {getInitials(user?.email[0])}
        </Avatar>
        <Stack>
          <Typography variant="h6" fontWeight="bold">
            {user?.name}
          </Typography>
          <Typography>{user?.email}</Typography>
        </Stack>
      </Container> */}

      <Box paddingY={4}>
        <Typography variant="h6">New Meter</Typography>
        <Typography variant="body2" paragraph>
          Add new meter and buy your prepaid units.
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 4,
            paddingY: 2,
          }}
        >
          <Meter
            title="Add Prepaid Meter"
            color="#42BFDD"
            type="prepaid"
            onClick={openAddMeter}
          />
          {/* <Meter
            title='Add Postpaid Meter'
            color='#42BFDD'
            type='postpaid'
            onClick={openAddMeter}
          /> */}
        </Box>
      </Box>
      <Divider />

      <Stack
        justifyContent="flex-end"
        alignItems="flex-end"
        paddingY={2}
      ></Stack>
      <List
        subheader={
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            py={2}
          >
            <Box>
              <Typography variant="h5">Available Meters</Typography>
              <Typography variant="body2" color="primary" paragraph>
                Showing details of user meters
              </Typography>
            </Box>
            <Button
              style={{ textDecoration: "underline" }}
              size="small"
              onClick={() => setOpenTransaction(true)}
            >
              View Transactions
            </Button>
          </Stack>
        }
        sx={{
          paddingY: 4,
        }}
      >
        {meterInfo?.data?.length > 0 ? (
          meterInfo?.data?.map((meter) => (
            <MeterListItem key={meter?.number} {...meter} />
          ))
        ) : (
          <Stack justifyContent="center" alignItems="center" rowGap={2}>
            <Typography textAlign="center" variant="subtitle">
              No meter available. Add new meter to start your transaction.
            </Typography>
          </Stack>
        )}
      </List>
      <AddMeter />
      <ConfirmAddMeter />
      <ViewMeter />
      <UserPayment />
      <PrepaidTransactions
        open={openTransaction}
        setOpen={setOpenTransaction}
      />
    </Container>
  );
}

export default Meters;
