import { useContext, useEffect } from "react";
import Avatar from "@mui/material/Avatar";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { FileDownloadRounded } from "@mui/icons-material";
import CheckOutItem from "../components/items/CheckOutItem";
import { CustomContext } from "../context/providers/CustomProvider";
import moment from "moment";
import { IMAGES, currencyFormatter } from "../constants";
import { downloadVouchers, makePayment } from "../api/paymentAPI";
import { Alert } from "@mui/material";
// import { globalAlertType } from "../components/alert/alertType";
import { LoadingButton } from "@mui/lab";

function Checkout() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  // const [errCount, setErrCount] = useState(0);
  const {
    customState: { transaction },
    // customDispatch,
  } = useContext(CustomContext);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const confirmationMessage = "Are you sure you want to leave?";
      e.returnValue = confirmationMessage; // For IE and Firefox prior to version 4
      return confirmationMessage; // For Safari and modern browsers
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const isVoucher = ["waec", "university", "security"].includes(
    transaction?.info?.type
  );

  const generatedVouchers = useQuery({
    queryKey: ["generatedVouchers", transaction?._id, transaction?.info?.type],
    queryFn: () =>
      makePayment({
        id: transaction?._id,
        type: transaction?.info?.type,
      }),

    enabled:
      !!transaction?._id &&
      !!transaction?.info?.type &&
      searchParams.get("completed") === null,

    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
      setSearchParams((params) => {
        params.set("completed", "true");
        return params;
      });
    },
  });

  const handleDownloadVouchers = () => downloadVouchers(transaction?._id);

  if (!transaction?._id) {
    return <Navigate to="/evoucher" />;
  }

  return (
    <Container
      maxWidth="md"
      sx={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 1,
        // cursor: isLoading ? "wait" : "default",
      }}
    >
      {/* <Back to={state?.path} /> */}

      <>
        {transaction?._id && (
          <>
            <Avatar
              alt="success"
              src={IMAGES.success}
              sx={{
                width: 60,
                height: 60,
                display: { xs: "none", md: "block" },
              }}
            />
            <Typography variant="h5">Transaction Complete!</Typography>
            <Typography variant="body2">
              {generatedVouchers.isLoading
                ? "  You will be notify shortly after your request is completed."
                : generatedVouchers.isSuccess
                ? "        Your request has been processed successfully!"
                : ""}
            </Typography>

            <Stack
              spacing={3}
              width="100%"
              justifyContent="center"
              alignItems="center"
            >
              <Stack spacing={1} width="100%">
                <Divider />
                <CheckOutItem title="Transaction ID" value={transaction._id} />
                <CheckOutItem
                  title="Date"
                  value={moment(new Date(transaction?.createdAt)).format("LLL")}
                />
                <CheckOutItem
                  title="Payment Method"
                  value={transaction?.paymentMode ?? "N/A"}
                />
                <CheckOutItem
                  title="Amount Paid"
                  value={currencyFormatter(transaction?.info?.amount)}
                />
                <CheckOutItem
                  title="Customer"
                  value={transaction?.info?.agentName || "Agent"}
                />
                <CheckOutItem
                  title="Mobile No."
                  value={transaction?.info?.agentPhoneNumber}
                />
                {transaction?.info?.agentEmail && (
                  <CheckOutItem
                    title="Email Address"
                    value={transaction?.info?.agentEmail}
                  />
                )}
                <CheckOutItem
                  title="Order No."
                  value={transaction?.info?.orderNo}
                />
                <Divider flexItem />
                {generatedVouchers?.isLoading && (
                  <Typography
                    textAlign="center"
                    fontStyle="italic"
                    fontWeight="bold"
                  >
                    Please wait..We are currently generating your{" "}
                    {isVoucher ? "Vouchers" : "Tickets"}
                  </Typography>
                )}
              </Stack>

              {generatedVouchers?.data?.id && (
                <LoadingButton
                  disabled={generatedVouchers?.isLoading}
                  loading={generatedVouchers?.isLoading}
                  variant="contained"
                  color="secondary"
                  size="small"
                  onClick={handleDownloadVouchers}
                  sx={{
                    textTransform: "uppercase",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                  endIcon={<FileDownloadRounded />}
                >
                  {isVoucher ? " Download Vouchers" : " Download Tickets"}
                </LoadingButton>
              )}

              <Stack
                rowGap={2}
                alignItems="center"
                justifyContent="center"
                paddingY={1}
              >
                <>
                  <Link to="/evoucher">Continue Shopping</Link>
                </>
              </Stack>
            </Stack>
          </>
        )}
      </>

      <Alert
        variant="standard"
        severity="info"
        sx={{ borderRadius: 0, py: 1, fontSize: "12px" }}
      >
        You are recommended to keep a copy of your <b>TRANSACTION NUMBER.</b> In
        case you didn&lsquo;t receive or lost your{" "}
        {`${isVoucher ? "Vouchers" : "Tickets"}`}, you can retrieve it from{" "}
        <Link to="/evoucher">here</Link>
      </Alert>
    </Container>
  );
}

export default Checkout;
