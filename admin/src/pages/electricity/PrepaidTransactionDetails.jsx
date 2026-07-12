
import {
  Button,
  Stack,
Divider,
  Chip,
  Box,
  Typography,
  IconButton,

  Paper,
  Grid,
  Alert,
  CircularProgress,

  alpha,
  useTheme,
} from "@mui/material";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, } from "react-router-dom";
import {
  ArrowBack,
  CheckCircle,
  Cancel,
  Receipt,
  Refresh,
} from "@mui/icons-material";
import moment from "moment";

import {
  getElectricity,

} from "../../api/electricityAPI";
import CheckOutItem from "../../components/items/CheckOutItem";
import { currencyFormatter } from "../../constants";
import CustomTitle from "../../components/custom/CustomTitle";

import AnimatedContainer from "../../components/animations/AnimatedContainer";

const PrepaidTransactionDetails = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const params = useParams();
  const queryClient = useQueryClient();


  // Fetch transaction data
  const transactionId = params.id;

  const {
    data: transactionData,
    isLoading: isLoadingData,
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



  




  // Loading state
  if (isLoadingData) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (isDataError || !transactionData) {
    return (
      <Box sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
        <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {dataError?.message || "Transaction not found."}
          </Alert>
          <Button variant="contained" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </Paper>
      </Box>
    );
  }

  const { info, ...rest } = transactionData;
  const isCompleted = rest.isProcessed;

  // ----- Render: View Mode -----

  return (
    <AnimatedContainer>
        <CustomTitle
          title="Transaction Details"
          subtitle="Complete information about this prepaid electricity transaction"
          // divider={true}
          showBack
        />
   
    


        <Paper
          elevation={0}
          sx={{
            p:2,
            borderRadius: 3,
            // border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
          }}
        >
          <Stack spacing={2}>
            {/* Action buttons */}
            <Stack
              direction="row"
              spacing={1}
              justifyContent="flex-end"
              flexWrap="wrap"
            >
              {info?.downloadLink && (
                <Button
                  component="a"
                  href={info.downloadLink}
                  target="_blank"
                  variant="contained"
                  startIcon={<Receipt />}
                >
                  View Receipt
                </Button>
              )}
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => refetchData()}
              >
                Refresh
              </Button>
            </Stack>

            <Grid container spacing={2} padding={2}>
              <Grid item xs={12} sm={6}>
                <CheckOutItem title="Transaction ID" value={rest.id} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CheckOutItem title="Order ID" value={rest.paymentId} />
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
                <CheckOutItem
                  title="Payment Method"
                  value={rest.mode || "N/A"}
                />
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
                      title="Completed By"
                      value={rest.issuerName || "N/A"}
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
              <Grid item xs={12}>
                <CheckOutItem
                  title="Transaction Token"
                  value={info?.orderNo || "N/A"}
                />
              </Grid>
            </Grid>

            <Divider>
              <Chip
                label={isCompleted ? "Completed" : "Pending"}
                color={isCompleted ? "success" : "warning"}
                icon={isCompleted ? <CheckCircle /> : <Cancel />}
                sx={{ fontWeight: 600 }}
              />
            </Divider>
          </Stack>
        </Paper>
   
    </AnimatedContainer>
  );
};

export default PrepaidTransactionDetails;

// import { useContext, useState, useEffect } from "react";
// import {
//   Button,
//   DialogActions,
//   Stack,
//   TextField,
//   Divider,
//   Chip,
//   Box,
//   InputLabel,
//   Typography,
//   IconButton,
//   Avatar,
//   Paper,
//   Grid,
//   Alert,
//   CircularProgress,
// } from "@mui/material";
// import { LoadingButton } from "@mui/lab";
// import { useForm, Controller } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import {
//   ArrowBack,
//   UploadFile,
//   CheckCircle,
//   Cancel,
// } from "@mui/icons-material";
// import moment from "moment";
// import Swal from "sweetalert2";
// import {
//   useCustomContext,
// } from "../../context/providers/CustomProvider";
// import { getElectricity } from "../../api/electricityAPI";
// import { globalAlertType } from "../../components/alert/alertType";
// import CheckOutItem from "../../components/items/CheckOutItem";
// import { currencyFormatter } from "../../constants";
// import CustomTitle from "../../components/custom/CustomTitle";
// import { processPrepaidValidationSchema } from "../../config/validationSchema";
// import { uploadFile } from "@/lib/upload";

// const PrepaidTransactionDetails = () => {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const queryClient = useQueryClient();
//   const { customDispatch } = useCustomContext();

//   // Local state for file upload
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [isUploading, setIsUploading] = useState(false);
//   const [uploadError, setUploadError] = useState("");

//   // Fetch transaction data
//   const transactionId = searchParams.get("row_id");
//   const viewMode = searchParams.get("view_status") === "true";

//   const {
//     data: transactionData,
//     isLoading: isLoadingData,
//     isError: isDataError,
//     error: dataError,
//   } = useQuery({
//     queryKey: ["electricity-transaction", transactionId],
//     queryFn: () => getElectricity(transactionId),
//     enabled: !!transactionId,
//     initialData: queryClient
//       .getQueryData(["ecg-transactions"])
//       ?.find((t) => t.id === transactionId),
//   });

//   // Warn on page leave
//   useEffect(() => {
//     const handleBeforeUnload = (e) => {
//       e.preventDefault();
//       e.returnValue = "Are you sure you want to leave?";
//       return "Are you sure you want to leave?";
//     };
//     window.addEventListener("beforeunload", handleBeforeUnload);
//     return () => window.removeEventListener("beforeunload", handleBeforeUnload);
//   }, []);

//   // Loading state
//   if (isLoadingData) {
//     return (
//       <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   // Error state
//   if (isDataError || !transactionData) {
//     return (
//       <Box sx={{ p: 3 }}>
//         <Alert severity="error">
//           {dataError?.message || "Transaction not found."}
//         </Alert>
//         <Button variant="contained" onClick={() => navigate(-1)} sx={{ mt: 2 }}>
//           Go Back
//         </Button>
//       </Box>
//     );
//   }

//   const { info, ...rest } = transactionData;
//   const isCompleted = rest.isProcessed;

//   // View mode: display transaction details
//   if (viewMode) {
//     return (
//       <Box sx={{ p: 3 }}>
//         <IconButton onClick={() => navigate(-1)} sx={{ mb: 2 }}>
//           <ArrowBack />
//         </IconButton>

//         <CustomTitle
//           title="Transaction Status"
//           subtitle="Details of the current prepaid electricity transaction"
//         />

//         <Paper elevation={0} sx={{ p: 3, mt: 2 }}>
//           <Stack spacing={2}>
//             {info?.downloadLink && (
//               <Button
//                 component="a"
//                 href={info.downloadLink}
//                 target="_blank"
//                 variant="contained"
//                 sx={{ alignSelf: "flex-end" }}
//               >
//                 View Receipt
//               </Button>
//             )}
//             <Grid container spacing={2}>
//               <Grid item xs={12} sm={6}>
//                 <CheckOutItem title="Transaction ID" value={rest.id} />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <CheckOutItem title="Order ID" value={rest.paymentId} />
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
//                 <CheckOutItem title="Meter Name" value={rest.name} />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <CheckOutItem title="SPN Number" value={rest.spn} />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <CheckOutItem title="District" value={rest.district} />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <CheckOutItem title="Payment Method" value={rest.mode} />
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
//                       title="Completed By"
//                       value={rest.issuerName || "N/A"}
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
//               <Grid item xs={12}>
//                 <CheckOutItem title="Transaction Token" value={info?.orderNo} />
//               </Grid>
//             </Grid>
//             <Divider>
//               <Chip
//                 label={isCompleted ? "Completed" : "Pending"}
//                 color={isCompleted ? "success" : "warning"}
//                 icon={isCompleted ? <CheckCircle /> : <Cancel />}
//               />
//             </Divider>
//           </Stack>
//         </Paper>
//       </Box>
//     );
//   }

// };

// export default PrepaidTransactionDetails;
