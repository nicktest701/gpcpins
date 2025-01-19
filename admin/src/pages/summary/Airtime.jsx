import { Button, Box, Grid, useTheme } from "@mui/material";
import {
  AirplaneTicketSharp,
  AllOut,
  NoteAltSharp,
  RefreshRounded,
} from "@mui/icons-material";
import ItemCard from "../../components/custom/ItemCard";
import LineChart from "../../components/charts/LineChart";
import CustomCard from "../../components/custom/CustomCard";
import AnimatedContainer from "../../components/animations/AnimatedContainer";
import PlainTable from "../../components/tables/PlainTable";
import BarChart from "../../components/charts/BarChart";
import { useQuery } from "@tanstack/react-query";
import { getAirtimeTransaction } from "../../api/transactionAPI";
import {
  recentTransactionColumns,
  topCustomersColumns,
} from "../../mocks/columns";
import PayLoading from "../../components/PayLoading";
import LoadingSpinner from "../../components/spinners/LoadingSpinner";
import CustomTitle from "../../components/custom/CustomTitle";

function Airtime() {
  const { palette } = useTheme();
  const summary = useQuery({
    queryKey: ["airtime-summary"],
    queryFn: () => getAirtimeTransaction(),
  });

  if (summary?.isLoading) {
    return <PayLoading />;
  }

  return (
    <AnimatedContainer>
      <CustomTitle
        title="Airtime"
        subtitle="View history and data about daily transactions."
        icon={<BarChart sx={{ width: 50, height: 50 }} color="primary" />}
      />

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <Button
          variant="contained"
          startIcon={<RefreshRounded />}
          onClick={summary.refetch}
          sx={{
            alignSelf: "flex-end",
            borderRadius: 1,
          }}
        >
          Refresh
        </Button>

        <CustomCard title="Airtime Transaction Summary">
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={3} lg={3}>
              <ItemCard
                title="Today"
                icon={<AllOut color="success" />}
                value={summary?.data?.today}
                bg="rgba(12, 126, 5,.2)"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={3}>
              <ItemCard
                title="Yesterday"
                icon={<AllOut color="success" />}
                value={summary?.data?.yesterday}
                bg="rgba(12, 126, 5,.2)"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={3}>
              <ItemCard
                title="Last 7 days"
                icon={<NoteAltSharp color="success" />}
                value={summary?.data?.lastSevenDaysTotal}
                bg="rgba(12, 126, 5,.2)"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={3}>
              <ItemCard
                title="This Month"
                icon={<AirplaneTicketSharp color="success" />}
                value={summary?.data?.thisMonth}
                bg="rgba(12, 126, 5,.2)"
              />
            </Grid>
          </Grid>
        </CustomCard>

        <Grid container spacing={4}>
          <Grid item xs={12} sm={12}>
            <CustomCard title="Total Airtime Sales for Last 7 days in GHS">
              <LineChart
                labels={summary?.data?.lastSevenDays?.labels}
                datasets={[
                  {
                    label: "Airtime Sales",
                    data: summary?.data?.lastSevenDays?.data ?? [],
                    borderColor: palette.success.main,
                    tension: 0.3,
                  },
                ]}
              />
            </CustomCard>
          </Grid>

          {/* <Grid item xs={12} sm={12} md={5} lg={5}>
              <CustomCard title=' Transactions Status'>
                <PieChart
                  height={200}
                  labels={['Pending', 'Completed']}
                  data={summary?.data?.status}
                />
              </CustomCard>
            </Grid> */}
          <Grid item xs={12} sm={12} md={5} lg={5}>
            <CustomCard title=" Top Customers">
              <PlainTable
                isLoading={summary.isLoading}
                columns={topCustomersColumns}
                data={summary?.data?.topCustomers}
                options={{
                  paging: false,
                }}
              />
            </CustomCard>
          </Grid>
          <Grid item xs={12} sm={12} md={7} lg={7}>
            <CustomCard title="Recent Transactions">
              <PlainTable
                isLoading={summary.isLoading}
                columns={recentTransactionColumns}
                data={summary?.data?.recent}
                options={{
                  paging: false,
                }}
              />
            </CustomCard>
          </Grid>
          <Grid item xs={12} sm={12}>
            <CustomCard title="Total Transaction by Month (GHS)">
              <BarChart
                labels={summary?.data?.thisYear?.labels}
                datasets={[
                  {
                    label: "Airtime Transfers",
                    data: summary?.data?.thisYear?.data ?? [],
                    backgroundColor: palette.success.main,
                    barThickness: 20,
                    borderRadius: 2,
                  },
                ]}
              />
            </CustomCard>
          </Grid>
        </Grid>
      </Box>
      {summary?.isLoading && (
        <LoadingSpinner value="Loading Airtime Details..." />
      )}
    </AnimatedContainer>
  );
}

export default Airtime;
