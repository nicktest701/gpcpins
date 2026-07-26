import React, { useState, useEffect } from "react";
import {
  Alert,
  Button,
  Container,
  Divider,
  Stack,
  Typography,
  Link as MuiLink,
  Paper,
  Box,
  Skeleton,
  Chip,
  TextField,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { findTransaction } from "../../api/transactionAPI";
import CheckOutItem from "../../components/items/CheckOutItem";
import moment from "moment";
import { currencyFormatter } from "../../constants";
import {
  FileDownloadRounded,
  ArrowBackRounded,
  HomeRounded,
  RefreshRounded,
  SearchRounded,
} from "@mui/icons-material";

const LostVoucher = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  // State management
  const [errCount, setErrCount] = useState(0);
  const [showRetryInputs, setShowRetryInputs] = useState(false);
  const [searchId, setSearchId] = useState(state?.id || "");
  const [searchMobile, setSearchMobile] = useState(state?.mobileNo || "");

  const transaction = useQuery({
    queryKey: ["retrieve-voucher", searchId, searchMobile],
    queryFn: () => findTransaction(searchId, searchMobile),
    enabled: !!searchId && !!searchMobile,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  useEffect(() => {
    if (transaction.isError) {
      setErrCount((prev) => prev + 1);
    }
  }, [transaction.isError]);

  // Initial gatekeeper route validation
  if (!state?.id || !state?.mobileNo) {
    return <Navigate to={state?.general ? "/" : "/evoucher"} replace />;
  }

  const handleGoBack = () => {
    navigate(state?.general ? "/" : "/evoucher");
  };

  const handleInlineSearch = (e) => {
    e.preventDefault();
    if (searchId && searchMobile) {
      transaction.refetch();
    }
  };

  // Helper utility to supply styled status chip parameters dynamically
  const getStatusChipProps = (status) => {
    const normalized = status?.toLowerCase() || "";
    if (
      normalized.includes("success") ||
      normalized.includes("complete") ||
      normalized === "paid"
    ) {
      return { color: "success", label: status || "Success" };
    }
    if (normalized.includes("pending") || normalized.includes("progress")) {
      return { color: "warning", label: status || "Pending" };
    }
    if (normalized.includes("fail") || normalized.includes("cancel")) {
      return { color: "error", label: status || "Failed" };
    }
    return { color: "default", label: status || "Unknown" };
  };

  return (
    <Box sx={{ width: "100%", py: 4 }}>
      {/* Help Banner Container */}
      {errCount > 2 && (
        <Container maxWidth="md" sx={{ mb: 2 }}>
          <Alert
            severity="info"
            sx={{ fontSize: "13px", borderRadius: 2, alignItems: "center" }}
          >
            Having trouble retrieving vouchers, tickets, or transaction details?
            Send an SMS to <b>+233244012766</b> or chat via{" "}
            <MuiLink
              component="a"
              href="https://whatsapp.com"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ fontWeight: "bold", textDecoration: "underline" }}
            >
              WhatsApp Support Desk
            </MuiLink>
            .
          </Alert>
        </Container>
      )}

      <Container
        maxWidth="md"
        sx={{
          minHeight: "65svh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 3,
        }}
      >
        {/* MODERN SKELETON LOADER STATE */}
        {transaction.isFetching ? (
          <Paper
            variant="outlined"
            sx={{ p: { xs: 2, sm: 4 }, width: "100%", borderRadius: 3 }}
          >
            <Stack spacing={2} alignItems="center" sx={{ mb: 4 }}>
              <Skeleton variant="text" width="40%" height={32} />
              <Skeleton variant="text" width="25%" height={20} />
            </Stack>
            <Stack spacing={2.5}>
              <Divider />
              {[...Array(6)].map((_, i) => (
                <Stack direction="row" justifyContent="space-between" key={i}>
                  <Skeleton variant="text" width="30%" height={24} />
                  <Skeleton variant="text" width="45%" height={24} />
                </Stack>
              ))}
              <Divider sx={{ my: 1 }} />
              <Skeleton
                variant="rectangular"
                width="100%"
                maxWidth={340}
                height={48}
                sx={{ mx: "auto", borderRadius: 2 }}
              />
            </Stack>
          </Paper>
        ) : transaction.isError ? (
          /* ERROR / NOT FOUND STATE WITH CONDITIONAL INLINE FIELDS */
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 3, sm: 5 },
              width: "100%",
              borderRadius: 3,
              textAlign: "center",
            }}
          >
            <Typography
              variant="h5"
              color="error"
              fontWeight="bold"
              gutterBottom
            >
              No Match Found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Sorry, we could not find a transaction matching this information.
            </Typography>

            {showRetryInputs ? (
              <Box
                component="form"
                onSubmit={handleInlineSearch}
                sx={{ maxWidth: 400, mx: "auto", mt: 2 }}
              >
                <Stack spacing={2.5}>
                  <TextField
                    label="Transaction ID"
                    variant="outlined"
                    size="small"
                    fullWidth
                    required
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                  />
                  <TextField
                    label="Mobile Number"
                    variant="outlined"
                    size="small"
                    fullWidth
                    required
                    value={searchMobile}
                    onChange={(e) => setSearchMobile(e.target.value)}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<SearchRounded />}
                    disabled={!searchId || !searchMobile}
                    fullWidth
                  >
                    Search Transaction
                  </Button>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => setShowRetryInputs(false)}
                  >
                    Cancel
                  </Button>
                </Stack>
              </Box>
            ) : (
              <Stack
                direction="row"
                spacing={2}
                justifyContent="center"
                sx={{ mt: 1 }}
              >
                <Button
                  variant="outlined"
                  startIcon={<RefreshRounded />}
                  onClick={() => setShowRetryInputs(true)}
                >
                  Try Again
                </Button>
                <Button
                  variant="text"
                  startIcon={<ArrowBackRounded />}
                  onClick={handleGoBack}
                >
                  Go Back
                </Button>
              </Stack>
            )}
          </Paper>
        ) : (
          /* SUCCESS STATE WITH SEMANTIC BADGES */
          <Paper
            elevation={0}
            variant="outlined"
            sx={{
              p: { xs: 2, sm: 4 },
              width: "100%",
              borderRadius: 3,
              bgcolor: "background.paper",
            }}
          >
            <Stack spacing={1} alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="h5" color="success.main" fontWeight="bold">
                Transaction Found!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Showing details of your transaction
              </Typography>
            </Stack>

            <Stack rowGap={2.5}>
              <Divider />

              <CheckOutItem
                title="Transaction ID"
                value={transaction?.data?.id}
              />
              {transaction?.data?.mode === "Mobile Money" && (
                <CheckOutItem
                  title="External Transaction ID"
                  value={transaction?.data?.externalTransactionId}
                />
              )}
              <CheckOutItem
                title="Category"
                value={transaction?.data?.categoryName}
              />
              <CheckOutItem title="Type" value={transaction?.data?.service} />
              <CheckOutItem
                title="Amount Paid"
                value={currencyFormatter(transaction?.data?.amount)}
              />
              <CheckOutItem
                title="Payment Method"
                value={transaction?.data?.mode}
              />
              {transaction?.data?.phonenumber && (
                <CheckOutItem
                  title="Mobile No."
                  value={transaction?.data?.phonenumber}
                />
              )}
              {transaction?.data?.email && (
                <CheckOutItem
                  title="Email Address"
                  value={transaction?.data?.email}
                />
              )}

              {/* Dynamically Badged Status Field */}
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ py: 0.5 }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight="medium"
                >
                  Status
                </Typography>
                <Chip
                  size="small"
                  variant="light"
                  {...getStatusChipProps(transaction?.data?.status)}
                  sx={{
                    fontWeight: "bold",
                    textTransform: "capitalize",
                    px: 0.5,
                  }}
                />
              </Stack>

              <CheckOutItem
                title="Date"
                value={moment(new Date(transaction?.data?.createdAt)).format(
                  "LLL",
                )}
              />

              <Divider sx={{ my: 1 }} />

              {transaction?.data?.downloadLink && (
                <Button
                  variant="contained"
                  color="primary"
                  target="_blank"
                  href={transaction?.data?.downloadLink}
                  rel="noopener noreferrer"
                  size="large"
                  endIcon={<FileDownloadRounded />}
                  sx={{
                    maxWidth: "340px",
                    width: "100%",
                    borderRadius: 2,
                    alignSelf: "center",
                    py: 1.2,
                    fontWeight: "bold",
                  }}
                >
                  Download {transaction?.data?.service}
                </Button>
              )}

              {/* Global Navigation Footer */}
              {!transaction.isFetching && (
                <Button
                  component={Link}
                  to="/"
                  startIcon={<HomeRounded />}
                  variant="text"
                  color="primary"
                  sx={{ fontWeight: "medium" }}
                >
                  Go Home
                </Button>
              )}
            </Stack>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default LostVoucher;

// import {
//   Alert,
//   Button,
//   CircularProgress,
//   Container,
//   Divider,
//   Stack,
//   Typography,
//   Link as MuiLink,
// } from "@mui/material";

// import { useQuery } from "@tanstack/react-query";
// import { Link, Navigate, useLocation } from "react-router-dom";
// import { findTransaction } from "../../api/transactionAPI";
// import CheckOutItem from "../../components/items/CheckOutItem";
// import moment from "moment";
// import { currencyFormatter } from "../../constants";
// import { useState } from "react";

// import { FileDownloadRounded } from "@mui/icons-material";

// const LostVoucher = () => {
//   const { state } = useLocation();
//   const [errCount, setErrCount] = useState(0);

//   const transaction = useQuery({
//     queryKey: ["retrieve-voucher", state?.id, state?.mobileNo],
//     queryFn: () => findTransaction(state?.id, state?.mobileNo),

//     enabled: !!state?.id && !!state?.mobileNo,
//     refetchOnMount: false,
//     refetchOnReconnect: false,
//     refetchOnWindowFocus: false,
//     onError: () => {
//       setErrCount(errCount + 1);
//     },
//   });

//   if (!state?.id || !state?.mobileNo) {
//     return <Navigate to={state?.general ? "/" : "/evoucher"} />;
//   }

//   return (
//     <>
//       {errCount > 2 && (
//         <Alert severity="info" sx={{ fontSize: 12 }}>
//           Finding problems retrieiving vouchers , tickets,transaction details?
//           Send a message via SMS on +233244012766 or via{" "}
//           <Link
//             to="https://chat.whatsapp.com/LOLI3PEzn31BPAUu017ylx"
//             target="_blank"
//             style={{ textDecoration: "underline" }}
//           >
//             Whatsapp
//           </Link>{" "}
//           to our support desk or any of our business lines.
//         </Alert>
//       )}
//       <Container
//         maxWidth="md"
//         sx={{
//           minHeight: "70svh",
//           display: "flex",
//           flexDirection: "column",
//           justifyContent: "center",
//           alignItems: "center",
//           gap: 1,
//           textAlign: "center",
//           p: 2,
//         }}
//       >
//         {transaction.isLoading ? (
//           <Stack justifyContent="center" alignItems="center" spacing={2}>
//             <CircularProgress />
//             <Typography>
//               Searching for your transaction details.Please wait...
//             </Typography>
//           </Stack>
//         ) : transaction.isError ? (
//           <>
//             {/* <Typography variant='h2' color='error'>
//             Error!
//           </Typography> */}

//             <Typography variant="h3">No match found </Typography>
//             <Stack direction="row" justifyContent="center" alignItems="center">
//               <Typography>
//                 Sorry we could not find a transaction with this information.
//               </Typography>
//               <MuiLink onClick={transaction?.refetch}>Try again?</MuiLink>
//             </Stack>
//             <Link to={state?.general ? "/" : "/evoucher"}>Go Back</Link>
//           </>
//         ) : (
//           <>
//             <Typography
//               variant="h3"
//               color={transaction.isError ? "red" : "green"}
//             >
//               {transaction.isError ? "No match found" : "Match found!"}
//             </Typography>
//             <Typography variant="caption">
//               Showing details of your transaction
//             </Typography>
//             <Link to="/">Go Home</Link>
//             <Container maxWidth="md" sx={{ py: 2 }}>
//               {/* Genral Search */}
//               <Stack rowGap={2}>
//                 <Divider />

//                 <Stack spacing={1}>
//                   <CheckOutItem
//                     title="Transaction ID"
//                     value={transaction?.data?.id}
//                   />
//                   {transaction?.data?.mode === "Mobile Money" && (
//                     <CheckOutItem
//                       title="External Transaction ID "
//                       value={transaction?.data?.externalTransactionId}
//                     />
//                   )}
//                   <CheckOutItem
//                     title="Category"
//                     value={transaction?.data?.categoryName}
//                   />
//                   <CheckOutItem
//                     title="Type"
//                     value={transaction?.data?.service}
//                   />
//                   <CheckOutItem
//                     title="Amount Paid"
//                     value={currencyFormatter(transaction?.data?.amount)}
//                   />

//                   <CheckOutItem
//                     title="Payment Method"
//                     value={transaction?.data?.mode}
//                   />
//                   {transaction?.data?.phonenumber && (
//                     <CheckOutItem
//                       title="Mobile No."
//                       value={transaction?.data?.phonenumber}
//                     />
//                   )}
//                   {transaction?.data?.email && (
//                     <CheckOutItem
//                       title="Email Address"
//                       value={transaction?.data?.email}
//                     />
//                   )}
//                   <CheckOutItem
//                     title="Status"
//                     value={transaction?.data?.status}
//                   />

//                   <CheckOutItem
//                     title="Date"
//                     value={moment(
//                       new Date(transaction?.data?.createdAt),
//                     ).format("LLL")}
//                   />
//                   <Divider flexItem />
//                   {transaction?.data?.downloadLink && (
//                     <Button
//                       variant="contained"
//                       target="_blank"
//                       sx={{
//                         maxWidth: "300px",
//                         borderRadius: 1,
//                         alignSelf: "center",
//                       }}
//                       size="large"
//                       endIcon={<FileDownloadRounded />}
//                       href={transaction?.data?.downloadLink}
//                     >
//                       Download {transaction?.data?.service}
//                     </Button>
//                   )}
//                 </Stack>
//               </Stack>
//             </Container>
//           </>
//         )}
//       </Container>
//     </>
//   );
// };

// export default LostVoucher;
