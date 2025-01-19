import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import moment from "moment";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyTransaction } from "../api/transactionAPI";
import {
  CircularProgress,
  Container,
  Stack,
  Typography,
  Divider,
} from "@mui/material";
import CheckOutItem from "../components/items/CheckOutItem";
import { currencyFormatter } from "../constants";

const VerifyTicket = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (!searchParams.get("XwnA") || !searchParams.get("bwhT")) {
      navigate("/");
      return;
    }
  }, [searchParams, navigate]);

  const { isError,isLoading, error, data } = useQuery({
    queryKey: ["ticket"],
    retry: 1,
    queryFn: () =>
      verifyTransaction(searchParams?.get("XwnA"), searchParams?.get("bwhT")),
    enabled: !!searchParams.get("XwnA") && !!searchParams.get("bwhT"),
  });

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: "50svh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        py: 4,
      }}
    >
      {/* <Back/> */}
      {isLoading && (
        <Stack spacing={3} alignItems='center'>
          <CircularProgress />
          <Typography>Fetching Details.Please Wait..</Typography>
        </Stack>
      )}
      {isError && (
        <Stack spacing={3}>
          <Typography>{error}</Typography>
        </Stack>
      )}

      {data && (
        <Stack spacing={1} width="100%">
          <Typography variant="h3">Ticket/Voucher Details</Typography>
          <Divider />
          <CheckOutItem title="Transaction ID" value={data.id} />
          <CheckOutItem title="Voucher/Ticket" value={data.voucherType} />
          {data?.pin && <CheckOutItem title="Pin" value={data.pin} />}
          {data?.serial && <CheckOutItem title="Serial" value={data.serial} />}
          {data?.seatNo && <CheckOutItem title="Seat No" value={data.seatNo} />}
          {data?.type && <CheckOutItem title="type" value={data.type} />}
          <CheckOutItem title="Payment Method" value={data?.mode ?? "N/A"} />
          <CheckOutItem
            title="Amount Paid"
            value={currencyFormatter(data?.amount)}
          />
          <CheckOutItem title="Mobile No." value={data?.phonenumber} />
          {data?.email && (
            <CheckOutItem title="Email Address" value={data?.email} />
          )}
          <CheckOutItem title="Status" value={data?.status} />
          <CheckOutItem
            title="Created On"
            value={moment(new Date(data?.createdAt)).format("LLL")}
          />
          <Divider flexItem />
        </Stack>
      )}
    </Container>
  );
};

export default VerifyTicket;
