import { useState, lazy, Suspense } from "react";
import {
  Box,
  Button,
  Container,
  Divider,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../context/providers/AuthProvider";
import { useCustomContext } from "../../../context/providers/CustomProvider";
import { getAllMetersByUserId } from "../../../api/meterAPI";
import Meter from "../meters/Meter";
import AddMeter from "../meters/AddMeter";
import ConfirmAddMeter from "../meters/ConfirmAddMeter";
import UserPayment from "../meters/UserPayment";
import MeterTable from "./MeterTable"; // desktop table (new component)
import MeterCardList from "./MeterCardList"; // mobile cards (new component)

const PrepaidTransactions = lazy(() => import("./PrepaidTransactions"));

function Meters() {
  const { user } = useAuth();
  const { customDispatch } = useCustomContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [openTransaction, setOpenTransaction] = useState(false);

  const {
    data: meters,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["meter", user?.id],
    queryFn: () => getAllMetersByUserId(user?.id),
    enabled: !!user?.id,
    retry: 1,
    initialData: [],
  });

  const openAddMeter = (type) => {
    customDispatch({
      type: "openAddMeter",
      payload: { open: true, type, details: {} },
    });
  };

  if (!user?.id) return <Navigate to="/electricity" />;
  if (isError) return <Navigate to="/electricity" />;

  // Loading skeletons
  const LoadingSkeleton = () => (
    <Stack spacing={2}>
      {[1, 2, 3].map((i) => (
        <Paper key={i} sx={{ p: 2 }}>
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="rectangular" height={40} />
        </Paper>
      ))}
    </Stack>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Add New Meter Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Add New Meter
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Register a new prepaid meter to start buying units.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
          <Meter
            title="Add Prepaid Meter"
            color="#42BFDD"
            type="prepaid"
            onClick={openAddMeter}
          />
        </Box>
      </Paper>

      <Divider sx={{ my: 3 }} />

      {/* Meters List Section */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h5" fontWeight="bold">
            My Meters
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and top up your registered meters
          </Typography>
        </Box>
        <Button
          variant="text"
          size="small"
          onClick={() => setOpenTransaction(true)}
          sx={{ textDecoration: "underline" }}
        >
          View All Transactions
        </Button>
      </Stack>

      {isLoading ? (
        <LoadingSkeleton />
      ) : meters?.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary" gutterBottom>
            No meters registered yet.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => openAddMeter("prepaid")}
            sx={{ mt: 1 }}
          >
            Add Your First Meter
          </Button>
        </Paper>
      ) : isMobile ? (
        <MeterCardList meters={meters} />
      ) : (
        <MeterTable meters={meters} />
      )}

      {/* Modals */}
      <AddMeter />
      <ConfirmAddMeter />
      <UserPayment />
      <Suspense fallback={<LoadingSkeleton />}>
        <PrepaidTransactions
          open={openTransaction}
          setOpen={setOpenTransaction}
        />
      </Suspense>
    </Container>
  );
}

export default Meters;

// import {
//   Box,
//   Button,
//   CircularProgress,
//   Container,
//   Divider,
//   List,
//   Stack,
//   Typography,
// } from "@mui/material";
// import { lazy, useEffect, useState } from "react";
// import Meter from "../meters/Meter";
// import MeterListItem from "../meters/MeterListItem";
// import { useCustomContext } from "../../../context/providers/CustomProvider";
// import AddMeter from "../meters/AddMeter";
// import UserPayment from "../meters/UserPayment";
// import ConfirmAddMeter from "../meters/ConfirmAddMeter";
// import { useQuery } from "@tanstack/react-query";
// import { getAllMetersByUserId } from "../../../api/meterAPI";

// import { Navigate } from "react-router-dom";
// import { useAuth } from "../../../context/providers/AuthProvider";

// const PrepaidTransactions = lazy(() => import("./PrepaidTransactions"));
// function Meters() {
//   const { user } = useAuth();
//   const { customDispatch } = useCustomContext();
//   const [photo, setPhoto] = useState(null);
//   const [openTransaction, setOpenTransaction] = useState(false);

//   const meterInfo = useQuery({
//     queryKey: ["meter", user?.id],
//     queryFn: () => getAllMetersByUserId(user?.id),
//     enabled: !!user?.id,
//     retry: 1,
//     initialData: [],
//   });

//   useEffect(() => {
//     setPhoto(user?.profile);
//   }, [user]);

//   const openAddMeter = (type) => {
//     customDispatch({
//       type: "openAddMeter",
//       payload: {
//         open: true,
//         type,
//         details: {},
//       },
//     });
//   };

//   if (!user?.id) {
//     return <Navigate to="/electricity" />;
//   }

//   if (meterInfo.isLoading) {
//     return (
//       <Container sx={{ display: "grid", placeItems: "center", height: "50vh" }}>
//         <CircularProgress />
//       </Container>
//     );
//   }

//   if (meterInfo.isError) {
//     return <Navigate to="/electricity" />;
//   }

//   return (
//     <Container sx={{ py: 3 }}>
//       <Box paddingY={4}>
//         <Typography variant="h6">New Meter</Typography>
//         <Typography variant="body2" paragraph>
//           Add new meter and buy your prepaid units.
//         </Typography>

//         <Box
//           sx={{
//             display: "flex",
//             justifyContent: "center",
//             alignItems: "center",
//             gap: 4,
//             paddingY: 2,
//           }}
//         >
//           <Meter
//             title="Add Prepaid Meter"
//             color="#42BFDD"
//             type="prepaid"
//             onClick={openAddMeter}
//           />
//           {/* <Meter
//             title='Add Postpaid Meter'
//             color='#42BFDD'
//             type='postpaid'
//             onClick={openAddMeter}
//           /> */}
//         </Box>
//       </Box>
//       <Divider />

//       <Stack
//         justifyContent="flex-end"
//         alignItems="flex-end"
//         paddingY={2}
//       ></Stack>
//       <List
//         subheader={
//           <Stack
//             direction={{ xs: "column", md: "row" }}
//             justifyContent="space-between"
//             py={2}
//           >
//             <Box>
//               <Typography variant="h5">Available Meters</Typography>
//               <Typography variant="body2" color="primary" paragraph>
//                 Showing details of user meters
//               </Typography>
//             </Box>
//             <Button
//               style={{ textDecoration: "underline" }}
//               size="small"
//               onClick={() => setOpenTransaction(true)}
//             >
//               View Transactions
//             </Button>
//           </Stack>
//         }
//         sx={{
//           paddingY: 4,
//         }}
//       >
//         {meterInfo?.data?.length > 0 ? (
//           meterInfo?.data?.map((meter) => (
//             <MeterListItem key={meter?.number} {...meter} />
//           ))
//         ) : (
//           <Stack justifyContent="center" alignItems="center" rowGap={2}>
//             <Typography textAlign="center" variant="subtitle">
//               No meter available. Add new meter to start your transaction.
//             </Typography>
//           </Stack>
//         )}
//       </List>
//       <AddMeter />
//       <ConfirmAddMeter />
//       <UserPayment />
//       <PrepaidTransactions
//         open={openTransaction}
//         setOpen={setOpenTransaction}
//       />
//     </Container>
//   );
// }

// export default Meters;
