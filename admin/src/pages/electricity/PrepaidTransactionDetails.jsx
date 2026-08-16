
import { useState } from "react";
import {
  Button,
  Stack,
  Divider,
  Chip,
  Box,
  Paper,
  Grid,
  Skeleton,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
  CheckCircleRounded,
  PendingRounded,
  ReceiptRounded,
  RefreshRounded,
  ErrorOutlineRounded,
  ContentCopyRounded,
  CheckRounded,
  ArrowBackRounded,
} from "@mui/icons-material";
import moment from "moment";

import { getElectricity } from "../../api/electricityAPI";
import CheckOutItem from "../../components/items/CheckOutItem";
import { currencyFormatter } from "../../constants";
import CustomTitle from "../../components/custom/CustomTitle";
import AnimatedContainer from "../../components/animations/AnimatedContainer";

const PrepaidTransactionDetails = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const params = useParams();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  const transactionId = params.id;

  const {
    data: transactionData,
    isLoading: isLoadingData,
    isFetching: isFetchingData,
    isError: isDataError,
    error: dataError,
    refetch: refetchData,
  } = useQuery({
    queryKey: ["electricity-transaction", transactionId],
    queryFn: () => getElectricity(transactionId),
    enabled: !!transactionId,
    initialData: queryClient
      .getQueryData(["ecg-transactions"])
      ?.find((t) => t.id === transactionId),
  });

  const handleCopyToken = (token) => {
    if (!token) return;
    navigator.clipboard.writeText(token).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  // ----- Loading state -----
  if (isLoadingData) {
    return (
      <AnimatedContainer>
        <Skeleton variant="text" width={240} height={44} />
        <Skeleton variant="text" width={320} height={24} sx={{ mb: 2 }} />
        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.6)}` }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Skeleton variant="rounded" width={130} height={36} />
              <Skeleton variant="rounded" width={110} height={36} />
            </Stack>
            <Grid container spacing={2} sx={{ p: 2 }}>
              {[...Array(8)].map((_, i) => (
                <Grid item xs={12} sm={6} key={i}>
                  <Skeleton variant="text" width="50%" height={18} />
                  <Skeleton variant="text" width="75%" height={28} />
                </Grid>
              ))}
            </Grid>
            <Divider>
              <Skeleton variant="rounded" width={110} height={28} />
            </Divider>
          </Stack>
        </Paper>
      </AnimatedContainer>
    );
  }

  // ----- Error state -----
  if (isDataError || !transactionData) {
    return (
      <Box sx={{ p: 3, maxWidth: 560, mx: "auto" }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
            bgcolor: alpha(theme.palette.error.main, 0.04),
          }}
        >
          <ErrorOutlineRounded color="error" sx={{ fontSize: 40, mb: 1 }} />
          <Box sx={{ mb: 1, fontWeight: 600, fontSize: "1.05rem" }}>
            Couldn&apos;t load this transaction
          </Box>
          <Box sx={{ mb: 3, color: "text.secondary", fontSize: "0.9rem" }}>
            {dataError?.message ||
              "This transaction couldn't be found, or something went wrong while loading it."}
          </Box>
          <Stack direction="row" spacing={1.5} justifyContent="center">
            <Button
              variant="outlined"
              startIcon={<ArrowBackRounded />}
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>
            <LoadingButton
              variant="contained"
              color="error"
              startIcon={<RefreshRounded />}
              loading={isFetchingData}
              onClick={() => refetchData()}
            >
              Try again
            </LoadingButton>
          </Stack>
        </Paper>
      </Box>
    );
  }

  const { info, ...rest } = transactionData;
  const isCompleted = rest.isProcessed;

  // ----- View mode -----
  return (
    <AnimatedContainer>
      <CustomTitle
        title="Transaction Details"
        subtitle="Complete information about this prepaid electricity transaction"
        showBack
      />

      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
        }}
      >
        <Stack >
          {/* Status + actions */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={1}
          >
            <Chip
              label={isCompleted ? "Completed" : "Pending"}
              color={isCompleted ? "success" : "warning"}
              icon={isCompleted ? <CheckCircleRounded /> : <PendingRounded />}
              sx={{ fontWeight: 600 }}
            />
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {info?.downloadLink && (
                <Button
                  component="a"
                  href={info.downloadLink}
                  target="_blank"
                  rel="noreferrer"
                  variant="contained"
                  startIcon={<ReceiptRounded />}
                  sx={{ textTransform: "none", borderRadius: 2 }}
                >
                  View Receipt
                </Button>
              )}
              <LoadingButton
                variant="outlined"
                startIcon={<RefreshRounded />}
                loading={isFetchingData}
                onClick={() => refetchData()}
                sx={{ textTransform: "none", borderRadius: 2 }}
              >
                Refresh
              </LoadingButton>
            </Stack>
          </Stack>

          <Divider sx={{py:2}} />

          <Grid container spacing={2} sx={{pt:3}}>
            <Grid item xs={12} sm={6}>
              <CheckOutItem title="Transaction ID" value={rest.id} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <CheckOutItem
                    title="Recharge Token"
                    value={info?.rechargeToken || "N/A"}
                  />
                </Box>
                {info?.rechargeToken && (
                  <Tooltip title={copied ? "Copied!" : "Copy token"}>
                    <IconButton
                      size="small"
                      onClick={() => handleCopyToken(info.rechargeToken)}
                    >
                      {copied ? (
                        <CheckRounded fontSize="small" color="success" />
                      ) : (
                        <ContentCopyRounded fontSize="small" />
                      )}
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <CheckOutItem
                title="Purchased On"
                value={moment(rest.createdAt).format("LLL")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CheckOutItem title="Meter Number" value={rest.number} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CheckOutItem title="Meter Name" value={rest.name || "N/A"} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CheckOutItem title="SPN Number" value={rest.spn || "N/A"} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CheckOutItem title="District" value={rest.district || "N/A"} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CheckOutItem title="Payment Method" value={rest.mode || "N/A"} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CheckOutItem
                title="Top Up Amount"
                value={currencyFormatter(rest.topup)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CheckOutItem
                title="Total Amount"
                value={currencyFormatter(rest.amount)}
              />
            </Grid>
            {isCompleted && (
              <>
                <Grid item xs={12} sm={6}>
                  <CheckOutItem
                    title="Payment By"
                    value={rest.paymentBy || "N/A"}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CheckOutItem
                    title="Completed On"
                    value={
                      rest.updatedAt
                        ? moment(rest.updatedAt).format("LLL")
                        : "N/A"
                    }
                  />
                </Grid>
              </>
            )}
          </Grid>
        </Stack>
      </Paper>
    </AnimatedContainer>
  );
};

export default PrepaidTransactionDetails;

// import {
//   Button,
//   Stack,
// Divider,
//   Chip,
//   Box,
//   Paper,
//   Grid,
//   Alert,
//   CircularProgress,
// } from "@mui/material";

// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import { useNavigate, useParams, } from "react-router-dom";
// import {

//   CheckCircle,
//   Cancel,
//   Receipt,
//   Refresh,
// } from "@mui/icons-material";
// import moment from "moment";

// import {
//   getElectricity,

// } from "../../api/electricityAPI";
// import CheckOutItem from "../../components/items/CheckOutItem";
// import { currencyFormatter } from "../../constants";
// import CustomTitle from "../../components/custom/CustomTitle";

// import AnimatedContainer from "../../components/animations/AnimatedContainer";

// const PrepaidTransactionDetails = () => {
//   const navigate = useNavigate();
//   const params = useParams();
//   const queryClient = useQueryClient();


//   // Fetch transaction data
//   const transactionId = params.id;

//   const {
//     data: transactionData,
//     isLoading: isLoadingData,
//     isError: isDataError,
//     error: dataError,
//     refetch: refetchData,
//   } = useQuery({
//     queryKey: ["electricity-transaction", transactionId],
//     queryFn: () => getElectricity(transactionId),
//     enabled: !!transactionId,
//     initialData: queryClient
//       .getQueryData(["ecg-transactions"])
//       ?.find((t) => t.id === transactionId),
//   });

//   // console.log(transactionData)


  




//   // Loading state
//   if (isLoadingData) {
//     return (
//       <Box
//         sx={{
//           display: "flex",
//           justifyContent: "center",
//           alignItems: "center",
//           minHeight: "60vh",
//         }}
//       >
//         <CircularProgress />
//       </Box>
//     );
//   }

//   // Error state
//   if (isDataError || !transactionData) {
//     return (
//       <Box sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
//         <Paper sx={{ p: 4, textAlign: "center", borderRadius: 1.2 }}>
//           <Alert severity="error" sx={{ mb: 2 }}>
//             {dataError?.message || "Transaction not found."}
//           </Alert>
//           <Button variant="contained" onClick={() => navigate(-1)}>
//             Go Back
//           </Button>
//         </Paper>
//       </Box>
//     );
//   }

//   const { info, ...rest } = transactionData;
//   const isCompleted = rest.isProcessed;

//   // ----- Render: View Mode -----

//   return (
//     <AnimatedContainer>
//         <CustomTitle
//           title="Transaction Details"
//           subtitle="Complete information about this prepaid electricity transaction"
//           // divider={true}
//           showBack
//         />
   
    


//         <Paper
//           elevation={0}
//           sx={{
//             p:2,
//             borderRadius: 1.2,
//             // border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
//           }}
//         >
//           <Stack spacing={2}>
//             {/* Action buttons */}
//             <Stack
//               direction="row"
//               spacing={1}
//               justifyContent="flex-end"
//               flexWrap="wrap"
//             >
//               {info?.downloadLink && (
//                 <Button
//                   component="a"
//                   href={info.downloadLink}
//                   target="_blank"
//                   variant="contained"
//                   startIcon={<Receipt />}
//                 >
//                   View Receipt
//                 </Button>
//               )}
//               <Button
//                 variant="outlined"
//                 startIcon={<Refresh />}
//                 onClick={() => refetchData()}
//               >
//                 Refresh
//               </Button>
//             </Stack>

//             <Grid container spacing={2} padding={2}>
//               <Grid item xs={12} sm={6}>
//                 <CheckOutItem title="Transaction ID" value={rest.id} />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <CheckOutItem title="Recharge Token" value={info?.rechargeToken} />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <CheckOutItem
//                   title="Purchased On"
//                   value={moment(rest.createdAt).format("LLL")}
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <CheckOutItem title="Meter Number" value={rest.number} />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <CheckOutItem title="Meter Name" value={rest.name || "N/A"} />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <CheckOutItem title="SPN Number" value={rest.spn || "N/A"} />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <CheckOutItem title="District" value={rest.district || "N/A"} />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <CheckOutItem
//                   title="Payment Method"
//                   value={rest.mode || "N/A"}
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <CheckOutItem
//                   title="Top Up Amount"
//                   value={currencyFormatter(rest.topup)}
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <CheckOutItem
//                   title="Total Amount"
//                   value={currencyFormatter(rest.amount)}
//                 />
//               </Grid>
//               {isCompleted && (
//                 <>
//                   <Grid item xs={12} sm={6}>
//                     <CheckOutItem
//                       title="Payment By"
//                       value={rest.paymentBy || "N/A"}
//                     />
//                   </Grid>
//                   <Grid item xs={12} sm={6}>
//                     <CheckOutItem
//                       title="Completed On"
//                       value={
//                         rest.updatedAt
//                           ? moment(rest.updatedAt).format("LLL")
//                           : "N/A"
//                       }
//                     />
//                   </Grid>
//                 </>
//               )}
//               {/* <Grid item xs={12}>
//                 <CheckOutItem
//                   title="Transaction Token"
//                   value={info?.orderNo || "N/A"}
//                 />
//               </Grid> */}
//             </Grid>

//             <Divider>
//               <Chip
//                 label={isCompleted ? "Completed" : "Pending"}
//                 color={isCompleted ? "success" : "warning"}
//                 icon={isCompleted ? <CheckCircle /> : <Cancel />}
//                 sx={{ fontWeight: 600 }}
//               />
//             </Divider>
//           </Stack>
//         </Paper>
   
//     </AnimatedContainer>
//   );
// };

// export default PrepaidTransactionDetails;
