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
import PlainTable from "../../components/tables/PlainTable";
import BarChart from "../../components/charts/BarChart";
import { useQuery } from "@tanstack/react-query";
import { getBundleTransaction } from "../../api/transactionAPI";
import {
  recentTransactionColumns,
  topCustomersColumns,
} from "../../mocks/columns";
import LoadingSpinner from "../../components/spinners/LoadingSpinner";
import CustomTitle from "../../components/custom/CustomTitle";

function Bundle() {
  const { palette } = useTheme();
  const summary = useQuery({
    queryKey: ["bundle-summary"],
    queryFn: () => getBundleTransaction(),
  });

  return (
    <>
      <CustomTitle
        title="Data Bundle"
        subtitle="View history and data about daily transactions."
        icon={<BarChart sx={{ width: 50, height: 50 }} color="primary" />}
      />
      <Box
        sx={{
          width: "100%",
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

        <CustomCard title="Bundle Transaction Summary">
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={3} lg={3}>
              <ItemCard
                title="Today"
                icon={<AllOut color="error" />}
                value={summary?.data?.today}
                bg={"rgba(240, 1, 5,.2)"}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={3}>
              <ItemCard
                title="Yesterday"
                icon={<AllOut color="error" />}
                value={summary?.data?.yesterday}
                bg={"rgba(240, 1, 5,.2)"}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={3}>
              <ItemCard
                title="Last 7 days"
                icon={<NoteAltSharp color="error" />}
                value={summary?.data?.lastSevenDaysTotal}
                bg={"rgba(240, 1, 5,.2)"}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={3}>
              <ItemCard
                title="This Month"
                icon={<AirplaneTicketSharp color="error" />}
                value={summary?.data?.thisMonth}
                bg={"rgba(240, 1, 5,.2)"}
              />
            </Grid>
          </Grid>
        </CustomCard>

        <Grid container spacing={4}>
          <Grid item xs={12} sm={12}>
            <CustomCard title="Total Bundle Sales for Last 7 days in GHS">
              <LineChart
                labels={summary?.data?.lastSevenDays?.labels}
                datasets={[
                  {
                    label: "Bundle Sales",
                    data: summary?.data?.lastSevenDays?.data ?? [],
                    borderColor: palette.error.main,
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
                    label: "Bundle Transfers",
                    data: summary?.data?.thisYear?.data ?? [],
                    backgroundColor: palette.error.main,
                    barThickness: 20,
                    borderRadius: 2,
                  },
                ]}
              />
            </CustomCard>
          </Grid>
        </Grid>
        {summary?.isLoading && (
          <LoadingSpinner value="Loading Bundle Details..." />
        )}
      </Box>
    </>
  );
}

export default Bundle;
