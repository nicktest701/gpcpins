import { Button, Grid, useTheme, Box } from "@mui/material";
import {
  AirplaneTicketSharp,
  AllOut,
  NoteAltSharp,
  RefreshRounded,
} from "@mui/icons-material";
import ElectricMeterIcon from "@mui/icons-material/ElectricMeter";
import ItemCard from "../../components/custom/ItemCard";
import LineChart from "../../components/charts/LineChart";
import CustomCard from "../../components/custom/CustomCard";
import PieChart from "../../components/charts/PieChart";
import PlainTable from "../../components/tables/PlainTable";
import BarChart from "../../components/charts/BarChart";
import { useQuery } from "@tanstack/react-query";
import { getElectricityTransaction } from "../../api/transactionAPI";
import {
  recentTransactionColumns,
  topCustomersColumns,
} from "../../mocks/columns";
import CustomTitle from "../../components/custom/CustomTitle";

function Electric() {
  const { palette } = useTheme();
  const summary = useQuery({
    queryKey: ["prepaid-summary"],
    queryFn: () => getElectricityTransaction(),
  });

  return (
    <>
      <CustomTitle
        title="Prepaid Units"
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

        <CustomCard title="Electricity Transaction Summary">
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={3} lg={3}>
              <ItemCard
                title="Today"
                icon={<AllOut color="info" />}
                value={summary?.data?.today}
                bg={"info.light"}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={3}>
              <ItemCard
                title="Yesterday"
                icon={<AllOut color="info" />}
                value={summary?.data?.yesterday}
                bg={"info.light"}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={3}>
              <ItemCard
                title="Last 7 days"
                icon={<NoteAltSharp color="info" />}
                value={summary?.data?.lastSevenDaysTotal}
                bg={"info.light"}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={3}>
              <ItemCard
                title="This Month"
                icon={<AirplaneTicketSharp color="info" />}
                value={summary?.data?.thisMonth}
                bg={"info.light"}
              />
            </Grid>
          </Grid>
        </CustomCard>

        <Grid container spacing={4}>
          <Grid item xs={12} sm={12} md={7} lg={7}>
            <CustomCard title="Total Prepaid Sales for Last 7 days">
              <LineChart
                labels={summary?.data?.lastSevenDays?.labels}
                datasets={[
                  {
                    label: "Prepaid Sales",
                    data: summary?.data?.lastSevenDays?.data ?? [],
                    borderColor: palette.info.main,
                    tension: 0.3,
                  },
                ]}
              />
            </CustomCard>
          </Grid>

          <Grid item xs={12} sm={12} md={5} lg={5}>
            <CustomCard title="Available Prepaid Meters">
              <ItemCard
                title="Total"
                icon={<ElectricMeterIcon color="info" />}
                value={summary?.data?.meters}
                bg="info.light"
              />
            </CustomCard>
            <CustomCard title=" Transactions Status">
              <PieChart
                height={200}
                labels={["Pending", "Completed"]}
                data={summary?.data?.status}
              />
            </CustomCard>
          </Grid>
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
                    label: "Vouchers & Tickets",
                    data: summary?.data?.thisYear?.data ?? [],
                    backgroundColor: palette.info.main,
                    barThickness: 20,
                    borderRadius: 2,
                  },
                ]}
              />
            </CustomCard>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

export default Electric;
