import { Box, Container, Divider, Stack, Typography } from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import _ from "lodash";
import { useParams } from "react-router-dom";
import CountUp from "react-countup";
import {
  getAssignedTicketByID,
  getScannedTicketSummary,
} from "../../api/ticketAPI";
import CustomTitle from "../../components/custom/CustomTitle";
import PayLoading from "../../components/PayLoading";
import Back from "../../components/Back";
import CustomCard from "../../components/custom/CustomCard";
import HorizontalBarChart from "../../components/charts/HorizontalBarChart";
import ItemCard from "../../components/custom/ItemCard";
import { BarChartRounded, PaymentRounded } from "@mui/icons-material";
import PieChart from "../../components/charts/PieChart";

function AssignedTicketDetails() {
  const queryClient = useQueryClient();
  const { id, ticketId } = useParams();

  const ticket = useQuery({
    queryKey: ["assigned-ticket", ticketId],
    queryFn: () => getAssignedTicketByID(ticketId),
    initialData: queryClient
      .getQueryData(["assigned-tickets", id])
      ?.find((item) => item?._id === ticketId),
    enabled: !!id,
  });

  const scannedTicketSummary = useQuery({
    queryKey: ["scanned-tickets", ticketId],
    queryFn: () => getScannedTicketSummary(ticketId, id),
    enabled: !!ticketId,
  });

  if (ticket.isLoading) {
    return <PayLoading />;
  }

  return (
    <Container>
      <Back
        to={-1}
        state={{
          tab: "tickets",
        }}
      />
      <CustomTitle
        title={ticket.data?.voucherType}
        subtitle="Details and History of ticket"
        // icon={
        //   <EmergencyRecording sx={{ width: 50, height: 50 }} color="primary" />
        // }
      />
      <CustomCard title="Total Sales">
        <ItemCard
          title="Tickets"
          icon={<BarChartRounded htmlColor="rgb(0, 20, 34)" />}
          value={
            <CountUp
              start={0}
              end={scannedTicketSummary.data?.totalSoldVouchers ?? 0}
            />
          }
          // bg={"rgba(0, 20, 34,.2)"}
        />

        <ItemCard
          title="Scanned Tickets"
          icon={<PaymentRounded color="secondary" />}
          value={
            <CountUp
              start={0}
              end={scannedTicketSummary.data?.totalScannedVouchers ?? 0}
            />
          }
          // bg={"rgba(255, 126, 5,.2)"}
        />
        <ItemCard
          title="Unscanned Tickets"
          icon={<PaymentRounded color="secondary" />}
          value={
            <CountUp
              start={0}
              end={scannedTicketSummary.data?.totalUnscannedVouchers ?? 0}
            />
          }
          // bg={"rgba(255, 126, 5,.2)"}
        />
      </CustomCard>

      <Box bgcolor="white" mt={2} py={2} borderRadius={1}>
        <Box p={1}>
          <Typography variant="h6" color="primary">
            Types
          </Typography>
          <Typography variant="body2">List of assigned types</Typography>
          <Divider />
        </Box>
        <Stack direction="row" spacing={1} py={2} px={1}>
          {ticket.data?.type?.map((item) => {
            return (
              <Typography color="success.main" key={item.id}>
                - {item.type}
              </Typography>
            );
          })}
        </Stack>
        <Box>
          <CustomCard title="Scan Summary">
            <PieChart
              labels={["Scanned", "UnScanned"]}
              data={[
                scannedTicketSummary.data?.totalScannedVouchers,
                scannedTicketSummary.data?.totalUnscannedVouchers,
              ]}
            />
          </CustomCard>
        </Box>
      </Box>
      <Box bgcolor="whitesmoke" p={1} my={3}>
        <Typography variant="h6">Scan History</Typography>
        <Typography variant="body2">
          Viewing details of scanned tickets
        </Typography>
      </Box>

      <CustomCard
        title="Total Scanned Tickets"
        value={scannedTicketSummary.data?.totalScannedVouchers}
      >
        <HorizontalBarChart
          labels={[..._.map(ticket.data?.type, "type"), "Unassigned"]}
          datasets={[
            {
              label: ticket.data?.voucherType ?? "",
              data:
                [
                  ...(scannedTicketSummary.data?.scanned ?? []),
                  scannedTicketSummary.data?.unassigned,
                ] ?? [],
              borderColor: "green",
              backgroundColor: ["#031523", "#f78e2a", "#155BCA", "#54D62C"],
              barThickness: 15,
              borderRadius: 2,
            },
          ]}
        />
      </CustomCard>
    </Container>
  );
}

export default AssignedTicketDetails;
